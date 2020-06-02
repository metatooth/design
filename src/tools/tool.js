/**
 * Description: Tool objects are used for direct manipulation of
 * graphical components.
 * @constructor
 */
function Tool() { }

Object.assign( Tool.prototype, {
  /**
   * @param {Event} event - the starting event
   * @return {Manipulator}
   */
  create: function(event) {
    return null;
  },

  /**
   * @param {Manipulator} manipulator - the manipulation to analyze
   * @return {Command}
   */
  interpret: function(manipulator) {
    return null;
  },

  /**
    * @return {Object3D}
    */
  component: function() {
    return null;
  },
});

export {Tool};
