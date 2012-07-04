"use strict"; // run code in ES5 strict mode

require("../../../testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass"),
    compile = nodeclass.compile,
    path = require("path");

var Request = require("../../../../compiled/server/request/Request.class.js"),
    Response = require("../../../../compiled/server/request/Response.class.js");

nodeclass.stdout = function() {
    //No output in test mode
};


describe("runService", function(){

    var runService = rewire("../../../../compiled/server/request/middleware/runService.js", false);

    describe("#serviceMiddleware", function() {

        var servicesMock = {
            getService : function(path) {

                if(path === "test/testService.server.class.js"){
                    return {
                        "create" : function(model, callback){ callback(200); },
                        "read" : function(model, callback){ callback(200, model); },
                        "update" : function(model, callback){ callback(200, model); }
                    };
                }

                if(path === "test2/test2Service.server.class.js"){
                    return {};
                }
                return null;
            }
        };

        runService.__set__("services", servicesMock);
        runService.__set__("paths", {
            compiledPath : __dirname + "/exampleApp/app"
        });

        it("should find the mocked POST service, run it and next afterwards", function (done) {

            var method = "create",
                path = "/services/test/",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });


        it("should find the mocked READ service, run it and next afterwards with data attached to response", function (done) {

            var method = "read",
                path = "/services/test",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });
        });

        it("should next with an error code if the service for the given method is not allowed", function (done) {

            var method = "delete",
                path = "/services/test",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(405);
                done();
            });
        });

        it("should next with error code 403 if no service is registered for a given path", function (done) {

            var method = "delete",
                path = "/services/test2",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(403);
                done();
            });
        });

        it("should next with an err if path is not defined", function (done) {

            var method = "delete",
                path = "/services/nonExistingPath",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).not.to.be(null);
                expect(response.getStatusCode()).to.be(404);
                done();
            });
        });

    });

    describe("#serviceFormat", function() {

        before(function() {
            var servicesMock = {
                getService : function(path) {
                    if(path === "servicea/serviceaService.server.class.js"){
                        var ServiceA = require("./runService/compiled/AService.server.class.js");
                        return new ServiceA();
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
            compile(path.resolve(__dirname, "./runService/src/"), path.resolve(__dirname, "./runService/compiled"));

        });

        it("should accept classes as services", function(done) {

            var method = "update",
                path = "/services/servicea",
                data = { "da" : "ta" };

            var request = new Request(method, path, data),
                response = new Response();
            //we have no middleware for setting the model in this test!
            request.setModel(data);

            runService(request, response, function(err) {
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                expect(response.getData()).to.eql(data);
                done();
            });
        });
    });

    describe("#service with deeper hierarchy - embedded documents", function() {
        //https://github.com/pandaa/alamid/issues/6

        before(function() {
            var servicesMock = {
                getService : function(path) {
                    if(path === "blogpost/comments/commentsService.server.class.js"){
                        var ServiceA = require("./runService/compiled/AService.server.class.js");
                        return new ServiceA();
                    }
                    return null;
                }
            };

            runService.__set__("services", servicesMock);
            compile(path.resolve(__dirname, "./runService/src/"), path.resolve(__dirname, "./runService/compiled"));

        });


        it("should accept services with deeper paths", function(done) {

            var method = "delete",
                path = "/services/blogpost/123/comments/1245",
                data = {};

            var request = new Request(method, path, data),
                response = new Response();

            runService(request, response, function(err) {
                expect(request.getIds()).to.eql({ blogpost: '123', comments: '1245' });
                expect(err).to.be(null);
                expect(response.getStatusCode()).to.be(200);
                done();
            });
        });
    });
});