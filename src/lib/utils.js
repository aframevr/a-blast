/* globals AFRAME */
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
  if (!assetsEl) {
    assetsEl = document.createElement('a-assets');
    scene.appendChild(assetsEl);
  }
  assetsEl.appendChild(mixinEl);

  return mixinEl;
}

Number.prototype.padLeft = function (n,str) {
  return Array(n-String(this).length+1).join(str||'0')+this;
}

String.prototype.pad = function (n,left, str) {
  var string = String(this).substr(0,n);
  var empty = Array(n-string.length+1).join(str||' ');
  return left ? empty + this : this + empty;
}

module.exports = {
  createMixin: createMixin
};
