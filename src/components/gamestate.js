/* global AFRAME */

AFRAME.registerComponent('gamestate', {
  schema: {
    health: {default: 5},
    level: {default: 1},
    points: {default: 0},
    isGameOver: {default: false},
    state: {default: 'STATE_START'}
  },

  init: function () {
    var el = this.el;
    var initialState = this.initialState;
    var state = this.data;

    // Initial state.
    if (!initialState) { initialState = state; }

    el.emit('gamestate-initialized', {state: initialState});

    el.addEventListener('enemy-hit', function () {
      var newState = AFRAME.utils.extend({}, state);
      newState.points += 1;
      newState.level = parseInt(newState.points / 10, 10);
      publishState(newState);
    });

    el.addEventListener('player-hit', function () {
      var newState = AFRAME.utils.extend({}, state);
      newState.health -= 1;
      if (newState.health <= 0) {
        newState.isGameOver = true;
        newState.state = 'STATE_GAME_OVER';

        // TEMPORARY: Reset the game after a few seconds.
        // Later be on explicit action.
        setTimeout(function () {
          publishState(initialState);
        }, 5000);
      }
      publishState(newState);
    });

    el.addEventListener('reset', function () {
      publishState(initialState);
    });

    function publishState (newState) {
      el.setAttribute('gamestate', newState);
      el.emit('gamestate-changed', {
        diff: AFRAME.utils.diff(state, newState),
        state: newState
      });
      state = newState;
    }
  }
});

/**
 * Bind game state to a component property.
 */
AFRAME.registerComponent('gamestate-bind', {
  schema: {
    default: {},
    parse: AFRAME.utils.styleParser.parse
  },

  update: function () {
    var sceneEl = this.el.closestScene();
    if (sceneEl.hasLoaded) {
      this.updateBinders();
    }
    sceneEl.addEventListener('loaded', this.updateBinders.bind(this));
  },

  updateBinders: function () {
    var data = this.data;
    var el = this.el;
    var subscribed = Object.keys(this.data);

    el.sceneEl.addEventListener('gamestate-changed', function (evt) {
      syncState(evt.detail.diff);
    });
    syncState(el.sceneEl.getComputedAttribute('gamestate'));

    function syncState (state) {
      Object.keys(state).forEach(function updateIfNecessary (stateProperty) {
        var targetProperty = data[stateProperty];
        var value = state[stateProperty];
        if (subscribed.indexOf(stateProperty) === -1) { return; }
        AFRAME.utils.entity.setComponentProperty(el, targetProperty, value);
      });
    }
  }
});
