/* global AFRAME ABLAST */
var PoolHelper = require('../lib/poolhelper.js');

ABLAST.BULLETS = {};

ABLAST.registerBullet = function (name, data, definition) {
  if (ABLAST.BULLETS[name]) {
    throw new Error('The bullet `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same bullet ' +
                    'or two different bullets of the same name.');
  }

  ABLAST.BULLETS[name] = {
    poolSize: data.poolSize,
    components: data.components,
    definition: definition
  };

  console.info('Bullet registered ', name);
};

AFRAME.registerSystem('bullet', {
  init: function () {
    var self = this;
    this.poolHelper = new PoolHelper('bullet', ABLAST.BULLETS, this.sceneEl);
    this.activeBullets = [];

    this.sceneEl.addEventListener('gamestate-changed', function (evt) {
      if ('state' in evt.detail.diff) {
        if (evt.detail.state.state === 'STATE_GAME_OVER' || evt.detail.state.state === 'STATE_GAME_WIN') {
          self.reset();
        }
      }
    });
  },

  reset: function (entity) {
    var self = this;
    this.activeBullets.forEach(function (bullet) {
      self.returnBullet(bullet.getAttribute('bullet').name, bullet);
    });
  },

  returnBullet: function (name, entity) {
    this.activeBullets.splice(this.activeBullets.indexOf(entity), 1);
    this.poolHelper.returnEntity(name, entity);
  },

  getBullet: function (name) {
    var self = this;
    var bullet = this.poolHelper.requestEntity(name);
    this.activeBullets.push(bullet);
    return bullet;
  }
});
