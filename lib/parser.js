var nopt = require('nopt');

function Parser() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.args = undefined;
    this.result = undefined;

    this.parse = function() {
        var known = {
            'generate': String,
            'remote': String,
            'setup': Boolean,
            'list': Boolean,
            'register': Boolean,
            'force': Boolean,
            'help': Boolean
        };
        var alias = {
            'g':'generate',
            's':'setup',
            'l':'list',
            'r':'register',
            'f':'--force',
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
                    break;
                case 'list' :
                    if (result.argv.remain.length == 1) {
                        result.registry = result.argv.remain[0];
                    }
                    break;
                case 'register' :
                    if (result.argv.remain.length == 2) {
                        result.name = result.argv.remain[0];
                        result.url = result.argv.remain[1];
                    }
                    break;
                case 'generate' :
                    if (result.argv.remain.length >= 1) {
                        var parts = result.argv.remain[0].split(':');
                        if (parts.length == 2) {
                            result.registry = parts[0];
                            result.template = parts[1];
                        }
                    }
                    break;
            }
        } else {
            result = { action:'generate' };
        }

        return result;
    };

}


module.exports = new Parser();