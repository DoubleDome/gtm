var del = require('del');
var glob = require('glob');
var path = require('path');
var log = require('./log');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var wrapper = require('git-wrapper');
var git = new wrapper();
var tempFolder = '.tmp';
var gitFolder = '.git';

function Cloner() {
	/* Variable Declarations
    --------------------------------------------------- */
	var _scope = this;
	var inputs = [];
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
			_scope.finalize();
		});
	};

	this.clone = function(details, callback) {
		inputs.push(details);
		// clear existing git directory if it exists
		// if (fs.existsSync(gitFolder)) del.sync(gitFolder);
		// clear existing temp folder if it exists
		if (fs.existsSync(tempFolder)) del.sync(tempFolder);

		if (!details.clean) {
			details.clean = {
				git: true,
				md: true
			};
			details.clean.files = [];
		}
		var name = _scope.getRepoName(details.git);

		log.header('Pulling remote repo "' + name + '"');
		log.write('Cloning into temporary directory... ');
		git.exec('clone', [details.git, tempFolder], function(error, message) {
			if (!error) {
				log.ok();
				_scope.clean(tempFolder, details.clean || {});
				_scope.copy(details.dest);
				// grunt.file.delete(tempFolder);
				del.sync(tempFolder);
				if (callback) callback.apply(_scope);
			} else {
				log.error(message);
			}
		});
	};

	this.clean = function(target, details) {
		log.write('Cleaning files... ');

		if (details.md || typeof details.md == 'undefined') {
			details.files.unshift('*.md');
			details.files.unshift('*.markdown');
		}
		if (details.git || typeof details.git == 'undefined') {
			details.files.unshift('.git');
		}

		// Clean
		var path;
		details.files.forEach(function(value, index) {
			path = target + '/' + value.trim();
			try {
				del.sync(path);
			} catch (error) {
				log.error('Failed to delete: ' + path);
			}
		});

		log.ok();
	};

	this.copy = function(dest) {
		log.write('Copying files into "' + dest + '"... ');
		var files = glob.sync(tempFolder + '/**/*');
		var target;
		files.forEach(function(filepath, index) {
			target = filepath.replace(tempFolder, dest);
			targetDir = path.dirname(target);
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir);
			}
			if (!fs.statSync(filepath).isDirectory()) {
				fs.writeFileSync(target, fs.readFileSync(filepath));
			}
		});
		log.ok();
	};

	this.finalize = function() {
		async.series([
			// this.installNPMDependencies,
			// this.installBowerDependencies,
			this.initRepo,
			this.complete
		]);
	};
	/* Series Functions
    --------------------------------------------------- */
	this.installNPMDependencies = function(callback) {
		if (fs.existsSync('package.json')) {
			log.write('\nInstalling npm dependencies... ');
			exec('npm install', function(error, stdout, stderr) {
				// console.log('stdout: ' + stdout);
				// console.log('stderr: ' + stderr);
				if (error !== null) {
					log.write('Error!'.red + '\n');
				} else {
					log.write('Complete!'.green + '\n');
				}
				callback();
			});
		} else {
			log.error('Skipping installation of npm dependencies, "package.json" not found...');
			callback();
		}
	};

	this.installBowerDependencies = function(callback) {
		if (fs.existsSync('bower.json')) {
			log.write('Installing bower dependencies... ');
			exec('bower install', function(error, stdout, stderr) {
				// console.log('stdout: ' + stdout);
				// console.log('stderr: ' + stderr);
				if (error !== null) {
					log.write('Error!'.red + '\n');
				} else {
					log.write('Complete!'.green + '\n');
				}
				callback();
			});
		} else {
			log.error('Skipping installation of bower dependencies, "bower.json" not found...');
			callback();
		}
	};

	this.initRepo = function(callback) {
		if (this.data === undefined || this.data.git) {
			log.write('\ngit init... ');
			git.exec('init', function(error, message) {
				log.write('add... ');
				git.exec('add', ['.'], function(error, message) {
					log.write('commit... ');
					git.exec('commit', ['-m', _scope._getCommitMessage()], function(error, message) {
						if (_scope.data.remote) {
							log.write('remote... ');
							git.exec('remote', ['add', 'origin', _scope.data.remote], function(error, message) {
								log.write('push... ');
								git.exec('push', ['-u', 'origin', '--all'], function(error, message) {
									//console.log(message);
									callback();
								});
							});
						} else {
							log.write('skipping remote push... ');
							callback();
						}
					});
				});
			});
		}
	};

	this._getCommitMessage = function() {
		var message = '"Mashup of...\n';
		inputs.forEach(function(details, index) {
			if (details.dest !== '.') {
				message += details.git + ' into ./' + details.dest + '/\n';
			} else {
				message += details.git + ' into ' + details.dest + '/\n';
			}
		});
		message += '"';
		return message;
	};

	this.gitExists = function() {
		return fs.existsSync(gitFolder);
	};

	this.complete = function(callback) {
		log.writeln();
		log.success('Template ready!\n');
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