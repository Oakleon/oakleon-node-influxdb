"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _requestPromise = require("request-promise");

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _betterAssert = require("better-assert");

var _betterAssert2 = _interopRequireDefault(_betterAssert);

//rp.debug = true;

///////////////////////////////////////////////////////////////////
//
//                       POINT FORMAT
//
///////////////////////////////////////////////////////////////////
/*

[
    {
        measurement: "cpu_load",
        time: 1434311740594,
        value: 40.3
        tags:{"host":"kube_minion_3", core:"3"}
    },
    {
        measurement: "cpu_load",
        time: 1434311744000,
        value: 21.1
        tags:{"host":"kube_minion_3", core:"3"}
    }
]

*/

///////////////////////////////////////////////////////////////////
//
//                          API
//
///////////////////////////////////////////////////////////////////

var put = function put(endpoint, database_name, points) {

    if (!endpoint) throw new Error("endpoint is required");
    if (!database_name) throw new Error("database_name is required");
    if (!points) throw new Error("points is required");

    var body = _lodash2["default"].map(points, function (p) {
        return formatPoint(p);
    }).join("\n");

    var options = {
        method: "POST",
        qs: { db: database_name, precision: "ms" },
        url: "" + endpoint + "/write",
        resolveWithFullResponse: true,
        body: body
    };

    return (0, _requestPromise2["default"])(options).then(function (request) {
        bodyCheck(request.body);
        return request;
    });
};

exports.put = put;
var create = function create(endpoint, user, pass, name) {

    var options = {
        method: "GET",
        uri: "" + endpoint + "/query?q=CREATE DATABASE " + name,
        resolveWithFullResponse: true
    };

    return (0, _requestPromise2["default"])(options).then(function (request) {
        bodyCheck(request.body);
        return request;
    });
};

exports.create = create;
var drop = function drop(endpoint, user, pass, name) {

    var options = {
        method: "GET",
        uri: "" + endpoint + "/query?q=DROP DATABASE " + name,
        resolveWithFullResponse: true
    };

    return (0, _requestPromise2["default"])(options).then(function (request) {
        bodyCheck(request.body);
        return request;
    });
};

exports.drop = drop;
var showMeasurements = function showMeasurements(endpoint, user, pass) {

    var options = {
        method: "GET",
        uri: "" + endpoint + "/query?q=SHOW MEASUREMENTS"
    };

    return (0, _requestPromise2["default"])(options).then(function (request) {
        bodyCheck(request.body);
        return request;
    });
};

exports.showMeasurements = showMeasurements;
///////////////////////////////////////////////////////////////////
//
//                          HELPERS
//
///////////////////////////////////////////////////////////////////

//not using this function right now
function autoParse(body, response) {
    // FIXME: The content type string could contain additional values like the charset.
    if (response.headers["content-type"] === "application/json") {
        return JSON.parse(body);
    } else {
        return body;
    }
}

var formatPoint = function formatPoint(p) {
    var kv_pairs = _lodash2["default"].map(p.tags, function (v, k) {
        return "" + k + "=" + v;
    }).join(",");

    return "" + p.measurement + "," + kv_pairs + " value=" + p.value + " " + p.time;
};

exports.formatPoint = formatPoint;
// we need to look in the body for errors as the influxdb api
// hides errors e.g. it gives a status code of 200 but an error in the body
var bodyCheck = function bodyCheck(body) {
    if (body) {
        body = JSON.parse(body);
    } else {
        return;
    }

    if (body.results && body.results[0] && body.results[0].error) throw new Error(body.results[0].error);
};

