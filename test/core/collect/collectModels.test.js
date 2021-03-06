"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    rewire = require("rewire"),
    path = require("path"),
    collectModels,
    servicesFolder = __dirname + "/collectModels";

describe("collectModels", function () {

    it("should collect appropriately and return urls and paths for the services", function () {

        var expectedModels = {
            server: {},
            client: {}
        };

        expectedModels.server.blogpost = true;
        expectedModels.server["blogpost/comment"] = true;
        expectedModels.client.blogpost = true;
        expectedModels.client["blogpost/comment"] = true;

        collectModels = rewire("../../../lib/core/collect/collectModels.js", false);
        var models = collectModels(servicesFolder);

        expect(models.server).to.only.have.keys(Object.keys(expectedModels.server));
        expect(models.client).to.only.have.keys(Object.keys(expectedModels.client));
        expect(models.server.blogpost).to.eql(path.resolve(__dirname + "/collectModels/BlogPost/BlogPost.server.class.js"));
        expect(models.server["blogpost/comment"]).to.eql(path.resolve(__dirname + "/collectModels/BlogPost/Comment/Comment.server.class.js"));
    });

    it("should fail on non existing folders", function () {

        try{
            collectModels = rewire("../../../lib/core/collect/collectModels.js", false);
            collectModels(__dirname+"/non/existing/folder/");
        }
        catch(err) {
            expect(err instanceof Error).to.be(true);
        }
    });
});
