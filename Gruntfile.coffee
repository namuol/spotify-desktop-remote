module.exports = (grunt) ->
  grunt.initConfig
    watch:
      options:
        livereload: true
      express:
        files: 'server.coffee'
        tasks: ['express:dev']
        options:
          spawn: false
      coffee:
        files: ['main.coffee']
        tasks: ['coffee']
      html:
        files: '*.html'
      js:
        files: '*.js'

    express:
      dev:
        options:
          port: process.env.PORT ? 3001
          opts: ['node_modules/coffee-script/bin/coffee']
          script: 'server.coffee'

    coffee:
      build:
        files:
          'main.js': 'main.coffee'

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks "grunt-express-server"

  grunt.registerTask 'default', ['coffee', 'express:dev', 'watch']
