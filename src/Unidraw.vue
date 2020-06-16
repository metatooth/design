<template>
<div id="unidraw">
  <div id="logo">
    <img width="145" alt="Metatooth Logo" src="./assets/logo.png">
    <br/>
    <span id="copyright">&copy; Metatooth 2020</span>
    --
    <span id="version">Version {{version}}</span>
    --
    <span id="commit">Commit {{commit}}</span>
  </div>
  <Editor v-bind:asset='asset' ref="editor"/>
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
import {History} from './history.js';

export default {
  name: 'unidraw',
  components: {
    Editor,
  },
  data: function() {
    return {
      asset: null,
      commit: '',
      histories: new Map,
      maxhistlen: 100,
      version: '',
    };
  },
  mounted() {
    this.version = process.env.VUE_APP_VERSION;
    this.commit = process.env.VUE_APP_COMMIT;

    const query = window.location.search;
    const params = new URLSearchParams( query );
    if (params.get('asset')) {
      this.asset = params.get( 'asset' );
    }
  },
  methods: {
    log: function(command) {
      if (command.reversible()) {
        const editor = command.editor;
        const comp = editor.component;

        if (!this.histories.has(comp)) {
          this.histories.set(comp, new History);
        }

        const history = this.histories.get(comp);

        if (history.future.length > 0) {
          history.future.splice(0, history.future.length);
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

<style>
#app {
    background-color: #2d2d2d;
}
#logo {
    background-color: transparent;
    position: absolute;
    bottom: 0px;
    width: 100%;
    text-align: center;
    user-select: none;
    pointer-events: none;
    z-index: 1;
}
</style>
