import {Manipulator} from './manipulator';
import {Vector2} from 'three';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Rubberband} rubberband - used to track mouse movement
 */
function DragManip( rubberband ) {
  Manipulator.call( this );

  this.type = 'Manipulator';

  this.rubberband = rubberband;
  this.preset = false;
  this.origin = new Vector2;
}

DragManip.prototype = Object.assign( Object.create( Manipulator.prototype ), {
  constructor: DragManip,

  isDragManip: true,

  /**
   * @param {Event} event - the mousedown event to start the drag
   */
  grasp: function( event ) {
    this.grasp = event;

    if ( !this.preset ) {
      this.origin.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.origin.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    console.log(this.rubberband);

    this.rubberband.track( this.origin.x, this.origin.y );
  },

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    console.log('manipulating --> ', event.type);
    if ( event.type == 'mousemove' ) {
      const x = ( event.clientX / window.innerWidth ) * 2 - 1;
      const y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.rubberband.track( x, y );
    } else if ( event.type == 'mouseup' ) {
      return false;
    }
    return true;
  },

  /**
   * @param {Event} event - mouseup to end the drag
   */
  effect: function( event ) {
    console.log('effect -> ', event.type);
  },
});

export {DragManip};
