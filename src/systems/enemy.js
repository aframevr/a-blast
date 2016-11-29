/* globals ASHOOTER AFRAME */
var PoolHelper = require('../lib/poolhelper.js');

ASHOOTER.ENEMIES = {};

ASHOOTER.registerEnemy = function (name, data, definition) {
  if (ASHOOTER.ENEMIES[name]) {
    throw new Error('The enemy `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same enemy ' +
                    'or two different enemies of the same name.');
  }

  ASHOOTER.ENEMIES[name] = {
    poolSize: data.poolSize,
    components: data.components,
    definition: definition,
    name: name
  };

  console.info('Enemy registered ', name);
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
            self.createWave(0);
    // TODO: Enable A-Frame `System.update()` to decouple from gamestate.
    sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_PLAYING') {
          setTimeout(function(){
            self.createWave(0);
          }, 1000);
        }
        if (evt.detail.state.state === 'STATE_GAME_OVER' || evt.detail.state.state === 'STATE_GAME_WIN') {
          self.reset();
        }
      }

      if ('waveSequence' in evt.detail.diff) {
        self.createSequence(evt.detail.state.waveSequence);
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
    if (this.sceneEl.getAttribute('gamestate').state === 'STATE_MAIN_MENU') {
      this.sceneEl.emit('start-game');
    } else {
      this.poolHelper.returnEntity(name, entity);
      this.sceneEl.emit('enemy-death');
    }
  },

  createSequence: function (sequenceNumber) {
    var self = this;
    setTimeout(function initFirstSequence() {
      self.currentSequence = sequenceNumber;
      var sequence = self.currentWave.sequences[sequenceNumber];
      sequence.enemies.forEach(function createEnemyFromDef (enemyDef) {
        self.createEnemy(enemyDef);
      });
    }, this.currentWave.sequences[sequenceNumber].start);
  },

  createWave: function (waveNumber) {
    var enemyNum;
    var enemyType;
    var i;
    var self = this;

    this.currentWave = WAVES[waveNumber % WAVES.length];
    console.log('Creating wave', waveNumber);
    this.createSequence(0);
    this.sceneEl.emit('wave-created', {wave: this.currentWave});
  },

  createEnemy2: function (enemyType, enemyDefinition, timeOffset) {
    var entity = this.getEnemy(enemyType);
    // entity.setAttribute('enemy', {shootingDelay: Math.random() * 57000 + 6000});
    entity.setAttribute('enemy', {shootingDelay: 3000});
    entity.setAttribute('curve-movement', {
      type: enemyDefinition.movement,
      loopStart: enemyDefinition.loopStart || 1,
      timeOffset: timeOffset || 0
    });
    entity.components['curve-movement'].addPoints(enemyDefinition.points);
    entity.play();
    this.activeEnemies.push(entity);
    this.sceneEl.emit('enemy-spawn', {enemy: entity});
  },

  createEnemy: function (enemyDefinition) {
    if (Array.isArray(enemyDefinition.type)) {
      for (var i = 0; i < enemyDefinition.type.length; i++) {
        var type = enemyDefinition.type[i];
        var timeOffset = (enemyDefinition.enemyTimeOffset || 0) * i;
        this.createEnemy2(type, enemyDefinition, timeOffset);
      }
    } else {
      this.createEnemy2(enemyDefinition.type, enemyDefinition);
    }
  },

  reset: function (entity) {
    var self = this;
    this.activeEnemies.forEach(function (enemy) {
      self.poolHelper.returnEntity(enemy.getAttribute('enemy').name, enemy);
    });
  }
});
