var fs = require('fs');
var nconf = require('nconf');
var path = require('path');
var log = require('./log');
var json = require('request-json').JsonClient;

var userPath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
if (process.platform.indexOf('win') !== -1 && process.platform !== 'darwin') userPath = path.join('C:', userPath);

var mashupPath = path.join(userPath, 'mashup');
var settingPath = path.join(mashupPath, 'settings.json');
var registryPath = path.join(mashupPath, 'registry');

function Config() {
    /* Variables
    --------------------------------------------------- */
    var _this = this;

    this.init = function(detail, callback) {
        nconf.file({
            file: settingPath
        });
    };

    this.reset = function() {
        this.set('registries', {});
        this.save();
    };
    /* Data Fetch
    --------------------------------------------------- */
    this.fetchRegistry = function(registry, callback) {
        //var url = this.data.registries[registry];
        var url = nconf.get('registries:' + registry + ':url');
        if (url) {
            this.cacheRegistry(registry, url, function(error, jsonData) {
                callback.apply(_this, [jsonData]);
            });
        } else {
            log.error('Registry not found!');
        }
    };
    this.fetchRegistryTemplate = function(detail, callback) {
        this.fetchRegistry(detail.registry, function(jsonData) {
            var template = jsonData[detail.template];
            if (template) {
                callback.apply(_this, [null, template]);
            } else {
                callback.apply(_this, ['Template not found!', template]);
            }
        });
    };
    this.cacheRegistry = function(registry, url, callback) {
        var parsedURL = require('url').parse(url);
        var request = new json(parsedURL.protocol + '//' + parsedURL.host);
        request.get(parsedURL.path, function(error, response, body) {
            if (error) {
                log.error('Could not cache registry!');
                if (callback) callback.apply(this, [error, body]);
                return;
            }
            var jsonPath = path.join(registryPath, registry + '.json');
            fs.writeFileSync(jsonPath, JSON.stringify(body));
            if (callback) callback.apply(this, [error, body]);
        });
    };
    /*
    --------------------------------------------------- */
    this.addRegistry = function(detail) {
        if (!this.exists()) {
            this.reset();
        }
        nconf.set('registries:' + detail.name, {
            url: detail.url
        });
        this.cacheRegistry(detail.name, detail.url, function(error, data) {
            if (!error) _this.save();
        });
    };

    /* List Functions
    --------------------------------------------------- */
    this.getRegistryList = function(callback) {
        var result = [];
        var registries = this.get('registries');
        for (var key in registries) {
            result.push({
                name: key,
                url: registries[key].url
            });
        }
        return result;
    };
    this.registryExists = function() {

    };

    this.getTemplateList = function(registry, callback) {
        this.fetchRegistry(registry, function(data) {
            var result = [];
            for (var key in data) {
                result.push({
                    name: key
                });
            }
            callback.apply(this, [result]);
        });
    };


    /* Basic Operations
    --------------------------------------------------- */
    this.save = function() {
        fs.mkdirSync(mashupPath);
        nconf.save();
    };

    this.set = function(name, value) {
        nconf.set(name, value);
    };

    this.get = function(name) {
        return nconf.get(name);
    };

    this.exists = function() {
        return fs.existsSync(settingPath);
    };
}

module.exports = new Config();