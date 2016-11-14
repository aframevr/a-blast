AFRAME.registerComponent('wave-text', {
  init: function () {
    var el = this.el;
    var self = this;

    el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if (evt.detail.event === 'wave-created') {
        setTimeout(function(){
          self.setText(evt.detail.state);
        }, 500);
      }
    });
  },

  setText: function (state) {
    var el = this.el;
    el.setAttribute('bmfont-text', {
      color: '#FFF',
      opacity: 0,
      text: 'WAVE ' + state.wave
    });
    el.emit('wavetextchange');
  }
});
