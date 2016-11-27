var fontText = '0123456789:';

function LetterPanel (materialSystem, numSegments, width) {
  this.width = width;
  this.numSegments = numSegments;

  var src = 'https://feiss.github.io/a-shooter-assets/images/font.png';

  materialSystem.loadTexture(src, {src: src}, setMap.bind(this));
  this.material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: 0x024caff
  });

  function setMap (texture) {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  this.group = new THREE.Group();
  var segmentWidth = width / numSegments;
  this.numLetters = fontText.length;
  for (var i = 0; i < numSegments; i++) {
    plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(segmentWidth, 0.5), this.material);
    plane.position.x = i * segmentWidth;
    this.group.add(plane);
  }
}

LetterPanel.prototype = {
  update: function (string) {
    string = string.split('').map(function(char){
      return fontText.indexOf(char);
    });

    var inc = 1 / this.numLetters;
    for (var i = 0; i < this.numSegments; i++) {
      var uv = this.group.children[i].geometry.attributes.uv;
      var array = uv.array;
      var x1 = string[i] * inc;
      var x2 = (string[i] + 1) * inc;
      array[0] = x1;
      array[4] = x1;
      array[2] = x2;
      array[6] = x2;
      uv.needsUpdate = true;
    }
  }
}

module.exports = LetterPanel;
