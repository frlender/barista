module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // grab info from the package.json file
    pkg: grunt.file.readJSON('package.json'),

    // configure concatination of files
    concat: {
      options: {
        separator: '\n'
      },
      js_barista_utils: {
        src: ['barista/utils/**/*.js','!barista/utils/utils.main.js'],
        dest: 'barista/utils/utils.main.js'
      },
      js_barista_models: {
        src: ['barista/models/**/*.js','!barista/models/models.main.js'],
        dest: 'barista/models/models.main.js'
      },
      js_barista_views: {
        src: ['barista/views/**/*.js','!barista/views/views.main.js'],
        dest: 'barista/views/views.main.js'
      },
      js_barista_collections: {
        src: ['barista/collections/**/*.js','!barista/collections/collections.main.js'],
        dest: 'barista/collections/collections.main.js'
      },
      js_barista_main: {
        src: ['barista/utils/utils.main.js',
              'barista/models/models.main.js',
              'barista/views/views.main.js',
              'barista/collections/collections.main.js',
              'barista/tile.js',
              ],
        dest: 'barista/barista.js'
      },
      js_external: {
        src: ['external/backgrid.min.js',
              'external/chardinjs.min.js',
              'external/d3.parcoords.js',
              'external/FileSaver.min.js',
              'external/handlebars.js',
              'external/intro.min.js',
              'external/rgbcolor.js',
              'external/canvg.js',
              'external/Blob.js',
              'external/canvas-toBlob.js'
              ],
        dest: 'external/external.js'
      }
    },

    // configure uglification of files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      js: {
        src: ['external/external.js','barista/barista.js'],
        dest: '<%= pkg.name %>.main.min.js'
      }
    },

    // configure concatination and minification of css files
    cssmin: {
      external: {
        files: {
          'css/external.css': ['css/external/backgrid.min.css',
                                  'css/external/chardinjs.css',
                                  'css/external/d3.parcoords.css',
                                  'css/external/introjs.min.css',
                                  'css/external/tipsy.css']
        }
      },
      cf_internal: {
        files: {
          'css/internal.css': ['css/internal/barista.css']
        }
      },
      main: {
        files: {
          '<%= pkg.name %>.main.min.css': ['css/external.css','css/internal.css']
        }
      }
    },

    // configure the generation of docs with groc
    groc: {
      javascript: ["barista/**/*.js","README.md"],
      options: {
        index: 'README.md',
        out: "./",
        except: ['barista/**/*.main.js','barista/barista.js']
      }
    },

    // set up grunt to run the default patern when any js files change
    watch: {
      js: {
        files: ['barista/**/*.js'],
        tasks: ['concat','uglify','groc']
      },
      css: {
        files: ['css/internal/**/*.css'],
        tasks: ['cssmin']
      }
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "cssmin" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Load the plugin that provides the "groc" task.
  grunt.loadNpmTasks('grunt-groc');

  // load the plugin that provides the "watch" task
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['concat','uglify','cssmin','groc']);

};