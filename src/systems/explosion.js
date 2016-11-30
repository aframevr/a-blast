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
  },

  createExplosion: function (type, position, color, scale, direction, enemyName) {
    var explosionEntity = this.getFromPool(type);
    explosionEntity.setAttribute('position', position || this.el.getAttribute('position'));
    console.log(direction);
    explosionEntity.setAttribute('explosion', {
        type: type,
        lookAt: direction,
        color: color || '#FFF',
        scale: scale || 1.0
    });
    explosionEntity.setAttribute('visible', true);
    explosionEntity.play();
/*
  explosion.setAttribute('sound', {
    src: this.sounds[enemyName || type].src,
    volume: this.soundVolumes[type],
    poolSize: 15,
    autoplay: true
  });
*/
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
