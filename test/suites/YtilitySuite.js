var expect = require("expect.js");
var $ = require("../../source/ytility");

describe("ytility", function() {
	describe("#capitalize", function() {
		it("should work properly", function() {
			expect($.capitalize("hello!")).to.be("Hello!");
			expect($.capitalize("HELLO!")).to.be("HELLO!");
		});
	});

	describe("#camelize", function() {
		it("should work properly", function() {
			expect($.camelize("Salut, ça va ?")).to.be("SalutÇaVa");
			expect($.camelize("SalutÇaVa")).to.be("SalutÇaVa");
			expect($.camelize("a b c d e f")).to.be("aBCDEF");
			expect($.camelize("(aaa,bbb,ccc,ddd,eee,fff)")).to.be("AaaBbbCccDddEeeFff");
		});
	});

	describe("#isDefined", function() {
		it("should work properly", function() {
			expect($.isDefined(undefined)).to.be(false);
			expect($.isDefined(null)).to.be(true);

			expect($.isDefined(false)).to.be(true);
			expect($.isDefined(true)).to.be(true);
			expect($.isDefined(Boolean(false))).to.be(true);
			expect($.isDefined(new Boolean(false))).to.be(true);
			expect($.isDefined(Boolean(true))).to.be(true);
			expect($.isDefined(new Boolean(true))).to.be(true);

			expect($.isDefined(NaN)).to.be(true);
			expect($.isDefined(123)).to.be(true);
			expect($.isDefined(Number(123))).to.be(true);
			expect($.isDefined(new Number(123))).to.be(true);

			expect($.isDefined("")).to.be(true);
			expect($.isDefined(String(""))).to.be(true);
			expect($.isDefined(new String(""))).to.be(true);

			expect($.isDefined({})).to.be(true);
			expect($.isDefined(Object())).to.be(true);
			expect($.isDefined(new Object())).to.be(true);

			expect($.isDefined([])).to.be(true);
			expect($.isDefined(Array())).to.be(true);
			expect($.isDefined(new Array())).to.be(true);

			expect($.isDefined(new Date())).to.be(true);

			expect($.isDefined(function() {})).to.be(true);
			expect($.isDefined(Function())).to.be(true);
			expect($.isDefined(new Function())).to.be(true);

			expect($.isDefined(/^$/)).to.be(true);
			expect($.isDefined(RegExp())).to.be(true);
			expect($.isDefined(new RegExp())).to.be(true);
		});
	});

	describe("#isObject", function() {
		it("should work properly", function() {
			expect($.isObject(undefined)).to.be(false);
			expect($.isObject(null)).to.be(false);

			expect($.isObject(false)).to.be(false);
			expect($.isObject(true)).to.be(false);
			expect($.isObject(Boolean(false))).to.be(false);
			expect($.isObject(new Boolean(false))).to.be(true);
			expect($.isObject(Boolean(true))).to.be(false);
			expect($.isObject(new Boolean(true))).to.be(true);

			expect($.isObject(NaN)).to.be(false);
			expect($.isObject(123)).to.be(false);
			expect($.isObject(Number(123))).to.be(false);
			expect($.isObject(new Number(123))).to.be(true);

			expect($.isObject("")).to.be(false);
			expect($.isObject(String(""))).to.be(false);
			expect($.isObject(new String(""))).to.be(true);

			expect($.isObject({})).to.be(true);
			expect($.isObject(Object())).to.be(true);
			expect($.isObject(new Object())).to.be(true);

			expect($.isObject([])).to.be(true);
			expect($.isObject(Array())).to.be(true);
			expect($.isObject(new Array())).to.be(true);

			expect($.isObject(Date())).to.be(false); // string
			expect($.isObject(new Date())).to.be(true);

			expect($.isObject(function() {})).to.be(true);
			expect($.isObject(Function())).to.be(true);
			expect($.isObject(new Function())).to.be(true);

			expect($.isObject(/^$/)).to.be(true);
			expect($.isObject(RegExp())).to.be(true);
			expect($.isObject(new RegExp())).to.be(true);
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
			"readable": $.union(definition["readable"], definition["public"]),
			"writable": $.union(definition["writable"], definition["public"])
		};

		breakdown["read-only"] = $.difference(breakdown["readable"], breakdown["writable"]);
		breakdown["write-only"] = $.difference(breakdown["writable"], breakdown["readable"]);
		breakdown["read/write"] = $.intersection(breakdown["readable"], breakdown["writable"]);
		breakdown["private"] = $.difference(breakdown["own"], breakdown["readable"].concat(breakdown["writable"]));

		function Car(values) {
			var self = $.define(this, definition);

			var own = self["private"];

			$.forOwn(values, function(value, property) {
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
				$.define({}, {
					"own": {},
					"readable": ["thing"],
					"public": ["unknown"],
					"writable": ["questionable"]
				});
			}).to.throwError(/^Unknown property/);
		});

		it("should throw errors for invalid definition", function() {
			expect(function() {
				$.define({}, {
					"readable": ["thing"],
					"public": ["unknown"],
					"writable": ["questionable"]
				});
			}).to.throwError(/^Invalid definition/);
		});
	});
});