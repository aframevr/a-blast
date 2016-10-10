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
    for (var i = 0; i < 15; i++){
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
    var data = this.data;
    var enemies = Object.keys(ASHOOTER.ENEMIES);
    var enemyType = enemies[Math.floor(Math.random() * enemies.length)];

    var entity = this.getEnemy(enemyType);
    entity.setAttribute('enemy', {
      shootingDelay: Math.random() * 7000 + 6000
    });
    entity.play();
    this.activeEnemies.push(entity);
  }
});
