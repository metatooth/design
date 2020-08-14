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

import {Raycaster} from 'three';

import {DragManip} from './drag-manip.js';

/**
 * Description: A multi-click manipulation.
 * @param {Viewer} viewer: used for raycasting
 * @param {GrowingVertices} gv: track mouse movement and collect vertices
 * @param {Tool} tool: user interaction
 */
function VertexManip( viewer, gv, tool ) {
  DragManip.call( this, viewer, gv, tool );

  this.type = 'VertexManip';

  this.raycaster = new Raycaster;
}

VertexManip.prototype = Object.assign( Object.create( DragManip.prototype ), {
  constructor: VertexManip,

  isVertexManip: true,

  /**
   * Cast pointer location -- typically (X, Y) of an event -- to the
   * viewer's mesh. Returns closest intersection, if any.
   * @param {Float32} x
   * @param {Float32} y
   * @return {Vector3} the closest intersection or null
   */
  raycast: function( x, y ) {
    const p = this.viewer.ndc( event.clientX, event.clientY );
    this.raycaster.setFromCamera( p, this.viewer.camera );
    const intersects = this.raycaster.intersectObject( this.viewer.mesh() );

    if ( intersects.length > 0 ) {
      return intersects[0].point;
    }

    return null;
  },

  /**
   * @param {Event} event - the mousedown event to start the drag
   */
  grasp: function( event ) {
    DragManip.prototype.grasp.call(this, event);

    const pt = this.raycast( event.clientX, event.clientY );
    if ( pt ) {
      this.rubberband.addVertex( pt );
    }
  },

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    if ( event.type == 'mousemove' ) {
      const p = this.viewer.unproject( event.clientX, event.clientY );
      this.rubberband.track( p );
    } else if ( event.type == 'mousedown' ) {
      const pt = this.raycast( event.clientX, event.clientY );
      if ( pt ) {
        this.rubberband.addVertex( pt );
      }
    } else if ( event.type === 'mouseup' ) {
      return false;
    }
    return true;
  },
});

export {VertexManip};
