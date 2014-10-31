var log    = require('./log');
var config = require('./config');
var cloner = require('./cloner');
var prompt = require('prompt');
prompt.message = '[' + "?".green + ']';

function Input() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    var generate = {
        properties: {
            git: {
                description: 'Enter a git url',
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
                description: 'Enter files to be cleared, separated by commas, glob patterns accepted',
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
            remote: {
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
    /*
    --------------------------------------------------- */
    this.addRegistry = function(callback) {
        prompt.start();
        prompt.get(registry, function(error, input) {
            if (error) return;
            callback.apply(_this, [input]);
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
        log.warning('Are you sure you want to reset all your settings?'.yellow);

        prompt.start();
        prompt.get(confirm, function(error, input) {
            if (error) return;

            if (input.confirm == 'y' || input.confirm == 'yes') {
                callback.apply(_this);
            }
        });
    };

    this.generate = function(params) {
        prompt.start();
        prompt.get(generate, function(error, input) {
            if (error) return;

            if (input.clean !== '') {
                input.clean = { files:input.clean.replace(' ', '').split(',') };
            } else {
                input.clean = { files:[] };
            }

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