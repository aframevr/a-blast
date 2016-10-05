/* global AFRAME THREE*/
var PoolHelper = require('../poolhelper.js');

ASHOOTER.BULLETS = {};

ASHOOTER.registerBullet = function (name, data, definition) {

  if (ASHOOTER.BULLETS[name]) {
    throw new Error('The bullet `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same bullet ' +
                    'or two different bullets of the same name.');
  }

  ASHOOTER.BULLETS[name] = {
    components: data.components,
    definition: definition
  };

  console.info(`Bullet registered '${name}'`);
};

AFRAME.registerSystem('bullet', {
  init: function () {
    this.poolHelper = new PoolHelper('bullet', ASHOOTER.BULLETS, this.sceneEl);
  },
  returnBullet: function (name, entity) {
    this.poolHelper.returnEntity(name, entity);
  } ,
  getBullet: function (name) {
    return this.poolHelper.requestEntity(name);
  }
});
