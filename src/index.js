window.ABLAST = {};

// Assets managment
require('./a-asset-image.js')

require('./lib/utils.js');

// Systems.
require('./systems/bullet.js');
require('./systems/enemy.js');
require('./systems/explosion.js');

// Bullets.
require('./bullets/player.js');
require('./bullets/enemy-slow.js');
require('./bullets/enemy-medium.js');
require('./bullets/enemy-fast.js');
require('./bullets/enemy-fat.js');

// Enemies.
require('./enemies/enemy_start.js');
require('./enemies/enemy0.js');
require('./enemies/enemy1.js');
require('./enemies/enemy2.js');
require('./enemies/enemy3.js');

// Components
require('./components/highscores.js');
require('./components/proxy_event.js');
require('./components/countdown.js');
require('./components/decals.js');
require('./components/curve-movement.js');
require('./components/collision-helper.js');
require('./components/gamestate.js');
require('./components/gamestate-debug.js');
require('./components/shoot-controls.js');
require('./components/bullet.js');
require('./components/lifes-counter.js');
require('./components/points-counter.js');
require('./components/timer-counter.js');
require('./components/enemy.js');
require('./components/weapon.js');
require('./components/gun.js');
require('./components/headset.js');
require('./components/json-model.js');
require('./components/spline-line.js');
require('./components/explosion.js');
require('./components/animate-message.js');
require('./components/gamestate-visuals.js');
require('./components/sound-fade.js');
require('./components/restrict-position.js');
