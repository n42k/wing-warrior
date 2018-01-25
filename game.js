var GAME_OBJECT_TYPE_BACKGROUND = 0
var GAME_OBJECT_TYPE_PLAYER = 1;
var GAME_OBJECT_TYPE_ORC = 2;
var GAME_OBJECT_TYPE_DAMAGE_OBJECT = 3;
var GAME_OBJECT_TYPE_DROP = 4;
var GAME_OBJECT_TYPE_BOMBER = 5;

var STATE_PLAYER_WALKING = 0;
var STATE_PLAYER_JUMPING = 1;
var STATE_PLAYER_ATTACKING = 2;
var STATE_PLAYER_FLYING = 3;

var PLAYER_MAX_JUMP_FORCE = 70;
var PLAYER_MAX_SPEED = 0.6;

function Player(inputHandler) {
	GameObject.call(this);

	this.lookingRight = true;
	this.state = STATE_PLAYER_WALKING;
	this.jumpStartY = 0;
	this.frame = 0;
	this.pframe = 0;
	this.ammo = 0;
	this.jumpForce = 10;
	this.speed = 0.2;
	this.wings = false;
	this.flakToFire = 0;
	this.flakAmmo = 0;
	this.flakCooldown = 0;
}

Player.prototype = Object.create(GameObject.prototype);

Player.prototype.getType = function() {
	return GAME_OBJECT_TYPE_PLAYER;
}

Player.prototype.getDragX = function() {
	switch(this.state) {
		case STATE_PLAYER_WALKING:
			return 0.06;
		case STATE_PLAYER_ATTACKING:
			return 0.3;
		default:
			return 0.003;
	}
}

Player.prototype.getDragY = function() {
	switch(this.state) {
		case STATE_PLAYER_WALKING:
			return 0.3;
		case STATE_PLAYER_JUMPING:
			return 0.05;
		case STATE_PLAYER_ATTACKING:
			return 0.3;
		case STATE_PLAYER_FLYING:
			return 0;
	}
}

Player.prototype.getAmmo = function() {
	return this.ammo;
}

Player.prototype.getFlakAmmo = function() {
	return this.flakAmmo;
}

Player.prototype.jump = function(force) {
	this.getAcceleration().setX(0);
	this.getAcceleration().setY(0);
	this.getVelocity().setY(-force);
	this.state = STATE_PLAYER_JUMPING;
	this.jumpStartY = this.getPosition().getY();
	this.setGravity(true);
}

Player.prototype.handleGroundMovement = function() {
	// horizontal movement
	var accX = 0;
	if(inputHandler.isMovingLeft())
		accX -= this.speed;
	if(inputHandler.isMovingRight())
		accX += this.speed;
	this.getAcceleration().setX(accX);
	if(accX != 0) {
		helper.notify(HELPER_NOTIFY_HORIZONTAL_MOVEMENT);
		if(accX > 0)
			this.lookingRight = true;
		else
			this.lookingRight = false;
	}

	// vertical movement
	var accY = 0;
	if(inputHandler.isMovingUp())
		accY -= 1;
	if(inputHandler.isMovingDown())
		accY += 1;
	this.getAcceleration().setY(accY);

	if(accY != 0)
		helper.notify(HELPER_NOTIFY_VERTICAL_MOVEMENT);

	if(this.getPosition().getX() < -2400)
		this.getPosition().setX(-2400);
	else if(this.getPosition().getX() > 2400)
		this.getPosition().setX(2400);

	if(inputHandler.hasJumped()) {
		helper.notify(HELPER_NOTIFY_JUMP);
		playSound("jump.wav");
		this.jump(this.jumpForce);
	}
	else if(inputHandler.hasAttacked()) {
		helper.notify(HELPER_NOTIFY_ATTACK);
		playSound("sword.wav");
		this.state = STATE_PLAYER_ATTACKING;
		this.frame = 0;

		var damageObject;
		if(this.lookingRight)
			damageObject = new DamageObject(DAMAGE_OBJECT_PLAYER_SWORD_R);
		else
			damageObject = new DamageObject(DAMAGE_OBJECT_PLAYER_SWORD_L);

		damageObject.setPosition(this.getPosition());

		if(this.lookingRight)
			damageObject.getPosition().moveX(32);
		else
			damageObject.getPosition().moveX(-32);

		scene.addObject(damageObject);
	} else if(inputHandler.hasSpecialAttacked() && this.ammo > 0) {
		helper.notify(HELPER_NOTIFY_SPECIAL_ATTACK);
		this.state = STATE_PLAYER_ATTACKING;
		this.frame = 0;

		var damageObject;
		if(this.lookingRight)
			damageObject = new DamageObject(DAMAGE_OBJECT_PLAYER_ORB_R);
		else
			damageObject = new DamageObject(DAMAGE_OBJECT_PLAYER_ORB_L);

		damageObject.setPosition(this.getPosition());
		damageObject.getPosition().moveY(-32);

		if(this.lookingRight)
			damageObject.getPosition().moveX(48);
		else
			damageObject.getPosition().moveX(-48);

		scene.addObject(damageObject);

		--this.ammo;
	}
}

