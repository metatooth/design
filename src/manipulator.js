/**
 * Description: manipulation semantics
 */
function Manipulator() { }

Object.assign( Manipulator.prototype, {
  /**
   * @param {Event} event - the starting event
   */
  grasp: function( event ) {

  },

  /**
   * @param {Event} event - the subsequent events
   * @return {boolean}
   */
  manipulating: function( event ) {
    return false;
  },

  /**
   * @param {Event} event - the final event
   */
  effect: function( event ) {

  },
});

export {Manipulator};
