"use strict";

var resolveFilename = require("../../lib/core/bundle/resolveFilename.js"),
    rewireWebpackExtension = require("rewire").bundlers.webpack,
    path = require("path");

exports.use = function () {

    var options = {
        context: path.resolve(__dirname, "../../"),
        includeFilenames: true,
        debug: true,
        extensions: ["", ".client.js", ".js"],
        resolve: {
            loaders: [
                { test: /\.html$/i, loader: "raw" }
            ],
            postprocess: {
                normal: [resolveFilename]
            }
        }
    };

    rewireWebpackExtension(options);

    return options;

};