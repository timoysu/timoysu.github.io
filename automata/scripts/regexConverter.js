var stateIndex = 0;
var operandStack = new Array();
var inputSet = ['a', 'b'];
var operatorStack = new Array();
var final_NFATable = new Array();
var final_DFATable = new Array();

function drawNFA(regex) {
	if (!check(regex)) {
		alert("Invalid regular expression!");
		return;
	}
	resetStage();
	regex = document.getElementById(regex).value;
	regex = regexTrimming(regex);
	regex = addConcatSymbol(regex);
	if(regex == "" || !createNFA(regex)) {
		return;
	}

	stateCounter = final_NFATable.length;
	statePool.pool = final_NFATable;

	assignCoordinates();

	statePool.drawAllStates();
  drawAllTransitions();
	showDFATools(regex);
};

function drawDFA(regex) {
	if (!check(regex)) {
		alert("Invalid regular expression!");
		return;
	}
	resetStage();
	regex = document.getElementById(regex).value;
	regex = regexTrimming(regex);
	regex = addConcatSymbol(regex);
	if(regex == "" || !createNFA(regex)) {
		return;
	}
	checking();
	convertNFAToDFA();
	checkingDFA();

	stateCounter = final_DFATable.length;
	statePool.pool = final_DFATable;

	assignCoordinates();

	statePool.drawAllStates();
  drawAllTransitions();
	showDFATools(regex);
};

function fromNFAtoDFA() {
	final_NFATable = statePool.pool;
	findStringTransitions();
	resetStage();

	convertNFAToDFA();
	statePool.pool = final_DFATable;
	
	stateCounter = final_DFATable.length;
	statePool.pool = final_DFATable;
	startStateTracker = statePool.pool[0].index;

	assignCoordinates();
	statePool.drawAllStates();
  drawAllTransitions();
};

function assignCoordinates() {
	var numOfstates = statePool.pool.length;
	var distanceX = stage.getWidth() / ((numOfstates/2)+2); 
	var distanceY = stage.getHeight() / 3; 
	var tempX = distanceX; 

	for (var i = 0; i < statePool.pool.length; i++) {
		if (i % 2 == 1) {
			distanceY += 90;
		} else {
			distanceY -= 90;
		}
		statePool.pool[i].updateCoordinates(tempX, distanceY);
		if (i >=(numOfstates / 2)) {
			tempX -= distanceX;
		} else {
			tempX += distanceX;
		}
		if (i == Math.floor(numOfstates / 2)) {
			distanceY += 150; 	
			tempX = stage.getWidth() - distanceX; 
		}  
	}
}

function createNFA(regex) {
	for (var i = 0; i < regex.length; i++) {
		var symbol = regex.charAt(i);
	 	if (isInput(symbol)) {
	 		pushToNFA(symbol);
		} else if (operatorStack.length == 0 || isLeftParenthesis(symbol)) {
			operatorStack.push(symbol);
		} else if (isRightParenthesis(symbol)) {
			while(!isLeftParenthesis(operatorStack[operatorStack.length - 1])) {
				if (!evaluate()) {
					return false;
				}
			}
			operatorStack.pop();
		} else {
			while ((operatorStack.length > 0) && precedence(symbol, operatorStack[operatorStack.length - 1])){
				if (!evaluate()) {
					return false;
				}
			}
			
			operatorStack.push(symbol);
		}
	}
	while (operatorStack.length > 0) {
		if(!evaluate()) {
			return false;
		}
	}

	if (!(final_NFATable = operandStack.pop())) {
		return false;	
	}
	adjustIndexes();

	final_NFATable[0].setType("start");
	startStateTracker = final_NFATable[0].index;
	final_NFATable[final_NFATable.length - 1].setType("final");
	
	checking();
	return true;
};

function addConcatSymbol(regex) {
	var newRegEx = "";
	for (var i=0; i < regex.length-1; i++) {
		var left = regex.charAt(i);
		var right = regex.charAt(i+1);
		newRegEx += left;
		if (isInput(left) || isRightParenthesis(left) || left == '*') {
			if (isInput(right) || isLeftParenthesis(right)) {
				newRegEx += '_';
			}
		}
	}
	newRegEx += regex.charAt(regex.length - 1);
	return newRegEx;
};

function isInput(symbol) {
	return (symbol == 'a' || symbol == 'b');
};

function isOperator(symbol) {
	return !isInput(symbol);
};

function isRightParenthesis(symbol) {
	return symbol == ')';
};

function isLeftParenthesis(symbol) {
	return symbol == '(';
};

function pushToNFA(symbol) {
	var s0 = new State();
	var s1 = new State();

	s0.init(0, 0, stateIndex++);
	s1.init(0, 0, stateIndex++);
	
	s0.addTransition(symbol, s1);

	var NFATable = new Array();
	NFATable.push(s0);
	NFATable.push(s1);

	operandStack.push(NFATable);
	inputSet.push(symbol);
};

