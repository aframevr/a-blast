/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('mainmenu', {
  schema: {
  },
  init: function () {
  	var self = this;
  	this.startMsg = null;
    this.el.addEventListener('model-loaded', function(event) {
        self.startMsg = self.el.getObject3D('mesh').getObjectByName('start');
    });
  },
  update: function (oldData) {
  },
  tick: function (time, delta) {
  	if (this.startMsg) {
  		this.startMsg.rotation.z = -Math.PI + Math.sin(time / 300) * 0.3;
  	}
  }
});
