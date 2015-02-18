var helper = require("lodash");
var XRegExp = require("xregexp").XRegExp;

var isObject = helper.isObject;

helper.mixin({
	"capitalize": function capitalize(text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	},

	"camelize": function camelize(text) {
		return text.replace(XRegExp("[^\\p{L}\\d]+([\\p{L}\\d]|$)", "g"), function(match, letter/*, offset, text*/) {
			return letter.toUpperCase();
		});
	},

	"isDefined": function isDefined() {
		return !helper.isUndefined.apply(this, arguments);
	},

	"isObject": function(thing, plain) {
		return plain ? helper.isPlainObject(thing) : isObject(thing);
	},

	"complement": function complement() {
		return helper.defaults.apply(this, arguments);
	},

	"define": function define(self, definition) {
		var defaultScope = "own";
		var scope = helper.find(Object.keys(definition), function(key) {
			return key === defaultScope || key.substr(0, defaultScope.length + 1) === defaultScope + ":";
		});

		if(!scope && helper.isEmpty(definition[scope])) {
			throw new Error("Invalid definition!");
		}

		var values = definition[scope];
		if(scope !== defaultScope) {
			scope = scope.split(defaultScope + ":")[1];
		}

		Object.defineProperty(self, scope, {
			enumerable: false,
			value: values
		});

		var own = self[scope];

		var readable = helper.unique(helper.union(definition["readable"], definition["public"]));
		var writable = helper.unique(helper.union(definition["writable"], definition["public"]));

		var descriptors = {};
		for(var property in own) {
			descriptors[property] = {};
		}

		readable.forEach(function(property) {
			if(!(property in own)) {
				throw new Error("Unknown property: \"" + property + "\".");
			}

			descriptors[property]["get"] = function() {
				return own[property];
			};
		});

		writable.forEach(function(property) {
			if(!(property in own)) {
				throw new Error("Unknown property: \"" + property + "\".");
			}

			descriptors[property]["set"] = function(value) {
				return own[property] = value;
			};
		});

		for(property in own) {
			var descriptor = descriptors[property];
			if(!helper.isEmpty(descriptor)) {
				descriptor["enumerable"] = false;
				if(descriptor["get"]) {
					descriptor["enumerable"] = true;
				}

				Object.defineProperty(self, property, descriptor);
			}
		}

		return self;
	},

	inherit: require("util").inherits,

	error: function error(initialize) {
		if(!initialize) {
			throw new Error("Invalid parameters!");
		}

		var name;

		if(typeof initialize === "function") {
			name = initialize.name;
		}
		else {
			name = String(initialize);
			initialize = undefined;
		}

		if(!name) {
			throw new Error("Error should named!");
		}

		var constructor = function(message) {
			Error.call(this);
			this.message = message;
			this.name = name;
			Error.captureStackTrace(this, arguments.callee);

			initialize && initialize.apply(this, arguments);
		};

		constructor.prototype = new Error();

		return constructor;
	},

	delegate: function delegate(object, provider) {
		helper.forOwn(provider, function(value, property) {
			if(!object.hasOwnProperty(property)) {
				Object.defineProperty(object, property, {
					get: function() {
						return provider[property];
					},

					set: function(value) {
						provider[property] = value;
					}
				});
			}
		});
	}
});

module.exports = helper;