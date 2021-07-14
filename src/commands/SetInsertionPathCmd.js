import {Command} from './Command.js';
import {Vector3} from 'three';

/**
 * Description: sets insertion path along view direction
 * @constructor
 * @param {Editor} editor the editor the command acts within
 */
function SetInsertionPathCmd( editor ) {
  Command.call( this, editor );
  this.type = 'SetInsertionPathCmd';
}

SetInsertionPathCmd.prototype =
  Object.assign( Object.create( Command.prototype ), {
    constructor: SetInsertionPathCmd,

    isSetInsertionPathCmd: true,

    execute: function() {
      const path = this.editor.viewer.path();
      console.log('path matrix', path.matrix);

      const curr = new Vector3(0, 1, 0);
      curr.applyMatrix4(path.matrix);

      console.log('curr', curr);

      const next = new Vector3();
      this.editor.viewer.camera.getWorldDirection( next );

      console.log('view', next);

      console.log('distance', next.distanceTo(curr));

      if (next.distanceTo(curr) > 1e-06) {
        const t = curr.angleTo(next);
        const p = curr.cross(next);
        p.normalize();

        path.rotateOnAxis(p, t);
        console.log('path matrix', path.matrix);
      }
    },
  });

export {SetInsertionPathCmd};
