/* global THREE AFRAME */
var LetterPanel = require('../lib/letterpanel');

AFRAME.registerComponent('lifes-counter', {
  schema: {
    width: {default: 0.9},
    value: {default: '      '},
    numSegments: {default: 6},
    height: {default: 0.2},
    color: {default: 0xff0000}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);
  },

  update: function () {
    var value = this.data.value;
    var computed = [0,0,0,0,0].map(function(e,i) {return i >= value ? ' ': '*'}).reverse().join('');
    this.letterPanel.update(computed);
  },
});
