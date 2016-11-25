/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('gamestate-visuals', {
  schema: {
  },
  init: function () {
    this.el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_PLAYING') {
          var logo = document.getElementById('logo');
          var object = { rotationX: 0.0 };
          var tween = new AFRAME.TWEEN.Tween(object)
            .to({rotationX: Math.PI * 0.6}, 1000)
            .onComplete(function () {
              document.getElementById('mainmenu').setAttribute('visible', false);
            })
            .easing(AFRAME.TWEEN.Easing.Back.InOut)
            .onUpdate(function () {
              logo.object3D.rotation.x = object.rotationX;
            });
          tween.start();

          document.getElementById('start_enemy').setAttribute('visible', false);
        } else if (evt.detail.state.state === 'STATE_GAME_OVER') {
          var gameover = document.getElementById('gameover-model');
          var welldone = document.getElementById('welldone-model');
          var group = document.getElementById('finished');

          gameover.setAttribute('visible', true);
          welldone.setAttribute('visible', false);
          group.setAttribute('visible', true);

          group.object3D.position.y = -5;

          var object = { positionY: -5 };
          var tween = new AFRAME.TWEEN.Tween(object)
            .to({positionY: 1}, 1000)
            .easing(AFRAME.TWEEN.Easing.Elastic.Out)
            .onUpdate(function () {
              group.object3D.position.y = object.positionY;
            });
          tween.start();
      } else if (evt.detail.state.state === 'STATE_GAME_WIN') {
        var gameover = document.getElementById('gameover-model');
        var welldone = document.getElementById('welldone-model');
        var group = document.getElementById('finished');

        group.object3D.position.y = -5;

        gameover.setAttribute('visible', false);
        welldone.setAttribute('visible', true);

        group.setAttribute('visible', true);

        var object = { positionY: -5 };
        var tween = new AFRAME.TWEEN.Tween(object)
          .to({positionY: 1}, 1000)
          .easing(AFRAME.TWEEN.Easing.Elastic.Out)
          .onUpdate(function () {
            group.object3D.position.y = object.positionY;
          });
        tween.start();
      } else if (evt.detail.state.state === 'STATE_MAIN_MENU') {
          var startEnemy = document.getElementById('start_enemy');
          startEnemy.setAttribute('position', '0 -5 -4');
          startEnemy.setAttribute('visible', true);
          document.getElementById('mainmenu').setAttribute('visible', true);
          var logo = document.getElementById('logo');
          logo.object3D.rotation.x = Math.PI * 0.6;

          var object = { rotationX: 0 };
          var tween = new AFRAME.TWEEN.Tween(object)
            .to({rotationX: Math.PI * 0.6}, 1000)
            .easing(AFRAME.TWEEN.Easing.Elastic.Out)
            .delay(1000)
            .onUpdate(function () {
              logo.object3D.rotation.x = Math.PI * 0.6 - object.rotationX;
            });
          tween.start();

          var object2 = { positionY: -5 };
          var tween2 = new AFRAME.TWEEN.Tween(object2)
            .to({positionY: 1.4}, 1000)
            .delay(1000)
            .easing(AFRAME.TWEEN.Easing.Back.InOut)
            .onUpdate(function () {
              startEnemy.setAttribute('position', {x: 0, y: object2.positionY, z: -4})
            });
          tween2.start();

          var group = document.getElementById('finished');

          group.object3D.position.y = 1;

          var object3 = { positionY: 1 };
          var tween3 = new AFRAME.TWEEN.Tween(object3)
            .to({positionY: -5}, 1000)
            .easing(AFRAME.TWEEN.Easing.Elastic.In)
            .onComplete(function () {
              group.setAttribute('visible', false);
            })
            .onUpdate(function () {
              group.object3D.position.y = object3.positionY;
            });
          tween3.start();
        }
      }
    });
  }
});
