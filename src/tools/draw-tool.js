import {Component} from '../component.js';
import {GrowingMultiLine} from '../rubberbands/growing-multi-line.js';
import {PasteCmd} from '../commands/paste-cmd.js';
import {ScribbleVertexManip} from '../manipulators/scribble-vertex-manip.js';
import {Tool} from './tool.js';

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
    if (manipulator.rubberband.children.length > 1) {
      const comp = new Component;
      comp.children = manipulator.rubberband.children;

      return new PasteCmd( manipulator.viewer.editor, [comp] );
    }
    return null;
  },

  subdivide: function(a, b, steps) {
    const dir = new Vector3;
    dir.subVectors(b, a);

    const points = [];
    for (let i = 0; i < steps; i++) {
      points.push( a.clone().addScaledVector( dir, i/steps ) );
    }

    return points;
  },
});

export {DrawTool};
