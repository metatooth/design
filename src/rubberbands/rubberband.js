/*
 * Copyright (c) 1987, 1988, 1989, 1990, 1991 Stanford University
 * Copyright (c) 1991 Silicon Graphics, Inc.
 *
 * Permission to use, copy, modify, distribute, and sell this software and
 * its documentation for any purpose is hereby granted without fee, provided
 * that (i) the above copyright notices and this permission notice appear in
 * all copies of the software and related documentation, and (ii) the names of
 * Stanford and Silicon Graphics may not be used in any advertising or
 * publicity relating to the software without the specific, prior written
 * permission of Stanford and Silicon Graphics.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL STANFORD OR SILICON GRAPHICS BE LIABLE FOR
 * ANY SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND,
 * OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
 * WHETHER OR NOT ADVISED OF THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF
 * LIABILITY, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
 */

import {Object3D} from 'three';
import {Vector3} from 'three';

/**
 * Rubberbanding primitive for tracking points
 * @constructor
 * @param {Vector3} offset an x, y, z offset
 */
function Rubberband( offset ) {
  Object3D.call(this);
  this.type = 'Rubberband';

  this.offset = (offset !== undefined) ? offset.clone() : null;
  this.tracked = null;
}

Rubberband.prototype = Object.assign( Object.create( Object3D.prototype ), {

  constructor: Rubberband,

  isRubberband: true,

  /**
   * Returns mid-point between two Vector3 objects.
   * @param {Vector3} v0
   * @param {Vector3} v1
   * @return {Vector3}
   */
  midpoint: function(v0, v1) {
    return new Vector3((v0.x + v1.x) / 2.0,
        (v0.y + v1.y) / 2.0,
        (v0.z + v1.z) / 2.0);
  },

  update: function() {
    throw new Error('Rubberband::update is an abstract method.');
  },

  /**
   * @param {Vector3} vec - the x, y, z coordinates to track
   */
  track: function( vec ) {
    if (!this.tracked) {
      this.tracked = new Vector3;
    }

    if (this.tracked !== vec) {
      this.tracked.x = vec.x;
      this.tracked.y = vec.y;
      this.tracked.z = vec.z;
      this.update();
    }
  },

});

export {Rubberband};
