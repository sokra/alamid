"use strict";

//https://github.com/flatiron/nconf
var nconf = require("nconf"),
    path = require("path"),
    fs = require("fs"),
    _ = require("underscore");

var defaultConfig = require("../defaults/defaultConfig.json");

/**
 * Hierarchical load config from 1. ARGV, 2. ENV, 3. CWD/config.json or 4. default config
 * If you pass --config via ARGV or ENV, this file will be loaded as config.json instead of the default
 * Only values defined in config.json and default-alamid values can be overwritten by env
 *
 * **Examples:**
 * alamid --port 1234 : load default-config but overwrite port
 * alamid --config /your/path/to/config.json : load your own config json
 * alamid --config /your/path/to/config.json --port 1234 : load your own config.json but overwrite the port
 *
 * @return {Object} config
 */
function readConfig() {

    var conf = {},
        configPath,
        log = readConfig.log,
        activeConfig;

    //parse args & env first
    nconf.argv()
        .env();

    //working together with process.env.NODE_ENV
    if(process.env.NODE_ENV !== undefined) {
        nconf.set("env", process.env.NODE_ENV);
    }
    else if (nconf.get("env") !== undefined){
        process.env.NODE_ENV = nconf.get("env");
    }

    //load default config file if none is set
    if (nconf.get("config") === undefined) {

        configPath = "config.json";

        if(nconf.get("env") !== undefined) {
            configPath += nconf.get("env") + ".";
        }

        configPath = path.normalize(process.cwd() + "/config/" + configPath);
        log("no config-file specified in argv or env");
        log("trying to read config-file from CWD: " + configPath);
    }
    //check if path to custom config was passed and load if set
    else {
        configPath = path.normalize(process.cwd() + "/" + nconf.get("config"));
        log("trying to read config-file: " + configPath);
    }

    if (fs.existsSync(configPath)) {

        log("config-file found");

        //we need this file to extract the keys from nconf
        activeConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        //at least the default config values have to be set.
        _(activeConfig).extend(defaultConfig);
    } else {

        log("config-file not found");
        activeConfig = defaultConfig;
    }

    nconf.file({ file: configPath });
    //set defaults from included config.json
    nconf.defaults(defaultConfig);

    //read each value from the passedConfig (merged with default config)
    //this way we can hide env values that are not really wanted
    _(activeConfig).forEach(function forEachDefaultConfig(value, key) {

        //Boolean-String to REAL boolean cast
        if(nconf.get(key) === "true") {
            conf[key] = true;
        }
        else if(nconf.get(key) === "false") {
            conf[key] = false;
        }
        else {
            conf[key] = nconf.get(key);
        }

    });

    return conf;
}

readConfig.log = console.log;   // expose log-property so the logging behaviour can be changed externally

module.exports = readConfig;
