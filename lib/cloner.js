var grunt = require('grunt');
var spawn = require('child_process').spawn;
var wrapper = require('git-wrapper');
var ass = new wrapper();
var temp = '.tmp';

function Cloner() {
    var _this = this;
    this.index = 0;
    this.templates = undefined;

    this.init = function(data) {
        this.index = 0;
        if (data.template instanceof Array) {
            this.templates = data.template;
        } else {
            this.templates = [data.template];
        }
        grunt.log.writeln();
        this.clone(this.index);
    };

    this.clone = function(index) {
        var detail = this.templates[index];
        // temp function to clear folder if it exists
        //if (grunt.file.exists(detail.dest)) grunt.file.delete(detail.dest);
        if (grunt.file.exists(temp)) grunt.file.delete(temp);

        if (!detail.clean) {
            detail.clean = { git: false, md: false };
            detail.clean.files = [];
        }
        var name = this.getRepoName(detail.git);

        grunt.log.header('Pulling remote repo "' + name + '"');
        grunt.log.write('Cloning into temp... ');
        ass.exec('clone', [detail.git, temp], function(error, message) {
            if (!error) {
                _this.clean(temp, detail.clean || {});
                _this.copy(detail.dest);
                grunt.file.delete(temp);
                _this.next();
            } else {
                grunt.log.error(message);
            }
        });
        /*
        var git = spawn('git', ['clone', detail.git, temp]);
        git.on('close', function(code) {
            if (code === 0) {
                _this.clean(temp, detail.clean || {});
                _this.copy(detail.dest);
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
            files = grunt.file.expand(target + '/' + value);
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
        grunt.file.expand(temp + '/**/*').forEach(function(path, index) {
            grunt.file.copy(path, path.replace(temp, dest));
        });
        grunt.log.ok();
    };

    this.next = function() {
        this.index += 1;
        if (this.index < this.templates.length) {
            this.clone(this.index);
        } else {
            this.installDependencies();
        }
    };

    this.installDependencies = function() {
        if (grunt.file.exists('package.json')) {
            var npm = spawn('npm', ['install']);
            grunt.log.write('\nInstalling dependencies... ');
            npm.on('close', function(code) {
                if (code === 0) {
                    grunt.log.ok();
                    _this.complete();
                } else {
                    grunt.log.error('Exit with error code: ' + code);
                }
            });
        } else {
            grunt.log.writeln();
            grunt.log.error('Skipping installation of dependencies, "package.json" not found...');
        }
    };

    this.complete = function() {
        grunt.log.writeln();
        grunt.log.success('Template ready!');
    };

    this.getRepoName = function(url) {
        var result = url.substring(url.lastIndexOf('/'));
        return result.substring(1, result.lastIndexOf('.git'));
    };
}

module.exports = new Cloner();