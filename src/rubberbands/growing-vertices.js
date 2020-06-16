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

import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {LineBasicMaterial} from 'three';

import {Rubberband} from './rubberband.js';

/**
 * Description: GrowingVertices are rubberbands defined by a set of vertices
 * that can grow dynamically in number.
 * @constructor
 * @param {Vector3} vec: the first vertex
 */
function GrowingVertices(vec) {
  Rubberband.call(this, vec);

  this.type = 'GrowingVertices';
  this.count = 0;
  this.max = 500;
  this.color = 0xff7700;
  this.linewidth = 5;

  const positions = new Float32Array( this.max * 3 );
  this.geometry = new BufferGeometry;
  this.geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
  this.geometry.setDrawRange( 0, this.count );

  this.material = new LineBasicMaterial({color: this.color,
    linewidth: this.linewidth});
}

GrowingVertices.prototype = Object.assign( Object.create(
    Rubberband.prototype ), {
  constructor: GrowingVertices,

  isGrowingVertices: true,

  /**
   * Description: Inserts a vertex (x, y, z) into the list at this.curPt
   * @param {Vector3} v: the vertex to add
   */
  addVertex: function( v ) {
    const positions = this.geometry.attributes.position.array;

    positions[this.count++] = v.x;
    positions[this.count++] = v.y;
    positions[this.count++] = v.z;

    this.geometry.setDrawRange( 0, this.count / 3 );
    this.geometry.attributes.position.needsUpdate = true;

    this.check();
  },

  /**
   * Removes the last vertex from the list
   */
  removeVertex: function() {
    this.count -= 3;
    this.geometry.setDrawRange( 0, this.count / 3 );
    this.geometry.attributes.position.needsUpdate = true;
  },

  /**
   * Check buffers and resize if necessary
   */
  check: function() {
    if (this.count + 1 >= this.max) {
      console.log('Buffer Overflow!');
    }
  },

});

export {GrowingVertices};
