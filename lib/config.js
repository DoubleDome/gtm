var grunt = require('grunt');
var nconf = require('nconf');
var path  = require('path');
var json  = require('request-json').JsonClient;

var userPath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var mashupFolder = 'mashup';
var mashupPath = path.join(userPath, mashupFolder);
var settingPath = path.join(userPath, mashupFolder, 'settings.json');
var registryPath = path.join(userPath, mashupFolder, 'registry');

function Config() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.init = function(detail, callback) {
        nconf.file({ file:settingPath });
    };

    this.reset = function() {
        this.set('name', '');
        this.set('registries', {});
        this.save();
        grunt.log.success('Setting Reset');
    };

    /* Data Fetch
    --------------------------------------------------- */
    this.fetchRegistry = function(registry, callback) {
        //var url = this.data.registries[registry];
        var url = nconf.get('registries:' + registry + ':url');
        if (url) {
            var parsedURL = require('url').parse(url);
            var request = new json(parsedURL.protocol + '//' + parsedURL.host);
            request.get(parsedURL.path, function(err, response, body) {
                var jsonPath = path.join(registryPath, registry + '.json');
                grunt.file.write(jsonPath, JSON.stringify(body));
                callback.apply(this, [body]);
            });
        } else {
            grunt.log.error('Registry not found!');
        }
    };
    this.fetchRegistryTemplate = function(detail, callback) {
        if (this.exists()) {
            this.fetchRegistry(detail.registry, function(data) {
                callback.apply(_this, [ data[detail.template] ]);
            });
        } else {
            grunt.log.warn('No config data available, run "mashup -setup"'.yellow);
        }
    };

    /*
    --------------------------------------------------- */
    this.addRegistry = function(detail) {
        if (this.exists()) {
            nconf.set('registries:' + detail.name, { url:detail.url });
            this.save();
        } else {
            grunt.log.warn('No config data available, run "mashup -setup"'.yellow);
        }
    };

    /* List Functions
    --------------------------------------------------- */
    this.getRegistryList = function(callback) {
        var result = [];
        var registries = this.get('registries');
        for (var key in registries) {
            result.push({name:key, url:registries[key].url});
        }
        return result;
    };

    this.getTemplateList = function(registry, callback) {
        this.fetchRegistry(registry, function(data) {
            var result = [];
            for (var key in data) {
                result.push({name:key});
            }
            callback.apply(this, [result]);
        });
    };


    /* Basic Operations
    --------------------------------------------------- */
    this.save = function() {
        grunt.file.mkdir(mashupPath);
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


}

module.exports = new Config();