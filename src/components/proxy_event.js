AFRAME.registerComponent('proxy_event', {
  schema: {
    event: { default: '' },
    dst: { type: 'selector' },
    bubbles: { default: false }
  },

  init: function () {
    this.el.sceneEl.addEventListener(this.data.event, function (event) {
      this.data.dst.emit(this.data.event, event, this.data.bubbles);
    }.bind(this));
  }
});
