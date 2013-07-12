var grunt = require('grunt');
var prompt = require('prompt');
var parser = require('./parser');
var config = require('./config');

function Feedback() {
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

    var confirm = {
        properties: {
            confirm: {
                description: 'Continue',
                pattern: /y[es]*|n[o]?/,
                message: 'Response must be yes or no',
                type: 'string'
            }
        }
    };


    this.setup = function(callback) {
        grunt.log.header('Running Initial Setup...');
        if (!config.exists) {
            this.initialSetup(callback);
        } else {
            grunt.log.warn('Config data exists, would you like to override your settings?'.yellow);
            prompt.start();
            prompt.get(confirm, function(error, input) {
                if (error) return;

                if (input.confirm == 'y' || input.confirm == 'yes') {
                    _this.initialSetup(callback);
                }
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

            _this.addRegistry(function(error, input) {
                grunt.log.writeln();
                grunt.log.success('Setup Complete');
                if (callback) callback.apply(_this, [error, input]);
            });
        });
    };

    this.addRegistry = function(callback) {
        prompt.start();
        prompt.get(registry, function(error, input) {
            if (error) return;

            config.addRegistry(input);
            if (callback) callback.apply(_this, [error, input]);
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
}

module.exports = new Feedback();