#!/usr/bin/env node

'use strict';

var grunt  = require('grunt');
var parser = require('./parser');
var cloner = require('./cloner');
var input  = require('./input');
var config = require('./config');

config.init();
parser.parse();

switch(parser.result.action) {
    case 'setup' :
        input.setup();
        break;
    case 'add' :
        config.addRegistry(parser.result);
        break;
    case 'reset' :
        input.reset(function() {
            config.reset();
        });
        break;
    case 'error' :
        grunt.log.error(parser.result.message);
        break;
    case 'help' :
        console.log(parser.result);
        break;
    default :
        config.fetchTemplate(parser.result, function(data) {
            data.remote = parser.result.remote;
            cloner.init(data);
        });
        break;
}