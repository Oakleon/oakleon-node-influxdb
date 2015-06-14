import assert from "better-assert";
import * as influxdb from "../src/index";

describe('Array', function(){
    
    describe('create()', function(){
        it('should create a new influxdb database', function(){
            influxdb.create("http://dockerbox:8086", null, null, "foottest")
        })
    }) 
     
    describe('showMeasurements()', function(){
        it('should create a new influxdb database', function(){
            influxdb.showMeasurements("http://dockerbox:8086", null, null)
        })
    })
})
