var container = document.getElementById("drawField");
var stateBtn = document.getElementById("stateBtn");
var transitionBtn = document.getElementById("transitionBtn");
var mode;
var statePool = new StatePool();
var stateCounter = 0;
var clicks = 0;
var prevClicked = -1;
var startStateTracker;

container.width = window.innerWidth;
container.height = window.innerHeight - 65;

var stage = new Kinetic.Stage({container: "drawField", width: container.width, height: container.height});
var layer = new Kinetic.Layer({width: stage.getWidth(), height: stage.getHeight()});
var layer2 = new Kinetic.Layer({width: stage.getWidth(), height: stage.getHeight()});
stage.add(layer2);
stage.add(layer);
layer2.draw();
layer.draw();

var showDFATools = function(regex) {
	document.getElementById("inputRegexTools").style.transition = "right .6s ease-out";
	document.getElementById("inputRegexTools").style.right = "90%";
	document.getElementById("createDFATools").style.transition = "left .6s ease-out";
	document.getElementById("createDFATools").style.left = "0";
	showTraceTools(regex);
}

var showRegexTools = function() {
	document.getElementById("inputRegexTools").style.transition = "right .6s ease-out";
	document.getElementById("inputRegexTools").style.right = "0";
	document.getElementById("createDFATools").style.transition = "left .6s ease-out";
	document.getElementById("createDFATools").style.left = "90%";
	document.getElementById("traceTools").style.transition = "bottom .6s ease-out";
	document.getElementById("traceTools").style.bottom = "-100%";
	if (stateBtn.classList.contains("active")) {
	stateBtn.classList.toggle("active");
	}
	if (dragBtn.classList.contains("active")) {
		dragBtn.classList.toggle("active");
	}
	if (transitionBtn.classList.contains("active")) {
		transitionBtn.classList.toggle("active");
	}
	if (removeBtn.classList.contains("active")) {
		removeBtn.classList.toggle("active");
	}
}

var showTraceTools = function(regex){
	if (regex != undefined) {
		document.getElementById("display").innerHTML = "<span class='traceLabel' id='regexLabel'>Regular Expression</span><br><span id='regexDisplay'>" + regex + "</span>";
	}
	document.getElementById("traceTools").style.transition = "bottom .6s ease-out";
	document.getElementById("traceTools").style.bottom = "0";
}


function resetStage() {
	statePool = new StatePool();
	stateCounter = 0;
	clicks = 0;
	prevClicked = -1;
	startStateTracker = null;
	stage.clear();
	layer2 = new Kinetic.Layer({width: stage.getWidth(), height: stage.getHeight()});
	layer = new Kinetic.Layer({width: stage.getWidth(), height: stage.getHeight()});
	stage.add(layer2);
	stage.add(layer);
	layer2.draw();
	layer.draw();
	document.getElementById("display").innerHTML = "";
}

