module.exports = function(grunt) {
	grunt.initConfig({
		browserify: {
			build: {
				options: {
					browserifyOptions: {
						standalone: "ytility"
					}
				},
				files: {"distribution/browser/ytility.js": ["source/ytility.js"]}
			}
		},

		connect: {
			options: {
				hostname: "*"
			},

			development: {
				options: {
					base: ".",
					keepalive: true,
					port: 8080
				}
			}
		}
	});

	grunt.registerTask("build", ["browserify:build"]);
	grunt.registerTask("server", ["connect:development"]);

	grunt.registerTask("default", ["build"]);

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-connect");
};