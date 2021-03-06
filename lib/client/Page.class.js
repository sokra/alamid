"use strict"; // run code in ES5 strict mode

var value = require("value"),
    DisplayObject = require("./DisplayObject.class.js"),
    _ = require("underscore");

var Page = DisplayObject.extend("Page", {

    /**
     * @type {Page}
     * @private
     */
    __subPage: null,

    /**
     * @type {Object}
     * @protected
     */
    _params: null,

    /**
     * @param {Object} params
     * @param {String=} template (optional)
     */
    constructor: function (params, template) {

        this._super(template);
        //Make params available for Pages that inherit from Page
        this._params = params;

    },

    /**
     * Sets a Sub-Page
     *
     * @param {Page|null} subPage
     * @param {Function=} transitionHandler (optional)
     */
    setSubPage: function (subPage, transitionHandler) {
        var prevSubPage;

        function disposePrevSubPage() {
            prevSubPage.dispose();
        }

        if (value(subPage).notTypeOf(Page) && subPage !== null) {
            throw new TypeError(
                "(alamid) Cannot set type of " + typeof subPage +" as new Sub-Page: " +
                "The Sub-Page must be an instance of Page or null."
            );
        }

        prevSubPage = this.__subPage;

        if (subPage !== null) {
            this._append(subPage).at("page");
        }

        if (prevSubPage) {
            /*
            if (transitionHandler === undefined && subPage.Class.animations) {
                transitionHandler = subPage.constructor.animations.transition;
            }
            if (transitionHandler) {
                transitionHandler(prevSubPage.getNode(), subPage.getNode(), disposePrevSubPage);
            } else {
                disposePrevSubPage();
            }
            */
            disposePrevSubPage();
        }

        this.__subPage = subPage;
    },

    /**
     * @return {Page}
     */
    getSubPage: function () {
        return this.__subPage;
    }
});



module.exports = Page;