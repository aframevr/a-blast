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

    this.el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_PLAYING') {
          var logo = document.getElementById('logo');
          var object = { rotationX: 0.0 };
          var tween = new AFRAME.TWEEN.Tween(object)
            .to({rotationX: Math.PI * 0.6}, 1000)
            .onComplete(function () {
              document.getElementById('logo').setAttribute('visible', false);
            })
            .easing(AFRAME.TWEEN.Easing.Back.InOut)
            .onUpdate(function () {
              logo.object3D.rotation.x = object.rotationX;
            });
          tween.start();

          document.getElementById('start_enemy').setAttribute('visible', false);
        }
        else if (evt.detail.state.state === 'STATE_GAME_OVER') {
          console.log('gameover');
        }
        else if (evt.detail.state.state === 'STATE_MAIN_MENU') {
          var startEnemy = document.getElementById('start_enemy');
          startEnemy.setAttribute('position', '0 -5 -4');
          startEnemy.setAttribute('visible', true);
          document.getElementById('logo').setAttribute('visible', true);
          var logo = document.getElementById('logo');
          var object = { rotationX: 0 };
          var tween = new AFRAME.TWEEN.Tween(object)
            .to({rotationX: Math.PI * 0.6}, 1000)
            .easing(AFRAME.TWEEN.Easing.Back.InOut)
            .onUpdate(function () {
              logo.object3D.rotation.x = Math.PI * 0.6 - object.rotationX;
            });
          tween.start();

          var object2 = { positionY: -5 };
          var tween2 = new AFRAME.TWEEN.Tween(object2)
            .to({positionY: 1.4}, 1000)
            .easing(AFRAME.TWEEN.Easing.Back.InOut)
            .onUpdate(function () {
              startEnemy.setAttribute('position', {x: 0, y: object2.positionY, z: -4})
            });
          tween2.start();
        }
      }
    });
/*
    var object = { alpha: 1.0 };
var tween = new AFRAME.TWEEN.Tween(object)
  .to({alpha: 0.0}, 4000)
  .onComplete(function () {
    logo.setAttribute('visible', false);
  })
  .onUpdate(function () {
    mesh.children[0].material.opacity = object.alpha;
  });
tween.start();
*/
  },
  update: function (oldData) {
  },
  tick: function (time, delta) {
  	if (this.startMsg) {
      this.startMsg.rotation.z = -Math.PI + Math.abs(Math.sin(time / 200) * 0.03);
  	}
  }
});
