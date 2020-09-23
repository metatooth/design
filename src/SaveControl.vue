<template>
<div class="navbar-item">
  <div class="button"
       v-bind:disabled="!enabled"
       v-bind:class="classObject"
       v-on:click="clicked()">
    <span class="icon">
      <font-awesome-icon icon="save"/>
    </span>
    <span>
      <strong>Save [{{ this.code }}]</strong>
    </span>
  </div>
</div>
</template>

<script>
import {SaveCmd} from './commands/SaveCmd.js';

export default {
  name: 'save-control',
  props: {
    active: Boolean,
    modified: Object,
  },
  data: function() {
    return {
      command: null,
      code: 's',
    };
  },
  mounted: function() {
    this.command = new SaveCmd(this.$parent);
  },
  computed: {
    classObject: function() {
      return {
        'is-active': this.active,
      };
    },
    enabled: function() {
      return this.modified.modified;
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
