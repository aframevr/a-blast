AFRAME.registerSystem('enemy', {
  schema: {
    wave: {default: 1}
  },

  init: function () {
    var self = this;
    var sceneEl = this.sceneEl;

    this.enemies = [];
    this.createNewEnemy();
    this.createNewEnemy();
    this.createNewEnemy();

    // TODO: Enable A-Frame `System.update()` to decouple from gamestate.
    sceneEl.addEventListener('gamestate-changed', function (evt) {
      if (!('wave' in evt.detail.diff)) { return; }
      self.data.wave = evt.detail.state.wave;
    });
  },
  createNewEnemy: function () {
    var data = this.data;
    var entity = document.createElement('a-entity');
    var maxRadius = 30;
    var minRadius = 15;
    var radius = Math.floor(Math.random() * maxRadius) + minRadius;
    var angle = Math.random() * Math.PI * 2;
    var dist = radius * Math.sqrt(Math.random());
    var point = [ dist * Math.cos(angle),
                  dist * Math.sin(angle),
                  Math.sqrt(radius * radius - dist * dist)];
    if (point[1] < 0) {
      point[1] = -point[1];
    }

    var wave = data.wave;
    var waitingTime = 5000 - (Math.random() * 2 + wave) * 500;
    if (waitingTime < 2000) {
      waitingTime = 2000;
    }

    // Easy
    var bulletSpeed = 6 + Math.random() * wave * 0.5;
    if (bulletSpeed > 8) {
      bulletSpeed = 8;
    }

    var chargingDuration = 6000 - wave * 500;
    if (chargingDuration < 4000) {
      chargingDuration = 4000;
    }

    entity.setAttribute('enemy', {
      lifespan: 6 * (Math.random()) + 1,
      waitingTime: waitingTime,
      startPosition: {x: point[0], y: -10, z: point[2]},
      endPosition: {x: point[0], y: point[1], z: point[2]},
      chargingDuration: chargingDuration,
      bulletSpeed: bulletSpeed
    });

    this.sceneEl.appendChild(entity);

    // this.enemies.push(entity);
    entity.setAttribute('json-model', {src: 'url(https://fernandojsg.github.io/a-shooter-assets/models/enemy0.json)'});

    // TODO: Wave management.
    if (Math.random() > .25) {
      entity.setAttribute('position', {x: point[0], y: -10, z: point[2]});
      entity.setAttribute('movement-pattern', {
        type: 'random', debug: true
      });
    }
    // } else {
    //   entity.setAttribute('position', {x: point[0], y: 5, z: point[2]});
    //   entity.setAttribute('movement-pattern', {
    //     type: 'toEntity', target: '#player', debug: true
    //   });
    // }
  }
});
