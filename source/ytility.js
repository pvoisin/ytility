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
	}
});

module.exports = helper;