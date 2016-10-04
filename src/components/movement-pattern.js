/* global AFRAME, THREE */

var MOVEMENT_PATTERNS = AFRAME.MOVEMENT_PATTERNS = module.exports.MOVEMENT_PATTERNS = {};

/**
 * Registration API.
 *
 * @param {string} name - Pattern name.
 * @param {object} definition - Pattern methods.
 * @returns {object} Pattern.
 */
AFRAME.registerMovementPattern = function registerMovementPattern (name, definition) {
  var BasePattern;
  var NewMovementPattern;
  var NewPrototype = {};

  // Format definition object to prototype object.
  Object.keys(definition).forEach(function buildPrototype (key) {
    NewPrototype[key] = {value: definition[key], writable: true};
  });

  if (MOVEMENT_PATTERNS[name]) {
    throw new Error('The movement pattern`' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same movement ' +
                    'pattern or two different movement patterns of the same name.');
  }

  BasePattern = function (el, data) {
    var self = this;
    this.el = el;
    this.data = data;
  };
  BasePattern.prototype = {
    schema: {},
    init: function () { },
    update: function () { },
    tick: function (t, dt) { },
  };

  NewMovementPattern = function (el, data) {
    BasePattern.call(this, el, data);
  };
  NewMovementPattern.prototype = Object.create(BasePattern.prototype, NewPrototype);
  MOVEMENT_PATTERNS[name] = {
    MovementPattern: NewMovementPattern,
    schema: NewMovementPattern.prototype.schema
  };
};

/**
 * Base component.
 */
AFRAME.registerComponent('movement-pattern', {
  schema: {
    type: {default: 'random'}  // Movement type.
  },

  updateSchema: function (data) {
    var currentPatternType = this.data && this.data.type;
    var newPatternType = data.type;
    var patternType = newPatternType || currentPatternType;
    var schema = MOVEMENT_PATTERNS[patternType] && MOVEMENT_PATTERNS[patternType].schema;

    // Type doesn't exist.
    if (!schema) { throw new Error('Unknown movement pattern ' + newPatternType); }

    // No change in type.
    if (currentPatternType && newPatternType === currentPatternType) { return; }

    this.extendSchema(schema);
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    // Remove old pattern behavior (in case we want to dynamically update movement pattern).
    if (oldData && oldData.type !== data.type) {
      if (this.movementPattern) {
        el.sceneEl.removeBehavior(this.movementPattern.tick);
      }
      this.movementPattern = new MOVEMENT_PATTERNS[data.type].MovementPattern(el, data);
      this.movementPattern.init();
    }

    this.movementPattern.data = data;
    this.movementPattern.update();
  },

  tick: function (t, dt) {
    if (!this.movementPattern.tick) { return; }
    this.movementPattern.tick(t, dt);
  }
});
