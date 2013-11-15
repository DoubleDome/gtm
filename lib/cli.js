#!/usr/bin/env node

'use strict';

var util   = require('util');
var parser = require('./parser');
var cloner = require('./cloner');
var input  = require('./input');
var config = require('./config');
var data   = require('../package.json');
var log    = require('./log');

config.init();
// get object with sanitized parameters
var params = parser.parse();

switch(params.action) {
    case 'register' :
        if (params.name && params.url) {
            config.addRegistry(params);
            log.success('Registry added successfully!');
        } else {
            input.addRegistry(function(input) {
                config.addRegistry(input);
                log.success('Registry added successfully!');
            });
        }
        break;
    case 'list' :
        if (params.registry) {
            config.getTemplateList(params.registry, function(list) {
                if (list.length > 0) {
                    log.header('Available Templates');
                    list.forEach(function(value, index) {
                        var output = util.format('    %d. %s', (index+1), value.name);
                        log.writeln(output);
                    });
                } else {
                    log.error('Registry is empty!');
                }
            });
        } else {
            var list = config.getRegistryList();
            if (list.length > 0) {
                log.header('Available Registries');
                list.forEach(function(value, index) {
                    var output = util.format('    %d. %s - %s', (index+1), value.name, value.url);
                    log.writeln(output);
                });
            } else {
                log.error('No saved registries!');

            }
        }
        break;
    case 'reset' :
        if (params.force) {
            config.reset();
            log.success('Settings Reset');
        } else {
            input.reset(function() {
                config.reset();
                log.success('Settings Reset');
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
            log.writeln(value);
        });
        break;
    case 'generate' :
        if (params.registry && params.template) {
            config.fetchRegistryTemplate(params, function(error, template) {
                if (error) {
                    log.error(error);
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
        log.error(params.message);
        break;
}

