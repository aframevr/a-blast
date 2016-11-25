/* globals AFRAME ASHOOTER THREE */
AFRAME.registerComponent('gamestate-visuals', {
  schema: {
  },
  startPlaying: function () {
    var self = this;
    var rotation = { x: 0.0 };
    var tween = new AFRAME.TWEEN.Tween(rotation)
      .to({x: Math.PI * 0.6}, 1000)
      .onComplete(function () {
        self.mainMenuGroup.setAttribute('visible', false);
      })
      .easing(AFRAME.TWEEN.Easing.Back.InOut)
      .onUpdate(function () {
        self.logo.object3D.rotation.x = rotation.x
      })
      .start();
    this.startEnemy.setAttribute('visible', false);
  },

  finishPlaying: function (type) {
    var gameover = type === 'GAME_OVER';

    var group = document.getElementById('finished');

    this.gameover.setAttribute('visible', gameover);
    this.welldone.setAttribute('visible', !gameover);
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
  },

  mainMenu: function () {
    var self = this;
    this.startEnemy.setAttribute('position', '0 -5 -4');
    this.startEnemy.setAttribute('visible', true);
    this.mainMenuGroup.setAttribute('visible', true);

    // Move the enemy up
    var enemyPosition = { positionY: -5 };
    var tweenEnemy = new AFRAME.TWEEN.Tween(enemyPosition)
      .to({positionY: 1.4}, 1000)
      .delay(1000)
      .easing(AFRAME.TWEEN.Easing.Back.InOut)
      .onUpdate(function () {
        self.startEnemy.setAttribute('position', {x: 0, y: enemyPosition.positionY, z: -4})
      }).start();

    // Move the gameover & well done down
    var group = document.getElementById('finished');

    group.object3D.position.y = 1;

    var textsPosition = { y: 1 };
    var tween = new AFRAME.TWEEN.Tween(textsPosition)
      .to({y: -5}, 1000)
      .easing(AFRAME.TWEEN.Easing.Elastic.In)
      .onComplete(function () {
        group.setAttribute('visible', false);
      })
      .onUpdate(function () {
        group.object3D.position.y = textsPosition.y;
      }).start();

    // A-Blast logo will appears after a 1s delay
    this.logo.object3D.rotation.x = Math.PI * 0.6;

    var logoRotation = { x: 0 };
    var tween = new AFRAME.TWEEN.Tween(logoRotation)
      .to({x: Math.PI * 0.6}, 1000)
      .easing(AFRAME.TWEEN.Easing.Elastic.Out)
      .delay(1000)
      .onUpdate(function () {
        self.logo.object3D.rotation.x = Math.PI * 0.6 - logoRotation.x;
      }).start();
  },

  init: function () {
    this.logo = document.getElementById('logo');
    this.startEnemy = document.getElementById('start_enemy');
    this.mainMenuGroup = document.getElementById('mainmenu');
    this.messageGroup = document.getElementById('message-group');
    this.gameover = document.getElementById('gameover-model');
    this.welldone = document.getElementById('welldone-model');

    var self = this;
    this.el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        console.log(evt.detail.state.state);
        if (evt.detail.state.state === 'STATE_PLAYING') {
          self.startPlaying();
        } else if (evt.detail.state.state === 'STATE_GAME_OVER') {
          self.finishPlaying('GAME_OVER');
        } else if (evt.detail.state.state === 'STATE_GAME_WIN') {
          self.finishPlaying('GAME_WIN');
        } else if (evt.detail.state.state === 'STATE_MAIN_MENU') {
          self.mainMenu();
        }
      }
    }.bind(this));
  }
});
