/* global THREE AFRAME */
var LetterPanel = require('../lib/letterpanel');

AFRAME.registerComponent('points-counter', {
  schema: {
    value: {default: 0},
    height: {default: 0.7},
    numSegments: {default: 3},
    width: {default: 0.9},
    color: {default: 0x024caff}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);

    this.el.sceneEl.addEventListener('enemy-death', function () {

    });
  },

  update: function () {
    this.letterPanel.update(this.data.value.padLeft(3));
  }
});
