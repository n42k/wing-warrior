var HELPER_NOTIFY_VERTICAL_MOVEMENT = 0;
var HELPER_NOTIFY_HORIZONTAL_MOVEMENT = 1;
var HELPER_NOTIFY_JUMP = 2;
var HELPER_NOTIFY_ATTACK = 3;
var HELPER_NOTIFY_SPECIAL_ATTACK = 11;
var HELPER_NOTIFY_ORC_KILL = 4;
var HELPER_NOTIFY_BOMBER_KILL = 15;
var HELPER_NOTIFY_DROP_HEALTH = 5;
var HELPER_NOTIFY_DROP_JUMP = 6;
var HELPER_NOTIFY_DROP_SPEED = 7;
var HELPER_NOTIFY_DROP_ORB = 8;
var HELPER_NOTIFY_DROP_FLAK = 9;
var HELPER_NOTIFY_DROP_WINGS = 10;
var HELPER_NOTIFY_FLY = 12;
var HELPER_NOTIFY_ALTERNATED = 13;
var HELPER_NOTIFY_FLAK = 14;
var HELPER_NOTIFY_BOMBER_SPAWN = 16;
var HELPER_NOTIFY_ORC_SPAWN = 17;
var HELPER_NOTIFY_WIN = 18;
var HELPER_NOTIFY_LOSS = 19;
var HELPER_NOTIFY_LANDING = 20;
// NOTE: LATEST IS 20 //UPDATE// THIS WHEN CHANGING
// PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE PLEASE
// DON'T GET TIRED AND IGNORE THIS
// THIS LARGE ENOUGH COMMENT BLOCK OUGHT TO DO IT

function HelperState() {
	this.messages = [];
}

HelperState.prototype.addMessage = function(msg) {
	this.messages.push(msg);
}

HelperState.prototype.getNextMessage = function() {
	if(this.messages.length > 0)
		return this.messages.shift();
	else
		return null;
}

HelperState.prototype.notify = function(type) {
}

HelperState.prototype.tick = function() {
}

var HELPER_MOVEMENT_STATE_HORIZONTAL_STAGE = 0;
var HELPER_MOVEMENT_STATE_VERTICAL_STAGE = 1;
var HELPER_MOVEMENT_STATE_JUMP_STAGE = 2;
var HELPER_MOVEMENT_STATE_ATTACK_STAGE = 3;
var HELPER_MOVEMENT_STATE_KILL_STAGE = 4;
var HELPER_MOVEMENT_STATE_FINISHED_STAGE = 5;

function HelperMovementState() {
	HelperState.call(this);

	this.stage = HELPER_MOVEMENT_STATE_HORIZONTAL_STAGE;
	this.addMessage("Welcome! I will guide you through playing Wing Warrior.");
	this.addMessage("To skip this explanation, press in order the keys: ");
	this.addMessage("Left Arrow, Up Arrow, Space Bar, Z. Enemies will spawn.");
	this.addMessage("The objective of this game is to achieve 1000 points.");
	this.addMessage("Are you up for it? Just follow my orders if so.");
	this.addMessage("Use the left/right arrow keys to move horizontally.");
}

HelperMovementState.prototype = Object.create(HelperState.prototype);

