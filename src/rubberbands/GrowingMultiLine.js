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

import {CylinderGeometry} from 'three';
import {Matrix4} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {Object3D} from 'three';
import {Vector3} from 'three';

import {GrowingVertices} from './GrowingVertices.js';

/**
 * GrowingMultiLine are Rubberbands defined by a set of vertices
 * that can grow dynamically in number. Represented by a polyline.
 * @constructor
 * @param {Vector3} vec the first vertex
 */
function GrowingMultiLine(vec) {
  GrowingVertices.call(this, vec);
  this.type = 'GrowingMultiLine';

  this.material = new MeshPhongMaterial( {color: 0xff33bb} );
}

GrowingMultiLine.prototype = Object.assign( Object.create(
    GrowingVertices.prototype ), {
  constructor: GrowingMultiLine,

  isGrowingMultiLine: true,

  cylinder: function( a, b ) {
    const dir = new Vector3().subVectors( b, a );
    const orient = new Matrix4;
    orient.lookAt( a, b, new Object3D().up);
    const align = new Matrix4;
    align.set(1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        0, 0, 0, 1);
    orient.multiply(align);

    const edgeGeom = new CylinderGeometry( 0.2, 0.2, dir.length(), 8, 1 );
    const edge = new Mesh( edgeGeom, this.material );

    edge.applyMatrix4(orient);

    const vec = new Vector3().addVectors( a, dir.multiplyScalar(0.5) );
    edge.position.x = vec.x;
    edge.position.y = vec.y;
    edge.position.z = vec.z;

    return edge;
  },

  update: function() {
    const length = this.vertices.length;

    if (length > 1) {
      const v0 = this.vertices[length - 2];
      const v1 = this.vertices[length - 1];

      this.add( this.cylinder( v0, v1 ) );
    }
  },

});

export {GrowingMultiLine};
