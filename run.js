// this file will contain the code to subscribe the pi to AWS IoT cloud services
// & send commands to sphero

// Required SDK's
var sphero = require('sphero')
var aws = require('aws-iot-device-sdk')

// configurables
const spheroId = 'FD:94:C6:CA:0E:C0'
var orb = sphero(spheroId)
const piAddress = '/home/pi/make/iot_robots/activities/subscribe_sphero_to_iot_cloud'
const macAddress = '/Users/pedre/Desktop/make-sphero-IoT/sphero-iot-sub'

var device = aws.device({
  keyPath: piAddress + '/de148d3481-private.pem.key',
  certPath: piAddress + '/de148d3481-certificate.pem.crt',
  caPath: piAddress + '/ca.pem',
  clientId: 'raspberry_pi-' + 'pedre_mardu_makeday',
  host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
})

device.on('connect', function() {
    console.log('connect')
    device.subscribe("things/bund/commands")
  })

  orb.connect(() => {
    orb.color('red').delay(1000).then(() => {
      return orb.color('green')
    })
  })

//
let command = {}
let color = ''

device.on('message', function(topic, payload) {
    console.log('message',payload.toString())
    const msg = JSON.parse(payload.toString())
    if (topic == "things/bund/commands") {
      // do somethig with payload
      command = msg.command
      color = msg.color
    }
    //
    if(command.type == 'roll'){
      orb.roll(command.speed, command.direction).delay(command.duration).then(() => {
        return orb.roll(0,0)
      })
    }
  })

// sphero execute



