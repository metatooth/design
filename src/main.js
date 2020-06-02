import Vue from 'vue';
import Unidraw from './Unidraw.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Unidraw),
}).$mount('#unidraw');
