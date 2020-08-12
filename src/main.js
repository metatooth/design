import Vue from 'vue';

import Unidraw from './Unidraw.vue';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faCrosshairs} from '@fortawesome/free-solid-svg-icons';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {faGlasses} from '@fortawesome/free-solid-svg-icons';
import {faPenSquare} from '@fortawesome/free-solid-svg-icons';
import {faRuler} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(faCrosshairs);
library.add(faDownload);
library.add(faGlasses);
library.add(faPenSquare);
library.add(faRuler);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Unidraw),
}).$mount('#unidraw');
