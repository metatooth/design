import {client} from '@xmpp/client';

/**
 * @constructor
 */
function XmppCommon() {
  this.type = 'XmppCommon';
}

Object.assign( XmppCommon.prototype, {
  constructor: XmppCommon,

  isXmppCommon: true,

  create: async function() {
    this.client = client({
      service: process.env.VUE_APP_XMPP_DOMAIN,
      username: process.env.VUE_APP_XMPP_USERNAME,
      password: process.env.VUE_APP_XMPP_PASSWORD,
    });

    await this.client.start();
  },
});

export {XmppCommon};
