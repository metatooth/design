/**
 * Description: Command objects operator on selected componets, and
 * editor, or the app itself.
 * @constructor
 */
function Command() { }

Object.assign( Command.prototype, {
  /**
   * Do something
   */
  execute: function() {

  },

  /**
   * Undo something
   */
  unexecute: function() {

  },

  /**
   * If true, the command can be unexecuted.
   * @return {boolean}
   */
  reversible: function() {
    return false;
  },

  /**
   * Log the command.
   */
  log: function() {

  },

});

export {Command};
