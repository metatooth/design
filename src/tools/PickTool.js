import {GrowingVertices} from '../rubberbands/GrowingVertices.js';
import {PasteCmd} from '../commands/PasteCmd.js';
import {Tool} from './Tool.js';
import {VertexManip} from '../manipulators/VertexManip.js';

/**
 * A tool for picking a point on the target mesh.
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
    const candidates = [];
    if (manipulator.rubberband.children.length > 0) {
      manipulator.rubberband.children.forEach((child) => {
        candidates.push(child);
      });

      return new PasteCmd( manipulator.viewer.editor, candidates );
    }
    return null;
  },
});

export {PickTool};
