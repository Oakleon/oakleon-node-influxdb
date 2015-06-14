import rp from "request-promise";
//rp.debug = true;
import lo from "lodash";

// a point should look like

// {
//     measurement: "cpu_load",
//     time: 1434311740594,
//     value: 40.3
//     tags:{"host":"kube_minion_3", core:"3"}
// }

export var formatPoint = function formatPoint(p) {

    var kv_pairs = lo.map(p.tags, (v,k)=>{
        return `${k}=${v}`
    }).join(",")

    return `${p.measurement},${kv_pairs} value=${p.value} ${p.time}`
}

export var put = function put(endpoint, database_name, points) {

    if(!endpoint)       throw new Error("endpoint is required")
    if(!database_name)  throw new Error("database_name is required")
    if(!points)         throw new Error("points is required")

    var body = lo.map(points, (p)=>{
        return formatPoint(p);
    }).join("\n")

    // console.log("body");
    // console.log(body);

    var options = {
        method: 'POST',
        qs: {db: database_name, precision:"ms"},
        url: `${endpoint}/write`,
        resolveWithFullResponse: true,
        body:body
    }

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body)
        return request;
    })
}

var bodyCheck = function bodyCheck(body) {
    if(body) {
        body = JSON.parse(body);
    } else {
        return;
    }

    if(body.results && body.results[0] && body.results[0].error) throw new Error(body.results[0].error);
}

export var create = function create(endpoint, user, pass, name) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=CREATE DATABASE ${name}`,
        resolveWithFullResponse: true
    }

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body)
        return request;
    })
}


export var showMeasurements = function showMeasurements(endpoint, user, pass) {


    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=SHOW MEASUREMENTS`,
    }

    return rp(options)
    .then((request)=>{
        bodyCheck(request.body)
        return request;
    })
}

