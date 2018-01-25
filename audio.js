function playSound(name) {
	var sound = new Audio("sounds/" + name);
	sound.play();
}

function playSoundReplay(name) {
	var sound = new Audio("sounds/" + name); 
	sound.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
	}, false);
	sound.play();
}

playSoundReplay("music.ogg");
