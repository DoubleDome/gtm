var nopt = require('nopt');
var _ = require('underscore');

function Parser() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.args = undefined;
    this.result = undefined;

    this.parse = function() {
        var known = {
            'generate': String,
            'origin': String,
            'setup': Boolean,
            'list': Boolean,
            'register': Boolean,
            'passive': Boolean,
            'help': Boolean
        };
        var alias = {
            'g':'generate',
            'o':'--origin',
            's':'setup',
            'l':'list',
            'r':'register',
            'p':'--passive',
            'h':'help'
        };

        return this.parseArguments(nopt(known, alias));
    };

    this.parseArguments = function(result) {

        if (result.argv.remain.length > 0) {
            result.action = result.argv.remain.shift();

            switch(result.action) {
                case 'setup' :
                case 'reset' :
                case 'help' :
                case 'list' :
                    if (result.argv.remain.length == 1) {
                        result.registry = result.argv.remain[0];
                    }
                    break;
                case 'register' :
                    if (result.argv.remain.length == 2) {
                        result.name = result.argv.remain[0];
                        result.url = result.argv.remain[1];
                    } else {
                        result.action = 'error';
                        result.message = 'Incorrect number of arguments!';
                    }
                    break;
                case 'generate' :
                    if (result.argv.remain.length >= 1) {
                        var parts = result.argv.remain[0].split(':');
                        if (parts.length == 2) {
                            result.registry = parts[0];
                            result.template = parts[1];
                        } else {
                            result.action = 'error';
                            result.message = 'Incorrect number of arguments!';
                        }
                    } else {
                        result.action = 'error';
                        result.message = 'Incorrect number of arguments!';
                    }
                    break;
            }
        } else {
            result = { action:'setup' };
        }

        return result;
    };

}


module.exports = new Parser();