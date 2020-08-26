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

import {Object3D} from 'three';

/**
 * Component - class of objects that are edited to form
 * domain-specific drawings. Component subjects contain structural,
 * connectivity, constraint, and transfer function information.
 * @constructor
 * @param {Object3D} object3d the first child
 */
function Component(object3d) {
  Object3D.call(this);
  if (object3d) this.add(object3d);
  this.type = 'Component';
}

Component.prototype = Object.assign( Object.create( Object3D.prototype ), {
  constructor: Component,

  isComponent: true,

  /**
   * Description: analyze and act on a command
   * @param {Command} command: the command sent by the user interface
   */
  interpret: function( command ) {
    if (command.constructor.name == 'PasteCmd') {
      for (let i = 0, l = command.clipboard.length; i < l; ++i) {
        this.add( command.clipboard[i] );
      }
    }
  },

  /**
   * Description: analyze and revert the action of a command
   * @param {Command} command: the command sent by the user interface
   */
  uninterpret: function( command ) {
    if (command.constructor.name == 'PasteCmd') {
      for (let i = 0, l = command.clipboard.length; i < l; ++i) {
        this.remove( command.clipboard[i] );
      }
    }
  },


});

export {Component};
