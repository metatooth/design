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

import {Rubberband} from './rubberband.js';

/**
 * Rubberbanding lines.
 * @constructor
 * @param {Vector3} fixed: the initial x, y, z coordinates
 * @param {Vector3} moving: the x, y, z coordinates from the mouse
 * @param {Vector3} off: offset x, y, z coordinates
 */
function RubberLine( fixed, moving, off ) {
  Rubberband.call(this, off);
  this.type = 'RubberLine';

  this.fixed = (fixed) ? fixed.clone() : null;
  this.moving = (moving) ? moving.clone() : null;
  this.tracked = (moving) ? moving.clone() : null;

  const positions = new Float32Array( 6 );

  const geometry = new BufferGeometry;
  geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
  geometry.setDrawRange( 0, 0 );

  const material = new LineBasicMaterial({color: 0xff7700, linewidth: 3});

  this.line = new Line(geometry, material);
  this.add(this.line);
}

RubberLine.prototype = Object.assign( Object.create( Rubberband.prototype ), {

  constructor: RubberLine,

  isRubberLine: true,

  original: function() {
    return [this.fixed, this.moving];
  },

  current: function() {
    return [this.fixed, this.tracked];
  },

  update: function() {
    const curr = this.current();

    const positions = this.line.geometry.attributes.position.array;

    positions[0] = curr[0].x;
    positions[1] = curr[0].y;
    positions[2] = curr[0].z;

    positions[3] = curr[1].x;
    positions[4] = curr[1].y;
    positions[5] = curr[1].z;

    this.line.geometry.setDrawRange( 0, 2 );

    this.line.geometry.attributes.position.needsUpdate = true;
  },

});

export {RubberLine};
