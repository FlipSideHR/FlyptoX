module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine'],
        files : [
            'client/bower_components/angular/angular.js',
            'client/bower_components/angular-mocks/angular-mocks.js',
            'client/app/modules.js',
            'client/app/**/*.js'
        ]
    });
};
