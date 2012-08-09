"use strict";

var Class = require("nodeclass").Class;
var Model = require('../../../lib/shared/Model.class.js'),
    schema = require("./schemas/OctocatSchema.js"),
    serverSchema = require("./schemas/OctocatSchema.server.js");

var Octocat = Model.define({
    $url : "Octocat",
    "init": function(id) {
        this.Super(id);
        this.Super.setSchema(schema, "shared");
        this.Super.setSchema(serverSchema);
    },
    "accept": function() {
        this.Super.acceptCurrentState();
    }
});

module.exports = Octocat;