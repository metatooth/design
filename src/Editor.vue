<template>
  <div id="editor" @keydown="key($event)" @keyup="key($event)">
    <nav class="navbar is-fixed-top is-transparent"
         role="navigation"
         aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://metatooth.com" target="_blank">
          <img src="./assets/logo.png" alt="Metatooth">
        </a>
        <div v-if=component class="navbar-item">
          <a class="button"
            ref="download"
            v-bind:href=assetUrl
            download>
            <font-awesome-icon icon="download" />
          </a>
        </div>
      </div>
    </nav>
    <Viewer v-bind:component='component' v-bind:tool='tool' />
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

import {ComponentNameVar} from './component-name-var.js';
import {DrawTool} from './tools/draw-tool.js';
import {MarkTool} from './tools/mark-tool.js';
import {ModifiedStatusVar} from './modified-status-var.js';
import {RedoCmd} from './commands/redo-cmd.js';
import {SaveCmd} from './commands/save-cmd.js';
import {SelectTool} from './tools/select-tool.js';
import {UndoCmd} from './commands/undo-cmd.js';

import Viewer from './Viewer.vue';

export default {
  name: 'editor',
  components: {
    Viewer,
  },
  props: {
    asset: String,
  },
  data: function() {
    return {
      assetUrl: null,
      component: null,
      modes: ['view', 'mark', 'draw', 'select'],
      mode: 'view',
      modified: null,
      name: null,
      tool: null,
    };
  },
  watch: {
    asset: function( newVal, oldVal ) {
      this.unidraw().catalog.retrieve(newVal, newVal)
          .then((response) => {
            this.component = response;
            this.modified = new ModifiedStatusVar(response);
            this.name = new ComponentNameVar(response, this.$parent.catalog);
          });
    },
    component: function( newVal, oldVal ) {
      if (newVal) {
        document.body.style.cursor = 'default';
      }
    },
    mode: function( newVal, oldVal ) {
      if ( this.mode == this.modes[0] ) {
        this.tool = null;
        document.body.style.cursor = 'default';
      } else if ( this.mode == this.modes[1] ) {
        this.tool = new MarkTool;
        document.body.style.cursor = 'crosshair';
      } else if ( this.mode == this.modes[2] ) {
        this.tool = new DrawTool;
        document.body.style.cursor = 'crosshair';
      } else if ( this.mode == this.modes[3] ) {
        this.tool = new SelectTool;
        document.body.style.cursor = 'crosshair';
      }
    },
  },
  methods: {
    key: function( event ) {
      console.log( event.key, event.keyCode );
      if (event.type == 'keydown') {
        if ( event.keyCode == 32) {
          const save = new SaveCmd(this);
          save.execute();
        } else if ( event.ctrlKey && event.keyCode == 90 ) {
          const undo = new UndoCmd(this);
          undo.execute();
        } else if ( ( event.ctrlKey && event.keyCode == 89 ) ||
            event.keyCode == 115 ) {
          const redo = new RedoCmd(this);
          redo.execute();
        } else if ( event.keyCode == 86 ) {
          this.mode = this.modes[0];
        } else if ( event.keyCode == 77 ) {
          this.mode = this.modes[1];
        } else if ( event.keyCode == 68 ) {
          this.mode = this.modes[2];
        } else if ( event.keyCode == 83 ) {
          this.mode = this.modes[3];
        }
      } else if ( event.type == 'keyup' ) {
        this.mode = this.modes[0];
      }
    },
    unidraw: function() {
      return this.$parent;
    },
  },
};
</script>

<style>
</style>

