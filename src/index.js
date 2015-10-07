import rp from "request-promise";
import lo from "lodash";
import influx from "influx";
import Promise from "bluebird";

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

/*eslint camelcase: [0, {properties: "never"}]*/
export var put = function put(endpoint, database_name, points) {

    if (!endpoint){
        throw new Error("endpoint is required");
    }
    if (!database_name){
        throw new Error("database_name is required");
    }
    if (!points){
        throw new Error("points is required");
    }

    var body = lo.map(points, (p)=>{
        return formatPoint(p);
    }).join("\n");

    var options = {
        method: 'POST',
        qs: {db: database_name, precision: "ms"},
        url: `${endpoint}/write`,
        resolveWithFullResponse: true,
        body: body
    };

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body);
        return request;
    });
};

export function query({protocol, host, database, query_string, port: port=8086}) {
    let client = influx({protocol, host, port, database});

    let fun = function(resolve, reject) {

        let onComplete = function(err, results) {
            if (err) {
                return reject(err);
            }
            resolve(results);
        };
        client.query(query_string, onComplete);
    };

    return new Promise(fun);
}

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


export var showMeasurements = function showMeasurements(endpoint) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=SHOW MEASUREMENTS`
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

export function formatPoint(p) {
    var kv_pairs = lo.map(p.tags, (v, k)=>{
        return `${formatKeyString(k)}=${formatTagValue(v)}`;
    }).join(",");

    return `${formatKeyString(p.measurement)},${kv_pairs} value=${formatMeasureValue(p.value)} ${p.time}`;
}

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

export function formatMeasureValue(str) {
    if (typeof str !== 'string') {
        throw new Error('all values must be strings, otherwise floats and ints will be conflated');
    }

    //Assume a string with a period is a float and without is an integer
    if (str.match(/^[0-9]*\.[0-9]+$/)) {
        return str;
    }

    if (str.match(/^[0-9]+$/)) {
        return `${str}i`;   //integers must have a trailing i
    }

    //string values need to be quoted
    return `"${str}"`;
}

// we need to look in the body for errors as the influxdb api
// hides errors e.g. it gives a status code of 200 but an error in the body
function bodyCheck(body) {
    if (body) {
        body = JSON.parse(body);
    } else {
        return;
    }

    if (body.results && body.results[0] && body.results[0].error) {
        throw new Error(body.results[0].error);
    }
}