Player.prototype.handleJumpingMovement = function() {
	if(this.getPosition().getX() < -2400)
		this.getPosition().setX(-2400);
	else if(this.getPosition().getX() > 2400)
		this.getPosition().setX(2400);

	if(inputHandler.hasSpecialAttacked() &&
	   this.wings &&
	   this.getPosition().getY() < -400 &&
	   Math.abs(this.getVelocity().getY()) < 5) {
	   	helper.notify(HELPER_NOTIFY_FLY);
	   	this.flakToFire = 0;
		this.state = STATE_PLAYER_FLYING;
		this.handleFlyingMovement();
	}
}

Player.prototype.handleFlyingMovement = function() {
	var alternations = inputHandler.getAlternations();

	var side = Math.abs(this.getVelocity().getX())/this.getVelocity().getX();
	if(alternations > 0) {
		helper.notify(HELPER_NOTIFY_ALTERNATED);
		playSound("fly.wav");
		++this.frame;
		this.getAcceleration().setX(side * alternations/4);
	} else this.getAcceleration().setX(0);

	var horizontalSpeed = 0.25 * Math.abs(this.getVelocity().getX())/2;
	var altitude = this.getPosition().getY();
	this.getAcceleration().setY(-0.5 -Math.pow(horizontalSpeed, 2) * (1 + 0.7 * altitude / 1500));

	if(this.getPosition().getX() < -2400) {
		this.getPosition().setX(-2400);
		this.getVelocity().setX(-0.8 * this.getVelocity().getX());
		this.lookingRight = true;
	} else if(this.getPosition().getX() > 2400) {
		this.getPosition().setX(2400);
		this.getVelocity().setX(-0.8 * this.getVelocity().getX());
		this.lookingRight = false;
	}

	if(inputHandler.hasJumped() && this.flakAmmo > 0 && this.flakCooldown < 0) {
		helper.notify(HELPER_NOTIFY_FLAK);
		this.flakToFire += 20;
		this.flakCooldown = 150;
		--this.flakAmmo;
	}
	
	if(this.flakToFire > 0) {
		--this.flakToFire;

		for(var i = 0; i < 6; ++i) {
			var flak = new DamageObject(DAMAGE_OBJECT_PLAYER_FLAK);
			flak.setPosition(this.getPosition());
			flak.setVelocity(this.getVelocity());
			flak.getPosition().moveY(-24);

			if(this.lookingRight) {
				flak.getPosition().moveX(48);
				flak.getVelocity().moveX(16);
			} else {
				flak.getPosition().moveX(-32);
				flak.getVelocity().moveX(-16);
			}

			flak.getVelocity().moveY(5 + -25 * Math.random());

			flak.tick();
			scene.addObject(flak);
		}
	}
}

Player.prototype.damage = function(value) {
	if(this.state == STATE_PLAYER_WALKING || this.state == STATE_PLAYER_ATTACKING)
		GameObject.prototype.damage.call(this, value);
	
	if(this.getHealth() == 0) {
		helper.notify(HELPER_NOTIFY_LOSS);
		lost = true;
	}
}

