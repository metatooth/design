<template>
  <div class="widget">
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <circle class="pointer" r="20" cx="60" cy="60"
              fill="#fefefe" @click="center" />
      <polygon class="pointer" points="60,5 75,35 45,35"
               fill="#fefefe" @click="top" />
      <polygon class="pointer" points="60,115 75,85 45,85"
               fill="#fefefe" @click="bottom" />
      <polygon class="pointer" points="5,60 35,75 35,45"
               fill="#fefefe" @click="left" />
      <polygon class="pointer" points="85,45 115,60 85,75"
               fill="#fefefe" @click="right" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'view-widget',
  methods: {
    center: function(event) {
      this.$emit('view-center');
    },
    top: function(event) {
      this.$emit('view-top');
    },
    bottom: function(event) {
      this.$emit('view-bottom');
    },
    left: function(event) {
      this.$emit('view-left');
    },
    right: function(event) {
      this.$emit('view-right');
    },
  },
};
</script>

<style scoped>
.widget {
  background-color: transparent;
  color: #fefefe;
  position: absolute;
  bottom: 100px;
  margin: 10px;
  width: calc(100vw - 40px);
  text-align: right;
  user-select: none;
  z-index: 1000;
}

.pointer {
  cursor: pointer;
}
</style>

