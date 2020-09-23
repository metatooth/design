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
import {SaveAsCmd} from './SaveAsCmd.js';

/**
 * Description: save command
 * @constructor
 * @param {Editor} editor: the editor the command acts within
 */
function SaveCmd( editor ) {
  Command.call( this, editor, null );
  this.type = 'SaveCmd';
}

SaveCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: SaveCmd,

  isSaveCmd: true,

  execute: function() {
    const modified = this.editor.modified;
    const compName = this.editor.name;
    const name = (compName) ? compName.name : undefined;
    if (name === undefined || compName.name.match(/^\/assets\//)) {
      const saveas = new SaveAsCmd(this.editor);
      saveas.execute();
    } else if (modified && modified.modified) {
      const catalog = this.editor.$parent.catalog;

      catalog.retrieve(name)
          .then((comp) => catalog.save(comp, name))
          .then((ok) => {
            if (ok) {
              if (modified) modified.modified = false;
              const comp = catalog.compMap.get(name);
              this.editor.unidraw.clearHistory(comp);
            } else {
              const saveas = new SaveAsCmd(this.editor);
              saveas.execute();
            }
          })
          .catch((error) => {
            console.log('save-cmd catch @ execute');
            console.log(error);
          });
    }
  },

});

export {SaveCmd};
