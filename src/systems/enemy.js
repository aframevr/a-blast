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

    this.activeEnemies = [];
    for (var i = 0; i < 1; i++){
      this.createNewEnemy();
    }

    // TODO: Enable A-Frame `System.update()` to decouple from gamestate.
    sceneEl.addEventListener('gamestate-changed', function (evt) {
      if (!('wave' in evt.detail.diff)) { return; }
      self.data.wave = evt.detail.state.wave;
    });

  },
  getEnemy: function (name) {
    return this.poolHelper.requestEntity(name);
  },
  onEnemyDies: function (name, entity) {
    this.poolHelper.returnEntity(name, entity);// @todo Manage state and wave
    setTimeout(function() {
      this.createNewEnemy();
    }.bind(this), 1000);
  },
  createNewEnemy: function () {
    console.log('Create new enemy');
    var data = this.data;

    var maxRadius = 20;
    var minRadius = 5;
    var radius = Math.floor(Math.random() * maxRadius) + minRadius;

    var theta = Math.random() * 2 * Math.PI;
    var u = 2 * Math.random() - 1;
    var v = Math.sqrt(1 - u * u);
    var point = [ v * Math.cos(theta) * radius,
                  v * Math.sin(theta) * radius,
                  u * radius];

    if (point[1] < 0) {
      point[1] = -point[1];
    }
    if (point[2] > 0) {
      point[2] = -point[2];
    }

    var entity = this.getEnemy('enemy0');
    entity.setAttribute('enemy', {
      shootingDelay: Math.random() * 5000 + 2000
    });

    entity.setAttribute('position',  {x: point[0], y: point[1], z: point[2]});
    entity.play();

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
