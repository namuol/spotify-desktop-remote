module.exports = (grunt) ->
  grunt.initConfig
    watch:
      options:
        livereload: true
      express:
        files: 'src/server.coffee'
        tasks: ['express:dev']
        options:
          spawn: false
      coffee:
        files: ['src/main.coffee']
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
          script: 'src/server.coffee'

    coffee:
      build:
        files:
          'main.js': 'src/main.coffee'
          'server.js': 'src/server.coffee'

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks "grunt-express-server"

  grunt.registerTask 'default', ['coffee']
  grunt.registerTask 'dev', ['coffee', 'express:dev', 'watch']
