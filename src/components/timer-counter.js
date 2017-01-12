var LetterPanel = require('../lib/letterpanel');

/* global THREE AFRAME */
AFRAME.registerComponent('timer-counter', {
  schema: {
    width: {default: 0.9},
    value: {default: ''},
    numSegments: {default: 5},
    height: {default: 0.35},
    color: {default: 0x024caff}
  },

  init: function () {
    this.letterPanel = new LetterPanel(this.el.sceneEl.systems.material, this.data);
    this.el.setObject3D('mesh', this.letterPanel.group);
    var self = this;
    this.el.sceneEl.addEventListener('countdown-update', function(event) {
      var t = event.detail;
      var value = t.minutes.padLeft(2) + ':' + t.seconds.padLeft(2);
      self.letterPanel.material.color.set(t.total <= 10000 ? 0xff0000 : 0x24caff);
      self.el.setAttribute('timer-counter', {value: value});
    });
  },

  update: function () {
    this.letterPanel.update(this.data.value);
  },
});
