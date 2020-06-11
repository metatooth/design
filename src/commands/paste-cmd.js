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

import {Command} from './command.js';

/**
 * Description: paste command
 * @constructor
 * @param {Editor} editor: the editor the command acts within
 * @param {Array} clipboard: an array of Component objects that will
 * interpret the command
 */
function PasteCmd( editor, clipboard ) {
  Command.call( this, editor, clipboard );
}

PasteCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: PasteCmd,

  isPasteCmd: true,

  executed: false,

  execute: function() {
    this.editor.component.interpret(this);
    this.executed = true;
  },

  unexecute: function() {
    this.editor.component.uninterpret(this);
    this.executed = false;
  },

  /**
   * If true, the command can be unexecuted.
   * @return {boolean}
   */
  reversible: function() {
    return ( this.clipboard.length > 0 );
  },

});

export {PasteCmd};