function getClickPosition(e) {		
	var points = stage.getPointerPosition();
	var xPosition = points.x;
	var yPosition = points.y;

	if (stateCounter < 0) {
		stateCounter = 0;
	} 
	if (mode == "drawState") {
		if (statePool.checkStatePosition(xPosition, yPosition) == -1) {
			document.getElementById("display").innerHTML = "";
			var state = new State();
			state.init(xPosition, yPosition, stateCounter);
			if (startStateTracker == null && statePool.pool.length == 0) {
				state.setType("start");
			}
			statePool.addState(state);			
			statePool.pool[statePool.pool.length - 1].draw();
			stateCounter++;
		}
		clicks = 0;
	} else if (mode == "drawTransitions") {
		var val = statePool.checkPosition(xPosition, yPosition);
		if (val > -1) {
			document.getElementById("display").innerHTML = "";
			if (clicks == 0) {
				prevClicked = val;
				clicks = 1;
			} else {
				var trans = prompt("Symbol for transition:", "");
				if (trans != null) {
					if (trans == "") {
						trans = "e";
					}
					for (var i = 0; i < trans.length; i++) {
						if (trans.charAt(i) != "a" && trans.charAt(i) != "b" && trans.charAt(i) != "e" && trans.charAt(i) != ",") {
							alert("Can only add string with symbols 'a', 'b', and 'e' (or empty) separated by a comma ','. No spaces allowed.");
							clicks = 0;
							return;
						}
					}
					var symbolArray = trans.split(",");
					for (var i = 0; i < symbolArray.length; i++) {
						
						if (statePool.pool[prevClicked].transitions[symbolArray[i]] != null) {
								statePool.pool[prevClicked].transitions[symbolArray[i]].push(statePool.pool[val]);
						} else {
							
							statePool.pool[prevClicked].transitions[symbolArray[i]] = [];
							statePool.pool[prevClicked].transitions[symbolArray[i]].push(statePool.pool[val]);
						}
					}
					drawAllTransitions();
					clicks = 0;
				} else {
					clicks = 0;
				}
			}
		} else {
			clicks = 0;
		}
	} else if (mode == "dragElements") {
		clicks = 0;
	} else if (mode == "removeElements") {
		var val = statePool.checkPosition(xPosition, yPosition);
		if (val > -1) {
			document.getElementById("display").innerHTML = "";
			if (val == 0) {
				removeTransition(statePool.pool[val]);
				statePool.pool[val].group.destroy();
				statePool.pool.shift();
				for (var i = 0; i < statePool.pool.length; i++){
					statePool.pool[i].group.destroy();
					statePool.pool[i].setIndex(i);
					statePool.pool[i].draw();
				}
			} else if (val == statePool.pool.length - 1) {
				removeTransition(statePool.pool[val]);
				statePool.pool[val].group.destroy();
				statePool.pool.pop();
			} else {
				removeTransition(statePool.pool[val]);
				statePool.pool[val].group.destroy();
				var first = statePool.pool.slice(0, val);
				var second = statePool.pool.slice(val + 1, statePool.pool.length);
				statePool.pool = first.concat(second);				
				for (var i = 0; i < statePool.pool.length; i++){
					statePool.pool[i].group.destroy();
					statePool.pool[i].setIndex(i);
					statePool.pool[i].draw();
				}
			}
			stateCounter--;
			layer.draw();
			drawAllTransitions();
			layer.moveUp();
			clicks = 0;
		}
	}
}

var drawStates = function(e) {
		var groups = stage.find("Group");
		groups.forEach(function(group) {
			group.off("click");
			group.setDraggable(false);
			group.on('mouseover', function() {
	      document.body.style.cursor = 'default';
	    });
    	group.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });
		});
		stateBtn.classList.toggle("active");
		if (stateBtn.classList.contains("active")) {			
			if (transitionBtn.classList.contains("active")) {
				transitionBtn.classList.toggle("active");
			}
			if (dragBtn.classList.contains("active")) {
				dragBtn.classList.toggle("active");
			}
			if (removeBtn.classList.contains("active")) {
				removeBtn.classList.toggle("active");
			}
			mode = "drawState";
			document.body.style.cursor = "default";
			container.addEventListener("click", getClickPosition, false);
		} else {
			container.removeEventListener("click", getClickPosition, false);
		}
}

var drawTransitions = function(e) {
		var groups = stage.find("Group");
		groups.forEach(function(group) {
			group.off("click");
			group.setDraggable(false);
			group.on('mouseover', function() {
	      document.body.style.cursor = 'default';
	    });
    	group.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });
		});
		transitionBtn.classList.toggle("active");
		if (transitionBtn.classList.contains("active")) {
			if (stateBtn.classList.contains("active")) {
				stateBtn.classList.toggle("active");
			}
			if (dragBtn.classList.contains("active")) {
				dragBtn.classList.toggle("active");
			}
			if (removeBtn.classList.contains("active")) {
				removeBtn.classList.toggle("active");
			}
			mode = "drawTransitions";
			clicks = 0;
			document.body.style.cursor = "default";
			container.addEventListener("click", getClickPosition, false);			
		} else {
			container.removeEventListener("click", getClickPosition, false);
			clicks = 0;
		}
}

var dragElements = function(e) {
		var groups = stage.find("Group");
		dragBtn.classList.toggle("active");
		if (dragBtn.classList.contains("active")) {	
			if (stateBtn.classList.contains("active")) {
				stateBtn.classList.toggle("active");
			}
			if (transitionBtn.classList.contains("active")) {
				transitionBtn.classList.toggle("active");
			}
			if (removeBtn.classList.contains("active")) {
				removeBtn.classList.toggle("active");
			}
			mode = "dragElements";
			container.addEventListener("click", getClickPosition, false);
			groups.forEach(function(group) {
				group.off("click");
				group.setDraggable(true);		 
	    	group.off("click");     	
				group.on('mouseover', function() {
		      document.body.style.cursor = 'grab';
		    });
      	group.on('mouseout', function() {
	        document.body.style.cursor = 'default';
	      });
	      group.on("dragstart", function(){
	      	layer2.hide();
	      });
	      group.on("dragend", function() {
	      	var index = this.getId();
	      	var points = stage.getPointerPosition();
	      	statePool.pool[index].updateCoordinates(points.x, points.y);
	      	drawAllTransitions();
	      });
			});
		} else {
			groups.forEach(function(group) {
			group.off("click");
			group.setDraggable(false);
			group.on('mouseover', function() {
	      document.body.style.cursor = 'default';
	    });
    	group.on('mouseout', function() {
        document.body.style.cursor = 'default';
      });
		});
			container.removeEventListener("click", getClickPosition, false);
		}
}