Player.prototype.tick = function() {
	--this.flakCooldown;
	if(this.isAlive()) {
		switch(this.state) {
			case STATE_PLAYER_WALKING:
				this.handleGroundMovement();
				break;
			case STATE_PLAYER_JUMPING:
				this.handleJumpingMovement();
				break;
			case STATE_PLAYER_FLYING:
				this.handleFlyingMovement();
				break;
		}
	} else {
		this.getAcceleration().setX(0);
		this.getAcceleration().setY(0);
	}

	GameObject.prototype.tick.call(this);

	switch(this.state) {
		case STATE_PLAYER_ATTACKING:
		case STATE_PLAYER_WALKING:
			if(this.getPosition().getY() > -10)
				this.getPosition().setY(-10);
			else if(this.getPosition().getY() < -190)
				this.getPosition().setY(-190);

			this.cameraOffset.setY(-300 - this.getPosition().getY());
			break;
		case STATE_PLAYER_JUMPING:
			if(this.getPosition().getY() > this.jumpStartY) {
				this.getPosition().setY(this.jumpStartY)
				this.state = STATE_PLAYER_WALKING;
				this.getVelocity().setY(0);
				this.setGravity(false);
			}

			var jumpHeight = this.jumpStartY - this.getPosition().getY();

			var height;
			var y0 = -300 - this.getPosition().getY();
			if(jumpHeight < 250)
				height = y0;
			else if(jumpHeight < 600)
				height = y0 * (1 - (jumpHeight - 250) / (600 - 250));
			else
				height = 0;

			this.cameraOffset.setY(height);
			break;
		case STATE_PLAYER_FLYING:
			if(this.getPosition().getY() > -300) {
				helper.notify(HELPER_NOTIFY_LANDING);
				this.state = STATE_PLAYER_JUMPING;
				this.getAcceleration().setX(0);
				this.getAcceleration().setY(0);
			}
			break;
	}

	switch(this.state) {
		case STATE_PLAYER_WALKING:
		case STATE_PLAYER_JUMPING:
		case STATE_PLAYER_FLYING:
			this.frame %= 4;
			break;
		case STATE_PLAYER_ATTACKING:
			if(this.frame == 4)
				this.state = STATE_PLAYER_WALKING;
			break;
	}

	if(this.dead)
		return;

	if(this.state == STATE_PLAYER_WALKING) {
		// hit with orcs
		{
			var objs = scene.getObjectsNear(this, 0, 20, 10);

			var hit = false;
			for(var i = 0; i < objs.length; ++i) {
				var obj = objs[i];

				if(obj.getType() == GAME_OBJECT_TYPE_ORC) {
					hit = true;
					break;
				}
			}

			if(hit) {
				playSound("hit.wav");
				this.damage(20);

				this.jump(30);
				if(Math.abs(this.getVelocity().getX()) < 8) {
					if(this.lookingRight)
						this.getVelocity().setX(8);
					else
						this.getVelocity().setX(-8);
				}
			}
		}

		// hit with drops
		{
			var objs = scene.getObjectsNear(this, 0, 32, 32);

			for(var i = 0; i < objs.length; ++i) {
				var obj = objs[i];

				if(obj.getType() == GAME_OBJECT_TYPE_DROP) {
					playSound("drop.wav");
					switch(obj.getDropType()) {
						case DROP_TYPE_HEALTH:
							helper.notify(HELPER_NOTIFY_DROP_HEALTH);
							this.heal(10);
							break;
						case DROP_TYPE_JUMP:
							helper.notify(HELPER_NOTIFY_DROP_JUMP);
							this.jumpForce += 4;
							if(this.jumpForce > PLAYER_MAX_JUMP_FORCE)
								this.jumpForce = PLAYER_MAX_JUMP_FORCE;
							break;
						case DROP_TYPE_SPEED:
							helper.notify(HELPER_NOTIFY_DROP_SPEED);
							this.speed += 0.04;
							if(this.speed > PLAYER_MAX_SPEED)
								this.speed = PLAYER_MAX_SPEED;
							break;
						case DROP_TYPE_AMMO:
							helper.notify(HELPER_NOTIFY_DROP_ORB);
							this.ammo += 3;
							break;
						case DROP_TYPE_FLAK:
							helper.notify(HELPER_NOTIFY_DROP_FLAK);
							this.flakAmmo += 3;
							break;
						case DROP_TYPE_WINGS:
							helper.notify(HELPER_NOTIFY_DROP_WINGS);
							this.wings = true;
							break;
					}
					obj.remove();
				}
			}
		}
	}
}

