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

import {VertexManip} from './vertex-manip.js';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Viewer} viewer - visualization
 * @param {GrowingVertices} gv - used to track mouse movement and
 * collect vertices
 * @param {Tool} tool: user interaction
 */
function ScribbleVertexManip( viewer, gv, tool ) {
  VertexManip.call( this, viewer, gv, tool );

  this.type = 'ScribbleVertexManip';

  this.first = true;
}

ScribbleVertexManip.prototype = Object.assign( Object.create(
    VertexManip.prototype ), {
  constructor: ScribbleVertexManip,

  isScribbleVertexManip: true,

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    if ( event.type == 'mousemove' ) {
      if (!this.first) {
        const p = this.viewer.unproject( event.clientX, event.clientY );


        this.rubberband.track( p );
        const intersects = this.raycast( event.clientX, event.clientY );
        if ( intersects.length > 0 ) {
          this.rubberband.addVertex( intersects[0].point );
          this.viewer.render();
        }
      } else {
        this.first = false;
      }
    } else if ( event.type === 'mouseup' ) {
      return false;
    }
    return true;
  },

});

export {ScribbleVertexManip};
