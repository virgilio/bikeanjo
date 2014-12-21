'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            styles: {
                files: [
                    'assets/styles/**/*.less',
                ],
                tasks: ['styles'],
            },
            main: {
                files: [
                    'assets/scripts/**/*.js',
                ],
                tasks: ['uglify:main'],
            },
            bower_components: {
                files: [
                    'bower_components/**/*'
                ],
                tasks: ['all'],
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                sourceMapIncludeSources: true,
                compress: true,
            },
            vendor: {
                files: {
                    'static/js/vendor.js': [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js',
                    ],
                },
            },
            main: {
                files: {
                    'static/js/main.js': [
                        'assets/scripts/**/*.js',
                    ],
                },
            },
        },
        less: {
            options: {
                compress: true,
                sourceMap: true,
                outputSourceFiles: true,
            },
            app: {
                options: {
                    sourceMapFilename: 'main.css.map',
                },
                files: {
                    'static/css/main.css': 'assets/styles/main.less',
                },
            },
        },
        rename: {
            csssourcemap: {
                src: 'main.css.map',
                dest: 'static/css/',
            },
        },
        copy: {
            fontawesome: {
                files: [
                    {expand: true, flatten: true, src: ['bower_components/font-awesome/fonts/*'], dest: 'static/fonts/', filter: 'isFile',},
                    {expand: true, flatten: true, src: ['bower_components/font-awesome/css/*.css'], dest: 'static/css/', filter: 'isFile',},
                ],
            },
        },
        browserSync: {
            options: {
                watchTask: true // < VERY important
            },
            app: {
                bsFiles: {
                    src : [
                        'static/css/*.css',
                        'static/js/*.js',
                        'templates/*.html'
                    ]
                },
            },
        },
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browser-sync');

    // define default task
    grunt.registerTask('styles', ['less', 'rename',]);
    grunt.registerTask('all', ['uglify', 'styles', 'copy',])
    grunt.registerTask('default', ['all', 'browserSync', 'watch',]);
};