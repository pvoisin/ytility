module.exports = function(grunt) {
	grunt.initConfig({
		mochaTest: {
			test: {
				options: {
					reporter: "spec"
				},

				src: ["test/suites/**/*.js"]
			}
		}
	});

	// lodash include=find,forOwn,isEmpty,unique,union,defaults,mixin,isObject,isUndefined,isPlainObject -o source/helper.js
	// lodash --production --output source/helper.js

	grunt.registerTask("test", ["mochaTest"]);

	grunt.loadNpmTasks("grunt-mocha-test");
};