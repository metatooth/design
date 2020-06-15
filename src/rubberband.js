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

import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
import {Vector3} from 'three';

/**
 * Description: rubberbanding graphical objects
 * @constructor
 * @param {Vector3} vec: the initial x, y, z coordinates
 */
function Rubberband( vec ) {
  Line.call(this);
  this.type = 'Rubberband';

  this.off = null;
  this.tracked = null;

  if (vec) {
    this.off = vec.clone();
  }

  const positions = new Float32Array( 6 );
  this.geometry = new BufferGeometry;
  this.geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
  this.geometry.setDrawRange( 0, 0 );

  this.material = new LineBasicMaterial({color: 0xff7700, linewidth: 1});
}

Rubberband.prototype = Object.assign( Object.create( Line.prototype ), {

  constructor: Rubberband,

  isRubberband: true,

  /**
   * @param {Vector3} vec - the x, y, z coordinates
   */
  track: function( vec ) {
    if (!this.tracked) {
      this.tracked = new Vector3;
    }

    this.tracked.x = vec.x;
    this.tracked.y = vec.y;
    this.tracked.z = vec.z;

    if (!this.off) {
      this.off = this.tracked.clone();
    }

    if (this.off.distanceTo(this.tracked) > 0) {
      const positions = this.geometry.attributes.position.array;

      positions[0] = this.off.x;
      positions[1] = this.off.y;
      positions[2] = this.off.z;

      positions[3] = this.tracked.x;
      positions[4] = this.tracked.y;
      positions[5] = this.tracked.z;

      this.geometry.setDrawRange( 0, 2 );
    } else {
      this.geometry.setDrawRange( 0, 0 );
    }

    this.geometry.attributes.position.needsUpdate = true;
  },

});

export {Rubberband};
