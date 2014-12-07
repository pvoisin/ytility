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
		Object.defineProperty(self, "own", {
			enumerable: false,
			value: definition["own"]
		});

		var own = self.own;

		var readable = helper.unique(helper.union(definition["readable"], definition["public"]));
		var writable = helper.unique(helper.union(definition["writable"], definition["public"]));

		var descriptors = {};
		for(var property in definition["own"]) {
			descriptors[property] = {};
		}

		readable.forEach(function(property) {
			descriptors[property]["get"] = function() {
				return own[property];
			};
		});

		writable.forEach(function(property) {
			descriptors[property]["set"] = function(value) {
				return own[property] = value;
			};
		});

		for(property in definition["own"]) {
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