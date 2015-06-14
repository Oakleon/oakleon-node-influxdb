# oakleon-node-influxdb


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
