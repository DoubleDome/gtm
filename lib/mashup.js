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
        input.setup(function() {
            grunt.log.success('Setup Complete');
        });
        break;
    case 'register' :
        if (result.name) {
            config.addRegistry(result);
            grunt.log.success('Registry added successfully!');
        } else {
            input.addRegistry(function(input) {
                config.addRegistry(input);
                grunt.log.success('Registry added successfully!');
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
        if (result.force) {
            config.reset();
        } else {
            input.reset(function() {
                config.reset();
            });
        }
        break;
    case 'help' :
        var output = [
            'MASHUP version 1.1',
            '',
            'setup',
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
    case 'error' :
        grunt.log.error(result.message);
        break;
}