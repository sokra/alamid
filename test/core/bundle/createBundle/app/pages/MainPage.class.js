"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    Page = require("../../../../../../lib/client/Page.class.js");

var MainPage = new Class({
    Extends: Page,
    init : function () {
        //nothing to do here
    }
});

module.exports = MainPage;