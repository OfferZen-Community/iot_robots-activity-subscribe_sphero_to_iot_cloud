// this file will contain the code to subscribe the pi to AWS IoT cloud services
// & send commands to sphero

// Required SDK's
var sphero = require('sphero')
var aws = require('aws-iot-device-sdk')

// configurables
const spheroId = 'FD:94:C6:CA:0E:C0'
var orb = sphero(spheroId)

var device = aws.device({
  keyPath: './de148d3481-private.pem.key',
  certPath: './de148d3481-certificate.pem.crt',
  caPath: './ca.pem',
  clientId: 'raspberry_pi-' + spheroId,
  host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
})

device.on('connect', function() {
    console.log('connect')
    device.subscribe("things/bund/commands")
  });

device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
    if (topic == "things/bund/commands") {
      // do somethig with payload
      
    }
  })

// listen to AWS MQTT

