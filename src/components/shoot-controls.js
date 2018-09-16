/* global AFRAME */
AFRAME.registerComponent('shoot-controls', {
  // dependencies: ['tracked-controls'],
  schema: {
    hand: { default: 'left' }
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    el.setAttribute('vive-controls', {hand: data.hand, model: false});
    el.setAttribute('oculus-touch-controls', {hand: data.hand, model: false});
    el.setAttribute('windows-motion-controls', {hand: data.hand, model: false});
    if (data.hand === 'right') {
      el.setAttribute('daydream-controls', {hand: data.hand, model: false});
      el.setAttribute('gearvr-controls', {hand: data.hand, model: false});
    }
  }
});
