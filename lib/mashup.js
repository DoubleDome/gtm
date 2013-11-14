#!/usr/bin/env node

'use strict';

var grunt  = require('grunt');
var util   = require('util');
var parser = require('./parser');
var cloner = require('./cloner');
var input  = require('./input');
var config = require('./config');
var data   = require('../package.json');

config.init();
// get object with sanitized parameters
var params = parser.parse();

switch(params.action) {
    case 'register' :
        if (params.name && params.url) {
            config.addRegistry(params);
            grunt.log.success('Registry added successfully!');
        } else {
            input.addRegistry(function(input) {
                config.addRegistry(input);
                grunt.log.success('Registry added successfully!');
            });
        }
        break;
    case 'list' :
        if (params.registry) {
            config.getTemplateList(params.registry, function(list) {
                if (list.length > 0) {
                    grunt.log.header('Available Templates');
                    list.forEach(function(value, index) {
                        var output = util.format('    %d. %s', (index+1), value.name);
                        console.log(output);
                    });
                } else {
                    grunt.log.error('Registry is empty!');
                }
            });
        } else {
            var list = config.getRegistryList();
            if (list.length > 0) {
                grunt.log.header('Available Registries');
                list.forEach(function(value, index) {
                    var output = util.format('    %d. %s - %s', (index+1), value.name, value.url);
                    console.log(output);
                });
            } else {
                grunt.log.error('No saved registries!');

            }
        }
        break;
    case 'reset' :
        if (params.force) {
            config.reset();
        } else {
            input.reset(function() {
                config.reset();
            });
        }
        break;
    case 'help' :
        var output = [
            '',
            'MASHUP version ' + data.version,
            '',
            'register [name] [url]',
            'reset [-f]',
            'list [registry]',
            'generate [registry:template] [-o remotegit] [-p]',
            ''
        ];
        output.forEach(function(value, index) {
            console.log(value);
        });
        break;
    case 'generate' :
        if (params.registry && params.template) {
            config.fetchRegistryTemplate(params, function(error, template) {
                if (error) {
                    grunt.log.error(error);
                    return;
                }

                if (!params.remote) {
                    input.promptForRemote(function(input) {
                        template.remote = (input.remote === '') ? false : input.remote;
                        cloner.init(template);
                    });
                } else {
                    cloner.init(template);
                }
            });

        } else {
            input.generate(params);
        }
        break;
    case 'error' :
        grunt.log.error(params.message);
        break;
}

