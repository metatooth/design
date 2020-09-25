import {Group} from 'three';
import {Vector3} from 'three';

import {GrowingMultiLine} from '../rubberbands/GrowingMultiLine.js';
import {PasteCmd} from '../commands/PasteCmd.js';
import {ScribbleVertexManip} from '../manipulators/ScribbleVertexManip.js';
import {Tool} from './Tool.js';

/**
 * Description: A tool for drawing.
 * @constructor
 */
function DrawTool() {
  Tool.call( this );

  this.type = 'DrawTool';
}

DrawTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: DrawTool,

  isDrawTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      const v = viewer.unproject( event.clientX, event.clientY );
      return new ScribbleVertexManip( viewer, new GrowingMultiLine(v), this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    const comp = new Group;
    comp.name = 'multiline';

    while (manipulator.rubberband.children.length > 0) {
      comp.add(manipulator.rubberband.children[0]);
    }

    if (comp.children.length > 0) {
      return new PasteCmd( manipulator.viewer.editor, [comp] );
    }

    return null;
  },

  subdivide: function(a, b, steps) {
    const dir = new Vector3();
    dir.subVectors(b, a);

    const points = [];
    for (let i = 0; i < steps; i++) {
      points.push( a.clone().addScaledVector( dir, i/steps ) );
    }

    return points;
  },
});

export {DrawTool};
