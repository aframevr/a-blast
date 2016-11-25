AFRAME.registerComponent('animate-message', {
  init: function () {
    var self = this;
  	this.startMsg = null;
    this.el.addEventListener('model-loaded', function(event) {
      self.startMsg = self.el.getObject3D('mesh').getObjectByName('start');
    });
  },
  tick: function (time, delta) {
  	if (this.startMsg) {
      this.startMsg.rotation.z = -Math.PI + Math.abs(Math.sin(time / 200) * 0.03);
  	}
  }
});
