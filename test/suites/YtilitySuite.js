var expect = require("expect.js");
var y = require("../../source/ytility");

describe("ytility", function() {
	describe("#capitalize", function() {
		it("should work properly", function() {
			expect(y.capitalize("hello!")).to.be("Hello!");
			expect(y.capitalize("HELLO!")).to.be("HELLO!");
		});
	});

	describe("#camelize", function() {
		it("should work properly", function() {
			expect(y.camelize("Salut, ça va ?")).to.be("SalutÇaVa");
			expect(y.camelize("SalutÇaVa")).to.be("SalutÇaVa");
			expect(y.camelize("a b c d e f")).to.be("aBCDEF");
			expect(y.camelize("(aaa,bbb,ccc,ddd,eee,fff)")).to.be("AaaBbbCccDddEeeFff");
		});
	});

	describe("#isDefined", function() {
		it("should work properly", function() {
			expect(y.isDefined(undefined)).to.be(false);
			expect(y.isDefined(null)).to.be(true);

			expect(y.isDefined(false)).to.be(true);
			expect(y.isDefined(true)).to.be(true);
			expect(y.isDefined(Boolean(false))).to.be(true);
			expect(y.isDefined(new Boolean(false))).to.be(true);
			expect(y.isDefined(Boolean(true))).to.be(true);
			expect(y.isDefined(new Boolean(true))).to.be(true);

			expect(y.isDefined(NaN)).to.be(true);
			expect(y.isDefined(123)).to.be(true);
			expect(y.isDefined(Number(123))).to.be(true);
			expect(y.isDefined(new Number(123))).to.be(true);

			expect(y.isDefined("")).to.be(true);
			expect(y.isDefined(String(""))).to.be(true);
			expect(y.isDefined(new String(""))).to.be(true);

			expect(y.isDefined({})).to.be(true);
			expect(y.isDefined(Object())).to.be(true);
			expect(y.isDefined(new Object())).to.be(true);

			expect(y.isDefined([])).to.be(true);
			expect(y.isDefined(Array())).to.be(true);
			expect(y.isDefined(new Array())).to.be(true);

			expect(y.isDefined(new Date())).to.be(true);

			expect(y.isDefined(function() {})).to.be(true);
			expect(y.isDefined(Function())).to.be(true);
			expect(y.isDefined(new Function())).to.be(true);

			expect(y.isDefined(/^$/)).to.be(true);
			expect(y.isDefined(RegExp())).to.be(true);
			expect(y.isDefined(new RegExp())).to.be(true);
		});
	});

	describe("#isObject", function() {
		it("should work properly", function() {
			expect(y.isObject(undefined)).to.be(false);
			expect(y.isObject(null)).to.be(false);

			expect(y.isObject(false)).to.be(false);
			expect(y.isObject(true)).to.be(false);
			expect(y.isObject(Boolean(false))).to.be(false);
			expect(y.isObject(new Boolean(false))).to.be(true);
			expect(y.isObject(Boolean(true))).to.be(false);
			expect(y.isObject(new Boolean(true))).to.be(true);

			expect(y.isObject(NaN)).to.be(false);
			expect(y.isObject(123)).to.be(false);
			expect(y.isObject(Number(123))).to.be(false);
			expect(y.isObject(new Number(123))).to.be(true);

			expect(y.isObject("")).to.be(false);
			expect(y.isObject(String(""))).to.be(false);
			expect(y.isObject(new String(""))).to.be(true);

			expect(y.isObject({})).to.be(true);
			expect(y.isObject(Object())).to.be(true);
			expect(y.isObject(new Object())).to.be(true);

			expect(y.isObject([])).to.be(true);
			expect(y.isObject(Array())).to.be(true);
			expect(y.isObject(new Array())).to.be(true);

			expect(y.isObject(Date())).to.be(false); // string
			expect(y.isObject(new Date())).to.be(true);

			expect(y.isObject(function() {})).to.be(true);
			expect(y.isObject(Function())).to.be(true);
			expect(y.isObject(new Function())).to.be(true);

			expect(y.isObject(/^$/)).to.be(true);
			expect(y.isObject(RegExp())).to.be(true);
			expect(y.isObject(new RegExp())).to.be(true);
		});
	});

	describe("#define", function() {
		var definition = {
			"own:private": {
				model: "Mustang",
				year: "2011",
				color: "yellow",
				secret: "???",
				magic: "!!!"
			},
			"readable": ["model", "year"],
			"public": ["color"],
			"writable": ["magic"]
		};

		var ownValues = definition["own:private"];
		var breakdown = {
			"own": Object.keys(definition["own:private"]),
			"readable": y.union(definition["readable"], definition["public"]),
			"writable": y.union(definition["writable"], definition["public"])
		};

		breakdown["read-only"] = y.difference(breakdown["readable"], breakdown["writable"]);
		breakdown["write-only"] = y.difference(breakdown["writable"], breakdown["readable"]);
		breakdown["read/write"] = y.intersection(breakdown["readable"], breakdown["writable"]);
		breakdown["private"] = y.difference(breakdown["own"], breakdown["readable"].concat(breakdown["writable"]));

		function Car(values) {
			var self = y.define(this, definition);

			var own = self["private"];

			y.forOwn(values, function(value, property) {
				own[property] = value;
			});
		}

		var car = new Car();

		it("should deal with readable properties properly", function() {
			breakdown["readable"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(true);
				expect(car[property]).to.be(ownValues[property]);
			});
		});

		it("should deal with read-only properties properly", function() {
			breakdown["read-only"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(true);
				var value = car[property];
				car[property] = "Whatever";
				expect(car[property]).to.be(value);
			});
		});

		it("should deal with writable properties properly", function() {
			breakdown["writable"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(true);
				car[property] = "Whatever";
				expect(car["private"][property]).to.be("Whatever");
			});
		});

		it("should deal with write-only properties properly", function() {
			breakdown["write-only"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(true);
				car[property] = "Whatever";
				expect(car[property]).to.be(undefined);
			});
		});

		it("should deal with read/write properties properly", function() {
			breakdown["read/write"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(true);
				car[property] = "Whatever";
				expect(car[property]).to.be("Whatever");
			});
		});

		it("should deal with private properties properly", function() {
			breakdown["private"].forEach(function(property) {
				expect(car.hasOwnProperty(property)).to.be(false);
				expect(car[property]).to.be(undefined);
				car[property] = "Whatever";
				// Here, regular public property creation happens.
				expect(car[property]).to.be("Whatever");
			});
		});

		it("should throw errors for undefined properties", function() {
			expect(function() {
				y.define({}, {
					"own": {},
					"readable": ["thing"],
					"public": ["unknown"],
					"writable": ["questionable"]
				});
			}).to.throwError(/^Unknown property/);
		});

		it("should throw errors for invalid definition", function() {
			expect(function() {
				y.define({}, {
					"readable": ["thing"],
					"public": ["unknown"],
					"writable": ["questionable"]
				});
			}).to.throwError(/^Invalid definition/);
		});
	});
});