<template>
<div class="navbar-item">
  <div class="button"
       v-bind:disabled="!enabled"
       v-bind:class="classObject"
       v-on:click="clicked()">
    <span class="icon">
      <font-awesome-icon icon="file-export"/>
    </span>
    <span>
      <strong>Export [{{ this.code }}]</strong>
    </span>
  </div>
</div>
</template>

<script>
import {ExportCmd} from './commands/ExportCmd.js';

export default {
  name: 'save-control',
  props: {
    active: Boolean,
    modified: Object,
  },
  data: function() {
    return {
      command: null,
      code: 'e',
    };
  },
  mounted: function() {
    this.command = new ExportCmd(this.$parent);
  },
  computed: {
    classObject: function() {
      return {
        'is-active': this.active,
      };
    },
    enabled: function() {
      const compName = this.$parent.name;
      const name = (compName) ? compName.name : undefined;

      if (name !== undefined) {
        const plan = name.match(/\/([0-9a-fA-F]+)\//);
        const revision = name.match(/\/([0-9a-fA-F]+)$/);
        if (plan && revision) {
          return !this.modified.modified;
        }
      }

      return false;
    },
  },
  methods: {
    clicked: function() {
      if (this.enabled) {
        this.command.execute();
      }
    },
  },
};
</script>

<style>
</style>