HelperMovementState.prototype.notify = function(type) {
	if(this.stage == HELPER_MOVEMENT_STATE_FINISHED_STAGE)
		return;

	switch(type) {
		case HELPER_NOTIFY_HORIZONTAL_MOVEMENT:
			if(this.stage == HELPER_MOVEMENT_STATE_HORIZONTAL_STAGE) {
				this.stage = HELPER_MOVEMENT_STATE_VERTICAL_STAGE;

				this.addMessage("Good job!");
				this.addMessage("Try moving vertically now with the other arrow keys!");
			}
			break;
		case HELPER_NOTIFY_VERTICAL_MOVEMENT:
			if(this.stage == HELPER_MOVEMENT_STATE_VERTICAL_STAGE) {
				this.stage = HELPER_MOVEMENT_STATE_JUMP_STAGE;

				this.addMessage("Woo, great job!");
				this.addMessage("Now try jumping with the space bar.");
				this.addMessage("While you're in the air, you can't take damage.");
			}
			break;
		case HELPER_NOTIFY_JUMP:
			if(this.stage == HELPER_MOVEMENT_STATE_JUMP_STAGE) {
				this.stage = HELPER_MOVEMENT_STATE_ATTACK_STAGE;

				this.addMessage("Jumping is a great way to avoid being hit by enemies.");
				this.addMessage("Now try attacking! Use the Z key!");
			}
			break;
		case HELPER_NOTIFY_ATTACK:
			if(this.stage == HELPER_MOVEMENT_STATE_ATTACK_STAGE) {
				this.stage = HELPER_MOVEMENT_STATE_KILL_STAGE;

				this.addMessage("Amazing! Now you can be the world's greatest Wing Warrior!");
				this.addMessage("I have unlocked the Stadium's doors. They're to the sides.");
				this.addMessage("Kill enough enemies to get 1000 points and win!");
				spawner.run();
			}
			break;
		case HELPER_NOTIFY_ORC_KILL:
			if(this.stage == HELPER_MOVEMENT_STATE_KILL_STAGE) {
				this.stage = HELPER_MOVEMENT_STATE_FINISHED_STAGE;

				this.addMessage("You've killed your first enemy!");
				this.addMessage("It awarded you one point!");
				this.addMessage("Sometimes enemies drop items you can pick up.");
			}
			break;
	}
}

function HelperSingleTimeState() {
	HelperState.call(this);

	this.gotHealth = false;
	this.gotJump = false;
	this.gotSpeed = false;
	this.gotOrb = false;
	this.specialAttacked = false;
	this.gotFlak = false;
	this.gotWings = false;
	this.hasWon = false;
	this.hasLost = false;
}

HelperSingleTimeState.prototype = Object.create(HelperState.prototype);

HelperSingleTimeState.prototype.notify= function(type) {
	switch(type) {
		case HELPER_NOTIFY_DROP_HEALTH:
			if(!this.gotHealth)
				this.addMessage("Acquiring a health pack grants you some life points.");
			this.gotHealth = true;
			break;
		case HELPER_NOTIFY_DROP_JUMP:
			if(!this.gotJump)
				this.addMessage("This drop will grant you a higher jump height.");
			this.gotJump = true;
			break;
		case HELPER_NOTIFY_DROP_SPEED:
			if(!this.gotSpeed)
				this.addMessage("This drop will grant you a higher speed.");
			this.gotSpeed = true;
			break;
		case HELPER_NOTIFY_DROP_ORB:
			if(!this.gotOrb) {
				this.addMessage("You just picked up 3 orbs! Use them by pressing X.");
				this.addMessage("They're excellent to destroy huge swarms.");
				this.gotOrb = true;
			}
			break;
		case HELPER_NOTIFY_DROP_FLAK:
			if(!this.gotFlak) {
				this.addMessage("You just picked up flak ammo!");
				this.addMessage("Press space when flying to use it.");
				this.gotFlak = true;
			}
			break;
		case HELPER_NOTIFY_DROP_WINGS:
			if(!this.gotWings) {
				this.addMessage("You just picked up a pair of wings!");
				this.addMessage("This enables you to _FLY_!");
				this.addMessage("You might need a few more speed/jump upgrades though!");
				this.addMessage("I'll get back to you once you have them.");
				this.gotWings = true;
			}
			break;
		case HELPER_NOTIFY_SPECIAL_ATTACK:
			if(!this.specialAttacked) {
				this.addMessage("There you go! Orb fired!");
				this.addMessage("Note that they deal more damage when they're moving slow.");
				this.specialAttacked = true;
			}
			break;
		case HELPER_NOTIFY_WIN:
			if(!this.hasWon) {
				this.addMessage("You have won! Congratulations!");
				this.addMessage("Feel free to keep playing for however long you wish.");
				this.addMessage("If you wish to restart, let your enemies kill you.");
				this.hasWon = true;
			}
			break;
		case HELPER_NOTIFY_LOSS:
			if(!this.hasLost) {
				if(typeof ga !== 'undefined') {
					ga('send', 'event', 'Game', 'Score', 'Points', this.points);
					ga('send', 'timing', 'Game', 'Play Time', Date.now() - startTime);
				}
				this.hasLost = true;
			}
			break;
	}
}