Player.prototype.draw = function() {
	ctx.translate(-32, -64);

	var y = 0;

	if(this.state != STATE_PLAYER_FLYING) {
		if(!this.lookingRight)
			y = 128;

		if(this.state == STATE_PLAYER_ATTACKING)
			y += 64;
	} else {
		ctx.rotate(this.angle);
		if(this.lookingRight)
			y = 320;
		else
			y = 256;
	}

	ctx.drawImage(images["archer.png"], this.frame * 64, y, 64, 64, 0, 0, 64, 64);

	if(this.isDead())
		return;

	if(this.state == STATE_PLAYER_WALKING || this.state == STATE_PLAYER_JUMPING) {
		this.pframe += Math.abs(this.getAcceleration().getX());

		if(this.pframe > 2) {
			this.pframe -= 2;
			++this.frame;
		}
	}
	else if(this.state != STATE_PLAYER_FLYING)
		++this.frame;
}

function Orc() {
	GameObject.call(this);

	this.frame = 0;
	this.pframe = 0;
}

Orc.prototype = Object.create(GameObject.prototype);

Orc.prototype.getType = function() {
	return GAME_OBJECT_TYPE_ORC;
}

Orc.prototype.tick = function() {
	var pos = this.getPosition();

	var target = scene.getTracking();
	var tPos = target.getPosition();

	var xDif = tPos.getX() - pos.getX();
	if(xDif > 30)
		this.getAcceleration().setX(0.005);
	else if(xDif < -30)
		this.getAcceleration().setX(-0.005);
	else
		this.getAcceleration().setX(0);

	var yDif = tPos.getY() - pos.getY();
	if(target.state == STATE_PLAYER_JUMPING || target.state == STATE_PLAYER_FLYING)
		yDif = target.jumpStartY - pos.getY();

	if(yDif > 5)
		this.getAcceleration().setY(0.001);
	else if(yDif < -5)
		this.getAcceleration().setY(-0.001);
	else
		this.getAcceleration().setY(0);
	GameObject.prototype.tick.call(this);
}

Orc.prototype.getDragX = function() {
	return 0.005;
}

Orc.prototype.getDragY = function() {
	return 0.005;
}

Orc.prototype.kill = function() {
	helper.notify(HELPER_NOTIFY_ORC_KILL);
	scorer.addPoint();

	var dropType = Drop.getRandomDrop();
	if(dropType !== null) {
		var drop = new Drop(dropType, this.getPosition().getY());
		drop.setPosition(this.getPosition());
		drop.getPosition().moveY(-40);
		scene.addObject(drop);
	}

	this.remove();
}

Orc.prototype.draw = function() {
	ctx.translate(-16, -64);

	var y = 0;
	if(this.getVelocity().getX() < 0)
		y = 64;

	ctx.drawImage(images["orc.png"], this.frame * 32, y, 32, 64, 0, 0, 32, 64);

	this.pframe += Math.abs(this.getVelocity().getX());

	if(this.pframe > 2) {
		this.frame = (++this.frame) % 4;
		this.pframe = this.pframe - 2;
	}
}

function Bomber() {
	GameObject.call(this);
	this.frame = 0;
	this.pframe = 0;
	this.pframeToBomb = 300 + Math.round(300 * Math.random());
}

Bomber.prototype = Object.create(GameObject.prototype);

Bomber.prototype.getType = function() {
	return GAME_OBJECT_TYPE_BOMBER;
}

Bomber.prototype.kill = function() {
	helper.notify(HELPER_NOTIFY_BOMBER_KILL);

	GameObject.prototype.kill.call(this);

	scorer.addPoints(5);

	for(var i = 0; i < 3; ++i) {
		var dropType = Drop.getRandomDrop();
		if(dropType !== null) {
			var drop = new Drop(dropType, -10 -180 * Math.random());
			drop.setPosition(this.getPosition());
			drop.setVelocity(this.getVelocity());
			drop.getVelocity().moveY(-20);
			scene.addObject(drop);
		}
	}

	this.setGravity(true);
}

