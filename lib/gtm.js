#!/usr/bin/env node

'use strict';

var grunt  = require('grunt');
var util   = require('util');
var parser = require('./parser');
var cloner = require('./cloner');
var input  = require('./input');
var config = require('./config');

config.init();
var result = parser.parse();

switch(result.action) {
    case 'setup' :
        input.setup();
        break;
    case 'register' :
        if (result.name) {
            config.addRegistry(result);
        } else {
            input.addRegistry(function(input) {
                config.addRegistry(input);
            });
        }
        break;
    case 'list' :
        if (result.registry) {
            grunt.log.header('Available Templates');
            config.getTemplateList(result.registry, function(data) {
                data.forEach(function(value, index) {
                    var output = util.format('    %d. %s', (index+1), value.name);
                    console.log(output);
                });
            });
        } else {
            grunt.log.header('Available Registries');
            config.getRegistryList().forEach(function(value, index) {
                var output = util.format('    %d. %s - %s', (index+1), value.name, value.url);
                console.log(output);
            });
        }
        break;
    case 'reset' :
        input.reset(function() {
            config.reset();
        });
        break;
    case 'error' :
        grunt.log.error(result.message);
        break;
    case 'help' :
        console.log(result);
        break;
    default :
        if (!result.origin && !result.passive) {
            input.promptForRemote(function(input) {
                config.fetchRegistryTemplate(result, function(data) {
                    data.origin = input.origin;
                    cloner.init(data);
                });
            });
        } else {
            config.fetchRegistryTemplate(result, function(data) {
                data.origin = result.origin;
                cloner.init(data);
            });
        }

        break;
}