ASHOOTER = {};

// Vendor.
require('../vendor/aframe-bmfont-text-component.min.js');

require('./utils.js');

// Systems.
require('./systems/bullet.js');
require('./systems/enemy.js');

// Bullets.
require('./bullets/player.js');
require('./bullets/enemy.js');

// Enemies.
//require('./enemies/enemy0.js');
//require('./enemies/enemy1.js');
require('./enemies/enemyfeiss.js');

// Components
require('./components/gamestate.js');
require('./components/gamestate-debug.js');
require('./components/shoot-controls.js');
require('./components/bullet.js');
require('./components/counter.js');
require('./components/enemy.js');
require('./components/gun.js');
require('./components/headset.js');
require('./components/json-model.js');
require('./components/movement-pattern.js');
require('./components/spline-line.js');

// Movement Patterns.
require('./movement-patterns/random.js');
require('./movement-patterns/toEntity.js');
