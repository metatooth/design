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

import {Rubberband} from './rubberband.js';

/**
 * Description: GrowingVertices are rubberbands defined by a set of vertices
 * that can grow dynamically in number.
 * @constructor
 * @param {Float32Array} px: x buffer
 * @param {Float32Array} py: y buffer
 * @param {Float32Array} pz: z buffer
 * @param {Integer} n: size of x, y, z buffers
 * @param {Integer} pt: current point index
 */
function GrowingVertices(px, py, pz, n, pt) {
  Rubberband.call(this, 0, 0);

  this.type = 'GrowingVertices';

  pt = (pt < 0) ? n : pt;

  this.origbufsize = this.count = n;
  this.bufsize = Math.max(2*n, 50);
  this.origPt = this.curPt = pt;

  this.x = new Float32Array(this.bufsize);
  this.y = new Float32Array(this.bufsize);
  this.z = new Float32Array(this.bufsize);

  for (let i = 0, l = this.count; i < l; ++i) {
    this.x[i] = px[i];
    this.y[i] = py[i];
    this.z[i] = pz[i];
  }
}

GrowingVertices.prototype = Object.assign( Object.create(
    Rubberband.prototype ), {
  constructor: GrowingVertices,

  isGrowingVertices: true,

  /**
   * Description: Inserts a vertex (x, y, z) into the list at this.curPt
   * @param {Float} vx: the x value
   * @param {Float} vy: the y value
   * @param {Float} vz: the z value
   */
  addVertex: function( vx, vy, vz ) {
    ++this.curPt;

    for (let i = this.count, l = this.curPt; i > l; --i) {
      this.x[i] = this.x[i-1];
      this.y[i] = this.y[i-1];
      this.z[i] = this.z[i-1];
    }

    this.x[this.curPt-1] = vx;
    this.y[this.curPt-1] = vy;
    this.z[this.curPt-1] = vz;

    ++this.count;
    this.check();
  },

  /**
   * Description: Appends a vertex (x,y,z) to end of buffer.
   * @param {Float} vx: the x value
   * @param {Float} vy: the y value
   * @param {Float} vz: the z value
   */
  appendVertex: function( vx, vy, vz ) {
    this.curPt = this.count;
    this.addVertex(vx, vy, vz);
  },

  /**
   * Removes the last vertex from the list
   */
  removeVertex: function() {
    this.count = Math.max(0, this.count-1);
    this.curPt = Math.max(0, this.curPt-1);

    for (let i = this.curPt, l = this.count; i < l; ++i) {
      this.x[i] = this.x[i+1];
      this.y[i] = this.y[i+1];
      this.z[i] = this.z[i+1];
    }
  },

  /**
   * Check buffers and resize if necessary
   */
  check: function() {
    if (this.count + 1 >= this.bufsize) {
      this.bufsize *= 2;

      const nx = new Float32Array(this.bufsize);
      const ny = new Float32Array(this.bufsize);
      const nz = new Float32Array(this.bufsize);

      for (let i = 0, l = this.count; i < l; ++i) {
        nx[i] = this.x[i];
        ny[i] = this.y[i];
        nz[i] = this.z[i];
      }

      this.x = nx;
      this.y = ny;
      this.z = nz;
    }
  },
});

export {GrowingVertices};
