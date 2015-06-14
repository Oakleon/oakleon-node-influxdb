import assert from "better-assert";
import * as influxdb from "../src/index";

describe('Array', function(){
    
    describe('create()', function(){
        it('should create a new influxdb database', function(done){
            influxdb.create("http://dockerbox:8086", null, null, "foottest")
            .then(function(result){
                console.log(JSON.stringify(result,true,4))
                done();
            })
            .catch((e)=>{
                done(e)
            })
        })
    })

    describe('formatPoint()', function(){
        it('send in JSON point get out influxdb format line', function(){

            var p = {
                measurement: "cpu_load",
                time: 1434311740594,
                value: 40.3,
                tags:{"host":"kube_minion_3", core:"3"}
            }

            var line = influxdb.formatPoint(p)
            assert("cpu_load,host=kube_minion_3,core=3 value=40.3 1434311740594" === line)
        })
    })


    describe('put()', function(){
        it('add some data', function(done){


            var p1 = {
                measurement: "cpu_load",
                time: 1434311740594,
                value: 40,
                tags:{"host":"kube_minion_3", core:"a3"}
            }

            var p2 = {
                measurement: "cpu_load",
                time: 1434313704006,
                value: 12,
                tags:{"host":"kube_minion_3", core:"a3"}
            }

            
            var points = [p1,p2];

            influxdb.put("http://dockerbox:8086", "foottest", points)
            .then(function(result){
                //console.log(result)
                //console.log(result.statusCode)
                //console.log(JSON.stringify(result,true,4))
                done();
            })
            .catch((e)=>{
                done(e)
            })
        })
    }) 
     
    // describe('showMeasurements()', function(){
    //     it('should create a new influxdb database', function(done){
    //         influxdb.showMeasurements("http://dockerbox:8086", null, null)
    //         .then(function(){
    //             done();
    //         })
    //         .catch((e)=>{
    //             done(e)
    //         })
    //     })
    // })
})
