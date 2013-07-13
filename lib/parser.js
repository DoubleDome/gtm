var optimist = require('optimist');
function Parser() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.args = undefined;
    this.result = undefined;

    this.parse = function() {
        this.args = optimist.argv;
        this.result = this.parseArguments();
    };

    this.parseArguments = function() {
        var result;
        if (this.args._.length > 0) {
            var command = this.args._.shift();
            result = { action:command };

            switch(command) {
                case 'setup' :
                case 'reset' :
                case 'help' :
                    break;
                case 'register' :
                    result = this.parseRegister(this.args._);
                    break;
                default :
                    result = this.parseGenerate([command].concat(this.args._));
                    console.log(this.args.s);
                    break;
            }
        } else {
            result = { action:'setup' };
        }

        return result;
    };

    this.parseRegister = function(args) {
        var result = {};
        if (args.length == 2 ) {
            result.action =  'add';
            result.name = args[0];
            result.url = args[1];
        } else {
            result.action = 'error';
            result.message = 'Incorrect number of arguments!';
        }
        return result;
    };

    this.parseGenerate = function(args) {
        var result = {};
        if (args.length >= 1) {
            var parts = args[0].split(':');
            if (parts.length == 2) {
                result.action = 'generate';
                result.registry = parts[0];
                result.template = parts[1];
            } else {
                result.action = 'error';
                result.message = 'Incorrect number of arguments!';
            }
            if (args.length > 1) result.remote = args[1];
        } else {
            result.action = 'error';
            result.message = 'Incorrect number of arguments!';
        }
        console.log(result);
        return result;
    };

    this.parseHelp = function(args) {

    };

}


module.exports = new Parser();