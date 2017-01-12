AFRAME.registerElement('a-asset-image', {
  prototype: Object.create(AFRAME.ANode.prototype, {
    createdCallback: {
      value: function () {
        this.isAssetItem = true;
      }
    },

    attachedCallback: {
      value: function () {
        var src = this.getAttribute('src');
        var textureLoader = new THREE.ImageLoader();
        textureLoader.load(src, this.onImageLoaded.bind(this));
      }
    },

    onImageLoaded: {
      value : function () {
        AFRAME.ANode.prototype.load.call(this);
      }
    }
  })
});
