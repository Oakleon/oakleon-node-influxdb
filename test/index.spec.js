import * as influxdb from "../src/index";
import lo from "lodash";
import moment from "moment";
import {expect} from 'chai';

describe('Influx', function(){

    before(function(done){
        influxdb.create("http://dockerbox:8086", null, null, "foottest")
        .then(function(result){
            expect(result.statusCode).to.equal(200);
            done();
        })
        .catch((e)=>{
            done(e);
        });
    });

    after(function(done){
        influxdb.drop("http://dockerbox:8086", null, null, "foottest")
        .then(function(result){
            expect(result.statusCode).to.equal(200);
            done();
        })
        .catch((e)=>{
            done(e);
        });
    });

    describe('formatPoint()', function(){
        it('send in JSON point get out influxdb format line', function(){

            var p = {
                measurement: "cpu_load",
                time: 1434311740594,
                value: "40.3",
                tags: {"host": "kube_minion_3", core: "3"}
            };

            var line = influxdb.formatPoint(p);
            expect(line).to.equal("cpu_load,host=kube_minion_3,core=3 value=40.3 1434311740594");
        });
        it('properly formats key parts with spaces, commas', function(){

            var p = {
                measurement: "cpu load",
                time: 1434311740594,
                value: "40.3",
                tags: {"h,ost": "kube minion 3", core: "3,"}
            };

            var line = influxdb.formatPoint(p);
            expect(line).to.equal("cpu\\ load,h\\,ost=kube\\ minion\\ 3,core=3\\, value=40.3 1434311740594");
        });
    });

    describe('formatMeasureValue()', function(){
        it('make sure int-strings are properly formatted for influxdb line protocol', function(){
            expect(influxdb.formatMeasureValue("3")).to.equal("3i");
        });
        it('make sure float-strings are properly formatted for influxdb line protocol', function(){
            expect(influxdb.formatMeasureValue("3.0")).to.equal("3.0");
            expect(influxdb.formatMeasureValue(".1")).to.equal(".1");
        });
        it('make sure string-strings are properly formatted for influxdb line protocol', function(){
            expect(influxdb.formatMeasureValue("string")).to.equal('"string"');
        });
    });

    describe('put()', function(){
        it('add some data', function(done){

            var p1 = {
                measurement: "cpu_load",
                time: 1434311740594,
                value: "40",
                tags: {"host": "kube_minion_3", core: "a3"}
            };

            var p2 = {
                measurement: "cpu_load",
                time: 1434313704006,
                value: "12",
                tags: {"host": "kube_minion_3", core: "a3"}
            };

            var points = [p1, p2];

            influxdb.put("http://dockerbox:8086", "foottest", points)
            .then(function(result){
                expect(result.statusCode).to.equal(204);
                done();
            })
            .catch((e)=>{
                done(e);
            });
        });

        it('add some data with funky strings', function(done){

            var p1 = {
                measurement: "error with thing",
                time: 1434311740594,
                value: "Hey: string goes here",
                tags: {"host": "kube minion 3", core: "a,3"}
            };

            var p2 = {
                measurement: "error with thing",
                time: 1434313704006,
                value: "Hey: string goes here now",
                tags: {"host": "kube minion 3", core: "a,3"}
            };

            var points = [p1, p2];

            influxdb.put("http://dockerbox:8086", "foottest", points)
            .then(function(result){
                expect(result.statusCode).to.equal(204);
                done();
            })
            .catch((e)=>{
                done(e);
            });
        });
    });

    describe('query()', function(){
        it('queries data from the DB', function(done){

            var p1 = {
                measurement: "cpu_load",
                time: moment().valueOf(),
                value: "50",
                tags: {"host": "kube_minion_3", core: "a3"}
            };

            var p2 = {
                measurement: "cpu_load",
                time: moment().valueOf() - 1,
                value: "52",
                tags: {"host": "kube_minion_3", core: "a3"}
            };

            var points = [p1, p2];

            influxdb.put("http://dockerbox:8086", "foottest", points)
            .then(function(){
                return influxdb.query({protocol: 'http', host: 'dockerbox', port: '8086', database: 'foottest', query_string: 'SELECT value FROM cpu_load WHERE time > NOW() - 10s'});
            })
            .then( (result) => {
                let vals = lo.pluck(result[0], 'value');
                expect(vals).to.contain(50);
                expect(vals).to.contain(52);
                done();
            })
            .catch( (e) =>{
                done(e);
            });
        });
    });

    describe('es5 put()', function(){
        it('use the build es5 to add some data', function(done){

            var es5_influxdb = require("../build/index.js");
            var p1 = {
                measurement: "cpu_load",
                time: 1434311740594,
                value: "40",
                tags: {"host": "kube_minion_3", core: "a3"}
            };

            var p2 = {
                measurement: "cpu_load",
                time: 1434313704006,
                value: "12",
                tags: {"host": "kube_minion_3", core: "a3"}
            };


            var points = [p1, p2];

            es5_influxdb.put("http://dockerbox:8086", "foottest", points)
            .then(function(result){
                expect(result.statusCode).to.equal(204);
                done();
            })
            .catch((e)=>{
                done(e);
            });
        });
    });

    // afterEach(function(done){
    //     var client = _Oakdrop.init();
    //
    //     _Oakdrop.delete_all_ready_jobs(client, tube)
    //     .then(function() {
    //         return _Oakdrop.delete_all_buried_jobs(client, tube);
    //     })
    //     .then(function() {
    //         _Oakdrop.disconnect(client);
    //     })
    // })

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
});
