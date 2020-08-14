import {Component} from '../component.js';
import {GrowingVertices} from '../rubberbands/growing-vertices.js';
import {PasteCmd} from '../commands/paste-cmd.js';
import {VertexManip} from '../manipulators/vertex-manip.js';
import {Tool} from './tool.js';

/**
 * A tool for picking points on the target mesh.
 * @constructor
 */
function PickTool() {
  Tool.call( this );

  this.type = 'PickTool';
}

PickTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: PickTool,

  isPickTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      return new VertexManip( viewer, new GrowingVertices, this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    if (manipulator.rubberband.children.length > 0) {
      const comp = new Component;
      for (let i = 0, l = manipulator.rubberband.children.length; i < l; ++i) {
        comp.add(manipulator.rubberband.children[i]);
      }

      return new PasteCmd( manipulator.viewer.editor, [comp] );
    }
    return null;
  },
});

export {PickTool};