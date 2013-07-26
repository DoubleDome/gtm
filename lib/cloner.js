var grunt = require('grunt');
var spawn = require('child_process').spawn;
var wrapper = require('git-wrapper');
var async = require('async');
var git = new wrapper();
var temp = '.tmp';

function Cloner() {
    /* Variable Declarations
    --------------------------------------------------- */
    var _this = this;
    this.source = undefined;
    this.data = undefined;

    this.init = function(data) {
        this.data = data;
        if (data.source instanceof Array) {
            this.source = data.source;
        } else {
            this.source = [data.source];
        }
        async.eachSeries(this.source, this.clone, function() {
            _this.finalize();
        });
    };

    this.clone = function(details, callback) {
        // temp function to clear folder if it exists
        //if (grunt.file.exists(details.dest)) grunt.file.delete(details.dest);
        if (grunt.file.exists('.git')) grunt.file.delete('.git');
        if (grunt.file.exists(temp)) grunt.file.delete(temp);

        if (!details.clean) {
            details.clean = { git: false, md: false };
            details.clean.files = [];
        }
        var name = _this.getRepoName(details.git);

        grunt.log.header('Pulling remote repo "' + name + '"');
        grunt.log.write('Cloning into temp... ');
        git.exec('clone', [details.git, temp], function(error, message) {
            if (!error) {
                _this.clean(temp, details.clean || {});
                _this.copy(details.dest);
                grunt.file.delete(temp);
                if (callback) callback.apply(_this);
            } else {
                grunt.log.error(message);
            }
        });
        /*
        var git = spawn('git', ['clone', details.git, temp]);
        git.on('close', function(code) {
            if (code === 0) {
                _this.clean(temp, details.clean || {});
                _this.copy(details.dest);
                grunt.file.delete(temp);
                _this.next();
            } else {
                grunt.log.error('Exit with error code: ' + code);
            }
        });
        git.stdout.on('data', function(data) {
            grunt.log.header('Pulling remote repo "' + name + '"');
            grunt.log.write('Cloning into temp... ');
        });
        git.stderr.on('data', function(data) {
            grunt.log.error(data);
        });
        */
    };

    this.clean = function(target, details) {

        grunt.log.ok();
        grunt.log.write('Cleaning files... ');

        if (!details.md || typeof detail.md == 'undefined') {
            details.files.unshift('**/*.md');
            details.files.unshift('**/*.markdown');
        }
        if (!details.git || typeof detail.git == 'undefined') {
            details.files.unshift('.git');
        }

        // Clean
        var files;
        details.files.forEach(function(value, index) {
            files = grunt.file.expand(target + '/' + value.trim());
            files.forEach(function(value, index) {
                try {
                    grunt.file.delete(value);
                } catch (e) {
                    grunt.verbose.error(e);
                    grunt.fail.warn('Operation failed.');
                }
            });
        });

        grunt.log.ok();
    };

    this.copy = function(dest) {
        grunt.log.write('Copying files into "' + dest + '"... ');
        grunt.file.expand(temp + '/**/*.*').forEach(function(path, index) {
            grunt.file.copy(path, path.replace(temp, dest));
        });
        grunt.log.ok();
    };

    this.finalize = function() {
        grunt.log.writeln();
        async.series([
            this.installNPMDependencies,
            this.installBowerDependencies,
            this.initRepo,
            this.complete
        ]);
    };
    /* Series Functions
    --------------------------------------------------- */
    this.installNPMDependencies = function(callback) {
        if (grunt.file.exists('package.json')) {
            var command = spawn('npm', ['install']);
            grunt.log.write('\nInstalling npm dependencies... ');
            command.on('close', function(code) {
                if (code === 0) {
                    grunt.log.ok();
                    _this.complete();
                } else {
                    grunt.log.error('Exit with error code: ' + code);
                }
                callback();
            });
        } else {
            grunt.log.error('Skipping installation of npm dependencies, "package.json" not found...');
            callback();
        }
    };

    this.installBowerDependencies = function(callback) {
        if (grunt.file.exists('bower.json')) {
            var command = spawn('bower', ['install']);
            grunt.log.write('\nInstalling bower dependencies... ');
            command.on('close', function(code) {
                if (code === 0) {
                    grunt.log.ok();
                    _this.complete();
                } else {
                    grunt.log.error('Exit with error code: ' + code);
                }
                callback();
            });
        } else {
            grunt.log.error('Skipping installation of bower dependencies, "bower.json" not found...');
            callback();
        }
    };

    this.initRepo = function(callback) {
        grunt.log.writeln();
        grunt.log.write('git init... ');
        git.exec('init', function(error, message) {
            grunt.log.write('add... ');
            git.exec('add', ['.'], function(error, message) {
                grunt.log.write('commit... ');
                git.exec('commit', ['-m', '"initial commit..."'], function(error, message) {
                    if (_this.data.remote) {
                        grunt.log.write('remote... ');
                        git.exec('remote', ['add', 'origin', _this.data.remote], function(error, message) {
                            grunt.log.write('push... ');
                            git.exec('push', ['-u', 'origin', '--all'], function(error, message) {
                                //console.log(message);
                                callback();
                            });
                        });
                    } else {
                        grunt.log.write('skipping remote push... ');
                        callback();
                    }
                });
            });
        });
    };

    this.complete = function(callback) {
        grunt.log.writeln();
        grunt.log.success('Template ready!');
        callback();
    };

    /* Util Functions
    --------------------------------------------------- */

    this.getRepoName = function(url) {
        var result = url.substring(url.lastIndexOf('/'));
        return result.substring(1, result.lastIndexOf('.git'));
    };
}

module.exports = new Cloner();