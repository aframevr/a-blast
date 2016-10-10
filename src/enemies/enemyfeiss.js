ASHOOTER.registerEnemy(
  // name
  'enemyfeiss',
  // data
  {
    components: {
      enemy: {
        name: 'enemyfeiss'
      },
      'json-model': {
        src: 'url(https://feiss.github.io/a-shooter-assets/models/enemy1.json)'
      }
    },
    poolSize: 1
  },
  // implementation
  {
    init: function () { this.reset(); },
    reset: function () {
      this.el.removeAttribute('movement-pattern');
      this.el.setAttribute('position', 'y', -10);
      this.el.setAttribute('movement-pattern', {
        type: 'random', debug: false
      });
    },
    tick: function (time, delta) {},
    onHit: function (type) {}
  }
);
