"use strict";

var Class = require("nodeclass").Class,
    DisplayObject = require("../../../lib/client/DisplayObject.class.js");

/**
 * This is a mock for testing DisplayObject's append() by making it a public method.
 */
var ExtendedByDisplayObject = new Class({

    Extends: DisplayObject,

    /**
     * @type {string}
     * @private
     */
    __focus: "untriggered",

    /**
     * @type {string}
     * @private
     */
    __blur: "untriggered",

    /**
     *
     * How to use: displayObjectInstance.append(new displayObjectInstance()).at("nodeName").
     *
     * @param {!DisplayObject} displayObject
     * @return {Object.<string, function(string): DisplayObject>}
     * @protected
     */
    append: function (displayObject) {
        return this.Super._append(displayObject);
    },

    /**
     * Exposing protected _addNodeEvents for testing.
     *
     * @param nodeEvents
     */
    addNodeEvents: function (nodeEvents) {
        this.Super._addNodeEvents(nodeEvents);
    },

    _onFocus: function () {
        this.__focus = "triggered";
    },

    _onBlur: function () {
        this.__blur = "triggered";
    }

});

module.exports = ExtendedByDisplayObject;