/* global AFRAME THREE*/
AFRAME.BULLETS = {};

// @Hack until I'll find out how to import helpers :)
var helpers = {};
helpers.mixinFactory = function (id, obj, scene) {
  var mixinEl = document.createElement('a-mixin');
  mixinEl.setAttribute('id', id);
  Object.keys(obj).forEach(function (componentName) {
    mixinEl.setAttribute(componentName, obj[componentName]);
  });

  var assetsEl = scene ? scene.querySelector('a-assets') : document.querySelector('a-assets');
  assetsEl.appendChild(mixinEl);

  return mixinEl;
};
//@hack end

AFRAME.registerBullet = function (name, data, definition) {

  if (AFRAME.BULLETS[name]) {
    throw new Error('The bullet `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same bullet ' +
                    'or two different bullets of the same name.');
  }

  AFRAME.BULLETS[name] = {
    data: data,
    definition: definition
  };
};

AFRAME.registerSystem('bullet', {
  init: function () {
    this.initializePools();
  },

  initializePools: function () {
    for (var name in AFRAME.BULLETS) {
      var definition = AFRAME.BULLETS[name].data;
      var mixinName = 'bullet' + name;

      var mixinEl = helpers.mixinFactory(mixinName,
        { bullet: `name: ${name}; acceleration: ${definition.acceleration}` },
        this.sceneEl);

      this.sceneEl.setAttribute('pool__' + mixinName,
        {
          size: definition.poolSize,
          mixin: mixinName,
          dynamic: true
        });
    }
  },
  getBullet: function (name) {
    var mixinName = 'bullet' + name;
    var poolName = 'pool__' + mixinName;
    var entity = this.sceneEl.components[poolName].requestEntity();

    entity.play();
    return entity;
  }
});
