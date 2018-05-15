// this file will contain the code to subscribe the pi to AWS IoT cloud services
// & send commands to sphero

// Required SDK's
var sphero = require('sphero')
var aws = require('aws-iot-device-sdk')

// configurables
const spheroId = 'FD:94:C6:CA:0E:C0'
var orb = sphero(spheroId)

var device = aws.device({
  keypath: './de148d3481-private.pem.key',
  certPath: './de148d3481-certificate.pem.crt',
  caPath: './VeriSign-Class 3-Public-Primary-Certification-Authority-G5.pem',
  clientId: 'raspberry_pi-' + spheroId,
  host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
})

device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
    device.publish('topic_2', JSON.stringify({ test_data: 1}));
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });

// listen to AWS MQTT

