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

import {MeshPhongMaterial} from 'three';
import {SphereGeometry} from 'three';
import {Mesh} from 'three';

import {Rubberband} from './rubberband.js';

/**
 * GrowingVertices are Rubberbands defined by a set of vertices
 * that can grow dynamically in number.
 * @constructor
 * @param {Vector3} vec: the first vertex
 */
function GrowingVertices(vec) {
  Rubberband.call(this, vec);

  this.type = 'GrowingVertices';

  if (vec) {
    this.track(vec);
  }
}

GrowingVertices.prototype = Object.assign( Object.create(
    Rubberband.prototype ), {
  constructor: GrowingVertices,

  isGrowingVertices: true,

  update: function() {
    // no op
  },

  /**
   * Description: Inserts a vertex (x, y, z) into the list at this.curPt
   * @param {Vector3} v: the vertex to add
   */
  addVertex: function( v ) {
    const geometry = new SphereGeometry(0.3, 32, 32);
    const material = new MeshPhongMaterial({color: 0xff33bb});
    const mesh = new Mesh(geometry, material);

    mesh.position.x = v.x;
    mesh.position.y = v.y;
    mesh.position.z = v.z;

    this.add(mesh);
  },

  /**
   * Removes the last vertex from the list
   */
  removeVertex: function() {
    this.children.pop();
  },

});

export {GrowingVertices};
