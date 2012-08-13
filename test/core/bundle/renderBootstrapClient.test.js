"use strict"; // run code in ES5 strict mode

require("nodeclass").registerExtension();

var expect = require("expect.js"),
    pathUtil = require("path"),
    renderBootstrapClient = require("../../../lib/core/bundle/renderBootstrapClient.js"),
    vm = require("vm"),
    fs = require("fs"),
    makeDirSync = require("fshelpers").makeDirSync,
    alamidIndex = require("../../../lib/index.js"),
    alamidClientIndex = require("../../../lib/index.client.js"),
    clientConfig = require("../../../lib/client/config.client.js"),
    config = require("../../../lib/core/config"),
    _ = require("underscore");

var appPath = __dirname + "/renderBootstrapClient",
    bootstrapPath = appPath + "/bundle/tmp";

describe("renderBootstrapClient", function () {
    var config = {
            "mode" : "development",
            "useCasting" : true,
            "useWebsockets": true
        },
        index = {},
        sandbox = {
            require: function (path) {
                if (path.charAt(0) === ".") {
                    path = pathUtil.resolve(bootstrapPath, path);
                }

                // Alamid mocks
                if (path.indexOf("alamid/lib/client/App.class.js") !== -1) {
                    return App;
                } else if (path.indexOf("alamid/lib/index.js") !== -1) {
                    return index;
                }

                return require(path);
            }
        },
        MainPage = require(appPath + "/app/pages/MainPage.class.js");

    function App(MainPage) {
        this.MainPage = MainPage;
    }

    before(function () {
        index = _(index).extend(alamidIndex);
        index = _(index).extend(alamidClientIndex);
        makeDirSync(__dirname + "/node_modules");
        fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/node_modules/alamid");
    });
    after(function () {
        fs.unlinkSync(__dirname + "/node_modules/alamid");
        fs.rmdirSync(__dirname + "/node_modules");
    });
    it("should throw no error", function () {
        var src = renderBootstrapClient(config);

        vm.runInNewContext(src, sandbox);
    });
    it("should only assign client config keys", function () {
        expect(index.config).to.only.have.keys(_(clientConfig).keys());
    });
    it("should use the same values as in the server config", function () {
        _(index.config).each(function eachConfigValue(value, key) {
            expect(value).to.be(config[key]);
        });
    });
    it("should initialize the app", function () {
        expect(index.app).to.be.a(App);
        expect(index.app.MainPage).to.be(MainPage);
    });
    it("should call fillPageRegistry.js", function () {
        expect(require.cache[appPath + "/bundle/tmp/fillPageRegistry.js"]).to.be.an(Object);
    });
    it("should call /app/init.client.js", function () {
        expect(require.cache[appPath + "/app/init.client.js"]).to.be.an(Object);
    });
});