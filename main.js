var scene;
var spawner, scorer;
var helper;
var startTime;
var lost;
var won;
var requestId; // Thanks to http://stackoverflow.com/a/10748750

function main() {
	if(typeof ga !== 'undefined')
		ga('send', 'pageview', {'sessionControl': 'start'});

	lost = false;
	won = false;
	startTime = Date.now();

	spawner = new Spawner();
	scorer = new Scorer();

	scene = new Scene();

	var background = new Background();
	scene.addObject(background);

	var player = new Player();
	scene.addObject(player);
	scene.setTracking(player);

	helper = new Helper();

	onFrame();
}

function onFrame() {
	spawner.tick();
	scene.tick();
	helper.tick();

	ctx.fillStyle = 'rgb(204,255,255)';
	ctx.fillRect(0,0,canvas.width,canvas.height);

	ctx.save();
	ctx.translate(400, 300);

	var camera = scene.getCamera();
	var cameraX = camera.getX();
	var cameraY = camera.getY();

	var objs = scene.getObjects();

	for(var i = 0; i < objs.length; ++i) {
		var obj = objs[i];
		var x = obj.getPosition().getX();
		var y = obj.getPosition().getY();

		ctx.save();
		ctx.translate(x - cameraX, y - cameraY);
		obj.draw();
		ctx.restore();
	}

	ctx.restore();

	ctx.save();
	helper.draw();
	ctx.restore();

	ctx.save();
	drawGUI();
	ctx.restore();

	requestId = window.requestAnimationFrame(onFrame);
}

function drawGUI() {
	ctx.save();

	// set font color
	ctx.fillStyle = 'rgb(0,0,0)';

	// draw score gui
	ctx.font="30px Georgia";
	ctx.fillText("Score: " + scorer.getPoints(),10,50);

	// draw ammo gui
	ctx.fillText("" + scene.getTracking().getAmmo(), 250, 50);
	ctx.drawImage(images["damageObjects.png"], 128, 0, 48, 48, 250-48, 50-24-10, 48, 48);

	// draw flak ammo gui
	ctx.fillText("" + scene.getTracking().getFlakAmmo(), 360, 50);
	ctx.drawImage(images["damageObjects.png"], 128, 192, 32, 16, 360-32-10, 50-16, 32, 16);

	// draw loss text (if applicable)
	ctx.font = "30px Georgia";
	if(lost) {
		if(won)
			ctx.fillText("YOU HAVE WON! PRESS R TO RESTART!", 80, 350);
		else
			ctx.fillText("YOU HAVE FAILED! PRESS R TO RESTART!", 50, 350);
	}

	// draw hp gui
	var healthPercentage = scene.getTracking().getHealth()/100;
	ctx.fillStyle = 'rgb(255,0,0)';
	ctx.fillRect(430, 10, 360 * healthPercentage, 50);

	ctx.drawImage(images["health.png"], 430, 10);

	ctx.restore();
}

window.onbeforeunload = function () {
	if(typeof ga !== 'undefined')
		ga('set', 'transport', 'beacon');

	helper.notify(HELPER_NOTIFY_LOSS);
	return null;
}

window.onerror = (msg, source, lineno, colno, err) => {
	if(typeof ga !== 'undefined')
		ga('send', 'exception', {'exDescription': msg, 'exFatal': false});
}
