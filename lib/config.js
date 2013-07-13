var grunt = require('grunt');
var nconf = require('nconf');
var path  = require('path');
var json  = require('request-json').JsonClient;

var userPath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var gtmFolder = 'gtm';
var gtmPath = path.join(userPath, gtmFolder);
var settingPath = path.join(userPath, gtmFolder, 'settings.json');
var registryPath = path.join(userPath, gtmFolder, 'registry');

function Config() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.init = function(detail, callback) {
        nconf.file({ file:settingPath });
     };

    this.fetchRegistry = function(detail, callback) {
        //var url = this.data.registries[detail.registry];
        var url = nconf.get('registries:' + detail.registry + ':url');
        var remote = this.parseURL(url);
        var request = new json(remote.host);
        request.get(remote.path, function(err, response, body) {
            var jsonPath = path.join(registryPath, detail.registry + '.json');
            grunt.file.write(jsonPath, JSON.stringify(body));
            callback.apply(_this, [ body[detail.template] ]);
        });
    };

    this.addRegistry = function(detail) {
        if (this.exists()) {
            nconf.set('registries:' + detail.name, { url:detail.url });
            this.save();
            grunt.log.success('Registry added successfully!');
        } else {
            grunt.log.warn('No config data available, run "gtm -setup"'.yellow);
        }
    };

    this.fetchTemplate = function(detail, callback) {
        if (this.exists()) {
            this.fetchRegistry(detail, callback);
        } else {
            grunt.log.warn('No config data available, run "gtm -setup"'.yellow);
        }
    };

    this.save = function() {
        grunt.file.mkdir(gtmPath);
        nconf.save();
    };

    this.set = function(name, value) {
        nconf.set(name, value);
    };

    this.get = function(name) {
        return nconf.get(name);
    };

    this.exists = function() {
        return grunt.file.exists(settingPath);
    };
    this.reset = function() {
        this.set('name', '');
        this.set('registries', {});
        this.save();
        grunt.log.success('Setting Reset');
    };
    this.parseURL = function(url) {
        var parsedURL  = require('url').parse(url);
        var result = {
            host: parsedURL.protocol + '//' + parsedURL.host,
            path: parsedURL.path
        };
        return result;
    };

}

module.exports = new Config();