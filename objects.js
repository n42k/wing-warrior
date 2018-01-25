function Vector2D() {
	this.x = 0;
	this.y = 0;
}

Vector2D.prototype.getX = function() {
	return this.x;
}

Vector2D.prototype.getY = function() {
	return this.y;
}

Vector2D.prototype.setX = function(x) {
	this.x = x;
}

Vector2D.prototype.setY = function(y) {
	this.y = y;
}

Vector2D.prototype.moveX = function(dif) {
	this.x += dif;
}

Vector2D.prototype.moveY = function(dif) {
	this.y += dif;
}

Vector2D.prototype.lerp = function(vec2, t) {
	var x = vec2.getX();
	var y = vec2.getY();

	this.x = this.x + (x - this.x) * t;
	this.y = this.y + (y - this.y) * t;
}

Vector2D.prototype.clone = function() {
	var vec = new Vector2D();
	vec.setX(this.x);
	vec.setY(this.y);
	return vec;
}

function Camera() {
	this.vec = new Vector2D();
}

Camera.prototype.get = function() {
	return this.vec;
}

Camera.prototype.getX = function() {
	return this.vec.getX();
}

Camera.prototype.getY = function() {
	return this.vec.getY();
}

Camera.prototype.setX = function(x) {
	this.vec.setX(x);
}

Camera.prototype.setY = function(y) {
	this.vec.setY();
}

Camera.prototype.set = function(vec) {
	this.vec = vec.clone();
}

function Scene() {
	this.tracking = null;
	this.camera = new Camera();
	this.objs = [];
	this.objsToAdd = [];
}

Scene.prototype.getTracking = function() {
	return this.tracking;
}

Scene.prototype.setTracking = function(obj) {
	this.tracking = obj;
}

Scene.prototype.getCamera = function() {
	return this.camera;
}

Scene.prototype.getObjects = function() {
	return this.objs;
}

Scene.prototype.addObject = function(obj) {
	this.objsToAdd.push(obj);
}

Scene.prototype.tick = function() {
	// move camera towards tracking point
	if(this.tracking !== null) {
		var pos = this.tracking.getPosition().clone();
		var offset = this.tracking.getCameraOffset();

		pos.moveX(offset.getX());
		pos.moveY(offset.getY());

		this.camera.get().lerp(pos, 0.4);
	}

	// process each object individually
	for(var i = 0; i < this.objs.length; ++i) {
		var obj = this.objs[i];

		obj.tick();

		if(obj.isRemoved()) {
			this.objs.splice(i, 1);
			--i;
			continue;
		}
	}

	// at the end of the tick, add all objects to add
	for(var i = 0; i < this.objsToAdd.length; ++i) {
		var obj = this.objsToAdd[i];
		this.objs.push(obj);
	}

	this.objsToAdd = [];
}

Scene.prototype.getObjectsNear = function(obj, objType, xDif, yDif) {
	var pos = obj.getPosition();
	var x = pos.getX();
	var y = pos.getY();

	var objs = [];

	for(var i = 0; i < this.objs.length; ++i) {
		var o = this.objs[i];

		var oPos = o.getPosition();
		var oX = oPos.getX();
		var oY = oPos.getY();

		if(Math.abs(x - oX) < xDif && Math.abs(y - oY) < yDif)
			objs.push(o);
	}
	return objs;
}

function GameObject() {
	this.position = new Vector2D();
	this.velocity = new Vector2D();
	this.acceleration = new Vector2D();
	this.cameraOffset = new Vector2D();
	this.gravity = false;
	this.removed = false;
	this.health = 100;
	this.dead = false;
}

GameObject.prototype.setPosition = function(vec) {
	this.position.setX(vec.getX());
	this.position.setY(vec.getY());
}

GameObject.prototype.setVelocity = function(vec) {
	this.velocity.setX(vec.getX());
	this.velocity.setY(vec.getY());
}

GameObject.prototype.getPosition = function() {
	return this.position;
}

GameObject.prototype.getVelocity = function() {
	return this.velocity;
}

GameObject.prototype.getAcceleration = function() {
	return this.acceleration;
}

GameObject.prototype.getMaxHealth = function() {
	return 100;
}

GameObject.prototype.getDragX = function() {
	return 0;
}

GameObject.prototype.getDragY = function() {
	return 0;
}

GameObject.prototype.isRemoved = function() {
	return this.removed;
}

GameObject.prototype.remove = function() {
	this.removed = true;
}

GameObject.prototype.setGravity = function(val) {
	this.gravity = val;
}

GameObject.prototype.getGravity = function() {
	if(this.gravity)
		return 1;
	return 0;
}

GameObject.prototype.kill = function() {
	this.dead = true;
}

GameObject.prototype.isAlive = function() {
	return !this.isDead();
}

GameObject.prototype.isDead = function() {
	return this.dead;
}

GameObject.prototype.damage = function(value) {
	if(value > 0) {
		this.setHealth(this.getHealth() - value);
		if(this.getHealth() == 0 && this.isAlive())
			this.kill();
	}

}

GameObject.prototype.heal = function(value) {
	if(value > 0)
		this.setHealth(this.getHealth() + value);
}

GameObject.prototype.setHealth = function(value) {
	if(value > this.getMaxHealth())
		this.health = this.getMaxHealth();
	else if(value < 0)
		this.health = 0;
	else
		this.health = value;
}

GameObject.prototype.getHealth = function() {
	return this.health;
}

GameObject.prototype.getCameraOffset = function() {
	return this.cameraOffset;
}

GameObject.prototype.getType = function() {
	return null;
}

GameObject.prototype.tick = function() {
	var FX = this.acceleration.getX() - this.getDragX() * this.velocity.getX();
	var FY = this.acceleration.getY() - this.getDragY() * this.velocity.getY() + this.getGravity();

	this.velocity.moveX(FX);
	this.velocity.moveY(FY);

	this.position.moveX(this.velocity.getX());
	this.position.moveY(this.velocity.getY());
}

GameObject.prototype.draw = function() {
}
