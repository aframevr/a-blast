AFRAME.registerComponent('wave-text', {
  init: function () {
    var el = this.el;
    var self = this;

    // TODO: tween.js-based animation component.
    setTimeout(function () {
      self.setText(0);
    }, 500);

    el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('wave' in evt.detail.diff) {
        self.setText(evt.detail.state.wave);
      }
    });
  },

  setText: function (wave) {
    var el = this.el;
    el.setAttribute('bmfont-text', {
      color: '#FFF',
      opacity: 0,
      text: 'WAVE ' + wave
    });
    el.emit('wavetextchange');
  }
});
