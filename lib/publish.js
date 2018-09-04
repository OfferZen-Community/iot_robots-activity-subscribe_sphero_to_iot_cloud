const awsIot = require('aws-iot-device-sdk');
const username = 'ScottDay'

const device = awsIot.device({
   keyPath: 'certificates/private.pem.key',
  certPath: 'certificates/certificate.pem.crt',
    caPath: 'certificates/ca.pem',
  clientId: `${username}-publish`,
      host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});

device.on('connect', () => {
  console.log('Publisher client connected to AWS IoT cloud.\n');

  device.publish('makers/challenge/answers', JSON.stringify({
	"name": "ScottDay",
	"answerToken": "CZxozRKtDhtAEmtrzvwvazMt",
	"answer": "White Rabbit"
  }));
});
