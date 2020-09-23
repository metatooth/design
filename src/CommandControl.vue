<template>
<div class="navbar-item">
  <div class="button"
    v-bind:disabled="!enabled"
    v-bind:class="classObject"
    v-on:click="clicked()">
    <span class="icon">
      <font-awesome-icon :icon="icon" />
    </span>
    <span>
      <strong>
        {{ label }} [{{ keyCode }}]
      </strong>
    </span>
  </div>
</div>
</template>

<script>
import {Command} from './commands/command.js';

export default {
  name: 'command-control',
  props: {
    command: {
      type: Command,
      default: null,
    },
    label: {
      type: String,
      default: 'null',
    },
    keyLabel: {
      type: String,
      default: 'null',
    },
    keyCode: {
      type: String,
      default: 'null',
    },
    icon: {
      type: String,
      default: 'null',
    },
    active: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    classObject: function() {
      return {
        'is-active': this.active,
      };
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

<style scoped>
</style>
