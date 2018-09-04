 const awsIot = require('aws-iot-device-sdk');
const username = 'ScottDay'
var sphero = require("sphero");
var spheroId = process.argv[2];
var orb = sphero(spheroId);

let isRolling = false;
let state = 2;
let lastDirection = 0;
let lastSpeed = 0;
let isStopping = false;
let speedDec = false;
let topSpeed = 100;
let movement = 1;

const device = awsIot.device({
   keyPath: 'certificates/private.pem.key',
  certPath: 'certificates/certificate.pem.crt',
    caPath: 'certificates/ca.pem',
  clientId: `${username}-subscribe`,
      host: 'a2yujzh40clf9c.iot.us-east-2.amazonaws.com'
});
const stop = (from) => {
	console.log(from);
	orb.roll(0,lastDirection);
	orb.color("red");
}
const move = (payload) => {
	payload = JSON.parse(payload);
	console.log(payload)
	if (payload.speed === 0) {
		stop("Command");;
	} else {
		orb.color("blue");
		orb.roll(payload.speed, payload.direction);
		lastDirection = payload.direction;
	}
};


let keytimeout = 0;
setInterval(function() {
	if (keytimeout > 0) {
		
		keytimeout--;
		if (keytimeout == 0)
		{
			stop("Timeout");
		}
	}
}, 1000);

setInterval(function() {
	if (isRolling) {
		if (lastSpeed >= topSpeed) { speedDec = true; }
		if (lastSpeed > 0 && speedDec)
		{
			lastSpeed -= 15;
		} else if (!speedDec) {
			lastSpeed += 25;
		}
		else
		{
			if (!isStopping)
			{
			isStopping = true;
			lastSpeed = 0;
			orb.stop();
			moving++;
			setTimeout(function() {
				isRolling = false;
				isStopping = false;
				orb.color("blue");
				}, 3000);
				
			orb.color("red");
			}
			if (moving === 2) {
				console.log('returning home');
				lastSpeed = 0;
				lastDirection -= 180;
				isRolling = true;
				speedDec = false;
				orb.color("yellow");
			} else if (moving > 2) {
				moving = 1;
			}
		}
		console.log(`Speed ${lastSpeed}, direction ${lastDirection}`);
		orb.roll(lastSpeed, lastDirection);
	}
}, 500);

device.on('connect', () => {
  console.log('Subscriber client connected to AWS IoT cloud.\n');

  device.subscribe('makers/scorflufus');
});


orb.connect(function () {

	orb.startCalibration();
	  console.log('Start Calibration\n');
	  
	setTimeout(function() {
		orb.finishCalibration();
		console.log('Finished Calibration\n');
		}, 3000);


	//orb.setStabilization(false);

	orb.streamOdometer();
	orb.on('odometer', function(data) {
		//console.log(`ODO ${data.xOdometer.value}; ${data.yOdometer.value}`);
		} );

	orb.streamImuAngles(10);
	orb.on('imuAngles', function(data) {
		//console.log(`IMU ${data.pitchAngle.value}; ${data.rollAngle.value}; ${data.yawAngle.value}`);
		x = data.rollAngle.value;
		y = data.pitchAngle.value;
		
		a = Math.sqrt( (x*x) + (y*y) );
		if ((a > 35) && (!isRolling))
			{ 
			angle = Math.atan2(y,x) * 180 / Math.PI;
			if (angle < 0)
				angle += 360;
				
			console.log(`Abs pitch,roll  magnitude = ${a}  angle = ${angle}\n`);
			
			lastDirection = 270 - angle;
			if (lastDirection > 360)
				lastDirection -= 360;
			if (lastDirection < 0)
				lastDirection += 360;
			
			isRolling = true;
			speedDec = false;
			lastSpeed = 0;
			moving = 1;
			orb.roll(lastSpeed, lastDirection);
			orb.color("green");
			}
		} );


	device.on('message', (topic, payload) => {

	  let message = JSON.parse(payload.toString());

	  switch (topic) {
		case 'makers/scorflufus':
			move(payload);
		default:
			keytimeout = 10;
		  console.log(`Message received on topic "${topic}"\n`)
	  }
	});
})


