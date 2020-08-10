<template>
<div class="navbar-item">
  <div class="button" v-bind:class="classObject" v-on:click="clicked()">
    <span class="icon">
      <font-awesome-icon :icon="icon" />
    </span>
    <span>
      <strong>
        <u>{{ keyCode.toUpperCase() }}</u>{{ label.substr(1) }}
      </strong>
    </span>
  </div>
</div>
</template>

<script>
export default {
  name: 'user-control',
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
      defalt: false,
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
      this.$parent.activate(this.keyCode);
    },
  },
};
</script>

<style scoped>
</style>
