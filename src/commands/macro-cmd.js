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
 * Description: command containing a sequence of other commands to execute
 * @constructor
 * @param {Editor} editor: the editor the command acts within
 * @param {Command} c1
 * @param {Command} c2
 */
function MacroCmd( editor, c1, c2 ) {
  Command.call( this, editor );
  this.type = 'MacroCmd';
  this.cmds = [];
  if (c1) this.cmds.unshift(c1);
  if (c2) this.cmds.unshift(c2);
}

MacroCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: MacroCmd,

  isMacroCmd: true,

  execute: function() {
    for (let i = 0, l = this.cmds.length; i < l; ++i) {
      this.cmds[i].execute();
    }
  },

  unexecute: function() {
    for (let i = 0, l = this.cmds.length; i < l; ++i) {
      this.cmds[i].unexecute();
    }
  },

  reversible: function() {
    for (let i = 0, l = this.cmds.length; i < l; ++i) {
      if (this.cmds[i].reversible()) {
        return true;
      }
    }
    return false;
  },

});

export {MacroCmd};
