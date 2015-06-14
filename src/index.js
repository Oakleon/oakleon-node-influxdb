import rp from "request-promise";


export var put = function blah(endpoint, user, pass, points) {
    rp(endpoint, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage. 
        }
    })  
}

var bodyCheck = function(body) {
    console.log(body);
    body = JSON.parse(body);
    if(body.results && body.results[0] && body.results[0].error) throw new Error(body.results[0].error);
}

export var create = function blah(endpoint, user, pass, name) {

    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=CREATE DATABASE ${name}`,
    }

    rp(options)
    .then((body)=>{
        console.log(body)
    })
    .catch((e)=>{
        console.log(e)
    })
}

export var showMeasurements = function blah(endpoint, user, pass) {


    var options = {
        method: 'GET',
        uri: `${endpoint}/query?q=SHOW MEASUREMENTS`,
    }

    rp(options)
    .then((body)=>{
        console.log(body)
    })
    .catch((e)=>{
        console.log(e)
    })
}

