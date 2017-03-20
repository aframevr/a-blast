/* globals ABLAST AFRAME */
var PoolHelper = require('../lib/poolhelper.js');

ABLAST.EXPLOSIONS = {};

ABLAST.registerExplosion = function (name, data, definition) {
  if (ABLAST.EXPLOSIONS[name]) {
    throw new Error('The explosion `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same explosion ' +
                    'or two different enemies of the same name.');
  }

  ABLAST.EXPLOSIONS[name] = {
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
    this.poolHelper = new PoolHelper('explosion', ABLAST.EXPLOSIONS, this.sceneEl);
    this.activeExplosions = [];

    this.sounds = {
      'enemy_start': document.getElementById('explosion0'),
      'enemy0': document.getElementById('explosion0'),
      'enemy1': document.getElementById('explosion1'),
      'enemy2': document.getElementById('explosion2'),
      'enemy3': document.getElementById('explosion3'),
      'bullet': document.getElementById('hitbullet'),
      'background': document.getElementById('hitbullet')
    };

    this.soundVolumes = {
      'enemy_start': 0.7,
      'enemy0': 1,
      'enemy1': 1,
      'enemy2': 1,
      'enemy3': 1,
      'bullet': 0.4,
      'background': 0.2
    };
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
    explosionEntity.setAttribute('explosion', {
        type: type,
        lookAt: direction.clone(),
        color: color || '#FFF',
        scale: scale || 1.0
    });

    // This should be done by the pool!!
    explosionEntity.setAttribute('sound', {
      src: this.sounds[enemyName || type].src,
      volume: this.soundVolumes[enemyName || type],
      poolSize: 15,
      autoplay: true
    });
    explosionEntity.setAttribute('visible', true);

    explosionEntity.play();

  }
});


/* globals ABLAST */
ABLAST.registerExplosion(
  // name
  'enemy',
  // data
  {
    components: {
      explosion: {
        type: 'enemy',
      },
    },
    poolSize: 10
  },
  // implementation
  {
  }
);

/* globals ABLAST */
ABLAST.registerExplosion(
  // name
  'enemygun',
  // data
  {
    components: {
      explosion: {
        type: 'enemygun',
      },
    },
    poolSize: 10
  },
  // implementation
  {
  }
);


/* globals ABLAST */
ABLAST.registerExplosion(
  // name
  'bullet',
  // data
  {
    components: {
      explosion: {
        type: 'bullet',
      },
    },
    poolSize: 10
  },
  // implementation
  {
  }
);

/* globals ABLAST */
ABLAST.registerExplosion(
  // name
  'background',
  // data
  {
    components: {
      explosion: {
        type: 'background',
      },
    },
    poolSize: 10
  },
  // implementation
  {
  }
);
