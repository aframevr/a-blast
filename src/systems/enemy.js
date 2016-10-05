var PoolHelper = require('../poolhelper.js');

ASHOOTER.ENEMIES = {};

ASHOOTER.registerEnemy = function (name, data, definition) {
  if (ASHOOTER.ENEMIES[name]) {
    throw new Error('The enemy `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same enemy ' +
                    'or two different enemies of the same name.');
  }

  ASHOOTER.ENEMIES[name] = {
    components: data.components,
    definition: definition
  };

  console.info(`Enemy registered '${name}'`);
}

AFRAME.registerSystem('enemy', {
  schema: {
    wave: {default: 1}
  },

  init: function () {
    var self = this;
    var sceneEl = this.sceneEl;

    this.poolHelper = new PoolHelper('enemy', ASHOOTER.ENEMIES, this.sceneEl);
    console.log("LOLASO0000");
    this.activeEnemies = [];
    this.createNewEnemy();
    this.createNewEnemy();
    this.createNewEnemy();

    // TODO: Enable A-Frame `System.update()` to decouple from gamestate.
    sceneEl.addEventListener('gamestate-changed', function (evt) {
      if (!('wave' in evt.detail.diff)) { return; }
      self.data.wave = evt.detail.state.wave;
    });

  },
  returnEnemy: function (name, entity) {
    this.poolHelper.returnEntity(name, entity);
  },
  getEnemy: function (name) {
    return this.poolHelper.requestEntity(name);
  },
  onEnemyDies: function (name, entity) {
    this.returnEnemy(name, entity);
    // @todo Manage state and wave
    this.createNewEnemy();
  },
  createNewEnemy: function () {
    var data = this.data;

    var maxRadius = 30;
    var minRadius = 15;
    var radius = Math.floor(Math.random() * maxRadius) + minRadius;
    var angle = Math.random() * Math.PI * 2;
    var dist = radius * Math.sqrt(Math.random());
    var point = [ dist * Math.cos(angle),
                  dist * Math.sin(angle),
                  Math.sqrt(radius * radius - dist * dist) * -1];
    if (point[1] < 0) {
      point[1] = -point[1];
    }

    var wave = data.wave;
    var waitingTime = 5000 - (Math.random() * 2 + wave) * 500;
    if (waitingTime < 2000) {
      waitingTime = 2000;
    }

    var chargingDuration = 6000 - wave * 500;
    if (chargingDuration < 4000) {
      chargingDuration = 4000;
    }

    var entity = this.getEnemy('enemy0');
    entity.setAttribute('enemy', {
      lifespan: 6 * (Math.random()) + 1,
      waitingTime: waitingTime,
      startPosition: {x: point[0], y: -10, z: point[2]},
      endPosition: {x: point[0], y: point[1], z: point[2]},
      chargingDuration: chargingDuration
    });

    // TODO: Wave management.
    if (Math.random() > .25) {
      entity.setAttribute('position', {x: point[0], y: -10, z: point[2]});
      entity.setAttribute('movement-pattern', {
        type: 'random', debug: true
      });
    } else {
      entity.setAttribute('position', {x: point[0], y: 5, z: point[2]});
      entity.setAttribute('movement-pattern', {
        type: 'toEntity', target: '#player', debug: true
      });
    }

    this.activeEnemies.push(entity);
  }
});
