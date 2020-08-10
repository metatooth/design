import {DragManip} from '../manipulators/drag-manip.js';
import {RubberLine} from '../rubberbands/rubber-line.js';
import {Tool} from './tool.js';

/**
 * Measures the 2d distance on screen from the source to target point.
 * @constructor
 */
function MeasureTool() {
  Tool.call( this );

  this.type = 'MeasureTool';
}

MeasureTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: MeasureTool,

  isMeasureTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      const v = viewer.unproject( event.clientX, event.clientY );
      return new DragManip( viewer, new RubberLine(v, v), this );
    }
    return null;
  },

});

export {MeasureTool};
