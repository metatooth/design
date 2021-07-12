<template>
  <div
    class="context-menu"
    :style="style"
    ref="context"
    tabindex="0">
    <ul>
      <li
        v-for="option in options"
        :key="option.id"
        @click.stop="clicked(option)"
        class="contect-menu__item"
        :class="[option.class,
                (option.type === 'divider' ? 'context-menu__divider' : '')]"
        >
        <span v-html="option.label"></span>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue';

const ContextMenu = Vue.extend({
  name: 'ContextMenu',
  props: {
    options: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  data() {
    return {
      left: 0,
      top: 0,
      show: false,
    };
  },
  computed: {
    style() {
      return {
        top: this.top + 'px',
        left: this.left + 'px',
      };
    },
  },
  methods: {
    clicked(option) {
      this.$refs.context.classList.remove('context-menu--active');
      this.$emit('option-clicked', option);
    },
    close() {
      console.log('close');
      this.$refs.context.classList.remove('context-menu--active');
      this.show = false;
      this.left = 0;
      this.top = 0;
    },
    open(ev) {
      console.log('open', ev);
      this.$refs.context.classList.add('context-menu--active');
      this.left = ev.pageX || ev.clientX;
      this.top = (ev.pageY || ev.clientY) - window.pageYOffset;
      Vue.nextTick(() => this.$el.focus());
      this.show = true;
    },
    onEscKeyRelease(ev) {
      if (ev.keyCode === 27) {
        this.$refs.context.classList.remove('context-menu--active');
      }
    },
  },
  mounted() {
    document.body.addEventListener('keyup', this.onEscKeyRelease);
  },
  beforeDestroy() {
    document.body.removeEventListener('keyup', this.onEscKeyRelease);
  },
});

export default ContextMenu;
</script>

<style lang="scss">
.context-menu {
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  display: none;
  list-style: none;
  position: absolute;
  z-index: 1000000;
  background-color: #fefefe;
  border-bottom-width: 0px;
  box-shadow: 0 3px 6px 0 rgba(#c2c2c2, 0.2);
  border-radius: 4px;

  &--active {
    display: block;
  }

  &__item {
    display: flex;
    color: #c2c2c2;
    cursor: pointer;
    padding: 5px 15px;
    align-items: center;

    &:hover {
      background-color: blue;
      color: white;
    }
  }

  &__divider {
    box-sizing: content-box;
    height: 2px;
    background-color: #c2c2c2;
    padding: 4px 0;
    background-clip: content-box;
    pointer-events: none;
  }

  li {
    &:first-of-type {
      margin-top: 4px;
    }

    &:last-of-type {
      margin-bottom: 4px;
    }
  }
}
</style>
