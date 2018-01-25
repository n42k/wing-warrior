var KEYCODE_SPACE = 32;
var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_Z = 90;
var KEYCODE_X = 88;
var KEYCODE_R = 82;

function InputHandler() {
	this.preppinJump = false;
	this.jump = false;
	this.preppinAttack = false;
	this.attack = false;
	this.preppinSpecialAttack = false;
	this.specialAttack = false;

	this.up = false;
	this.left = false;
	this.right = false;
	this.down = false;

	this.alternations = 0;
	this.lastAttackKeyIsZ = false;
	this.lastAttackKeyIsX = false;
}

InputHandler.prototype.hasJumped = function() {
	if(!this.jump)
		return false;

	this.jump = false;
	return true;
}

InputHandler.prototype.hasAttacked = function() {
	this.alternations = 0;
	if(!this.attack)
		return false;

	this.attack = false;
	return true;
}

InputHandler.prototype.hasSpecialAttacked = function() {
	this.alternations = 0;
	if(!this.specialAttack)
		return false;

	this.specialAttack = false;
	return true;
}

InputHandler.prototype.getAlternations = function() {
	var val = this.alternations;
	this.attack = false;
	this.specialAttack = false;
	this.alternations = 0;
	return val;
}

InputHandler.prototype.isMovingUp = function() {
	return this.up;
}

InputHandler.prototype.isMovingLeft = function() {
	return this.left;
}

InputHandler.prototype.isMovingRight = function() {
	return this.right;
}

InputHandler.prototype.isMovingDown = function() {
	return this.down;
}

InputHandler.prototype.handleDown = function(keyCode) {
	switch(keyCode) {
		case KEYCODE_SPACE:
			this.preppinJump = true;
			break;
		case KEYCODE_UP:
			this.up = true;
			break;
		case KEYCODE_LEFT:
			this.left = true;
			break;
		case KEYCODE_RIGHT:
			this.right = true;
			break;
		case KEYCODE_DOWN:
			this.down = true;
			break;
		case KEYCODE_Z:
			this.preppinAttack = true;
			break;
		case KEYCODE_X:
			this.preppinSpecialAttack = true;
			break;
	}
}

InputHandler.prototype.handleUp = function(keyCode) {
	switch(keyCode) {
		case KEYCODE_SPACE:
			if(!this.preppinJump)
				return;
			this.preppinJump = false;
			this.jump = true;
			break;
		case KEYCODE_UP:
			this.up = false;
			break;
		case KEYCODE_LEFT:
			this.left = false;
			break;
		case KEYCODE_RIGHT:
			this.right = false;
			break;
		case KEYCODE_DOWN:
			this.down = false;
			break;
		case KEYCODE_Z:
			if(!this.preppinAttack)
				return;
			this.preppinAttack = false;
			this.attack = true;

			if(this.lastAttackKeyIsX)
				++this.alternations;

			this.lastAttackKeyIsX = false;
			this.lastAttackKeyIsZ = true;
			break;
		case KEYCODE_X:
			if(!this.preppinSpecialAttack)
				return;
			this.preppinSpecialAttack = false;
			this.specialAttack = true;

			if(this.lastAttackKeyIsZ)
				++this.alternations;

			this.lastAttackKeyIsZ = false;
			this.lastAttackKeyIsX = true;
			break;
	}
}

var inputHandler = new InputHandler();

document.addEventListener("keydown", function(event) {
	inputHandler.handleDown(event.keyCode);

	if(lost && event.keyCode == KEYCODE_R) {
		window.cancelAnimationFrame(requestId);
		requestId = undefined;
		main();
	}

	event.preventDefault();
});

document.addEventListener("keyup", function(event) {
	inputHandler.handleUp(event.keyCode);
	event.preventDefault();
});
