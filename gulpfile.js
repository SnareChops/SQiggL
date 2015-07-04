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
    toJson = require('gulp-to-json'),
    istanbul = require('gulp-istanbul'),
    tsify = require('tsify'),
    watchify = require('watchify');
	
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

gulp.task('default', ['build:site', 'build:tests']);
gulp.task('test', ['karma:test']);
gulp.task('ci', ['karma:ci']);
gulp.task('site', ['serve:site']);

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

gulp.task('build:source', function(){
    var stream = through();
    globby(['./src/**/*.ts'], function(err, entries){
        if(err){
            stream.emit('error', err);
            return;
        }
        return browserify({debug: true, entries: entries, cache: {}, packageCache: {}})
        .plugin('tsify')
        .bundle()
        .pipe(stream);
    });
    return stream
    .pipe(source('SQiggL.js'))
    .on('error', function(error){console.log(error.toString()); this.emit('end');})
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build:site', function(){
    var stream = through();
    globby(['./www/**/*.ts'], function(err, entries){
        if(err){
            stream.emit('error', err);
            return;
        }
        return browserify({debug: true, entries: entries, cache: {}, packageCache: {}})
        .plugin('tsify')
        .bundle()
        .pipe(stream);
    });
    return stream
    .pipe(source('app.js'))
    .on('error', function(error){console.log(error.toString()); this.emit('end');})
    .pipe(gulp.dest('./www/'));
});

gulp.task('build:tests', ['build:source'], function(){
    var stream = through();
    globby(['./tests/**/*.ts'], function(err, entries){
        if(err){
            stream.emit('error', err);
            return;
        }
        return browserify({debug: true, entries: entries, cache: {}, packageCache: {}})
        .plugin('tsify')
        .bundle()
        .pipe(stream);
    });
    return stream
    .pipe(source('tests.js'))
    .on('error', function(error){console.log(error.toString()); this.emit('end');})
    .pipe(gulp.dest('./tests/'));
});

gulp.task('docs', function(){
    return gulp.src(['./src/**/*.ts'])
    .pipe(ts(mainTsProject))
    .js.pipe(gulpJsdoc2md())
    .pipe(rename(function(path){
        path.extname = '.md';
    }))
    .pipe(gulp.dest('./docs'))
    .pipe(toJson({
        filename: './www/docs.json',
        strip: /^.+\/?\\?sqiggl-js\/?\\?/i
    }));
});

gulp.task('watch', ['build:source', 'docs', 'build:site', 'build:tests'], function(){
    gulp.watch('./src/**/*.ts', ['build:source', 'docs'])
    .on('change', function(event){
        console.log('File '+event.path+' was '+event.type+', rebuilding...');
    });
    gulp.watch('./www/**/*.ts', ['build:site'])
    .on('change', function(event){
        console.log('File '+event.path+' was '+event.type+', rebuilding...');
    });
    gulp.watch('./tests/**/*.ts', ['build:tests'])
    .on('change', function(event){
        console.log('File '+event.path+' was '+event.type+', rebuilding...');
    });
    gulp.watch('./tests/tests.js', ['karma:test'])
});

gulp.task('istanbul:source', ['browserify:site']);//, function (){
    // return gulp.src(['./src/**/*.js', '!./src/bundle.js'])
    // .pipe(istanbul())
    // .pipe(istanbul.hookRequire());
// });

gulp.task('karma:test', function(){
    return karma.start({
       configFile: __dirname + '/karma.conf.js',
       singleRun: false 
    });
});

gulp.task('karma:ci', ['build:tests'], function(){
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