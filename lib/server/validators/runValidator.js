var paths = require('../../paths.js'),
    settings = require('../../settings.js'),
    validators = require('../../validators.js').validators;

function runValidator(req, res, next) {
    var parsed = req.parsedURL,
        finalResult = {},
        validator,
        id,
        model,
        basePath,
        path,
        type,
        i = 0;

    function onValidatorResult(result) {
        finalResult[type] = result;
        if (result.result === true) {
            callValidator();
        } else {    // IF TRUE: an error occured
            finalResult.result = false;
            sendResponse();
        }
    }

    function sendResponse() {
        res.statusCode = 200;
        finalResult = JSON.stringify(finalResult);
        res.end(finalResult);
    }

    function callValidator() {
        if (i === 0) {
            type = 'client';
        } else if(i === 1) {
            type = 'server';
        } else {
            if (finalResult.client || finalResult.server) {
                finalResult.result = true;
                sendResponse();
            } else {
                next();
            }

            return;
        }
        i++;
        path = basePath + '.' + type + '.js';
        if (settings.isDev) {
            console.log('looking for validator ' + path);
        }
        if (validators[type][path]) {
            if (settings.isDev) {
                console.log('found ... running validator');
            }
            validator = require(path);
            validator.validate(id, model, onValidatorResult);
        } else {
            if (settings.isDev) {
                console.log('not found ... skipping');
            }
            callValidator();
        }
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Allow', 'POST');
        res.end();

        return;
    }
    if (typeof req.body.model !== "object" || req.body.id === undefined) {
        res.statusCode = 400;
        res.end('The validator expects a JSON like {"id": "the model id or null", "model": {...}}');

        return;
    } else {
        id = req.body.id;
        model = req.body.model;
    }
    basePath = paths.appCompiledPath + parsed.pathname;
    callValidator();
}

module.exports = runValidator;