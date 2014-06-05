//Lazy Loading, with special  thanks to Arnelle Balane
var startBG = document.createElement("img");
startBG.src = "img/start.png";
startBG.onload = function() {
	document.getElementById("start").style.backgroundImage = "url(" + startBG.src + ")";
	var instructionsBG = document.createElement("img");
	instructionsBG.src = "img/instructions.png";
	instructionsBG.onload = function() {
		document.getElementById("instructions").style.backgroundImage = "url(" + instructionsBG.src + ")";
		var gameOverBG = document.createElement("img");
		gameOverBG.src = "img/gameover.png";
		gameOverBG.onload = function() {
			document.getElementById("gameOver").style.backgroundImage = "url(" + gameOverBG.src + ")";
			document.getElementById("intro").play();
			document.getElementById("wrapper").style.opacity = "1";
			document.getElementById("loadText").style.display =  "none";
		}
	}
}

//Image Repository
var imageRepository = new function() {
	//Define images
	this.background = new Image();
	this.nerd = new Image();
	this.number = new Image();

	//Ensure all images are loaded
	var numImages = 3;
	var numLoaded = 0;

	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.nerd.onload = function() {
		imageLoaded();
	}
	this.number.onload = function() {
		imageLoaded();
	}

	//Set resources
	this.background.src = "img/bg.png";
	this.nerd.src = "img/nerd.png";
	this.number.src = "img/number.png";
}

//Create random number generator 
function getRandomNumber() {
	return Math.floor(Math.random() * 21) + 10;
}

//Drawables
function Drawable() {
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	this.draw = function() {
	};
}

//Create Background Object
function Background() {
	this.speed = 2;
	this.draw = function() {
		this.x -= this.speed;
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.context.drawImage(imageRepository.background, this.x, this.y);
		this.context.drawImage(imageRepository.background, this.x - this.canvasWidth, this.y);

		if (this.x <= 0) {
			this.x = this.canvasWidth;
		}
	}
}
//Set Background to inherit Drawable
Background.prototype = new Drawable();

//Create Nerd Object
function Nerd() {
	this.speed = 10;
	this.score = 0;
	this.temp = 0;
	this.alive = true;
	this.goal = getRandomNumber();
	this.tracker = 0;

	this.setTemp = function(value) {
			this.temp += value;
	};

	this.checkScore = function() {
		return (this.temp == this.goal);
	};

	this.getX = function() {
		return this.x;
	};

	this.getY = function() {
		return this.y;
	};

	this.draw = function() {
		if (this.alive) {
			this.context.drawImage(imageRepository.nerd, this.x, this.y);
		}
	};

	this.move = function() {
		if (KEY_STATUS.up || KEY_STATUS.down || KEY_STATUS.space) {
			this.context.clearRect(this.x, this.y, this.width, this.height);
			if (KEY_STATUS.up) {
				this.y -= this.speed;
				if (this.y <= 0) {
					this.y = 0;
				}
			} else if (KEY_STATUS.down) {
				this.y += this.speed;

				if (this.y >= 290) {
					this.y = 290;
				}
			} else if (KEY_STATUS.space) {
				this.draw();
				if(this.checkScore()) {
					game.yay.get();
					this.score += 10;
					this.goal = getRandomNumber();
					this.temp = 0;
				} else {
					if (this.temp > this.goal) {
						this.tracker = this.temp;
						this.alive = false; // game over
					}
				}
			}
			this.draw();
		}
	};
}
//Set Nerd to inherit Drawable
Nerd.prototype = new Drawable();

