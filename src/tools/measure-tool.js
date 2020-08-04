import {DragManip} from '../manipulators/drag-manip.js';
import {Rubberband} from '../rubberbands/rubberband.js';
import {Tool} from './tool.js';

/**
 * Measures the 2d distance on screen from the source to target point.
 * @constructor
 */
function MeasureTool() {
  Tool.call( this );

  this.type = 'MeasureTool';

  this.color = 0xff33bb;
  this.linewidth = 5;
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
      return new DragManip( viewer, new Rubberband, this );
    }
    return null;
  },

});

export {MeasureTool};
