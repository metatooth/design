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

import {BufferGeometry} from 'three';
import {BufferAttribute} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';

import {Component} from '../components/component.js';
import {GrowingVertices} from '../rubberbands/growing-vertices.js';
import {PasteCmd} from '../commands/paste-cmd.js';
import {ScribbleVertexManip} from '../manipulators/scribble-vertex-manip.js';
import {Tool} from './tool.js';

/**
 * Description: A tool for drawing.
 * @constructor
 */
function DrawTool() {
  Tool.call( this );

  this.type = 'DrawTool';

  this.color = 0xff33bb;
  this.linewidth = 5;
}

DrawTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: DrawTool,

  isDrawTool: true,

  /**
   * @param {Viewer} viewer - the container
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      return new ScribbleVertexManip( viewer, new GrowingVertices, this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    if (manipulator.rubberband.count > 0) {
      const doomed = manipulator.rubberband.geometry.attributes.position.array;

      const positions = new Float32Array( manipulator.rubberband.count );
      for (let i = 0, l = manipulator.rubberband.count; i < l; ++i) {
        positions[i] = doomed[i];
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
      geometry.setDrawRange( 0, manipulator.rubberband.count / 3 );
      const material = new LineBasicMaterial({color: this.color,
        linewidth: this.linewidth});

      const line = new Line( geometry, material );

      return new PasteCmd( manipulator.viewer.editor(), [new Component(line)] );
    }
    return null;
  },
});

export {DrawTool};
