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

import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {SphereGeometry} from 'three';

import {ClickManip} from '../manipulators/ClickManip.js';
import {PasteCmd} from '../commands/PasteCmd.js';
import {Tool} from './Tool.js';

/**
 * Description: A tool for drawing.
 * @constructor
 */
function MarkTool() {
  Tool.call( this );

  this.type = 'MarkTool';

  this.radius = 0.3;
  this.div = 32;
  this.color = 0xff33bb;
  this.specular = 0x111111;
  this.shininess = 90;
}

MarkTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: MarkTool,

  isMarkTool: true,

  /**
   * @param {Viewer} viewer the visualization container
   * @param {Event} event the starting event
   * @return {Manipulator}
   */
  create: function( viewer, event ) {
    if (event.type == 'mousedown') {
      return new ClickManip( viewer, this );
    }
    return null;
  },

  /**
   * @param {Manipulator} manipulator the manipulation to analyze
   * @return {Command}
   */
  interpret: function( manipulator ) {
    if (manipulator.found) {
      const geometry = new SphereGeometry( this.radius, this.div, this.div );
      const material = new MeshPhongMaterial( {color: this.color,
        specular: this.specular, shininess: this.shininess} );

      const sphere = new Mesh( geometry, material );
      sphere.position.x = manipulator.point.x;
      sphere.position.y = manipulator.point.y;
      sphere.position.z = manipulator.point.z;
      sphere.name = 'point';

      return new PasteCmd(manipulator.viewer.editor(), [sphere]);
    }
    return null;
  },
});

export {MarkTool};
