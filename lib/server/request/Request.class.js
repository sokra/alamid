"use strict";

var Class = require("alamid-class"),
    value = require("value"),
    pathHelpers = require("../../shared/helpers/pathHelpers.js"),
    httpCrud = require("../../shared/helpers/httpCrud.js"),
    _ = require("underscore");

var allowedMethods = ["create", "read", "update", "destroy"];

var Request = new Class("Request", {

    session : "",
    __method : "",
    __rawPath : "",
    __path : "",
    _ids : null,
    __data : null,
    __model : null,
    __type : "",
    __transportType : "",
    __transport : null,

    /**
     * @construct
     * @param {String} method
     * @param {String} path
     * @param {Object} data
     */
    constructor : function (method, path, data) {

        this._ids = {};
        this.__data = {};

        if(method !== undefined) {
            this.setMethod(method);
        }
        if(path !== undefined) {
            this.setPath(path);
        }

        if(data !== undefined) {
            this.setData(data);
        }

        this.addSetters();
    },
    addSetters : function() {
        var self = this;

        Object.defineProperty(this, "method", {
            get : function(){
                //we return http-methods not the internal crud methods
                return httpCrud.convertCRUDtoHTTP(self.getMethod()).toUpperCase();
            },
            set : function(newMethod){
                self.setMethod(httpCrud.convertHTTPtoCRUD(newMethod));
            },
            enumerable : true,
            configurable : true
        });

        Object.defineProperty(this, "path", {
            get : function(){
                return "/" + self.getType() + "/" + self.getPath();
            },
            set : function(newPath){
                self.setPath(newPath);
            },
            enumerable : true,
            configurable : true
        });

        Object.defineProperty(this, "url", {
            get : function(){
                return "/" + self.getType() + "s/" + self.getPath();
            },
            set : function(newPath){
                self.setPath(newPath);
            },
            enumerable : true,
            configurable : true
        });

    },
    /**
     * set method to create|read|update|destroy
     * @param method
     */
    setMethod : function(method) {
        //one of the allowed methods
        method = method.toLowerCase();

        if(_.include(allowedMethods, method)){
            this.__method = method;
            return;
        }

        throw new Error("(alamid) Unsupported Method: " + method);
    },
    /**
     * attach data
     * @param {!Object} data
     */
    setData : function(data) {
        this.__data = data;
    },
    /**
     * attach model, accepts only objects and functions
     * @param {Object} model
     */
    setModel : function(model) {
        if (value(model).notTypeOf(Object)) {
            throw new TypeError("(alamid) Cannot set model: The model must be an object");
        }
        this.__model = model;
    },
    /**
     * set request-path
     * @param {String} path
     */
    setPath : function(path) {

        var sanitizedPath = "",
            pathParts;

        //reset related attributes
        this._ids = {};
        this.__rawPath = "";

        //sanitize the path
        path = pathHelpers.apply.modifier(
            pathHelpers.modifiers.normalize,
            pathHelpers.modifiers.noTrailingSlash,
            pathHelpers.modifiers.noLeadingSlash
        ).on(path);

        //after sanitization
        pathParts = path.split("/");

        //save the sanitized original request path
        this.__rawPath = path;

        //determine request-types
        if (pathHelpers.filters.onlyServiceURL(path)) {
            this.__type = "service";
        }
        else if(pathHelpers.filters.onlyValidatorURL(path)) {
            this.__type = "validator";
        }
        else {
            this.__type = "unknown";
        }

        //check for IDs
        //remove ids from requests, and save them separately
        //we start with 1, because 0 = services or validators
        for(var i = 1; i < pathParts.length; i++) {
            if(i % 2 === 0) {
                this._ids[pathHelpers.modifiers.noTrailingSlash(sanitizedPath)] = pathParts[i];
            }
            else {
                sanitizedPath += pathParts[i] + "/";
            }
        }

        sanitizedPath = pathHelpers.modifiers.noTrailingSlash(sanitizedPath);
        sanitizedPath = sanitizedPath.toLowerCase();
        this.__path = sanitizedPath;
    },
    /**
     * stores a reference to the original-transport
     * @param {String} transportType
     * @param {Object} transport
     */
    setTransport : function(transportType, transport) {
        this.__transportType = transportType;
        this.__transport = transport;
    },
    /**
     * returns the ID of the actual request
     * if you request /blogpost/1223/comment/12, it would return 12.
     * @return {String}
     */
    getId : function(){
        return this._ids[this.getPath()];
    },
    setId : function(id) {
        this._ids[this.getPath()] = id;
    },
    /**
     * returns all ids, passed to the request as object
     * keys are the names and values are ids
     * @return {Object}
     */
    getIds : function() {
        return this._ids;
    },
    setIds : function(ids) {
        this._ids = ids;
    },
    /**
     * return a model if it has been attached
     * @return {*}
     */
    getModel : function() {
        return this.__model;
    },
    /**
     * get the sanitized path
     * all ids are stripped and slashes are removed
     * @return {String}
     */
    getPath : function() {
        return this.__path;
    },
    /**
     * returns the raw path, the request has been made with
     * @return {String}
     */
    getRawPath : function() {
        return this.__rawPath;
    },
    /**
     * return the type of the request (ether service or validator)
     * @return {String}
     */
    getType : function() {
        return this.__type;
    },
    /**
     * return request-data as an object
     * @return {Object}
     */
    getData : function() {
        return this.__data;
    },
    /**
     * returns the method create|read|update|destroy
     * @return {String}
     */
    getMethod : function() {
        return this.__method;
    },
    getTransportType : function() {
        return this.__transportType;
    },
    getTransport : function() {
        return this.__transport;
    },
    setSession: function (session) {
        this.session = session;
    },
    getSession: function () {
        return this.session;
    }
});

module.exports = Request;

