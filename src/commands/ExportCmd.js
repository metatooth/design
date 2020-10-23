import {Command} from './Command.js';

import {PubSub} from '../api-services/pub-sub.js';

/**
 * Exports the Editor's top component for the next production step.
 * @constructor
 * @param {Editor} editor the editor the command acts within
 */
function ExportCmd( editor ) {
  Command.call( this, editor );
  this.type = 'ExportCmd';
}

ExportCmd.prototype = Object.assign( Object.create( Command.prototype ), {
  constructor: ExportCmd,

  isExportCmd: true,

  /**
   * Publish an item that describes the plan that's ready for the next
   * production step.
   */
  execute: function() {
    const pubsub = new PubSub;
    pubsub.publish('Hello, World!', 'First post.');
  },

  /**
   * This command cannot be reversed.
   * @return {boolean}
   */
  reversible: function() {
    return false;
  },

});

export {ExportCmd};
