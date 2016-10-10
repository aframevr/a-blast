function createMixin (id, obj, scene) {
  var mixinEl = document.createElement('a-mixin');
  mixinEl.setAttribute('id', id);
  Object.keys(obj).forEach(function (componentName) {
    var value = obj[componentName];
    if (typeof value === 'object') {
      value = AFRAME.utils.styleParser.stringify(value);
    }
    mixinEl.setAttribute(componentName, value);
  });

  var assetsEl = scene ? scene.querySelector('a-assets') : document.querySelector('a-assets');
  assetsEl.appendChild(mixinEl);

  return mixinEl;
};

window.createMixin = createMixin;
