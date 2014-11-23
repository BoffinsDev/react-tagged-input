module.exports = function(grunt) {

  grunt.initConfig({});

  grunt.config( 'webpack', require('./grunt/webpack.js') );
  grunt.config( 'react', require('./grunt/react.js') );
  grunt.config( 'sass', require('./grunt/sass.js') );
  grunt.config( 'watch', require('./grunt/watch.js') );

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-react');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['react', 'webpack']);

};