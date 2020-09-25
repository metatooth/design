import {DragAndDropManip} from '../manipulators/DragAndDropManip.js';
import {RubberRuler} from '../rubberbands/RubberRuler.js';
import {Tool} from './Tool.js';

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
   * @param {Viewer} viewer the viewport owner
   * @param {Event} event the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      const v = viewer.unproject( event.clientX, event.clientY );
      return new DragAndDropManip( viewer,
          new RubberRuler(viewer, v, v),
          this );
    }
    return null;
  },

});

export {MeasureTool};