var removeElements = function(e) {
		var groups = stage.find("Group");	
		groups.forEach(function(group) {
			group.setDraggable(false);
			group.on('mouseover', function() {
	      document.body.style.cursor = 'default';
	    });
    	group.on('rightclick', function() {
        document.body.style.cursor = 'default';
      });
		});
		removeBtn.classList.toggle("active");
		if (removeBtn.classList.contains("active")) {	
			if (stateBtn.classList.contains("active")) {
				stateBtn.classList.toggle("active");
			}
			if (transitionBtn.classList.contains("active")) {
				transitionBtn.classList.toggle("active");
			}
			if (dragBtn.classList.contains("active")) {
				dragBtn.classList.toggle("active");
			}			
			mode = "removeElements";
			container.addEventListener("click", getClickPosition, false);
		} else {		
			groups.forEach(function(group) {
				group.on('mouseover', function() {
		      document.body.style.cursor = 'default';
		    });
	    	group.off("click");
			});
			container.removeEventListener("click", getClickPosition, false);
		}
}

function State() {
	this.x = 0;
	this.y = 0;
	this.index;
	this.type;
	this.group;
	this.transitions = {
		"a" : [],
		"b"	: [],
		"e" : []
	}
	this.NFAStates;


	this.setNFAStates = function(states){
		this.NFAStates = states;
	}

	this.getNFAStates = function(){
		return this.NFAStates;
	}

	this.init = function(x, y, index) {
		this.x = x;
		this.y = y;
		this.index = index;		
		this.type = "nonfinal";		
		if (this.index == startStateTracker) {
			this.type = "start";
			startStateTracker = index;
		} else {
			this.type = "nonfinal";
		}
		this.group = new Kinetic.Group({id: this.index});
	};

	this.draw = function() {
		this.group = new Kinetic.Group({id: this.index});
		this.group.setId(this.index);	
		var fill;
		var textFill;
		if (this.type == "final") {
			fill = "#ff007e";
			textFill = "#9CFFE8";
		} else if (this.type == "nonfinal") {
			fill = "#E257FF";
			textFill = "#9CFFE8";
		} else if (this.type == "start") {
			fill = "#9CFFE8";
			textFill = "#E257FF";
		} else if (this.type == "dead") {
			fill = "#888";
			textFill = "#9CFFE8";
		}
		var circle = new Kinetic.Circle({
	        x: this.x,
	        y: this.y,
	        radius: 20,
	        fill: fill,
	        strokeWidth: 2
	      });      
		var text = new Kinetic.Text({
            x: this.x - 5,
            y: this.y - 10,
            text: this.index,
            fontSize: 24,
            fontFamily: 'BPReplay',
            align: 'center',    
            fill: textFill,
        });
		if ((this.index == 0 && this.type == "start") || (this.index == startStateTracker && (this.type == "final" || this.type == "start"))) {
			var x1 = this.x - 20;
			var y1 = this.y;
			var x2 = x1;
			var y2 = y1;
			var headlen = 15;  
			var angle = Math.atan2(y2-y1,x2-x1);
			var line = new Kinetic.Line({
	      points: [x1, y1, x2, y2, x2-headlen*Math.cos(angle-Math.PI/6),y2-headlen*Math.sin(angle-Math.PI/6),x2, y2, x2-headlen*Math.cos(angle+Math.PI/6),y2-headlen*Math.sin(angle+Math.PI/6)],
	      stroke: "#ff007e",
	      strokeWidth: 2,
	      lineCap: 'round',
	      lineJoin: 'round',
	      zindex: 300
		   });
			this.group.add(line);
		}
		this.group.add(circle);
		this.group.add(text); 	
    layer.add(this.group);
    layer.draw();
	}

	this.updateCoordinates = function(x, y) {
		this.x = x;
		this.y = y;
	}

	this.setIndex = function(index) {
		this.index = index;
		this.group.setId(index);
	}

	this.setType = function(type) {
		if (type == "start") {
			startStateTracker = this.index;
		}
		this.type = type;
	}

	this.setXY = function(x, y) {
		this.x = x;
		this.y = y;
	}

	this.addTransition = function(symbol, nextState) {
		this.transitions[symbol].push(nextState);
	}
}

