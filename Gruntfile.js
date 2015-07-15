module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  setEnvVars();

  grunt.initConfig({

        clean: {
            dist: 'dist/'
        },
        // Configure a mochaTest task
        mochaTest: {
          test: {
            options: {
              reporter: 'spec',
              captureFile: 'results.txt', // Optionally capture the reporter output to a file
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            src: ['test/server/*.spec.js']
          }
        },
        copy: {
            app_common: {
                expand: true,
                cwd: 'app',
                src: ['**/*', '!**/*.js'],
                dest: 'dist/app'
            },
            app_unminified: {
                expand: true,
                cwd: 'app',
                src: ['**/*.js', '!**/*_test.js'],
                dest: 'dist/app/unminified'
            },
            app_minified: {
                expand: true,
                cwd: 'app',
                src: ['**/*.js', '!**/*_test.js'],
                dest: 'dist/app/minified'
            },
            server: {
                expand: true,
                cwd: 'server',
                src: ['**', '!views/**'],
                dest: 'dist/server'
            },
            server_unminified: {
                expand: true,
                cwd: 'server',
                src: ['views/**'],
                dest: 'dist/server/unminified'
            },
            server_minified: {
                expand: true,
                cwd: 'server',
                src: ['views/**'],
                dest: 'dist/server/minified'
            },
            bower_copy: {
                expand: true,
                src: ['bower_components/**'],
                dest: 'dist/app/unminified'
            },
            knexfile: {
                src: 'knexfile.js',
                dest: 'dist/knexfile.js'
            }
        },

    jshint: {
        app: {
          options: {
            browser: true,
            globals: {
              angular: false,
              console: false,
              FlyptoX: true
            },
            laxcomma: true,
            maxlen: 120,
            unused: 'vars',
            undef: true
          },
          files: {
            src: [
              'client/app/**/*.js'
            ]
          }
        },
        server: {
          options: {
            node: true,
            globals: (function() {
              // add model names to globals
              var globals = {};
              var models = grunt.file.expand('./server/models/**/*.js');
              for(var i in models) {
                globals[
                  models[i]
                    .replace(/^.*[\\\/]/, '')
                    .split('.')[0]
                ] = true;
              }
              return globals;
            })(),
            laxcomma: true,
            maxlen: 120,
            unused: 'vars',
            undef: true
          },
          files: {
            src: ['server/**/*.js']
          }
        }
    },

    less: {
      unminified: {
        files: {
          'dist/client/unminified/app.css': 'client/assets/css/app.less'
        }
      },
      minified: {
        files: {
          'dist/client/minified/app.css': 'client/assets/css/app.less'
        }
      }
    },

    useminPrepare: {
      html: 'dist/server/minified/views/index.html',
      options: {
        dest: 'dist/client/minified',
        root: 'dist/client/unminified'
      }
    },

    usemin: {
      html: 'dist/server/minified/views/index.html'
    },

    express: {
      server: {
        options: {
          script: 'dist/server/main.js',
          port: 9999
        }
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        autoWatch: false,
        singleRun: false,
        browsers: ['PhantomJS']
      }
    },

    watch: {
      options: {
        livereload: true,
        spawn: false
      },
      less: {
        files: 'client/assets/**/*.less',
        tasks: ['compile-less']
      },
      app_markup: {
        files: ['client/**/*.html'],
        tasks: [
          'jshint:app',
          'copy-app-dist',
          'prepare-dist'
        ]
      },
      app_code: {
        files: ['client/**/*.js'],
        tasks: [
          'jshint:app',
          'copy-app-dist',
          'prepare-dist',
          'karma'
        ]
      },
      server: {
        files: ['server/**'],
        tasks: [
          'jshint:server',
          'copy-server-dist',
          'prepare-dist',
          'express'
        ]
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['build-dist', 'express']
      }
    }

  });

  grunt.registerTask('copy-app-dist', 'Copy app files to dist',
  function() {
    grunt.task.run([
      'copy:app_common',
      'copy:app_unminified',
      'copy:bower_copy'
    ]);
    if(minOption()) {
      grunt.task.run('copy:app_minified');
    }
  });

  grunt.registerTask('copy-server-dist', 'Copy server files to dist',
  function() {
    grunt.task.run('copy:server');
    grunt.task.run('copy:knexfile');
    grunt.task.run('copy:server_unminified');
    if(minOption()) {
      grunt.task.run('copy:server_minified');
    }
  });

  grunt.registerTask('compile-less', 'Compile LESS to CSS',
  function() {
    grunt.task.run('less:unminified');
    if(minOption()) {
      grunt.task.run('less:minified');
    }
  });

  grunt.registerTask('prepare-dist', function() {
    if(minOption()) {
      grunt.task.run([
        'useminPrepare',
        'concat:generated',
        'uglify:generated',
        'usemin'
      ]);
    }
  });

  grunt.registerTask('build-dist', [
    'clean',
    'copy-app-dist',
    'copy-server-dist',
    'compile-less',
    'prepare-dist'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build-dist',
    'express',
    'karma',
    'watch'
  ]);

  grunt.registerTask('test:server', [
    'mochaTest'
  ]);

  function setEnvVars() {
    if(minOption()) {
      process.env.MINIFY = 'yes';
    }
  }

  function minOption() {
    return grunt.option('minify') || grunt.option('min');
  }

}