Bomber.prototype.dropBomb = function() {
	var bomb = new DamageObject(DAMAGE_OBJECT_ENEMY_BOMB);
	bomb.setPosition(this.getPosition());
	bomb.getPosition().moveY(96);
	scene.addObject(bomb);
	this.pframeToBomb = this.pframe + Math.round(300 + 300 * Math.random());
}

Bomber.prototype.tick = function() {
	GameObject.prototype.tick.call(this);

	if(this.getPosition().getY() > 32)
		this.remove();

	if(this.pframe < 300)
		return;

	if(this.getPosition().getX() < -2400) {
		this.getPosition().setX(-2400);
		this.getVelocity().setX(-this.getVelocity().getX());
	} else if(this.getPosition().getX() > 2400) {
		this.getPosition().setX(2400);
		this.getVelocity().setX(-this.getVelocity().getX());
	}

	if(this.pframe == this.pframeToBomb)
		this.dropBomb();
}

Bomber.prototype.draw = function() {
	var y = 0;
	if(this.getVelocity().getX() > 0)
		y = 64;

	ctx.drawImage(images["bomber.png"], 64 * this.frame, y, 64, 64, -32, -64, 64, 64);

	++this.pframe;
	if(this.pframe % 3 == 0)
		this.frame = (++this.frame) % 4;
}


var DAMAGE_OBJECT_PLAYER_SWORD_R = 0;
var DAMAGE_OBJECT_PLAYER_SWORD_L = 1;
var DAMAGE_OBJECT_PLAYER_ORB_R = 2;
var DAMAGE_OBJECT_PLAYER_ORB_L = 3;
var DAMAGE_OBJECT_ENEMY_BOMB = 4;
var DAMAGE_OBJECT_ENEMY_EXPLOSION = 5;
var DAMAGE_OBJECT_PLAYER_FLAK = 6;

function DamageObject(type) {
	GameObject.call(this);
	this.type = type;
	this.frame = 0;
	this.pframe = 0;

	this.afterSetup();
}

DamageObject.prototype = Object.create(GameObject.prototype);

DamageObject.prototype.getType = function() {
	return GAME_OBJECT_TYPE_DAMAGE_OBJECT;
}

DamageObject.prototype.afterSetup = function() {
	switch(this.type) {
		case DAMAGE_OBJECT_PLAYER_ORB_R:
			this.getAcceleration().setX(0.1);
			break;
		case DAMAGE_OBJECT_PLAYER_ORB_L:
			this.getAcceleration().setX(-0.1);
			break;
		case DAMAGE_OBJECT_ENEMY_BOMB:
			playSound("falling.wav");
			this.getAcceleration().setY(0.005);
			break;
		case DAMAGE_OBJECT_PLAYER_FLAK:
			this.setGravity(true);
			break;
	}
}

DamageObject.prototype.getObjectsNearIf = function(obj, cond, xDif, yDif) {
	if(cond)
		return scene.getObjectsNear(obj, 0, xDif, yDif);
	else
		return null;
}

DamageObject.prototype.damageObjects = function(objs, val) {
	for(var i = 0; i < objs.length; ++i) {
		var obj = objs[i];

		if(obj.getType() == GAME_OBJECT_TYPE_ORC)
			obj.damage(val);
	}
}