function evaluate() {
	if (operatorStack.length > 0) {
		var currop = operatorStack.pop();
		
		if (currop == '*') {
			return star();
		}	else if (currop == '+') {
			return union();
		} else if (currop == '_') {
			return concatenation();
		} 
	}
	return false;
};

function precedence(symbol, stacktop) {
	if(symbol == stacktop)
		return true;

	if(symbol == '*')
		return false;

	if(stacktop == '*')
		return true;

	if(symbol == '_')
		return false;

	if(stacktop == '_')
		return true;

	if(symbol == '+')
		return false;

	return true;
};

function concatenation() {
	var A = new Array();
	var B = new Array();
	if (!(B = operandStack.pop()) || !(A = operandStack.pop())) {
		return false;
	}

	A[A.length - 1].addTransition('e', B[0]);

	for (var i = 0; i < B.length; i++) {
		A.push(B[i]);
	}

	operandStack.push(A);
	return true;
};

function star() {
	var A = new Array();
	if (!(A = operandStack.pop())) {
		return false;
	}

	var s0 = new State();
	var s1 = new State();

	s0.init(0,0,stateIndex++);
	s1.init(0,0,stateIndex++);

	s0.addTransition('e', s1);

	s0.addTransition('e', A[0]);
	A[A.length - 1].addTransition('e', s1);
	A[A.length - 1].addTransition('e', A[0]);

	A.push(s1);
	A.unshift(s0);

	operandStack.push(A);
	return true;

};

function union() {
	var A = new Array();
	var B = new Array();
	if (!(B = operandStack.pop()) || !(A = operandStack.pop())) {
		return false;
	}

	var s0 = new State();
	var s1 = new State();

	s0.init(0,0,stateIndex++);
	s1.init(0,0,stateIndex++);

	s0.addTransition('e', A[0]);
	s0.addTransition('e', B[0]);

	A[A.length - 1].addTransition('e', s1);3
	B[B.length - 1].addTransition('e', s1);

	B.push(s1);
	A.unshift(s0);
	for (var i = 0; i < B.length; i++) {
		A.push(B[i]);
	}
	
	operandStack.push(A);
	return true;
};

function stringTransitions(stringKey, state) {
	var newTransitions = [];
	
	for (var i = 0; i < stringKey.length; i++) {
		var s0 = new State();
		var s1 = new State();
		var newStates = [];
		s0.init(0, 0, stateIndex++);
		s1.init(0, 0, stateIndex++);

		s0.addTransition(stringKey.charAt(i), s1);

		final_NFATable.push(s0);
		final_NFATable.push(s1);

		newStates.push(s0);
		newStates.push(s1);

		newTransitions.push(newStates);
	}
	state.addTransition('e', newTransitions[0][0]);

	for (var i = 0; i < newTransitions.length - 1; i++) {
		newTransitions[i][1].addTransition('e', newTransitions[i + 1][0]);
	}

	for (var i = 0; i < state.transitions[stringKey].length; i++) {
		newTransitions[newTransitions.length - 1][1].addTransition('e', state.transitions[stringKey][i]);	
	}

	state.transitions[stringKey] = [];

}

function adjustIndexes() {
	for (var i = 0; i < final_NFATable.length; i++) {
		final_NFATable[i].index = i;
	}
};

function checking() {
	for (var i = 0; i < final_NFATable.length; i++) {
		for (key in final_NFATable[i].transitions) {	
			for (var j = 0; j < final_NFATable[i].transitions[key].length; j++) {
		
			}
		}
	}
};

///-------------------------------NFA2DFA2NFAAgain-------------------------------

function epsilonClosure(states) {
	var result = states;

	var unprocessedStack = [];
	for (var i = 0; i < states.length; i++){
		unprocessedStack.push(states[i]);
	}

	while (unprocessedStack.length > 0){
		var stateT = unprocessedStack.pop();
		var epsilonStates = stateT.transitions['e'];
		for (var i = 0; i < epsilonStates.length; i++){
			var stateU = epsilonStates[i];
			if (result.indexOf(stateU) === -1){
				result.push(stateU);
				unprocessedStack.push(stateU);
			}
		}
	}
	return result;

}


function move(input, states){
	var result = [];

	for (var i = 0; i < states.length; i++){
		var pState = states[i];
		var nextStates = pState.transitions[input];
		for (var j = 0; j < nextStates.length; j++){
			result.push(nextStates[j]);
		}
	}

	return result;

}

