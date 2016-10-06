AFRAME.registerComponent('debug-ui', {
	schema: {'properties': {
		default: '',
		parse: function (str) {
			var propertyList;
			if (!str) { return []; }
			propertyList = str.split(' ');
			propertyList.forEach(parseProperty);
			return propertyList;
			function parseProperty(str, index) {
				var fields = str.split('.');
				var elementId;
				var componentName;
				var propertyName;
				var parsedProperty = {};
				if (fields.length !== 2 && fields.length !== 3) {
					console.warn('Incorrect format for property ' + str);
					return;
				}
				if (fields.length === 2) {
					componentName = fields[0];
					propertyName = fields[1];
				}
				if (fields.length === 3) {
					elementId = fields[0];
					componentName = fields[1];
					propertyName = fields[2];
				}
				parsedProperty.id = elementId;
				parsedProperty.component = componentName;
				parsedProperty.property = propertyName;
				propertyList[index] = parsedProperty;
			}
		}
	}},

	init: function() {
		var controllerEls = this.controllerEls = document.querySelectorAll('[tracked-controls]');
		this.el.addEventListener('camera-ready', this.onCameraReady.bind(this));
		this.deltaAxis = 0;
		this.selectedProperty = this.data.properties[0];
		this.bindMethods();
		if (controllerEls.length === 0) {
			this.insertControllers();
		}
		this.attachEventListeners();
		if (this.el.tagName !== 'A-SCENE') {
			console.warn('This component can only be applied to a-scene');
		}
	},

	onCameraReady: function (evt) {
		var hudEl = this.hudEl = document.createElement('a-entity');
		hudEl.setAttribute('bmfont-text', {text: 'DEBUG-UI'});
		hudEl.setAttribute('position', '-1 0 -2.5');
		evt.detail.cameraEl.appendChild(hudEl);
	},

	bindMethods: function () {
		this.onAxisMoved = this.onAxisMoved.bind(this);
		this.onGripDown = this.onGripDown.bind(this);
		this.onGripUp = this.onGripUp.bind(this);
	},

	onAxisMoved: function (evt) {
		var currentAxisValue = evt.detail.axis[1];
		if (currentAxisValue === 0) {
			this.previousAxisValue = undefined;
			return;
		}
		this.previousAxisValue = this.previousAxisValue || currentAxisValue;
		this.deltaAxis += currentAxisValue - this.previousAxisValue;
		this.previousAxisValue = currentAxisValue;
		if (this.deltaAxis !== 0) { this.updateProperty(this.selectedProperty); }
	},

	onGripDown: function () {
		var properties = this.data.properties;
		var currentIndex = properties.indexOf(this.selectedProperty);
		var nextIndex = currentIndex === properties.length -1 ? 0 : currentIndex + 1;
		this.selectedProperty = properties[nextIndex];
		this.active = true;
		this.updateHUD();
	},

	updateHUD: function () {
		var selectedProperty = this.selectedProperty;
		var value = selectedProperty.value || '';
		value = typeof value !== 'number' ? value : value.toFixed(2);
		var text = selectedProperty.component + ' ' + selectedProperty.property + ' ' + value;
		this.hudEl.setAttribute('bmfont-text', 'text', text);
	},

	onGripUp: function () {
	},

	updateProperty: function (property) {
		var component = property.component;
		var deltaAxis = this.deltaAxis;
		var propertyName = property.property;
		var els = this.el.querySelectorAll('[' + component + ']');
		var self = this;
		if (this.active === false) { return; }
		if (this.wait) { return; }
		this.wait = true;
		setTimeout(function() { this.wait = false; }.bind(this), 50);
		els.forEach(function updateEl(el) {
			var currentValue = el.getAttribute(component)[propertyName];
			var schema;
			var range;
			var valueIncrement;
			var newValue;
			if (el.isEntity !== true) { return; }
			schema = el.components[component].schema[propertyName];
			range = schema.min && schema.max ? schema.max - schema.min : 5;
			valueIncrement = range * deltaAxis;
			newValue = currentValue + valueIncrement;
			if ( property.value === newValue ||
				(schema.min !== undefined && newValue < schema.min) ||
				((schema.max !== undefined && newValue > schema.max))) {
				return;
			}
			el.setAttribute(component, propertyName, newValue);
			property.value = newValue;
			self.updateHUD();
		});
		this.deltaAxis = 0;
	},

	insertControllers: function() {
		var leftControllerEl = document.createElement('a-entity');
		var rightControllerEl = document.createElement('a-entity');
		leftControllerEl.setAttribute('vive-controls', 'hand: left');
		rightControllerEl.setAttribute('vive-controls', 'hand: right');
		this.el.appendChild(leftControllerEl);
		this.el.appendChild(rightControllerEl);
		this.controllerEls = [leftControllerEl, rightControllerEl];
	},

	attachEventListeners: function () {
		var self = this;
		this.controllerEls.forEach(function attachEventListeners (el) {
			el.addEventListener('gripdown', self.onGripDown);
			el.addEventListener('gripup', self.onGripUp);
			el.addEventListener('axismove', self.onAxisMoved);
		});
	}
});