function HelperFlyState() {
	HelperState.call(this);

	this.frame = 0;

	this.hasFlown = false;
	this.hasAlternated = false;
	this.hasFlakked = false;

	this.hasWings = false;
	this.jumpUpgrades = 0;
	this.speedUpgrades = 0;
}

HelperFlyState.prototype = Object.create(HelperState.prototype);

HelperFlyState.prototype.tick = function() {
	if(this.frame % 1000 == 0) {
		this.flyMessages();
		this.alternateMessages();
		this.thrustMessages();
	}

	++this.frame;
}

HelperFlyState.prototype.flyMessages = function() {
	if(this.hasWings && this.jumpUpgrades >= 5 && this.speedUpgrades >= 4 && !this.hasFlown) {
		this.addMessage("To fly, run as fast as you can at the top of the field.");
		this.addMessage("Then, when you can't go any faster, jump!");
		this.addMessage("The secret trick is to press X at the top of the jump.");
		this.addMessage("This will make you fly! Good luck!");
		this.addMessage("Make sure your landing area is clear when landing.");
		this.frame = 1;
	}
}

HelperFlyState.prototype.alternateMessages = function() {
	if(this.hasFlown && !this.hasAlternated) {
		this.addMessage("To keep in the air, alternate between pressing Z and X.");
		this.addMessage("This will thrust you forward.");
		this.frame = 1;
	}
}

HelperFlyState.prototype.thrustMessages = function() {
	if(this.hasFlown && !this.hasFlakked && this.hasAlternated) {
		this.addMessage("To fire in the air just press the space bar, try it!");
		this.frame = 1;
	}
}

HelperFlyState.prototype.notify = function(type) {
	switch(type) {
		case HELPER_NOTIFY_FLY:
			if(!this.hasFlown) {
				this.hasFlown = true;
				this.addMessage("Congrulations, you just began to fly!");
				this.alternateMessages();
			}
			break;
		case HELPER_NOTIFY_DROP_WINGS:
			this.hasWings = true;
			this.flyMessages();
			break;
		case HELPER_NOTIFY_DROP_SPEED:
			++this.speedUpgrades;
			this.flyMessages();
			break;
		case HELPER_NOTIFY_DROP_JUMP:
			++this.jumpUpgrades;
			this.flyMessages();
			break;
		case HELPER_NOTIFY_ALTERNATED:
			if(!this.hasAlternated) {
				this.hasAlternated = true;
				this.addMessage("Amazing! Now you just have to figure out how to keep stable!");
				this.addMessage("Tip: don't try to keep off the ground, try to keep level.");
				this.thrustMessages();
			}
			break;
		case HELPER_NOTIFY_FLAK:
			if(!this.hasFlakked) {
				this.hasFlakked = true;
				this.addMessage("YEAAHAAWW!");
			}
			break;
	}
}

function HelperMilitaryState() {
	HelperState.call(this);

	this.orcHasSpawned = false;
	this.bomberHasSpawned = false;
	this.orcKills = 0;
	this.bomberKills = 0;
}

HelperMilitaryState.prototype = Object.create(HelperState.prototype);

HelperMilitaryState.prototype.notify = function(type) {
	switch(type) {
		case HELPER_NOTIFY_ORC_KILL:
			++this.orcKills;

			if(this.orcKills == 5) {
				this.addMessage("Going behind enemies and hitting them is fairly effective.");
			} else if(this.orcKills == 15) {
				this.addMessage("Grouping enemies in a line by going around them in circles");
				this.addMessage("works very well, as your sword can hit multiple ones.");
			}
			break;
		case HELPER_NOTIFY_BOMBER_KILL:
			++this.bomberKills;

			if(this.bomberKills == 1)
				this.addMessage("My personal congratulations on your first bomber kill!");
			break;
		case HELPER_NOTIFY_ORC_SPAWN:
			if(!this.orcHasSpawned) {
				this.orcHasSpawned = true;
				// do nothing, orc spawns are treated by HelperMovementState
			}
			break;
		case HELPER_NOTIFY_BOMBER_SPAWN:
			if(!this.bomberHasSpawned) {
				this.bomberHasSpawned = true;
				this.addMessage("A bomber has just spawned!");
				this.addMessage("It will drop bombs which will destroy anything vertically!");
				this.addMessage("They don't extend horizontally much though.");
				this.addMessage("The only way to destroy bombers is going airborne!");
			}
			break;
	}
}