function convertNFAToDFA(){
	final_DFATable = [];
	if (final_NFATable.length == 0)
		return;

	stateIndex = 0;
	var unmarkedStates = [];

	var DFAStartStateSet = [];
	var NFAStartStateSet = [];

	NFAStartStateSet.push(final_NFATable[0]);
	DFAStartStateSet = epsilonClosure(NFAStartStateSet);

	var DFAStartState = new State();
	DFAStartState.init(0,0,stateIndex++);
	DFAStartState.setNFAStates(DFAStartStateSet);
	DFAStartState.setType("start"); 
	final_DFATable.push(DFAStartState);
	unmarkedStates.push(DFAStartState);
	while (unmarkedStates.length > 0){
		var processingDFAState = unmarkedStates.pop();
		for (var i = 0; i < inputSet.length; i++){
			var input = inputSet[i];

			var MoveRes = [];
			var EpsilonClosureRes = [];

			MoveRes = move(input, processingDFAState.getNFAStates());
			EpsilonClosureRes = epsilonClosure(MoveRes);
			
			var bFound = false;
			var curState;
			for (var j = 0; j < final_DFATable.length; j++){
				var state = final_DFATable[j];
				if (_.isEqual(state.getNFAStates(), EpsilonClosureRes)){
					curState = state;
					bFound = true;
					break;
				}
			}

				processingDFAState.transitions[input] = [];

			if (!bFound){
				var stateU = new State();
				stateU.init(0,0, stateIndex++);
				stateU.setNFAStates(EpsilonClosureRes);

				unmarkedStates.push(stateU);
				final_DFATable.push(stateU);

				processingDFAState.addTransition(input, stateU);
			} else {
				processingDFAState.addTransition(input, curState);
		
			}
			
		}
	}
	assignFinal();
};

function assignFinal() {
	for (var i = 0; i < final_DFATable.length; i++) {
		for (var j = 0; j < final_DFATable[i].getNFAStates().length; j++) {
			if (final_DFATable[i].getNFAStates()[j].type === "final") {
				final_DFATable[i].type = "final";
			}
		}
		if (isDeadState(final_DFATable[i])) {
			final_DFATable[i].type = "dead";
		}
	}
};

function checkingDFA() {
	for (var i = 0; i < final_DFATable.length; i++) {
		for (key in final_DFATable[i].transitions) {	
			for (var j = 0; j < final_DFATable[i].transitions[key].length; j++) {
		
			}
		}
	}
};

//------------------------DFAOptimization----------------------------
function removeDeadStates() {
	var deadStates = [];

	for (var i = 0; i < final_DFATable.length; i++) {
		if (final_DFATable[i].type == "dead") {
			deadStates.push(final_DFATable[i]);
		}
	}

	if (deadStates.length == 0) {
		return;
	}

	for (var i = 0; i < deadStates.length; i++) {
		removeTransitions(deadStates[i]);
		for (var j = 0; j < final_DFATable.length; j++) {
			if (final_DFATable[j] == deadStates[i]) {
				final_DFATable.splice(deadStates[i].index, 1);
			}
		}
	}
};

function isDeadState(state) {
	var counter = 0;

	if (state.type == "final") {
		return false;
	}

	for (key in state.transitions) {
		if (state.transitions[key][0] == state) {
			counter++;
		}
	}

	if (counter > 1) {
		return true;
	}
};

function removeTransitions(state) {
	for (var i = 0; i < final_DFATable.length; i++) {
		for (key in final_DFATable[i].transitions) {
			if (final_DFATable[i].transitions[key][0] == state) {
				final_DFATable[i].transitions[key].splice(0, 1);
			}
		}
	}
};


//-----------------------InputChecking--------------------------------
function find(string){
	string = document.getElementById(string).value;

	final_NFATable = statePool.pool;
	findStringTransitions();

	convertNFAToDFA();

	var nState = 0;

	for (var i = 0; i < string.length; i++) {
		if (inputSet.indexOf(string.charAt(i)) != -1) {
			nState = final_DFATable[nState].transitions[string.charAt(i)][0].index;
		} else {
			alert("Invalid input character(s)! Only strings with 'a' and 'b' are allowed.");
			return;
		}
	}

	if (final_DFATable[nState].type == "final") {
		alert(string + " is accepted!");
		return;
	}	

	alert(string + " is denied!");
	return;
};

function findStringTransitions() {
	stateIndex = final_NFATable.length;
	for (var i = 0; i < final_NFATable.length; i++) {
		for (key in final_NFATable[i].transitions) {
			if (key.length > 1) {
		
				stringTransitions(key, final_NFATable[i]);
			}
		}
	}
}

function regexTrimming(regex) {
	var characters = "";
	for (var i = 0; i < regex.length -1; i++) {
		if (regex.charAt(i) == '*' && regex.charAt(i+1) == '*') {
			continue;
		} else {
			characters += regex.charAt(i);
		}
	}
	characters += regex.charAt(regex.length-1);
	return characters;
};