function StatePool() {
	this.pool = [];

	this.addState = function(state) {
		this.pool.push(state);
		
	}

	this.checkPosition = function(x, y) {
		for (var i = 0; i < this.pool.length; i++) {
			if (this.pool[i] != null) {
				if (x < this.pool[i].x + 20 && x > this.pool[i].x - 20 && y < this.pool[i].y + 20 && y > this.pool[i].y - 20) {
					return i;
				}
			}			
		}
		return -1;
	}

	this.checkStatePosition = function(x, y) {
		if (this.pool.length > 0) {
			for (var i = 0; i < this.pool.length; i++) {
				if (this.pool[i] != null) {
					if (x < this.pool[i].x + 40 && x > this.pool[i].x - 40 && y < this.pool[i].y + 40 && y > this.pool[i].y - 40 &&
							this.pool[i] != null) {
						return i;
					}
				}
			}		
		}
		return -1;
	}

	this.drawAllStates = function() {
		layer.destroy();
		layer = new Kinetic.Layer();
		stage.add(layer);
		layer.draw();
		layer.show();
		for (var i = 0; i < statePool.pool.length; i++) {
			statePool.pool[i].draw();
		};
	}
}

//Contains data needed to draw transitions
function TransitionLine(){
	this.stateIndex;
	this.characters = [];

	this.init = function(index){
		this.stateIndex = index;
	}

}

//Draws all transition lines and labels
function drawAllTransitions() {
	var arrayOfMergedTransitions; 

	layer2.hide();
	layer2 = new Kinetic.Layer();
	stage.add(layer2);
	for (var i = 0; i < statePool.pool.length; i++) {
		console.info(statePool.pool[i].index);
		arrayOfMergedTransitions = [];
		for (key in statePool.pool[i].transitions) {
			for (var j = 0; j < statePool.pool[i].transitions[key].length; j++){
				var aState = _.find(arrayOfMergedTransitions, function(state){
					return state.stateIndex == statePool.pool[i].transitions[key][j].index;
				});
				if (aState === undefined){
					var trans = new TransitionLine();
					trans.init(statePool.pool[i].transitions[key][j].index);
					trans.characters.push(key);
					arrayOfMergedTransitions.push(trans);
				} else {
					aState.characters.push(key);
				}
			}
		}
		for (var k = 0; k < arrayOfMergedTransitions.length; k++){
				var x1 = statePool.pool[i].x;
				var y1 = statePool.pool[i].y;
				var x2 = statePool.pool[arrayOfMergedTransitions[k].stateIndex].x;
				var y2 = statePool.pool[arrayOfMergedTransitions[k].stateIndex].y;

				if (x1 == x2 && y1 == y2) {
					var offsetX = x1 - 3;
					var offsetY = ((y1 + y2) / 2) - 55;
					var line = new Kinetic.Circle({
						x: x1,
		        y: y1 - 20,
		        radius: 15,
		        stroke: "#ff007e",
		        strokeWidth: 2,
		        zindex: 300
					});
				} else {
						var offsetX = (x1 + x2) / 2;
						var offsetY = ((y1 + y2) / 2) - 7;
						var headlen = 15;  
						var angle = Math.atan2(y2-y1,x2-x1);
						if (x2 > x1 && y1 < y2) {
							x2 -= 10;
							y2 -= 18;
							offsetX += 10;
							offsetY += 10;
						} else if (x2 > x1 && y1 > y2){
							x2 -= 18;
							y2 += 10;
							offsetX -= 10;
							offsetY -= 10;
						} else if (x2 < x1 && y1 < y2) {
							x2 += 18;
							y2 -= 11;
							offsetX -= 10;
							offsetY += 10;
						} else if (x2 < x1 && y1 > y2) {
							x2 += 11;
							y2 += 18;
							offsetX += 10;
							offsetY -= 10;
						} else if (x2 == x1 && y1 < y2) {
							y2 -= 18;
							offsetX -= 10;
						} else if (x2 == x1 && y1 > y2) {
							y2 += 18;
							offsetX += 10;
						} else if (y1 == y2 && x1 < x2) {
							x2 -= 18;
							offsetY -= 10;
						} else if (y1 == y2 && x1 > x2) {
							x2 += 18;
							offsetY += 10;
						}
					var line = new Kinetic.Line({
		        points: [x1, y1, x2, y2, x2-headlen*Math.cos(angle-Math.PI/6),y2-headlen*Math.sin(angle-Math.PI/6),x2, y2, x2-headlen*Math.cos(angle+Math.PI/6),y2-headlen*Math.sin(angle+Math.PI/6)],
		        stroke: "#ff007e",
		        strokeWidth: 2,
		        lineCap: 'round',
		        lineJoin: 'round',
		        zindex: 300
				   });
				}
				var string = "";
				for (var j = 0; j < arrayOfMergedTransitions[k].characters.length; j++){
					string += arrayOfMergedTransitions[k].characters[j] + " ";
				}
				var text = new Kinetic.Text({
	        x: offsetX,
	        y: offsetY,
	        text: string ,
	        fontSize: 15,
	        fontFamily: 'BPReplay',
	        align: 'center',    
	        fill: "#000",
				});
				layer2.add(line);
				layer2.add(text);
				layer2.draw();
			}
	}
	layer.show();
	layer.moveUp();
}