function HelperKongregateState() {
	HelperState.call(this);

	this.orcKills = 0;
	this.bomberKills = 0;
	this.flightStart = 0;
	this.longestFlight = 0;
}

HelperKongregateState.prototype = Object.create(HelperState.prototype);

HelperKongregateState.prototype.notify = function(type) {
	switch(type) {
		case HELPER_NOTIFY_ORC_KILL:
			++this.orcKills;
			break;
		case HELPER_NOTIFY_BOMBER_KILL:
			++this.bomberKills;
			break;
		case HELPER_NOTIFY_FLY:
			this.flightStart = Date.now();
			break;
		case HELPER_NOTIFY_LANDING:
			var flightTime = Date.now() - this.flightStart;
			if(flightTime > this.longestFlight)
				this.longestFlight = flightTime;

			if(flightTime > 1)
				parent.kongregate.stats.submit("LongestFlight", this.longestFlight);
			break;
		case HELPER_NOTIFY_WIN:
			var winTime = Date.now() - startTime;
			parent.kongregate.stats.submit("WinTime", winTime);
			parent.kongregate.stats.submit("GameComplete", 1);
			break;
		case HELPER_NOTIFY_LOSS:
			parent.kongregate.stats.submit("Points", scorer.getPoints());
			parent.kongregate.stats.submit("OrcKills", this.orcKills);
			parent.kongregate.stats.submit("BomberKills", this.bomberKills);
			parent.kongregate.stats.submit("LongestFlight", this.longestFlight);
			break;
	}
}

function Helper() {
	this.stateMachines = [];
	this.messages = [];
	this.displayedMessages = ["", "", "", ""];
	this.displayedMessagesTimer = 120;
	this.displayedMessagesInterpolation = 0;

	this.stateMachines.push(new HelperMovementState());
	this.stateMachines.push(new HelperSingleTimeState());
	this.stateMachines.push(new HelperFlyState());
	this.stateMachines.push(new HelperMilitaryState());

	if(parent && parent.kongregate)
		this.stateMachines.push(new HelperKongregateState());

	for(var i = 0; i < this.stateMachines.length; ++i) {
		this.fetchMessages(this.stateMachines[i]);
	}
}

Helper.prototype.fetchMessages = function(stateMachine) {
	var message = stateMachine.getNextMessage();
	while(message !== null) {
		this.messages.push(message);
		message = stateMachine.getNextMessage();
		
		if(this.displayedMessagesTimer > 30)
			this.displayedMessagesTimer = 30;
	}
}

Helper.prototype.tick = function() {
	for(var i = 0; i < this.stateMachines.length; ++i) {
		this.stateMachines[i].tick();
		this.fetchMessages(this.stateMachines[i]);
	}

	if(this.displayedMessagesTimer == 0) {
		for(var i = 3; i > 0; --i)
			this.displayedMessages[i] = this.displayedMessages[i-1];

		if(this.messages.length > 0)
			this.displayedMessages[0] = this.messages.shift();
		else
			this.displayedMessages[0] = "";

		this.displayedMessagesTimer = 120;
		this.displayedMessagesInterpolation = 1;
	}

	--this.displayedMessagesTimer;
}

Helper.prototype.draw = function() {
	ctx.fillStyle = 'rgb(0,0,0)'; // set font color
	ctx.font="20px Georgia";

	var t = this.displayedMessagesInterpolation;
	for(var i = 0; i < this.displayedMessages.length; ++i)
		ctx.fillText(this.displayedMessages[i], 20, 200 - i * 30 + t * 30);

	if(t > 0)
		this.displayedMessagesInterpolation -= 0.05;
}

Helper.prototype.notify = function(type) {
	for(var i = 0; i < this.stateMachines.length; ++i) {
		var stateMachine = this.stateMachines[i];

		stateMachine.notify(type);
		this.fetchMessages(stateMachine);
	}
}
