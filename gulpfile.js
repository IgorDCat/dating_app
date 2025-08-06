import dotenv from "dotenv";
dotenv.config()
import gulp from 'gulp';
import browserSync from 'browser-sync';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import { deleteAsync } from 'del';
import esbuild from 'gulp-esbuild';
import rename from 'gulp-rename';
import pngquant from 'imagemin-pngquant'
import replace from "gulp-replace";

const sass = gulpSass(dartSass);

// Пути к файлам
const paths = {
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/css'
    },
    scripts: {
        src: 'src/scripts/**/*.ts',
        dest: 'dist/js'
    },
    images: {
        src: 'src/images/**/*',
        dest: 'dist/images'
    },
    html: {
        src: 'src/*.html',
        dest: 'dist'
    }
};

// Очистка dist
export const clean = () => deleteAsync(['dist']);
const server = browserSync.create()

// Компиляция SCSS в CSS
export const styles = () => {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(concat('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
};

// Компиляция TypeScript
export const scripts = () => {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(esbuild({
            bundle: true,
            minify: true,
            target: 'es2015',
            sourcemap: true,
            format: 'esm'
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(replace('process.env.API_URL', JSON.stringify(process.env.API_URL)))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(server.stream());
};

export const images = () => {
    return gulp.src('src/images/**/*', { encoding: false })
        .pipe(imagemin([
            pngquant({
                quality: [0.7, 0.9],
                speed: 1,
                strip: true
            })
        ]))
        .pipe(gulp.dest('dist/images'));
}


// Копирование HTML
export const html = () => {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
};

// Отслеживание изменений
export const watch = () => {
    browserSync.init({
        server: {
            baseDir: './dist',
        }
    });

    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.html.src, html);
};

// Сборка для production
export const build = gulp.series(
    clean,
    gulp.parallel(styles, scripts, images, html)
);

// Задача по умолчанию (dev-режим)
export const dev = gulp.series(build, watch);

export default dev;
