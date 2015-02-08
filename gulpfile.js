var gulp = require('gulp'); 

// 引入组件
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');

// 压缩css
gulp.task('minifycss', function() {
    return gulp.src('./static/css/*.css')      //压缩的文件
    		.pipe(rename({
        		suffix: '.min',
            extname: ".css"
        }))
        .pipe(gulp.dest('./static/css/dist'))   //输出文件夹
        .pipe(minifycss());   //执行压缩
});

// 压缩js
gulp.task('scripts', function() {
    gulp.src('./static/js/*.js')
        .pipe(rename({
        		suffix: '.min',
            extname: ".js"
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./static/js/dist'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('scripts', 'minifycss');

    // 监听文件变化
//  gulp.watch('./static/js/*.js', function(){
//      gulp.run(['scripts', 'minifycss']);
//  });
});