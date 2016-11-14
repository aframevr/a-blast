/* globals ASHOOTER AFRAME */
var PoolHelper = require('../poolhelper.js');

var WAVES = [
  {
    name: 'WAVE 1',
    sequences: [
      {
        start: 1000,
        random: 5,
        enemies: [
          {
            type: 'enemy0',
            points: [[3.3477237224578857,1.3690065145492554,-6.406318187713623],[0.012093067169189453,2.8417158126831055,-3.73813796043396],[-2.7143843173980713,3.9169554710388184,-1.4280019998550415]],
            movement: 'loop',
          },
          {
            type: 'enemy0',
            points: [[-1.043067455291748,2.316108226776123,-6.373414516448975],[1.5889892578125,-0.9243419170379639,-6.513626575469971],[-1.6819621324539185,-3.0366225242614746,-4.636663913726807]],
            movement: 'loop',
          },
          {
            type: 'enemy1',
            points: [ [3, -5, -5], [3, 0, -5], [3, 10, -5] ],
            movement: 'pingpong',
            random: 8
          }
        ]
      }
    ]
  }
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
AFRAME.registerSystem('enemir', {
  schema: {
    default: 0
  },

  init: function() {
    console.log(this.data);
  }
});

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

  createSequence: function (sequenceNumber) {
    this.currentSequence = sequenceNumber;
    var sequence = this.currentWave.sequences[sequenceNumber];
    var self = this;
    sequence.enemies.forEach(function createEnemyFromDef (enemyDef) {
      self.createEnemy(enemyDef);
    });
  },

  createWave: function (waveNumber) {
    var enemyNum;
    var enemyType;
    var i;
    var self = this;

    this.currentWave = WAVES[waveNumber % WAVES.length];
    console.log('Creating wave', waveNumber);
    var self = this;
    setTimeout(function initFirstSequence() {
      self.createSequence(0);
    }, this.currentWave.sequences[0].start);
  },

  createEnemy: function (enemyDefinition) {
    var entity = this.getEnemy(enemyDefinition.type);
    entity.setAttribute('enemy', {shootingDelay: Math.random() * 57000 + 6000});
    entity.setAttribute('curve-movement', {type: enemyDefinition.movement});
    entity.components['curve-movement'].addPoints(enemyDefinition.points);
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
