var createMixin = require('./utils').createMixin;

var PoolHelper = function (groupName, data, sceneEl) {
  this.groupName = groupName;
  this.sceneEl = sceneEl || document.querySelector('a-scene');
  this.initializePools(groupName, data);
};

PoolHelper.prototype = {
  initializePools: function (groupName, data) {
    var self = this;
    Object.keys(data).forEach(function (name) {
      var item = data[name];
      var components = item.components;
      var mixinName = groupName + name;
      createMixin(mixinName, components, self.sceneEl);

      self.sceneEl.setAttribute('pool__' + mixinName,
        {
          size: item.poolSize,
          mixin: mixinName,
          dynamic: true
        });
    });
  },

  returnEntity: function (name, entity) {
    var mixinName = this.groupName + name;
    var poolName = 'pool__' + mixinName;
    this.sceneEl.components[poolName].returnEntity(entity);
  },

  requestEntity: function (name) {
    var mixinName = this.groupName + name;
    var poolName = 'pool__' + mixinName;
    var entity = this.sceneEl.components[poolName].requestEntity();
    // entity.id= this.groupName + Math.floor(Math.random() * 1000);
    return entity;
  }
};

module.exports = PoolHelper;
