var grunt = require('grunt');
var config = require('./config');
var cloner = require('./cloner');
var prompt = require('prompt');
prompt.message = '[' + "?".green + ']';

function Input() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    var initial = {
        properties: {
            name: {
                description: 'Enter your name',
                pattern: /^[a-zA-Z\s\-]+$/,
                message: 'Name must be only letters, spaces, or dashes',
                type: 'string',
                required: true
            }
        }
    };
    var generate = {
        properties: {
            git: {
                description: 'Enter a git address',
                type: 'string',
                required: true
            },
            dest: {
                description: 'Enter a destination directory',
                //pattern:/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi,
                //message: 'Please enter a valid url',
                default:'.',
                type: 'string',
                required: true
            },
            clean:{
                description: 'Enter files to be cleared, separated by commas',
                //pattern:/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi,
                //message: 'Please enter a valid url'
                type: 'string'
            }
        }
    };
    var another = {
        properties: {
            confirm: {
                description: 'Clone another repo',
                pattern: /y[es]*|n[o]?/,
                message: 'Response must be yes or no',
                default: 'no',
                type: 'string'
            }
        }
    };

    var registry = {
        properties: {
            name: {
                description: 'Enter a name for the registry',
                type: 'string',
                required: true
            },
            url: {
                description: 'Enter url of the json registry file',
                //pattern:/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi,
                message: 'Please enter a valid url',
                type: 'string',
                required: true
            }
        }
    };

    var remote = {
        properties: {
            origin: {
                description: 'Please enter remote git address for new project',
                //pattern:/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi,
                message: 'Please enter a valid git',
                type: 'string',
                required: false
            }
        }
    };

    var confirm = {
        properties: {
            confirm: {
                description: 'Clear all settings',
                pattern: /y[es]*|n[o]?/,
                message: 'Response must be yes or no',
                default: 'no',
                type: 'string'
            }
        }
    };

    this.setup = function(callback) {
        grunt.log.header('Running Initial Setup...');
        if (!config.exists()) {
            this.initialSetup(callback);
        } else {
            grunt.log.warn('Config data exists, would you like to clear your settings?'.yellow);
            prompt.start();
            prompt.get(confirm, function(error, input) {
                if (error) return;

                if (input.confirm == 'y' || input.confirm == 'yes') {
                    config.reset();
                }
                _this.initialSetup(callback);
            });
        }
    };

    this.initialSetup = function(callback) {
        prompt.start();
        prompt.get(initial, function(error, input) {
            if (error) return;

            config.set('name', input.name);
            if (!config.get('registries')) config.set('registries', {});
            config.save();

            _this.addRegistry(function(input) {
                config.addRegistry(input);

                if (callback) callback.apply(_this, [input]);
            });
        });
    };

    this.addRegistry = function(callback) {
        prompt.start();
        prompt.get(registry, function(error, input) {
            if (error) return;

            if (callback) callback.apply(_this, [input]);
        });
    };

    this.promptForRemote = function(callback) {
        prompt.start();
        prompt.get(remote, function(error, input) {
            if (error) return;

            if (callback) callback.apply(_this, [input]);
        });
    };

    this.reset = function(callback) {
        grunt.log.warn('Are you sure you want to reset all your settings?'.yellow);

        prompt.start();
        prompt.get(confirm, function(error, input) {
            if (error) return;

            if (input.confirm == 'y' || input.confirm == 'yes') {
                callback.apply(_this);
            }
        });
    };

    this.generate = function() {
        prompt.start();
        prompt.get(generate, function(error, input) {
            if (error) return;

            if (input.clean !== '') {
                input.clean = { files:input.clean.replace(' ', '').split(',') };
            } else {
                input.clean = { files:[] };
            }
            console.log(input);

            cloner.clone(input, function() {
                prompt.get(another, function(error, input) {
                    if (error) return;

                    if (input.confirm == 'y' || input.confirm == 'yes') {
                        _this.generate();
                    } else {
                        _this.promptForRemote(function(input) {
                            cloner.data = input;
                            cloner.finalize();
                        });

                    }
                });
            });
        });
    };
}

module.exports = new Input();