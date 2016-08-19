AFRAME.registerComponent('json-vc', {
  schema: {
    src: {type: 'src'},
  },
  init: function () {
    var objectLoader;
    var object3D = this.el.object3D;
    if (this.objectLoader) { return; }
    objectLoader = this.objectLoader = new THREE.ObjectLoader();
    objectLoader.load(this.data.src, function(group) {
      group.children.forEach(function(obj) {

        //it is supposed that if you check "shadeless" in blender, threejs exporter sets the 
        //material to MeshBasicMaterial, but it doesn't work for me, so I have to set it manually :/
        //https://github.com/mrdoob/three.js/pull/7635

        if (obj.name=='red' || obj.name=="sky" || obj.name=='glow'){
          obj.material= new THREE.MeshBasicMaterial( { vertexColors: true } );
        }
        else{
          //obj.material= new THREE.MeshLambertMaterial( { vertexColors: true } );;
        }

      });

      object3D.add(group);
    });
  }
});