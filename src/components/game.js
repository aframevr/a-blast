/* global AFRAME */
// var styleParser = require('../utils/styleParser');
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

AFRAME.registerComponent('game', {
  schema: {
    state: { default: 'start', oneOf: ['start', 'playing', 'game-over'] },
    lifes: { default: 5, min: 0 },
    points: { default: 0, min: 0 }
  },

  init: function () {
    var el = this.el;

    el.addEventListener('game-over', function () {
      document.getElementById('gameover').setAttribute('visible', true);
      this.setState('game-over');
    }.bind(this));

    el.addEventListener('game-start', function () {
      document.getElementById('gameover').setAttribute('visible', false);
      this.setState('start');
    }.bind(this));

    el.addEventListener('player-hit', this.playerHit.bind(this));
    el.addEventListener('enemy-hit', this.enemyHit.bind(this));
  },
  setState: function (state) {
    var game = this.el.getAttribute('game');
    if (state === 'start') {
      game.lifes = 5;
      game.points = 0;
    }
    game.state = state;
    this.el.setAttribute('game', game);
    this.el.emit('game-changed');
  },
  tick: function (time, delta) {
  },
  playerHit: function () {
    var game = this.el.getAttribute('game');
    game.lifes--;
    if (game.lifes <= 0) {
      this.el.emit('game-over');
      game.lifes = 0;
    }
    this.el.setAttribute('game', game);
    this.el.emit('game-changed');
  },
  enemyHit: function () {
    var game = this.el.getAttribute('game');
    game.points++;
    this.el.setAttribute('game', game);
    this.el.emit('game-changed');
  },
  update: function () {
/*
    var sceneEl = this.el.sceneEl;
    var mesh = this.el.getObject3D('mesh');
    var object3D = this.el.object3D;
    var originPoint = this.el.object3D.position.clone();
    for (var vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
      var localVertex = mesh.geometry.vertices[vertexIndex].clone();
      var globalVertex = localVertex.applyMatrix4(object3D.matrix);
      var directionVector = globalVertex.sub(object3D.position);

      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var collisionResults = ray.intersectObjects(sceneEl.object3D.children, true);
      collisionResults.forEach(hit);
    }
    function hit (collision) {
      if (collision.object === object3D) {
        return;
      }
      if (collision.distance < directionVector.length()) {
        if (!collision.object.el) { return; }
        collision.object.el.emit('hit');
      }
    }
*/
  }
});
