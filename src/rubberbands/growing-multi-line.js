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

import {GrowingVertices} from './growing-vertices.js';

/**
 * GrowingMultiLine are Rubberbands defined by a set of vertices
 * that can grow dynamically in number. Represented by a polyline.
 * @constructor
 * @param {Vector3} vec: the first vertex
 */
function GrowingMultiLine(vec) {
  GrowingVertices.call(this, vec);
  this.type = 'GrowingMultiLine';

  this.max = 50;

  const positions = new Float32Array( this.max * 3 );

  const geometry = new BufferGeometry;
  geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
  geometry.setDrawRange( 0, 0 );

  const material = new LineBasicMaterial({color: 0xff7700, linewidth: 3});

  this.line = new Line(geometry, material);
  this.add(this.line);

  if (vec) {
    this.addVertex(vec);
  }
}

GrowingMultiLine.prototype = Object.assign( Object.create(
    GrowingVertices.prototype ), {
  constructor: GrowingMultiLine,

  isGrowingMultiLine: true,

  update: function() {
    // children contain collected vertices, and includes this.line

    const length = this.children.length - 1;

    if (length > this.max) {
      this.max *= 2;
      const positions = new Float32Array( this.max * 2 );
      const doomed = this.line.geometry.getAttribute('position');
      for (let i = 0, l = doomed.length; i < l; i++) {
        positions[i] = doomed[i];
      }
      this.line.geometry.setAttribute('position', positions);
      this.line.geometry.setDrawRange(0, doomed.length/3);
    }

    const last = this.children[length-1];

    const positions = this.line.geometry.getAttribute('position');
    positions[3*(length-1)] = last.position.x;
    positions[3*(length-1)+1] = last.position.y;
    positions[3*(length-1)+2] = last.position.z;
    this.line.geometry.setDrawRange(0, 3*length);
  },

});

export {GrowingMultiLine};
