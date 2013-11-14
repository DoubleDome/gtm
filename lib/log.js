function Log() {
    this.write = function(message) {
        if (!message) message = '';
        process.stdout.write(message);
    };
    this.writeln = function(message) {
        if (!message) message = '';
        this.write(message + '\n');
    };

    this.success = function(message) {
        this.writeln(message.green.bold);
    };
    this.error = function(message) {
        this.writeln('>> '.red + message);
    };
    this.warning = function(message) {
        this.writeln('>> '.yellow + message);
    };
    this.header = function(message) {
        this.writeln('\n' + message.underline);
    };
    this.ok = function() {
        this.writeln('OK'.green);
    };
}

module.exports = new Log();