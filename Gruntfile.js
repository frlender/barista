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
        src: ['source/utils/**/*.js','!source/utils/utils.main.js'],
        dest: 'source/utils/utils.main.js'
      },
      js_barista_models: {
        src: ['source/models/**/*.js','!source/models/models.main.js'],
        dest: 'source/models/models.main.js'
      },
      js_barista_views: {
        src: ['source/views/**/*.js','!source/views/views.main.js'],
        dest: 'source/views/views.main.js'
      },
      js_barista_collections: {
        src: ['source/collections/**/*.js','!source/collections/collections.main.js'],
        dest: 'source/collections/collections.main.js'
      },
      js_barista_main: {
        src: ['source/utils/utils.main.js',
              'source/models/models.main.js',
              'source/views/views.main.js',
              'source/collections/collections.main.js',
              'source/tile.js'
              ],
        dest: 'source/barista.js'
      },
      js_external: {
        src: ['external_source/backgrid.min.js',
              'external_source/chardinjs.min.js',
              'external_source/d3.parcoords.js',
              'external_source/FileSaver.min.js',
              'external_source/handlebars.js',
              'external_source/intro.min.js',
              'external_source/rgbcolor.js',
              'external_source/canvg.js',
              'external_source/Blob.js',
              'external_source/canvas-toBlob.js'
              ],
        dest: 'external_source/external.js'
      }
    },

    // configure uglification of files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> */\n'
      },
      js: {
        src: ['external_source/external.js','source/barista.js'],
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
      internal: {
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
      javascript: ["source/**/*.js","README.md"],
      options: {
        index: 'README.md',
        strip: 'source',
        except: ['source/**/*.main.js','source/barista.js']
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