//Create Number Object
function Num() {
	this.speed = 5;
	this.value = 0;
	this.alive = false;
	this.prev;

	this.spawn = function(x, y, value) {
		this.x = x + 750;
		this.y = y + 5;
		this.value = value;
		this.alive = true;
		this.prev = -1;
	};

	this.setValue = function(value) {
		this.value = value;
	};

	this.clear = function() {
		this.context.clearRect(this.x, this.y, imageRepository.number.width + 7, imageRepository.number.height);
		this.x = 0;
		this.y = 0;
		this.value = 0;
		this.alive = false;
	};

	this.collide = function(nerdX, nerdY, prev) {
			if (this.prev != prev) {
				if (nerdX < this.x + imageRepository.number.width && nerdX + imageRepository.nerd.width - 10 > this.x &&
						nerdY < this.y + imageRepository.number.height - 10 && nerdY + imageRepository.nerd.height - 10 > this.y) {
					this.prev = prev;
					game.ding.get();
					return this.value;
				}
			}
	};

	this.draw = function() {
		if (this.alive) {
			this.x -= this.speed;
			this.context.clearRect(this.x, this.y, imageRepository.number.width + 7, imageRepository.number.height);
			this.context.drawImage(imageRepository.number, this.x, this.y);
			this.context.font = "30px LiquidCrystal, Calibri, sans-serif";
			this.context.fillStyle = "#00f";
			this.context.fillText(this.value, this.x + 15, this.y + 33);

			if (this.x <= -41) {
				this.alive = false;
			}
		}
	};
}
//Set Number to inherit drawable
Num.prototype = new Drawable();

//Create the object pool for numbers
function Pool(max) {
	this.size = max;
	this.pool = [];

	this.init = function() {
		for (var i = 0; i < this.size; i++) {
			var number = new Num();
			this.pool[i] = number;
		}
	};

	this.animate = function() {
		var multiplierX = 11;
		var multiplierY = 8;
		for (var i = 0; i < this.pool.length; i++) {
			if (this.pool[i].alive) {
				this.pool[i].draw();
				var setVal = this.pool[i].collide(game.nerd.getX(), game.nerd.getY(), i);
				if (setVal > 0) {
					game.nerd.setTemp(setVal);
					this.pool[i].clear();
				}
			} else {
				var chance = Math.floor(Math.random() * 101);
				if (chance <= 30) {
					if (multiplierX == 1) {
						multiplierX = 11;
					}
					if (multiplierY == 1) {
						multiplierY = 8;
					}
					var value = Math.floor(Math.random() * 5 + 1);
					var numberX = (Math.floor(Math.random() * multiplierX) * 50);
					var numberY = (Math.floor(Math.random() * multiplierY) * 50);
					multiplierX--;
					multiplierY--;
					this.pool[i].spawn(numberX, numberY, value);
				}
			}
		}
	};
}

