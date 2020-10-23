/* global  */
import {xml} from '@xmpp/client';
import {XmppCommon} from './xmpp-common.js';
import setupPubSub from '@xmpp-plugins/pubsub';

const PUBSUB_SERVICE_ID = 'pubsub.xmpp.metatooth.com';
const PUBSUB_NODE = '500 Mouthguard Export';

/**
 * @constructor
 */
function PubSub() {
  this.type = 'PubSub';
}

Object.assign( PubSub.prototype, {
  constructor: PubSub,

  isPubSub: true,

  create: async function() {
    const xmpp = new XmppCommon;
    xmpp.create().then(async () => {
      const pubSubPlugin = setupPubSub(xmpp.client);

      await pubSubPlugin.createNode(PUBSUB_SERVICE_ID, PUBSUB_NODE);
    });
  },

  publish: async function(plan, revision) {
    const xmpp = new XmppCommon;
    xmpp.create().then(async () => {
      const pubSubPlugin = setupPubSub(xmpp.client);

      const entry = xml(
          'item',
          {},
          xml(
              'entry',
              {},
              xml('plan', {}, plan),
              xml('revision', {}, revision),
          ),
      );

      console.log(entry.toString());

      const itemId = await pubSubPlugin.publish(PUBSUB_SERVICE_ID,
          PUBSUB_NODE,
          entry);

      console.log(`Published with id ${itemId}`);
    });
  },
});


export {PubSub};
