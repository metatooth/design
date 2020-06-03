import {Command} from '../commands/command.js';
import {VertexManip} from '../vertex-manip.js';
import {Rubberband} from '../rubberband.js';
import {Tool} from './tool.js';
import {Vector2, Raycaster} from 'three';

/**
 * Description: A tool for drawing.
 * @constructor
 */
function MarkTool() {
  Tool.call( this );

  this.type = 'MarkTool';
}

MarkTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: MarkTool,

  isMarkTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    let manipulator = null;

    const mouse = new Vector2;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    const raycaster = new Raycaster;
    raycaster.setFromCamera( mouse, viewer.camera );
    const intersects = raycaster.intersectObject( viewer.mesh() );

    if ( intersects.length > 0 ) {
      const rubberband = new Rubberband( mouse.x, mouse.y );
      manipulator = new VertexManip( viewer, rubberband );
    }

    return manipulator;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    return new Command;
  },
});

export {MarkTool};
