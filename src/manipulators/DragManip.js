/*
 * Copyright (c) 1990, 1991 Stanford University
 *
 * Permission to use, copy, modify, distribute, and sell this software and its
 * documentation for any purpose is hereby granted without fee, provided
 * that the above copyright notice appear in all copies and that both that
 * copyright notice and this permission notice appear in supporting
 * documentation, and that the name of Stanford not be used in advertising or
 * publicity pertaining to distribution of the software without specific,
 * written prior permission.  Stanford makes no representations about
 * the suitability of this software for any purpose.  It is provided "as is"
 * without express or implied warranty.
 *
 * STANFORD DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL STANFORD BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {Manipulator} from './Manipulator.js';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Viewer} viewer - for visualization
 * @param {Rubberband} rubberband - used to track mouse movement
 * @param {Tool} tool - for user interaction
 */
function DragManip( viewer, rubberband, tool ) {
  Manipulator.call( this );

  this.type = 'DragManip';

  this.viewer = viewer;
  this.rubberband = rubberband;
  this.tool = tool;
}

DragManip.prototype = Object.assign( Object.create( Manipulator.prototype ), {
  constructor: DragManip,

  isDragManip: true,

  /**
   * @param {Event} event the mousedown event to start the drag
   */
  grasp: function( event ) {
    this.viewer.controls.enabled = false;
    this.viewer.controls.saveState();

    const p = this.viewer.unproject( event.clientX, event.clientY );
    this.rubberband.track( p );

    this.viewer.scene.add(this.rubberband);
  },

  /**
   * @param {Event} event is dragging
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
   * @param {Event} event mouseup to end the drag
   */
  effect: function( event ) {
    this.viewer.scene.remove(this.rubberband);

    this.viewer.controls.reset();
    this.viewer.controls.enabled = true;
  },
});

export {DragManip};
