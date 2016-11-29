/* globals ASHOOTER AFRAME */
var PoolHelper = require('../lib/poolhelper.js');

ASHOOTER.EXPLOSIONS = {};

ASHOOTER.registerExplosion = function (name, data, definition) {
  if (ASHOOTER.EXPLOSIONS[name]) {
    throw new Error('The explosion `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same explosion ' +
                    'or two different enemies of the same name.');
  }

  ASHOOTER.EXPLOSIONS[name] = {
    poolSize: data.poolSize,
    components: data.components,
    definition: definition,
    name: name
  };

  console.info('Explosion registered ', name);
};

AFRAME.registerSystem('explosion', {
  schema: {
    wave: {default: 0}
  },

  init: function () {
    var self = this;
    this.poolHelper = new PoolHelper('explosion', ASHOOTER.EXPLOSIONS, this.sceneEl);
    this.activeExplosions = [];
/*
    this.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_GAME_OVER' || evt.detail.state.state === 'STATE_GAME_WIN') {
          self.reset();
        }
      }
    });
*/
  },

  reset: function (entity) {
    var self = this;
    this.activeExplosions.forEach(function (entity) {
      self.returnToPool(entity.getAttribute('explosion').name, entity);
    });
  },

  returnToPool: function (name, entity) {
    this.activeExplosions.splice(this.activeExplosions.indexOf(entity), 1);
    this.poolHelper.returnEntity(name, entity);
  },

  getFromPool: function (name) {
    var entity = this.poolHelper.requestEntity(name);
    this.activeExplosions.push(entity);
    return entity;
  }

});


/* globals ASHOOTER */
ASHOOTER.registerExplosion(
  // name
  'enemy',
  // data
  {
    components: {
      explosion: {
        type: 'enemy',
      },
    },
    poolSize: 1
  },
  // implementation
  {
  }
);

/* globals ASHOOTER */
ASHOOTER.registerExplosion(
  // name
  'enemygun',
  // data
  {
    components: {
      explosion: {
        type: 'enemygun',
      },
    },
    poolSize: 1
  },
  // implementation
  {
  }
);


/* globals ASHOOTER */
ASHOOTER.registerExplosion(
  // name
  'bullet',
  // data
  {
    components: {
      explosion: {
        type: 'bullet',
      },
    },
    poolSize: 1
  },
  // implementation
  {
  }
);

/* globals ASHOOTER */
ASHOOTER.registerExplosion(
  // name
  'background',
  // data
  {
    components: {
      explosion: {
        type: 'background',
      },
    },
    poolSize: 1
  },
  // implementation
  {
  }
);
