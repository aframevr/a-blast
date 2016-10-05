var PoolHelper = function (groupName, data, sceneEl) {
  this.groupName = groupName;
  this.sceneEl = sceneEl || document.querySelector('a-scene');
  this.initializePools(groupName, data);
}

PoolHelper.prototype = {
  initializePools: function (groupName, data) {
    var self = this;
    Object.keys(data).forEach(function(name) {
      var item = data[name];
      var components = item.components;
      var mixinName = groupName + name;
      var mixinEl = createMixin(mixinName,
        components,
        this.sceneEl);

      self.sceneEl.setAttribute('pool__' + mixinName,
        {
          size: item.poolSize || 10,
          mixin: mixinName,
          dynamic: true
        });
    });
  },
  returnEntity: function (name, entity) {
    var mixinName = this.groupName + name;
    var poolName = 'pool__' + mixinName;
    this.sceneEl.components[poolName].returnEntity(entity);
  } ,
  requestEntity: function (name) {
    var mixinName = this.groupName + name;
    var poolName = 'pool__' + mixinName;
    var entity = this.sceneEl.components[poolName].requestEntity();

    entity.play();
    return entity;
  }
}

module.exports = PoolHelper;
