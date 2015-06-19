var gulp = require('gulp'),
	ts = require('gulp-typescript'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	through = require('through2'),
	globby = require('globby'),
	karma = require('karma').server,
    jsdoc = require('gulp-jsdoc'),
    del = require('del'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename');
	
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

gulp.task('test-clean', ['test-browserify'], function(){
    return del([
        './tests/**/*.js',
        '!./tests/tests.js'
    ]);
});

gulp.task('test', ['test-clean'], function(){
    return karma.start({
       configFile: __dirname + '/karma.conf.js',
       singleRun: true 
    });
});

gulp.task('ci', ['test-browserify'], function(){
    return karma.start({
        configFile: __dirname + '/karma.ci.conf.js',
        singleRun: true
    });
});

gulp.task('build', ['clean'], function(){
    var tsResult = gulp.src(['./src/**/*.ts']).pipe(ts(mainTsProject));
    return tsResult.js.pipe(gulp.dest('./src'));
});

gulp.task('browserify', ['build'], function(){
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

gulp.task('default', ['browserify'], function(){
    return del([
        './src/**/*.js'
    ]);
});

gulp.task('docs-generate', ['browserify'], function(){
    // return gulp.src('./src/**/*.js')
    // .pipe(jsdoc('./docs'));
    return gulp.src('./src/**/*.js')
    .pipe(gulpJsdoc2md())
    .pipe(rename(function(path){
        path.extname = '.md';
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('docs', ['docs-generate']);

gulp.task('clean', function(){
    return del([
        'src/**/*.js',
        'tests/**/*.js',
        'dist/*.js'
    ]);
});

gulp.task('build-site', ['default'], function(){
    var tsResult = gulp.src(['./www/**/*.ts']).pipe(ts(mainTsProject));
    return tsResult.js.pipe(gulp.dest('./www'));
});

gulp.task('browserify-site', ['build-site'], function(){
    var bundledStream = through();
       
    globby(['./www/**/*.js'], function(err, entries){
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
    .pipe(source('app.js'))
    .pipe(gulp.dest('./www/'));
});

gulp.task('site', ['browserify-site'], function(){
    return del([
        'www/**/*.js',
        '!www/app.js'
    ]);
});