DamageObject.prototype.tick = function() {
	switch(this.type) {
		case DAMAGE_OBJECT_PLAYER_FLAK:
		case DAMAGE_OBJECT_ENEMY_BOMB:
		case DAMAGE_OBJECT_PLAYER_ORB_R:
		case DAMAGE_OBJECT_PLAYER_ORB_L:
			GameObject.prototype.tick.call(this);
			break;
	}

	switch(this.type) {
		case DAMAGE_OBJECT_PLAYER_SWORD_R:
		case DAMAGE_OBJECT_PLAYER_SWORD_L:
			var objs = this.getObjectsNearIf(this, this.frame == 4, 32, 32);
			if(objs !== null) {
				this.damageObjects(objs, 20);
				this.remove();
			}
			break;
		case DAMAGE_OBJECT_PLAYER_FLAK:
			var hit = false;
			var objs = this.getObjectsNearIf(this, true, 32, 32);
			for(var i = 0; i < objs.length; ++i) {
				var obj = objs[i];

				if(obj.getType() == GAME_OBJECT_TYPE_ORC || obj.getType() == GAME_OBJECT_TYPE_BOMBER) {
					obj.damage(100);
					hit = true;
				}
			}

			if(hit || this.frame > 200)
				this.remove();
			break;
		case DAMAGE_OBJECT_PLAYER_ORB_R:
		case DAMAGE_OBJECT_PLAYER_ORB_L:
			var objs = this.getObjectsNearIf(this, true, 40, 40);
			if(objs !== null)
				this.damageObjects(objs, 3);

			if(this.frame > 200)
				this.remove();
			break;
		case DAMAGE_OBJECT_ENEMY_BOMB:
			if(this.getPosition().getY() > -150) {
				playSound("explosion.wav");

				var explosion = new DamageObject(DAMAGE_OBJECT_ENEMY_EXPLOSION);
				explosion.setPosition(this.getPosition());
				explosion.getPosition().setY(0);
				scene.addObject(explosion);

				this.remove();
			}
			break;
		case DAMAGE_OBJECT_ENEMY_EXPLOSION:
			var objs = scene.getObjectsNear(this, 0, 32, 320);
			for(var i = 0; i < objs.length; ++i) {
				var obj = objs[i];

				if(obj.getType() == GAME_OBJECT_TYPE_PLAYER)
					obj.damage(8);
			}

			if(this.frame == 4)
				this.remove();
			break;
	}
}

DamageObject.prototype.draw = function() {
	var x = 0;
	var y = 0;
	var w = 32;
	var h = 64;
	var dx = 0;
	var dy = 0;
	var dw = 32;
	var dh = 64;

	switch(this.type) {
		case DAMAGE_OBJECT_PLAYER_SWORD_R:
			y += 64;
		case DAMAGE_OBJECT_PLAYER_SWORD_L:
			dx -= 16;
			dy -= 64;
			x = this.frame * 32;
			this.pframe += 0.8;
			break;
		case DAMAGE_OBJECT_PLAYER_ORB_L:
		case DAMAGE_OBJECT_PLAYER_ORB_R:
			x = 128;
			w = 48;
			h = 48;
			dw = 48;
			dh = 48;
			dx = -24;
			dy = -24;
			++this.pframe;
			break;
		case DAMAGE_OBJECT_ENEMY_BOMB:
			x = 128;
			y = 64;
			w = 32;
			h = 128;
			dx = -16;
			dy = -128;
			dw = 32;
			dh = 128;
			break;
		case DAMAGE_OBJECT_ENEMY_EXPLOSION:
			x = this.frame * 32;
			y = 128;
			w = 32;
			h = 160;
			dx = -16;
			dy = -128;
			dw = 32;
			dh = 160;
			this.pframe += 0.5;
			break;
		case DAMAGE_OBJECT_PLAYER_FLAK:
			x = 128;
			y = 224;
			w = 16;
			h = 8;
			dx = -8;
			dy = -4;
			dw = 8;
			dh = 4;
			++this.pframe;
			break;
	}

	switch(this.type) {
		case DAMAGE_OBJECT_PLAYER_ORB_L:
			var pos = this.getPosition().getX();
			ctx.rotate(pos/100);
			break;
		case DAMAGE_OBJECT_PLAYER_ORB_R:
			var pos = this.getPosition().getX();
			ctx.rotate(pos/100);
			break;
		case DAMAGE_OBJECT_ENEMY_EXPLOSION:
			ctx.scale(2, 2);
			break;
		case DAMAGE_OBJECT_PLAYER_FLAK:
			ctx.rotate(this.frame/4);
			break;
	}

	ctx.drawImage(images["damageObjects.png"], x, y, w, h, dx, dy, dw, dh);

	if(this.pframe >= 1) {
		++this.frame;
		this.pframe = this.pframe - 1;
	}
}

var DROP_TYPE_HEALTH = 0;
var DROP_TYPE_JUMP = 1;
var DROP_TYPE_SPEED = 2;
var DROP_TYPE_AMMO = 3;
var DROP_TYPE_FLAK = 4;
var DROP_TYPE_WINGS = 5;

