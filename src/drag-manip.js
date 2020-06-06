import {Manipulator} from './manipulator';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Viewer} viewer - for visualization
 * @param {Rubberband} rubberband - used to track mouse movement
 */
function DragManip( viewer, rubberband ) {
  Manipulator.call( this );

  this.type = 'DragManip';

  this.viewer = viewer;
  this.rubberband = rubberband;
}

DragManip.prototype = Object.assign( Object.create( Manipulator.prototype ), {
  constructor: DragManip,

  isDragManip: true,

  /**
   * @param {Event} event - the mousedown event to start the drag
   */
  grasp: function( event ) {
    this.grasp = event;

    const x = ( event.clientX / window.innerWidth ) * 2 - 1;
    const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.rubberband.track( x, y );
  },

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    if ( event.shiftKey && event.type == 'mousemove' ) {
      const x = ( event.clientX / window.innerWidth ) * 2 - 1;
      const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.rubberband.track( x, y );
    } else if ( !event.shiftKey || event.type == 'mouseup' ) {
      return false;
    }
    return true;
  },

  /**
   * @param {Event} event - mouseup to end the drag
   */
  effect: function( event ) {
  },
});

export {DragManip};
