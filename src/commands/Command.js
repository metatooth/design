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

/**
 * Description: Command objects operator on selected components, and
 * editor, or the app itself.
 * @constructor
 * @param {Editor} editor the editor the command acts within
 * @param {Array} clipboard an array of objects that will be acted upon
 */
function Command( editor, clipboard ) {
  this.editor = editor;
  this.clipboard = clipboard;
  this.type = 'Command';
}

Object.assign( Command.prototype, {
  constructor: Command,

  isCommand: true,

  /**
   * Do something
   */
  execute: function() {

  },

  /**
   * Undo something
   */
  unexecute: function() {

  },

  /**
   * If true, the command can be unexecuted.
   * @return {boolean}
   */
  reversible: function() {
    return false;
  },

  /**
   * Log the command.
   */
  log: function() {
    this.editor.unidraw.log(this);
  },

});

export {Command};
