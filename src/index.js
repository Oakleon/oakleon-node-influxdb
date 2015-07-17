import rp from "request-promise";
import lo from "lodash";

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

export var put = function put(endpoint, database_name, points) {

    if(!endpoint)       throw new Error("endpoint is required");
    if(!database_name)  throw new Error("database_name is required");
    if(!points)         throw new Error("points is required");

    var body = lo.map(points, (p)=>{
        return formatPoint(p);
    }).join("\n");

    var options = {
        method: 'POST',
        qs: {db: database_name, precision:"ms"},
        url: `${endpoint}/write`,
        resolveWithFullResponse: true,
        body:body
    };

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body);
        return request;
    });
};

export var create = function create(endpoint, user, pass, name) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=CREATE DATABASE ${name}`,
        resolveWithFullResponse: true
    };

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body);
        return request;
    });
};

export var drop = function drop(endpoint, user, pass, name) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=DROP DATABASE ${name}`,
        resolveWithFullResponse: true
    };

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body);
        return request;
    });
};


export var showMeasurements = function showMeasurements(endpoint, user, pass) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=SHOW MEASUREMENTS`,
    };

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body);
        return request;
    });
};

///////////////////////////////////////////////////////////////////
//
//                          HELPERS
//
///////////////////////////////////////////////////////////////////

//not using this function right now
function autoParse(body, response) {
    // FIXME: The content type string could contain additional values like the charset.
    if (response.headers['content-type'] === 'application/json') {
        return JSON.parse(body);
    } else {
        return body;
    }
}

export var formatPoint = function formatPoint(p) {
    var kv_pairs = lo.map(p.tags, (v,k)=>{
        return `${formatKeyString(k)}=${formatTagValue(v)}`;
    }).join(",");

    return `${formatKeyString(p.measurement)},${kv_pairs} value=${formatMeasureValue(p.value)} ${p.time}`;
};

function formatKeyString(tag_key) {
    return tag_key.replace(/,/g, '\\,').replace(/ /g, '\\ ');
}

function formatTagValue(tag_value) {
    if (tag_value === true) {
        return "true";
    }
    if (tag_value === false) {
        return "false";
    }
    return formatKeyString(tag_value);
}

function formatMeasureValue(str) {
    //Assume a string of all numbers is supposed to be an int or float
    //influxdb will then parse the string and set the type
    if (typeof str !== 'string' || str.match(/^[0-9\.]+$/)) {
        return str;
    }

    //string values need to be quoted
    return `"${str}"`;
}

// we need to look in the body for errors as the influxdb api
// hides errors e.g. it gives a status code of 200 but an error in the body
var bodyCheck = function bodyCheck(body) {
    if(body) {
        body = JSON.parse(body);
    } else {
        return;
    }

    if(body.results && body.results[0] && body.results[0].error) throw new Error(body.results[0].error);
};
