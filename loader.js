var canvas, ctx;

var images = {};

var imagesToLoad = [
	"archer.png",
	"background.png",
	"damageObjects.png",
	"health.png",
	"orc.png",
	"drops.png",
	"bomber.png",
];

var imagesLoaded = 0;

function start() {
	main();
}

function onLoad() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	loadImages();
}

function loadImage() {
	imagesLoaded++;
	if(imagesLoaded == imagesToLoad.length)
		start();
}

function loadImages() {
	for(var i = 0; i < imagesToLoad.length; ++i) {
		var imageName = imagesToLoad[i];

		images[imageName] = new Image();

		var image = images[imageName];
		image.onload = loadImage;
		image.src = "art/" + imageName;
	}
}
