import Vue from 'vue';

import Unidraw from './Unidraw.vue';

import './../node_modules/bulma/css/bulma.css';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(faDownload);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

window.unidraw = Unidraw;

new Vue({
  render: (h) => h(window.unidraw),
}).$mount('#unidraw');
