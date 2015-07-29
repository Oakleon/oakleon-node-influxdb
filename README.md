# oakleon-node-influxdb

A client library for InfluxDB 0.9+ using promises

For API line format see:  
<https://github.com/influxdb/influxdb/blob/master/tsdb/README.md>

You need a influxdb instance up to run the tests

docker run \
    --name influxdb \
    -d \
    -p 8083:8083 \
    -p 8086:8086 \
    cburki/influxdb:latest

to run the test

npm test

or

npm test -- watch
