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
  this.color = 0xff7700;
  this.linewidth = 3;
  this.epsilon = 0.1;

  if (vec) {
    this.off = vec.clone();
  }

  const positions = new Float32Array( 6 );
  this.geometry = new BufferGeometry;
  this.geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
  this.geometry.setDrawRange( 0, 0 );

  this.material = new LineBasicMaterial({color: this.color,
    linewidth: this.linewidth});
}

Rubberband.prototype = Object.assign( Object.create( Line.prototype ), {

  constructor: Rubberband,

  isRubberband: true,

  /**
   *  Gets a set of points, sampled at epsilon.
   * @return {Float32Array}
   */
  points: function() {
    const dx = (this.tracked.x - this.off.x) * this.epsilon;
    const dy = (this.tracked.y - this.off.y) * this.epsilon;
    const dz = (this.tracked.z - this.off.z) * this.epsilon;

    const totalDist = this.tracked.distanceTo(this.off);

    const start = this.tracked.clone();

    const points = new Float32Array(totalDist / this.epsilon * 3 + 1);

    console.log(totalDist);
    console.log(this.epsilon);

    console.log(totalDist / this.epsilon);

    for (let i = 0, l = totalDist / this.epsilon; i < l; i++) {
      points[i].x = start + dx * i;
      points[i].y = start + dy * i;
      points[i].z = start + dz * i;
    }
    return points;
  },

  /**
   * @param {Vector3} vec - the x, y, z coordinates
   */
  track: function( vec ) {
    if (!this.tracked) {
      this.tracked = new Vector3;
    }

    this.tracked.x = vec.x;
    this.tracked.y = vec.y;
    this.tracked.z = vec.z || 0;

    if (!this.off) {
      this.off = this.tracked.clone();
    }

    if (this.off.distanceTo(this.tracked) > this.epsilon) {
      const positions = this.geometry.attributes.position.array;

      const dx = this.tracked.x - this.off.x;
      const dy = this.tracked.y - this.off.y;
      const dz = this.tracked.z - this.off.z;

      const step = new Vector3(dx, dy, dz);

      console.log(step);
      console.log(this.epsilon * step);

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