//Create Game function;
function Game() {
	this.init = function() {
		this.bgCanvas = document.getElementById("background");
		this.nerdCanvas = document.getElementById("nerd");
		this.numberCanvas = document.getElementById("number");

		 // Audio files
			this.ding = new SoundPool(10);
			this.ding.init("ding");
			this.yay = new SoundPool(10);
			this.yay.init("yay");
			this.backgroundAudio = new Audio("sounds/spacenerd.mp3"); //music by tannerhellard.com
			this.backgroundAudio.loop = true;
			this.backgroundAudio.volume = .25;
			this.backgroundAudio.load();
			this.gameOverAudio = new Audio("sounds/die.mp3"); //music by tannerhellard.com
			this.gameOverAudio.loop = true;
			this.gameOverAudio.volume = .25;
			this.gameOverAudio.load();
			this.checkAudio = window.setInterval(function(){return (game.backgroundAudio.readyState === 4)},1000);

		if(this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext("2d");
			this.nerdContext = this.nerdCanvas.getContext("2d");
			this.numberContext = this.numberCanvas.getContext("2d");

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			Nerd.prototype.context = this.nerdContext;
			Nerd.prototype.canvasWidth = this.nerdCanvas.width;
			Nerd.prototype.canvasHeight = this.nerdCanvas.height;
			Num.prototype.context = this.numberContext;
			Num.prototype.canvasWidth = this.numberCanvas.width;
			Num.prototype.canvasHeight = this.numberCanvas.height;

			this.background = new Background();
			this.background.init(0, 0);
			this.nerd = new Nerd();
			var nerdX = 20;
			var nerdY = this.nerdCanvas.height / 2 - (imageRepository.nerd.height / 2);
			this.nerd.init(nerdX, nerdY, imageRepository.nerd.width, imageRepository.nerd.height);
			this.numberPool = new Pool(10);
			this.numberPool.init();

			return true;
		} else {
			return false;
		}
	};

	this.start = function() {
		document.getElementById("intro").pause();
		if (game.backgroundAudio.readyState === 4) {
			window.clearInterval(game.checkAudio);
			game.gameOverAudio.pause();
			game.backgroundAudio.play();
			document.getElementById("start").style.display = "none";
			document.getElementById("instructions").style.display = "none";
			document.getElementById("screen").style.display = "block";
			this.nerd.draw();
			animate();
		}
	};

	this.restart = function() {
		document.getElementById("gameOver").style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.nerdContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.numberContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
			this.background = new Background();
		this.background.init(0,0);
			this.nerd = new Nerd();
		var nerdX = 20;
		var nerdY = this.nerdCanvas.height / 2 - (imageRepository.nerd.height / 2);
		this.nerd.init(nerdX, nerdY, imageRepository.nerd.width, imageRepository.nerd.height);
		this.nerd.score = 0;
		this.numberPool = new Pool(10);
		this.numberPool.init();
		this.start();
	};

	this.instructions = function() {
		document.getElementById("instructions").style.display = "block";
		document.getElementById("start").style.display = "none";
	};

	this.menu = function() {
		document.getElementById("instructions").style.display = "none";
		document.getElementById("start").style.display = "block";
	}

	this.randomNumber = function() {
		this.randomNum = Math.floor(Math.random() * 43);
	};
}

//Animation Loop
function animate() {
	document.getElementById("randomNum").innerHTML = game.nerd.goal;
	document.getElementById("playerScore").innerHTML = game.nerd.score;	
	if (game.nerd.alive) {
	requestAnimFrame(animate);
	game.background.draw();
	game.numberPool.animate();
	game.nerd.move();
	} else {
		document.getElementById("gameOver").style.display = "block";
		document.getElementById("screen").style.display = "none";
		document.getElementById("tracker").innerHTML = game.nerd.tracker;
		document.getElementById("finalScore").innerHTML = game.nerd.score;	
		game.backgroundAudio.pause();
		game.gameOverAudio.play();
	}
}

window.requestAnimFrame = (function() {
	return window.requestAnimFrame ||
				 window.webkitRequestAnimationFrame ||
				 window.mozRequestAnimationFrame ||
				 window.oRequestAnimationFrame ||
				 window.msRequestAnimationFrame ||
				 function(callback, element) {
				 	window.setTimeout(callback, 1000 / 60);
				 };
})();

//Initialize Game
var game = new Game();

function init() {
	if (game.init()) {
	}
}

//Keycode detector (created by D. McInnes)
KEY_CODES = {
	32: "space",
	38: "up",
	40: "down",
}

KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[KEY_CODES[code]] = false;
}

document.onkeydown = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

document.onkeyup = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = false;
	}
}

/**
 * A sound pool to use for the sound effects
 */
function SoundPool(maxSize) {
	var size = maxSize;
	var pool = [];
	this.pool = pool;
	var currSound = 0;

	this.init = function(object) {
		if (object == "ding") {
			for (var i = 0; i < size; i++) {
				// Initalize the sound
				ding = new Audio("sounds/ding.mp3");
				ding.volume = .12;
				ding.load();
				pool[i] = ding;
			}
		} else if (object == "yay") {
				// Initalize the sound
			for (var i = 0; i < size; i++) {
				yay = new Audio("sounds/yay.mp3");
				yay.volume = .40;
				yay.load();
				pool[i] = yay;
			}
		}
	};

	this.get = function() {
		pool[currSound].play();
		currSound = (currSound + 1) % size;
	};
} 