function removeTransition(state) {
	for (var i = 0; i < statePool.pool.length; i++) {
		for (key in statePool.pool[i].transitions) {
			for (var j = 0; j < statePool.pool[i].transitions[key].length; j++) {
				if (statePool.pool[i].transitions[key][j].index == state.index) {
					statePool.pool[i].transitions[key].splice(j, 1);
				}
			}
		}
	};
} 

$(document).ready( function() {

	$(document).bind("contextmenu", function(event) {
	    event.preventDefault();
		val = statePool.checkStatePosition(event.pageX, event.pageY - 60);
		prevClicked = val;
		if (val > -1) {
	    $("<div id='custom-menu'><button id='finalizeBtn' onClick='finalizeState(this)'>Set Final</button><br><button id='startizeBtn' onClick='startizeState(this)'>Set Start</button><br><button id='nonfinalizeBtn' onClick='nonFinalizeState(this)'>Set Non-final</button><br><button id='deadizeBtn' onClick='deadizeState(this)'>Set Dead</button><br><button id='nonfinalizeBtn' onClick='removeTransitionTo(this)'>Remove Transitions</button></div>")
	        .appendTo("body")
	        .css({top: event.pageY + "px", left: event.pageX + "px"});
		}
	}).bind("click", function(event) {
	    $("div#custom-menu").hide();
	    if (mode == "dragElements") {
	    	dragElements();
	    	dragElements();
	    }
	});

});

function finalizeState() {
	statePool.pool[prevClicked].setType("final");
	statePool.pool[prevClicked].group.destroy();
	statePool.pool[prevClicked].draw();
}

function startizeState() {
	if(startStateTracker != null) {
		statePool.pool[startStateTracker].setType("nonfinal");
		statePool.pool[startStateTracker].group.destroy();
		statePool.pool[startStateTracker].draw();
	}
	statePool.pool[prevClicked].setType("start");
	statePool.pool[prevClicked].group.destroy();
	statePool.pool[prevClicked].draw();
}

function nonFinalizeState() {
	if (prevClicked == startStateTracker) {
		startStateTracker = null;
	}
	statePool.pool[prevClicked].setType("nonfinal");
	statePool.pool[prevClicked].group.destroy();
	statePool.pool[prevClicked].draw();
}

function removeTransitionTo() {
	var nextState = prompt("Remove all transitions to", "Input State Number");
	for (key in statePool.pool[prevClicked].transitions) {
		for (j = 0; j < statePool.pool[prevClicked].transitions[key].length; j++) {
			if (nextState == statePool.pool[prevClicked].transitions[key][j].index) {
				statePool.pool[prevClicked].transitions[key].splice(j, 1);
			}
		}
	}
	drawAllTransitions();
}

function deadizeState() {
	if (prevClicked == startStateTracker) {
		startStateTracker = null;
	}
	statePool.pool[prevClicked].setType("dead");
	statePool.pool[prevClicked].group.destroy();
	statePool.pool[prevClicked].draw();
}