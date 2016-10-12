/* globals ASHOOTER AFRAME */
var PoolHelper = require('../poolhelper.js');

// Dumb wave management.
var WAVES = [
  [['enemy0', 1]],
  [['enemy0', 2], ['enemy1', 1]],
  [['enemy0', 1], ['enemy3', 3]],
  [['enemy1', 2], ['enemy4', 4]]
];

ASHOOTER.ENEMIES = {};

ASHOOTER.registerEnemy = function (name, data, definition) {
  if (ASHOOTER.ENEMIES[name]) {
    throw new Error('The enemy `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same enemy ' +
                    'or two different enemies of the same name.');
  }

  ASHOOTER.ENEMIES[name] = {
    components: data.components,
    definition: definition,
    name: name
  };

  console.info(`Enemy registered '${name}'`);
};

AFRAME.registerSystem('enemy', {
  schema: {
    wave: {default: 0}
  },

  init: function () {
    var self = this;
    var sceneEl = this.sceneEl;

    if (!sceneEl.hasLoaded) {
      sceneEl.addEventListener('loaded', this.init.bind(this));
      return;
    }

    this.poolHelper = new PoolHelper('enemy', ASHOOTER.ENEMIES, this.sceneEl);

    this.activeEnemies = [];

    // TODO: Enable A-Frame `System.update()` to decouple from gamestate.
    this.createWave(0);
    sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_START') {
          self.createWave(0);
        }
        if (evt.detail.state.state === 'STATE_GAME_OVER') {
          self.reset();
        }
      }
      if ('wave' in evt.detail.diff) {
        self.createWave(evt.detail.state.wave);
      }
    });
  },

  getEnemy: function (name) {
    return this.poolHelper.requestEntity(name);
  },

  onEnemyDeath: function (name, entity) {
    this.poolHelper.returnEntity(name, entity);
    this.sceneEl.emit('enemy-death');
  },

  createWave: function (waveNumber) {
    var enemyNum;
    var enemyType;
    var i;
    var self = this;
    var wave;

    wave = WAVES[waveNumber % WAVES.length]
    wave.forEach(function createEnemyOfType (enemyDef) {
      var enemyNum = enemyDef[1];
      var enemyType = enemyDef[0];
      for (i = 0; i < enemyNum; i++) {
        self.createEnemy(enemyType);
      }
    });
  },

  createEnemy: function (enemyType) {
    var data = this.data;
    var entity = this.getEnemy(enemyType);
    entity.setAttribute('enemy', {shootingDelay: Math.random() * 7000 + 6000});
    entity.play();
    this.activeEnemies.push(entity);
    this.sceneEl.emit('enemy-spawn', {enemy: entity});
  },

  reset: function (entity) {
    var self = this;
    this.activeEnemies.forEach(function (enemy) {
      self.poolHelper.returnEntity(enemy.getAttribute('enemy').name, enemy);
    });
  }
});
