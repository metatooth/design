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
export default {
  name: 'tool-control',
  props: {
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
        this.$parent.activate(this.keyCode);
      }
    },
  },
};
</script>

<style scoped>
</style>
