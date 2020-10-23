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
   * Publish an item identifying a plan & revision that's ready for
   * the next production step.
   */
  execute: function() {
    const compName = this.editor.name;
    const name = (compName) ? compName.name : undefined;
    if (name !== undefined) {
      const plan = name.match(/\/([0-9a-fA-F]+)\//);
      const revision = name.match(/\/([0-9a-fA-F]+)$/);
      if (plan && revision) {
        const pubsub = new PubSub;
        pubsub.publish(plan[1], revision[1]);
      }
    }
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
