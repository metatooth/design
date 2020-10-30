/* global  */
import {client, xml} from '@xmpp/client';
import setupPubSub from '@xmpp-plugins/pubsub';

const PUBSUB_SERVICE_ID = 'pubsub.xmpp.metatooth.com';
const PUBSUB_OUTGOING_NODE = '500-Mouthguard-Export';
const PUBSUB_UPDATE_NODE = '600-Mouthguard-PrintReady';

/**
 * @constructor
 */
function PubSub() {
  this.type = 'PubSub';

  this.pubSubPlugin = undefined;
}

Object.assign( PubSub.prototype, {
  constructor: PubSub,

  isPubSub: true,

  create: async function() {
    /**
  const plugin = await this.plugin();

  await plugin.deleteNode(PUBSUB_SERVICE_ID, PUBSUB_OUTGOING_NODE);
  const id = await plugin.createNode(PUBSUB_SERVICE_ID, PUBSUB_OUTGOING_NODE);
  console.log(`${PUBSUB_OUTGOING_NODE} pubsub node created with id ${id}`);
*/
  },

  deleteItem: async function(id) {
    const plugin = await this.plugin();
    await plugin.retract(
        PUBSUB_SERVICE_ID,
        PUBSUB_UPDATE_NODE,
        id);
  },


  items: async function(plan) {
    const plugin = await this.plugin();
    const {items} = await plugin.items(PUBSUB_SERVICE_ID, PUBSUB_UPDATE_NODE);
    return items;
  },

  plugin: async function() {
    if (this.pubSubPlugin === undefined) {
      const xmpp = client({
        service: process.env.VUE_APP_XMPP_DOMAIN,
        username: process.env.VUE_APP_XMPP_USERNAME,
        password: process.env.VUE_APP_XMPP_PASSWORD,
      });

      await xmpp.start();

      this.pubSubPlugin = setupPubSub(xmpp);
    }
    return this.pubSubPlugin;
  },

  publish: async function(plan, revision) {
    const plugin = await this.plugin();

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

    const itemId = await plugin.publish(PUBSUB_SERVICE_ID,
        PUBSUB_OUTGOING_NODE,
        entry);

    console.log(`Published with id ${itemId}`);
  },

  published: async function(fn) {
    const plugin = await this.plugin();

    const node = `${PUBSUB_SERVICE_ID}:${PUBSUB_UPDATE_NODE}`;
    plugin.on(`item-published:${node}`, (ev) => {
      console.log(`An item was published on ${node}`, ev);
      fn(ev);
    });
  },
});

export {PubSub};
