
var gulp = require("gulp");
var git = require("simple-git");
var $ = require("gulp-load-plugins")();
var ngHtml2Js = require("gulp-ng-html2js"); // don't know why it's not captured by gulp-load-plugins!
var runSequence = require('gulp-run-sequence');
const spawn   = require('child-process-promise').spawn;

var streamqueue = require('streamqueue');

var srcPath = "src";
var distPath = "dist";
var outputName = "mde-swipe-to-refresh";

var banner = '/*\n' +
    ' * <%= pkg.name %> <%= pkg.version %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * <%= pkg.repository %>\n' +
    '*/\n\n';

gulp.task("build", ["build-js", "build-css"]);
gulp.task("watch", watch);
gulp.task("build-js", buildJs);
gulp.task("changelog", changelog);
gulp.task("build-css", buildCss);
gulp.task("bump-version-patch", bumpVersion("patch"));
gulp.task("bump-version-minor", bumpVersion("minor"));
gulp.task("bump-version-major", bumpVersion("major"));



function watch(){
    gulp.watch([srcPath + "/**/*.js", srcPath + "/**/*.html"], buildJs);
    gulp.watch(srcPath + "/**/*.scss", buildCss);
}

function bumpVersion(type){
    return function(){
        git().status(function(error, statusSummary){
            var dirtyFiles = statusSummary.files.filter(isInDist);
            if(dirtyFiles.length>0){
                console.error("Working directory is not clean! Please first commit your changes and try again.");
                statusSummary.modified.length && console.warn("Modified", statusSummary.modified);
                statusSummary.created.length && console.warn("Created", statusSummary.created);
                statusSummary.not_added.length && console.warn("Not added", statusSummary.not_added);
                statusSummary.renamed.length && console.warn("Renamed", statusSummary.renamed);
                statusSummary.deleted.length && console.warn("Deleted", statusSummary.deleted);
                return
            }
            gulp.src(['bower.json', 'package.json'])
                .pipe($.bump({type: type}))
                .pipe(gulp.dest('./'))
                .on('end', function() {
                    runSequence("build", "changelog", function(){
                        git()
                            .add('./*')
                            .commit('chore(all): bump version', function(error){
                                if(error){
                                    console.log("Changes not committed. Error: ", error)
                                }
                                else{
                                    gulp.src("package.json")
                                        .pipe($.tagVersion({prefix: ""}))
                                }
                            });
                    })
                })
                .on('error', function(error){
                    console.error("Error in bumping version: ", error.message)
                });

            function isInDist(file){
                return file.path.indexOf(distPath) != 0;
            }
        })
    }
}
function buildJs(){
    delete require.cache["./bower.json"];
    var pkg = require("./bower.json");
    return streamqueue(
        {
            objectMode: true
        },
        gulp.src(srcPath + "/**/*.js")
            .pipe($.angularFilesort())
            .pipe($.ngAnnotate()),
        getHtmlAndSvgJsStream()
    )
        .pipe($.plumber())
        .pipe($.concat(outputName + ".js"))
        .pipe($.stripBanner())
        .pipe($.banner(banner,{
            pkg: pkg
        }))
        .pipe(gulp.dest(distPath))
        .pipe($.uglify())
        .pipe($.banner(banner,{
            pkg: pkg
        }))
        .pipe($.rename({suffix: ".min"}))
        .pipe(gulp.dest(distPath));
}

function changelog(){
    var promise = spawn('node ./scripts/changelog.js', {cwd: dir});
    promise.childProcess.stdout.pipe(process.stdout);
    promise.childProcess.stderr.pipe(process.stderr);
    return promise;
}
function buildCss(){
    delete require.cache["./bower.json"];
    var pkg = require("./bower.json");
    gulp.src(srcPath + "/**/*.scss")
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.concatCss(outputName + ".css"))
        .pipe($.banner(banner,{
            pkg: pkg
        }))
        .pipe(gulp.dest(distPath))
        .pipe($.minifyCss())
        .pipe($.banner(banner,{
            pkg: pkg
        }))
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(distPath));
}
function getHtmlAndSvgJsStream(){
    return gulp.src([srcPath + "/**/*.html", srcPath + "/**/*.svg"])
        .pipe(ngHtml2Js({base: srcPath, moduleName: 'mde.swipeToRefresh'}));
}
