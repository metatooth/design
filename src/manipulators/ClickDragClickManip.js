import {DragManip} from './DragManip.js';

/**
 * Description: Mousedown. Mouseup. Drag... Mousedown. Mouseup.
 * @param {Viewer} viewer - for visualization
 * @param {Rubberband} rubberband - used to track mouse movement
 * @param {Tool} tool - for user interaction
 */
function ClickDragClickManip( viewer, rubberband, tool ) {
  DragManip.call( this, viewer, rubberband, tool );

  this.type = 'ClickDragClickManip';
}

ClickDragClickManip.prototype = Object.assign(
    Object.create( DragManip.prototype ), {
      constructor: ClickDragClickManip,

      isClickDragClickManip: true,

      /**
       * @param {Event} event the mousedown event to start the drag
       */
      grasp: function( event ) {
        this.viewer.controls.enabled = false;
        this.viewer.controls.saveState();

        const p = this.viewer.unproject( event.clientX, event.clientY );
        this.rubberband.track( p );

        this.viewer.temporary(this.rubberband);
      },

      /**
       * @param {Event} event - is dragging
       * @return {boolean}
       */
      manipulating: function( event ) {
        if ( event.type == 'mousemove' ) {
          const p = this.viewer.unproject( event.clientX, event.clientY );
          this.rubberband.track( p );
        } else if (event.type == 'mouseup' ) {
          return false;
        }
        return true;
      },

      /**
       * @param {Event} event ends the manipulation
       */
      effect: function( event ) {
        this.viewer.controls.reset();
        this.viewer.controls.enabled = true;
      },
    });

export {ClickDragClickManip};
