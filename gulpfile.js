var gulp = require('gulp'),
	ts = require('gulp-typescript'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	through = require('through2'),
	globby = require('globby'),
	karma = require('karma').server,
    jsdoc = require('gulp-jsdoc'),
    del = require('del');
	
var mainTsProject = ts.createProject({
    removeComments: false,
    target: 'ES5',
    module: 'commonjs',
    typescript: require('typescript')
});

var testTsProject = ts.createProject({
    removeComments: true,
    target: 'ES5',
    module: 'commonjs',
    typescript: require('typescript')
    // noEmitOnError: true
});

gulp.task('test-scripts', ['build'], function() {
    var tsResult = gulp.src('tests/**/*.ts').pipe(ts(testTsProject));
    return tsResult.js.pipe(gulp.dest('tests'));
});

gulp.task('test-browserify', ['test-scripts'], function(){
    var bundledStream = through();
    
    globby(['./tests/**/*.js', '!./tests/tests.js'], function(err, entries){
        if(err){
            bundledStream.emit('error', err);
            return;
        }
        var b = browserify({
            entries: entries,
            debug: true
        });
        
        b.bundle().pipe(bundledStream);
        return bundledStream;
    });
    return bundledStream
    .pipe(source('tests.js'))
    .pipe(gulp.dest('./tests/'));
});

gulp.task('test', ['test-browserify'], function(){
    karma.start({
       configFile: __dirname + '/karma.conf.js',
       singleRun: true 
    });
});

gulp.task('ci', ['test-browserify'], function(){
    karma.start({
        configFile: __dirname + '/karma.ci.conf.js',
        singleRun: true
    });
});

gulp.task('build', ['clean'], function(){
    var tsResult = gulp.src(['./src/**/*.ts']).pipe(ts(mainTsProject));
    return tsResult.js.pipe(gulp.dest('./src'));
});

gulp.task('default', ['build'], function(){
    var bundledStream = through();
       
    globby(['./src/**/*.js'], function(err, entries){
        if(err){
            bundledStream.emit('error', err);
            return;
        }
        var b = browserify({
            entries: entries,
            debug: true
        });
        
        b.bundle().pipe(bundledStream);
        return bundledStream;
    });
    return bundledStream
    .pipe(source('SQiggL.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('docs', ['build'], function(){
    gulp.src('./src/**/*.js')
    .pipe(jsdoc('./docs'));
});

gulp.task('clean', function(){
    del([
        'src/**/*.js',
        'tests/**/*.js',
        'dist/*.js'
    ]);
});