function Drop(type, groundY) {
	GameObject.call(this);
	this.type = type;
	this.groundY = groundY;
	this.getVelocity().setY(-30);
	this.getVelocity().setX(-5 + Math.random() * 10);
	this.setGravity(true);
}

Drop.getRandomDrop = function() {
	var random = Math.random();

	if(random < 0.2)
		return DROP_TYPE_HEALTH;
	else if(random < 0.27)
		return DROP_TYPE_JUMP;
	else if(random < 0.34)
		return DROP_TYPE_SPEED;
	else if(random < 0.39)
		return DROP_TYPE_AMMO;
	else if(random < 0.44)
		return DROP_TYPE_FLAK;
	else if(random < 0.46)
		return DROP_TYPE_WINGS;
	else return null;
}

Drop.prototype = Object.create(GameObject.prototype);

Drop.prototype.getType = function() {
	return GAME_OBJECT_TYPE_DROP;
}

Drop.prototype.getDropType = function() {
	return this.type;
}

Drop.prototype.draw = function() {
	ctx.drawImage(images["drops.png"], this.type * 32, 0, 32, 32, -16, -32, 32, 32);
}

Drop.prototype.getDragX = function() {
	if(this.getGravity() > 0)
		return 0;
	return 0.05;
}

Drop.prototype.tick = function() {
	GameObject.prototype.tick.call(this);
	if(this.groundY < this.getPosition().getY()) {
		this.setGravity(false);
		this.getPosition().setY(this.groundY);
	}

	if(this.getPosition().getX() < -2400)
		this.getPosition().setX(-2400);
	else if(this.getPosition().getX() > 2400)
		this.getPosition().setX(2400);
}

function Background() {
	GameObject.call(this);
}

Background.prototype = Object.create(GameObject.prototype);

Background.prototype.getType = function() {
	return GAME_OBJECT_TYPE_BACKGROUND;
}

Background.prototype.draw = function() {
	ctx.scale(2, 2);
	ctx.drawImage(images["background.png"], -1600, -2000);
}

Background.prototype.tick = function() {};

function Spawner() {
	this.frame = 0;
	this.running = false;
}

Spawner.prototype.run = function() {
	this.running = true;
}

Spawner.prototype.spawnOrc = function() {
	if(typeof ga !== 'undefined')
		ga('send', 'event', 'Game', 'Spawn', 'Orc');

	helper.notify(HELPER_NOTIFY_ORC_SPAWN);

	var orc = new Orc();

	if(Math.random() > 0.5)
		orc.getPosition().setX(-3000);
	else
		orc.getPosition().setX(3000);

	orc.getPosition().setY(-10 - (180 * Math.random()));

	scene.addObject(orc);
}

Spawner.prototype.spawnBomber = function() {
	helper.notify(HELPER_NOTIFY_BOMBER_SPAWN);

	var bomber = new Bomber();
	if(Math.random() > 0.5) {
		bomber.getPosition().setX(-3000);
		bomber.getVelocity().setX(3);
	} else {
		bomber.getPosition().setX(3000);
		bomber.getVelocity().setX(-3);
	}

	bomber.getPosition().setY(-400 -600 * Math.random());
	scene.addObject(bomber);
}

Spawner.prototype.tick = function() {
	if(!this.running)
		return;

	if(this.frame % Math.max(1, 200 - 18 * Math.round(Math.log2(scorer.getPoints()))) == 0)
		this.spawnOrc();

	if(this.frame > 5000 && scorer.getPoints() >= 40 && this.frame % 600 == 0)
		this.spawnBomber();

	++this.frame;
}

function Scorer() {
	this.points = 0;
}

Scorer.prototype.addPoint = function() {
	this.addPoints(1);
}

Scorer.prototype.addPoints = function(count) {
	if(count <= 0)
		return;

	this.points += count;

	if(this.points >= 1000) {
		helper.notify(HELPER_NOTIFY_WIN);
		won = true;
	}
}

Scorer.prototype.getPoints = function(points) {
	return this.points;
}

// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// THIS FILE HAS 1000 LINES OF CODE, I PROMISE YOU
// n42k
