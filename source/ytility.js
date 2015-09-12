var helper = require("./helper");
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
		var defaultOwnScopeKey = "own";
		var ownScopeKey = helper.find(Object.keys(definition), function(key) {
			return key === defaultOwnScopeKey || key.substr(0, defaultOwnScopeKey.length + 1) === defaultOwnScopeKey + ":";
		});

		if(!ownScopeKey && helper.isEmpty(definition[ownScopeKey])) {
			throw new Error("Invalid definition!");
		}

		var values = definition[ownScopeKey];
		if(ownScopeKey !== defaultOwnScopeKey) {
			ownScopeKey = ownScopeKey.split(defaultOwnScopeKey + ":")[1];
		}

		Object.defineProperty(self, ownScopeKey, {
			enumerable: false,
			value: values
		});

		var own = self[ownScopeKey];

		this.expose(self, own, helper.omit(definition, ownScopeKey));

		return self;
	},

	"expose": function expose(destination, source, definition) {
		var readable = helper.unique(helper.union(definition["readable"], definition["public"]));
		var writable = helper.unique(helper.union(definition["writable"], definition["public"]));

		var descriptors = {};
		for(var property in source) {
			descriptors[property] = {};
		}

		readable.forEach(function(property) {
			if(!(property in source)) {
				throw new Error("Unknown property: \"" + property + "\".");
			}

			descriptors[property]["get"] = function() {
				return source[property];
			};
		});

		writable.forEach(function(property) {
			if(!(property in source)) {
				throw new Error("Unknown property: \"" + property + "\".");
			}

			descriptors[property]["set"] = function(value) {
				return source[property] = value;
			};
		});

		for(property in source) {
			var descriptor = descriptors[property];
			if(!helper.isEmpty(descriptor)) {
				descriptor["enumerable"] = false;
				if(descriptor["get"]) {
					descriptor["enumerable"] = true;
				}

				Object.defineProperty(destination, property, descriptor);
			}
		}

		return destination;
	},

	"inherit": require("util").inherits,

	"error": function error(initialize) {
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

	"proxy": function proxy(object, target) {
		helper.forOwn(target, function(value, property) {
			if(!object.hasOwnProperty(property)) {
				Object.defineProperty(object, property, {
					get: function() {
						return target[property];
					},

					set: function(value) {
						target[property] = value;
					}
				});
			}
		});
	},

	"alias": function alias(object, mapping) {
		for(var key in mapping) {
			object[key] = object[mapping[key]];
		}

		return object;
	}
});

module.exports = helper;