<template>
<div @keydown="key($event)" @keyup="key($event)">
  <Viewer v-bind:component='component' v-bind:tool='tool' ref="viewer"/>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="navbar-item">
        <a href="https://metatooth.com" target="_blank">
          <img src="./assets/logo.png" width="30" alt="Metatooth">
        </a>
      </div>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <user-control
          v-for="control in controls"
          v-bind:key="control.id"
          v-bind:keyLabel="control.id"
          v-bind:keyCode="control.id"
          v-bind:label="control.label"
          v-bind:icon="control.icon"
          v-bind:active="control.active"
          ref="control">
        </user-control>
      </div>
      <div class="navbar-end">
        <save-control v-bind:modified="modified" ref="save" />
        <user-control
          v-for="command in commands"
          v-bind:key="command.id"
          v-bind:keyLabel="command.id"
          v-bind:keyCode="command.id"
          v-bind:label="command.label"
          v-bind:icon="command.icon"
          v-bind:enabled="command.enabled"
          ref="command">
        </user-control>
        <div class="navbar-item">
          <a class="button disabled" v-bind:href=assetUrl download>
            <span class="icon">
              <font-awesome-icon icon="download"/>
            </span>
          </a>
        </div>
      </div>
    </div>
  </nav>
  <div class="meta">
    <span>Design x Metatooth</span><br/>
    <span>r{{version}}</span><br/>
    <span>&copy; Metatooth 2020</span><br/>
  </div>
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

import {Vector3} from 'three';

import {ComponentNameVar} from './component-name-var.js';
import {DijkstraCmd} from './commands/dijkstra-cmd.js';
import {DrawTool} from './tools/draw-tool.js';
import {MeasureTool} from './tools/measure-tool.js';
import {ModifiedStatusVar} from './modified-status-var.js';
import {PickTool} from './tools/pick-tool.js';
import {RedoCmd} from './commands/redo-cmd.js';
import {RotateTool} from './tools/rotate-tool.js';
import {UndoCmd} from './commands/undo-cmd.js';

import SaveControl from './SaveControl.vue';
import UserControl from './UserControl.vue';
import Viewer from './Viewer.vue';

export default {
  name: 'editor',
  components: {
    SaveControl,
    UserControl,
    Viewer,
  },
  props: {
    uri: String,
    version: String,
  },
  data: function() {
    return {
      assetUrl: null,
      component: null,
      commands: [
        {id: 'z', command: new UndoCmd(this), label: 'Undo', icon: 'undo',
          enabled: true},
        {id: 'y', command: new RedoCmd(this), label: 'Redo', icon: 'redo',
          enabled: true},
      ],
      controls: [
        {id: 'r', tool: new RotateTool,
          label: 'Rotate View', icon: 'sync', cursor: 'default',
          active: true},
        {id: 'm', tool: new MeasureTool,
          label: 'Measure', icon: 'ruler', cursor: 'crosshair',
          active: false},
        {id: 'p', tool: new PickTool,
          label: 'Pick', icon: 'crosshairs', cursor: 'crosshair',
          active: false},
        {id: 'd', tool: new DrawTool,
          label: 'Draw', icon: 'pen-square', cursor: 'crosshair',
          active: false},
      ],
      modified: new ModifiedStatusVar(null, false),
      name: null,
      tool: null,
    };
  },
  computed: {
    unidraw: function() {
      return this.$parent;
    },
    viewer: function() {
      return this.$refs.viewer;
    },
  },
  watch: {
    uri: function( newVal, oldVal ) {
      this.unidraw.catalog.retrieve(newVal)
          .then((response) => {
            this.component = response;
            this.name = new ComponentNameVar(this.component,
                this.unidraw.catalog);
            this.modified = new ModifiedStatusVar(this.component, false);
            if (this.component.type === 'Metamesh') {
              this.assetUrl = this.component.children[0].sourceUrl;
            }
          });
    },
    component: function( newVal, oldVal ) {
      document.body.style.cursor = 'default';
    },
  },
  mounted: function() {
    this.tool = this.controls[0].tool;
  },
  methods: {
    activate: function(key) {
      this.viewer.scene.remove( this.viewer.temp );
      this.viewer.temp = null;
      let activated = false;
      for (let i = 0, l = this.controls.length; i < l; i++) {
        this.controls[i].active = false;
        if (key === this.controls[i].id) {
          activated = true;
          document.body.style.cursor = this.controls[i].cursor;
          this.tool = this.controls[i].tool;
          this.controls[i].active = true;
          if (key === 'm') {
            this.commands[0].enabled = false;
            this.commands[1].enabled = false;
          } else {
            this.commands[0].enabled = true;
            this.commands[1].enabled = true;
          }
        }
      }
      return activated;
    },
    key: function( event ) {
      if (event.type == 'keydown') {
        if (!this.activate(event.key)) {
          if ( event.keyCode == 32 ) {
            // SPACE
            console.log(this.component);
            let geometry = null;
            for (let i = 0, l = this.component.children.length; i < l; i++) {
              if (this.component.children[i].type === 'Mesh') {
                continue;
              }

              geometry = this.component.children[i].children[0].geometry;
              const positions = geometry.getAttribute('position');
              const last = (positions.count - 1) * 3;
              console.log(last);
              for (let j = 0, l = (positions.count - 1) * 3; j < l; j++) {
                const source = new Vector3(positions.array[j],
                    positions.array[j+1],
                    positions.array[j+2]);
                const target = new Vector3(positions.array[j+3],
                    positions.array[j+4],
                    positions.array[j+5]);
                const dijkstra = new DijkstraCmd(this, source, target);
                dijkstra.execute();
              }
            }
          } else if ( event.keyCode == 83 ) {
            // s
            this.$refs.save.command.execute();
          } else if (this.tool.type != 'MeasureTool') {
            this.commands.forEach((elem) => {
              if ( event.keyCode == elem.id ) {
                elem.command.execute();
              }
            });
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #fefefe;
  position: absolute;
  top: 0px;
  width: 100%;
}
.meta {
  background-color: transparent;
  color: #fefefe;
  position: absolute;
  bottom: 0px;
  margin: 10px;
  width: calc(100vw - 40px);
  text-align: right;
  user-select: none;
  pointer-events: none;
  z-index: 1;
}
</style>

