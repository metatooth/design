import Vue from 'vue';

import Unidraw from './Unidraw.vue';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faCrosshairs} from '@fortawesome/free-solid-svg-icons';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {faPenSquare} from '@fortawesome/free-solid-svg-icons';
import {faRedo} from '@fortawesome/free-solid-svg-icons';
import {faRuler} from '@fortawesome/free-solid-svg-icons';
import {faSave} from '@fortawesome/free-solid-svg-icons';
import {faSync} from '@fortawesome/free-solid-svg-icons';
import {faUndo} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

import {Object3D} from 'three';

Object3D.prototype.interpret = function( cmd ) {
  if ( cmd.type === 'PasteCmd' ) {
    cmd.clipboard.forEach((obj) => {
      this.add( obj );
    });
  }
};

Object3D.prototype.uninterpret = function( cmd ) {
  if ( cmd.type === 'PasteCmd' ) {
    cmd.clipboard.forEach((obj) => {
      this.remove( obj );
    });
  }
};

library.add(faCrosshairs);
library.add(faDownload);
library.add(faPenSquare);
library.add(faRedo);
library.add(faRuler);
library.add(faSave);
library.add(faSync);
library.add(faUndo);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Unidraw),
}).$mount('#unidraw');
