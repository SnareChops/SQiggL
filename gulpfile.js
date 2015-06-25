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
    rename = require('gulp-rename'),
    webserver = require('gulp-webserver'),
    toJson = require('gulp-to-json');
	
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

gulp.task('default', ['clean:tests']);
gulp.task('test', ['karma:test']);
gulp.task('ci', ['karma:ci']);
gulp.task('site', ['serve:site']);
gulp.task('docs', ['serve:docs']);

gulp.task('clean', function(){
    return del([
        'src/**/*.js',
        'tests/**/*.js',
        'dist/*.js',
        'www/**/*.js',
        '!www/lib/**',
        'docs/**',
        'www/docs.json'
    ]);
});

gulp.task('build:source', ['clean'], function(){
    var tsResult = gulp.src(['./src/**/*.ts']).pipe(ts(mainTsProject));
    return tsResult.js.pipe(gulp.dest('./src'));
});

gulp.task('build:site', ['build:source'], function(){
    var tsResult = gulp.src(['./www/**/*.ts']).pipe(ts(mainTsProject));
    return tsResult.js.pipe(gulp.dest('./www'));
});

gulp.task('build:tests', ['build:site'], function() {
    var tsResult = gulp.src('tests/**/*.ts').pipe(ts(testTsProject));
    return tsResult.js.pipe(gulp.dest('tests'));
});

gulp.task('docs:generate', ['build:tests'], function(){
    return gulp.src(['./src/**/*.js', '!./src/Actions.js', '!./src/Conditions.js', '!./src/Replacers.js', '!./src/SQiggL.js'])
    .pipe(gulpJsdoc2md())
    .pipe(rename(function(path){
        path.extname = '.md';
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('docs:files', ['docs:generate'], function(){
    return gulp.src('./docs/**/*.md')
    .pipe(toJson({
        filename: './www/docs.json',
        strip: /^.+\/?\\?sqiggl-js\/?\\?/i
    }));
});

gulp.task('browserify:source', ['docs:files'], function(){
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

gulp.task('browserify:site', ['browserify:source'], function(){
    var bundledStream = through();
    globby(['./www/**/*.js', '!./www/lib/**'], function(err, entries){
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

gulp.task('istanbul:source', ['browserify:site']);

gulp.task('browserify:tests', ['istanbul:source'], function(){
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

gulp.task('clean:source', ['browserify:tests'], function(){
    return del([
        './src/**/*.js'
    ]);
});

gulp.task('clean:site', ['clean:source'], function(){
    return del([
        './www/**/*.js',
        '!./www/app.js',
        '!./www/lib/**'
    ]);
});

gulp.task('clean:tests', ['clean:site'], function(){
    return del([
        './tests/**/*.js',
        '!./tests/tests.js',
    ]);
});

gulp.task('karma:test', ['clean:tests'], function(){
    return karma.start({
       configFile: __dirname + '/karma.conf.js',
       singleRun: true 
    });
});

gulp.task('karma:ci', ['clean:tests'], function(){
    return karma.start({
        configFile: __dirname + '/karma.ci.conf.js',
        singleRun: true
    });
});

gulp.task('serve:site', ['clean:tests'], function(){
    gulp.src('./')
    .pipe(webserver({
        livereload: true,
        open: true
    }));
});

gulp.task('serve:docs', ['clean:tests'], function(){
    gulp.src('./')
    .pipe(webserver({
        open: '#/srcdocs/'
    }));
});