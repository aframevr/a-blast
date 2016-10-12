var texloader = new THREE.TextureLoader();
var tex=texloader.load('bullethole.png');

AFRAME.registerComponent('bullet', {
  schema: {
    name: { default: '' },
    direction: { type: 'vec3' },
    maxSpeed: { default: 5.0 },
    initialSpeed: { default: 5.0 },
    position: { type: 'vec3' },
    acceleration: { default: 0.5 },
    owner: { default: 'player', oneOf: ['enemy', 'player']},
  },

  init: function () {
    this.bullet = ASHOOTER.BULLETS[this.data.name];
    this.bullet.definition.init.call(this);
    this.hit = false;
    this.direction = new THREE.Vector3();
  },

  update: function (oldData) {
    var data = this.data;

    this.direction.set(data.direction.x, data.direction.y, data.direction.z);
    this.currentAcceleration = data.acceleration;
    this.speed = data.initialSpeed;
    this.startPosition = data.position;
  },

  hitObject: function (type, data) {
    this.bullet.definition.onHit.call(this);
    this.hit = true;
    if (this.data.owner === 'enemy') {
      this.el.emit('player-hit');
    }

    if (type === 'background') {
      //this.geometry = new THREE.IcosahedronGeometry(0.3, 1);
      //console.log(data.face.a,b.c);

      var face = data.face;
      var vertices = data.object.geometry.vertices;
      console.log(data.object);
      var vA = vertices[ face.a ];
			var vB = vertices[ face.b ];
			var vC = vertices[ face.c ];
      var cb = new THREE.Vector3(), ab = new THREE.Vector3();

			cb.subVectors( vC, vB );
			ab.subVectors( vA, vB );
			cb.cross( ab );

			cb.normalize();
      var normal = cb.clone();
      console.log(normal,face.normal);

      var size = 0.1;

      this.geometry = new THREE.PlaneGeometry(size,size);
      this.material = new THREE.MeshBasicMaterial({ color: '#ff9', side: THREE.DoubleSide, map: tex,  opacity: 0.5});
      this.material = new THREE.MeshBasicMaterial( {
          transparent: true,
          map: tex,
          color: '#fff',
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -20
      });
      this.helperMesh = new THREE.Mesh(this.geometry, this.material);

      this.helperMesh.position.set(0, 0, 0);
      this.helperMesh.position.copy(data.point);
      this.helperMesh.lookAt(face.normal);

/*
      this.helperMesh = new THREE.Line( new THREE.Geometry( ), new THREE.LineBasicMaterial( { linewidth: 4 }) );
      this.helperMesh.geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
      this.helperMesh.geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

      var p = data.point;
      var n = cb.clone();
      n.multiplyScalar( -1  );
      n.add( data.point );
      this.helperMesh.geometry.vertices[ 0 ].copy( p );
      this.helperMesh.geometry.vertices[ 1 ].copy( n );
*/
      //this.helperMesh.rotation.copy(data.face.normal);
      this.el.sceneEl.object3D.add(this.helperMesh);
    }

    this.resetBullet();
  },

  resetBullet: function () {
    this.hit = false;
    this.bullet.definition.reset.call(this);
    this.system.returnBullet(this.data.name, this.el);
  },

  tick: (function () {
    var position = new THREE.Vector3();
    var direction = new THREE.Vector3();
    return function tick (time, delta) {

      // Update acceleration based on the friction
      position.copy(this.el.getAttribute('position'));
      var friction = 0.005 * delta;
      if (this.currentAcceleration > 0) {
        this.currentAcceleration -= friction;
      } else if (this.currentAcceleration <= 0) {
        this.currentAcceleration = 0;
      }

      // Update speed based on acceleration
      this.speed += this.currentAcceleration;
      if (this.speed > this.data.maxSpeed) { this.speed = this.data.maxSpeed; }

      // Set new position
      direction.copy(this.direction);
      var newBulletPosition = position.add(direction.multiplyScalar(this.speed));
      this.el.setAttribute('position', newBulletPosition);

      // Check if the bullet is lost in the sky
      if (position.length() >= 80) {
        this.resetBullet();
        return;
      }

      var collisionHelper = this.el.getAttribute('collision-helper');
      if (!collisionHelper) { return; }

      var bulletRadius = collisionHelper.radius;

      // Detect collision depending on the owner
      if (this.data.owner === 'player') {

        // megahack
        this.el.object3D.lookAt(this.direction.clone().multiplyScalar(1000));

        // Detect collision against enemies
        if (this.data.owner === 'player') {
          var enemies = this.el.sceneEl.systems.enemy.activeEnemies;
          for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            var radius = enemy.getAttribute('collision-helper').radius;
            if (newBulletPosition.distanceTo(enemies[i].object3D.position) < radius + bulletRadius) {
              enemy.emit('hit');
              this.hitObject('enemy', enemy);
              return;
            }
          }
        };
      } else {
        // @hack Any better way to get the head position ?
        var head = this.el.sceneEl.camera.el.components['look-controls'].dolly.position;
        if (newBulletPosition.distanceTo(head) < 0.25 + bulletRadius) {
          this.hitObject('player');
          return;
        }
      }

      // Detect collission aginst the background
      var ray = new THREE.Raycaster(position, direction.clone().normalize());
      var collisionResults = ray.intersectObjects(document.getElementById('border').object3D.children, true);
      var self = this;
      collisionResults.forEach(function (collision) {
       if (collision.distance < position.length()) {
         if (!collision.object.el) { return; }
         self.hitObject('background', collision);
         // return;

         // decals
/*
         if (collision.faceIndex === 1494) {
            // Hack to check collision against the counter face
           if (self.el.sceneEl.getAttribute('game').state === 'game-over') {
             self.el.emit('game-start');
           }
         }
         self.el.setAttribute('position', collision.point);
         self.hitObject();
*/
       }
     });
    }
  })()
});
