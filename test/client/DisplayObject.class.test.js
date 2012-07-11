"use strict";

var expect = require("expect.js"),
    STATICS = require("../../lib/client/ALAMID_CLIENT_CONST.js"),
    path = require("path"),
    compile = require("nodeclass").compile,
    DisplayObject = require("../../lib/client/DisplayObject.class.js"),
    ExtendedByDisplayObject = require("./mocks/ExtendedByDisplayObject.class.js");

describe("DisplayObject", function () {

    describe("# construct()", function () {

        it("should throw an error if no template is given", function () {
            expect(function () { var dO = new DisplayObject(); }).to.throwError();
        });

    });

    var $form,
        form,
        formTemplate,

        $submitButton,
        submitButton,
        submitButtonTemplate,

        displayObject,
        formDisplayObject,
        submitButtonDisplayObject;

    beforeEach(function () {
        form = DOMNodeMocks.getForm();
        $form = jQuery(form);
        formTemplate = DOMNodeMocks.getFormString();

        submitButton = DOMNodeMocks.getSubmitButton();
        $submitButton = jQuery(submitButton);
        submitButtonTemplate = DOMNodeMocks.getSubmitButtonString();


        displayObject = new DisplayObject(formTemplate);
        submitButtonDisplayObject = new ExtendedByDisplayObject(submitButtonTemplate);
        formDisplayObject = new ExtendedByDisplayObject(formTemplate);
    });

    describe("# getNode()", function () {

        it("should be an [object HTMLFormElement]", function () {
            expect(displayObject.getNode().toString()).to.be.equal("[object HTMLFormElement]");
        });

    });

    describe("# getNodeMap()", function () {

        it("should return an object", function () {
            //expect(displayObject.getNodeMap()).to.be.an(Object);
        });

        it("should return a map of nodes with a 'form'-, 'input-a'-, 'input-b'-, 'input-c'- node ", function () {
            var nodeMap = displayObject.getNodeMap();

            expect(nodeMap.form.toString()).to.be.equal("[object HTMLFormElement]");
            expect(nodeMap["input-a"].toString() === "[object HTMLInputElement]").to.be(true);
            expect(nodeMap["input-c"].toString() === "[object HTMLInputElement]").to.be(true);
            expect(nodeMap["input-c"].toString() === "[object HTMLInputElement]").to.be(true);
        });

    });

    describe("# _append()", function () {

        it("should throw an Error if an object not kind of DisplayObject is given", function () {
            expect(function () {
                formDisplayObject.append({});
            }).to.throwError();
        });

        it("should throw an Error if a not existent node name was passed to at()", function () {
            expect(function () {
                formDisplayObject.append(submitButtonDisplayObject).at("not_existing_node");
            }).to.throwError();
        });

        it("should return an object providing a function at()", function () {
            expect(formDisplayObject.append(submitButtonDisplayObject).at).to.be.a(Function);
        });

    });

    describe("# at()", function () {

        it("should return a reference to itself", function () {
            expect(formDisplayObject.append(submitButtonDisplayObject).at("form")).to.be.equal(formDisplayObject);
        });

        it("should append submit-button to form", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");

            var $lastChild = jQuery(formDisplayObject.getNode()).find(":last-child"),
                lastChild = $lastChild[0];

            expect(lastChild.toString()).to.be.equal(submitButtonDisplayObject.getNode().toString());
            expect($lastChild.val()).to.be.equal(submitButtonDisplayObject.getNode().value);
        });

    });

    describe("# addNodeEvents()", function () {
        it("should throw an Error if you try to attach events to a not existing node", function () {

            expect(function () {
                displayObject.addNodeEvents({
                    "not_existing_node": {
                        "click": function () {
                            //do nothing
                        }
                    }
                });
            }).to.throwError();
        });

    });

    describe("# destroy()", function () {

        it("should return a reference to itself", function () {
            expect(submitButtonDisplayObject.destroy()).to.be.equal(submitButtonDisplayObject);
        });

        it("should remove itself from parent node", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            expect(jQuery(formDisplayObject.getNode()).find("[type='submit']").length).to.be.equal(0);
        });

        it("should be still possible to trigger attached events after # destroy()", function (done) {
            submitButtonDisplayObject.addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            formDisplayObject.append(submitButtonDisplayObject).at("form");

            submitButtonDisplayObject.destroy();

            jQuery(submitButtonDisplayObject.getNode()).click();
        });

        it("should be possible to re-append a destroyed DisplayObject", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.destroy();
            formDisplayObject.append(submitButtonDisplayObject).at("form");

            expect(
                jQuery(formDisplayObject.getNode()).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButtonDisplayObject.getNode().toString());
        });

    });

    describe("# dispose()", function () {

        it("should return a reference to itself", function () {
            expect(submitButtonDisplayObject.dispose()).to.be(submitButtonDisplayObject);
        });

        it("should remove itself from parent node", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.dispose();
            expect(jQuery(formDisplayObject.getNode()).find("[type='submit']").length).to.be.equal(0);
        });

        it("should NOT be possible to trigger before attached events after # dispose()", function (done) {
            submitButtonDisplayObject.addNodeEvents({
                "submit-button": {
                    "click": function () {
                        done();
                    }
                }
            });

            formDisplayObject.append(submitButtonDisplayObject).at("form");

            submitButtonDisplayObject.dispose();

            jQuery(submitButtonDisplayObject.getNode()).click();

            done();
        });

        it("should be possible to re-append a disposed DisplayObject", function () {
            formDisplayObject.append(submitButtonDisplayObject).at("form");
            submitButtonDisplayObject.dispose();
            formDisplayObject.append(submitButtonDisplayObject).at("form");

            expect(
                jQuery(formDisplayObject.getNode()).find("[type='submit']")[0].toString()
            ).to.be.equal(submitButtonDisplayObject.getNode().toString());
        });
    });

    describe("# hide()", function () {

        it("node should have the attribute class with at least " + STATICS.HIDE_CLASS + " as value", function () {
            displayObject.hide();
            expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(true);
        });
    });

    describe("# display()", function () {

        it("node should NOT have the attribute class with " + STATICS.HIDE_CLASS + " as value", function () {
            displayObject.display();
            expect(jQuery(displayObject.getNode()).hasClass(STATICS.HIDE_CLASS)).to.be(false);
        });

    });

    describe("# isDisplayed()", function () {

        it("should be true by default value", function () {
            expect(displayObject.isDisplayed()).to.be(true);
        });

        it("should be false after # hide()", function () {
            displayObject.hide();
            expect(displayObject.isDisplayed()).to.be(false);
        });

        it("should be true after # hide() and then # display()", function () {
            displayObject.hide();
            displayObject.display();
            expect(displayObject.isDisplayed()).to.be(true);
        });

    });

    describe("# isAppended()", function () {

        var formDisplayObject,
            submitButtonDisplayObject;

        beforeEach(function () {
            formDisplayObject = new ExtendedByDisplayObject(formTemplate);
            submitButtonDisplayObject = new ExtendedByDisplayObject(submitButtonTemplate);

            formDisplayObject.append(submitButtonDisplayObject).at("form");
        });

        it("should be false by default (=just created and not appended anywhere)", function () {
            expect(formDisplayObject.isAppended()).to.be(false);
        });

        it("should be true after appending it anywhere", function () {
            expect(submitButtonDisplayObject.isAppended()).to.be(true);
        });

        it("should be false after # destroy()", function () {
            submitButtonDisplayObject.destroy();
            expect(submitButtonDisplayObject.isAppended()).to.be(false);
        });

        it("should be false after # dispose()", function () {
            submitButtonDisplayObject.dispose();
            expect(submitButtonDisplayObject.isAppended()).to.be(false);
        });
    });
});