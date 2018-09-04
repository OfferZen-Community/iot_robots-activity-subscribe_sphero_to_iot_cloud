
var sphero = require("sphero");
var spheroId = process.argv[2];
var orb = sphero(spheroId);

let lastDirection = 0;
let lastSpeed = 0;
const maxSpeed = 90;
const maxSpeedRev = maxSpeed+10;
const incSpeed = 40;
const decSpeed = 10;
const mainTimer = 250;

const states = {
	STARTUP: 0,
	CALIBRATING: 1,
	START_WAITING: 2,
	WAITING: 3,
	START_KICK: 4,
	SPEEDUP_FWD: 5,
	SPEEDDOWN_FWD: 6,
	TURN_AROUND: 7,
	SPEEDUP_REV: 8,
	SPEEDDOWN_REV: 9,
	WOBBLE: 10
};

let cur_state = states.STARTUP;
let timer = 0;

function handle_timer() {
	
	if (timer > 0)
		timer -= 500;
	
	console.log(cur_state);
	
	switch (cur_state)
	{
		case states.STARTUP:
			if (timer > 0)
				return;
		
			orb.color("red");
			orb.startCalibration();
			cur_state = states.CALIBRATING;
			timer = 3000; 
			break;
			
		case states.CALIBRATING:
			if (timer > 0)
				return;
			
			orb.finishCalibration();
			cur_state = states.START_WAITING;
			timer = 0; 
			break;

		case states.START_WAITING:
		
			if (timer > 0)
				return;

			orb.streamImuAngles(10);
			cur_state = states.WAITING;
			orb.color("blue");
			break;
			
		case states.WAITING:
			//do nothing!
			break;

		case states.START_KICK:
				
			orb.streamImuAngles(10, true);
			cur_state = states.SPEEDUP_FWD;
			orb.color("green");
			timer = 500;
			orb.roll(0, lastDirection);
			break;

		case states.SPEEDUP_FWD:
			if (timer > 0)
				return;
				
			if (lastSpeed < maxSpeed)
				lastSpeed += incSpeed;
			else	
				cur_state = states.SPEEDDOWN_FWD;
			orb.roll(lastSpeed, lastDirection);
			break;
			
		case states.SPEEDDOWN_FWD:
			if (lastSpeed > 0)
				lastSpeed -= decSpeed;
			else	
				cur_state = states.TURN_AROUND;
			
			if (lastSpeed < 0)
				lastSpeed = 0;
			
			orb.roll(lastSpeed, lastDirection);
			break;
			
		case states.TURN_AROUND:
			lastSpeed = 0;
			lastDirection = lastDirection + 180;
			
			if (lastDirection > 360)
				lastDirection -= 360;
			if (lastDirection < 0)
				lastDirection += 360;
		 
			orb.color("yellow");
		 	
			orb.roll(lastSpeed, lastDirection);
			cur_state = states.SPEEDUP_REV;
			break;
			
		case states.SPEEDUP_REV:
			if (lastSpeed < maxSpeedRev)
				lastSpeed += incSpeed;
			else	
				cur_state = states.SPEEDDOWN_REV;
			orb.roll(lastSpeed, lastDirection);
			break;
			
		case states.SPEEDDOWN_REV:
			if (lastSpeed > 0)
				lastSpeed -= decSpeed;
			else	
				cur_state = states.WOBBLE;
				
			if (lastSpeed < 0)
				lastSpeed = 0;
				
			orb.roll(lastSpeed, lastDirection);
			break;
			
		case states.WOBBLE:
			orb.color("red");
			orb.roll(0, 0);
			timer = 3000;
			cur_state = states.START_WAITING;
			break;
			
	}
}



orb.connect(function () {

	setInterval(function() {		
		handle_timer();
		}, mainTimer);
	
	orb.on('imuAngles', function(data) {
		
		
		if ( cur_state == states.WAITING )
			{
			x = data.rollAngle.value;
			y = data.pitchAngle.value;
			
			a = Math.sqrt( (x*x) + (y*y) );
			//console.log(a);
			if (a > 35)
				{ 
				angle = Math.atan2(y,x) * 180 / Math.PI;
				if (angle < 0)
					angle += 360;
				
				console.log(`Abs pitch,roll  magnitude = ${a}  angle = ${angle}\n`);
				
				lastDirection = 90 + angle;
				if (lastDirection > 360)
					lastDirection -= 360;
				if (lastDirection < 0)
					lastDirection += 360;
				
				lastSpeed = 0;
				cur_state = states.SPEEDUP_FWD;
				orb.color("green");
				
				}
			}
		} );

})


