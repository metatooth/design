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
import {Vector2} from 'three';
import {Vector3} from 'three';

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

  this.raycaster = new Raycaster;
  this.mouse = new Vector2;

  this.first = true;

  this.color = 0x00bbee;
  this.count = 0;
  this.linewidth = 5;
  this.max = 500;
}

ScribbleVertexManip.prototype = Object.assign( Object.create(
    VertexManip.prototype ), {
  constructor: ScribbleVertexManip,

  isScribbleVertexManip: true,

  /**
   * Track points on the mesh under the mouse location.
   * @param {Event} event - use the client X & Y
   */
  raycast: function(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    this.rubberband.track( this.mouse );

    const points = this.rubberband.points();

    console.log(points);

    for (let i = 0, l = points.length; i < l; i++) {
      this.raycaster.setFromCamera( this.mouse, this.viewer.camera );
      const intersects = this.raycaster.intersectObject( this.viewer.mesh() );

      if ( intersects.length > 0 ) {
        console.log(intersects[0]);
        const a = intersects[0];
        const positions = this.viewer.mesh().geometry.getAttribute('position');
        this.rubberband.addVertex(new Vector3(positions.array[3*a],
            positions.array[3*a+1],
            positions.array[3*a+2]));
      }
    }
  },

  /**
   * @param {Event} event - the mousedown event to start the drag
   */
  grasp: function( event ) {
    this.viewer.controls.enabled = false;
    this.viewer.controls.saveState();

    this.raycast(event);

    this.viewer.scene.add(this.rubberband);
  },

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    if ( event.type == 'mousemove' ) {
      if ( !this.first ) {
        this.raycast(event);
      } else {
        this.first = false;
      }
    } else if ( event.type == 'mouseup' ) {
      return false;
    }
    return true;
  },
});

export {ScribbleVertexManip};
