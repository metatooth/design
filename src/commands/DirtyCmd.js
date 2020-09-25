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

import {Command} from './Command.js';

/**
 * Description: command sets the modified flag for the root component
 * @param {Editor} editor: the editor the command acts within
 */
function DirtyCmd( editor ) {
  Command.call( this, editor, null );
  this.type = 'DirtyCmd';
}

DirtyCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: DirtyCmd,

  isDirtyCmd: true,

  reverse: false,

  execute: function() {
    if (this.reverse) {
      this.reverse = false;
      this.unexecute();
      this.reverse = true;
    } else {
      if (this.editor.modified) this.editor.modified.modified = true;
    }
  },

  unexecute: function() {
    if (this.reverse) {
      this.reverse = false;
      this.execute();
      this.reverse = true;
    } else {
      if (this.editor.modified) this.editor.modified.modified = false;
    }
  },

});

export {DirtyCmd};
