<template>
<div id="unidraw">
  <div id="meta">
    <span id="copyright">&copy; Metatooth 2020</span>
    <br/>
    <span id="version">Version {{version}}</span>
    <br/>
    <span id="commit">Commit {{commit}}</span>
  </div>
  <Editor v-bind:uri='uri' ref="editor"/>
</div>
</template>

<script>
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

import Editor from './Editor.vue';

import {Catalog} from './catalog.js';
import {History} from './history.js';

import {DirtyCmd} from './commands/dirty-cmd.js';
import {MacroCmd} from './commands/macro-cmd.js';

export default {
  name: 'unidraw',
  components: {
    Editor,
  },
  data: function() {
    return {
      catalog: new Catalog,
      commit: '',
      histories: new Map,
      maxhistlen: 100,
      uri: null,
      version: '',
    };
  },
  mounted() {
    this.version = process.env.VUE_APP_VERSION;
    this.commit = process.env.VUE_APP_COMMIT;

    const query = window.location.search;
    const params = new URLSearchParams( query );
    if (params.get('asset')) {
      this.uri = '/assets/' + params.get('asset');
    } else if (params.get('plan')) {
      this.uri = '/plans/' + params.get( 'plan' );
    } else if (process.env.VUE_APP_DEFAULT_PLAN) {
      this.uri = '/plans/' + process.env.VUE_APP_DEFAULT_PLAN;
    }
  },
  methods: {
    clearHistory: function(comp) {
      if (!this.histories.has(comp)) {
        const history = this.histories.get(comp);

        history.past.splice(0, history.past.length);
        history.future.splice(0, history.future.length);
      }
    },
    log: function(command) {
      if (command.reversible()) {
        const editor = command.editor;
        const comp = editor.component;

        if (!this.histories.has(comp)) {
          this.histories.set(comp, new History);
        }

        const history = this.histories.get(comp);

        history.future.splice(0, history.future.length);

        if (editor.modified && !editor.modified.modified) {
          const dirtycmd = new DirtyCmd(editor);
          dirtycmd.execute();
          command = new MacroCmd(editor, command, dirtycmd);
        }

        history.past.unshift(command);

        if (history.past.length > this.maxhistlen) {
          history.past.splice(this.maxhistlen - 1,
              history.past.length - this.maxhistlen);
        }
      }
    },
    undo: function(component, n = 1) {
      if (!this.histories.has(component)) {
        this.histories.set(component, new History);
      }

      const history = this.histories.get(component);

      for (let i = 0, l = history.past.length; i < n && i < l; ++i) {
        const command = history.past.shift();
        command.unexecute();

        history.future.unshift(command);
      }
    },
    redo: function(component, n = 1) {
      if (!this.histories.has(component)) {
        this.histories.set(component, new History);
      }

      const history = this.histories.get(component);

      for (let i = 0, l = history.future.length; i < n && i < l; ++i) {
        const command = history.future.shift();
        command.execute();

        history.past.unshift(command);
      }
    },
  },
};
</script>

<style lang="scss">
$pink: #ff33bb;
$cyan: #00bbee;
$green: #00dd77;
$orange: #ff7700;
$white: #fdfdfd;
$jet: #2d2d2d;

$primary: $green;

@import 'bulma';

#app {
    background-color: #2d2d2d;
}
#meta {
    background-color: transparent;
    color: #fdfdfd;
    position: absolute;
    bottom: 0px;
    margin: 10px;
    text-align: right;
    width: 95%;
    user-select: none;
    pointer-events: none;
    z-index: 1;
}
</style>
