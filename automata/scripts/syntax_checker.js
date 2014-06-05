var check = function(regex){
	var parenthesisStack = [];
	var characterStack = [];
	regex = document.getElementById(regex).value;
	for (var i = 0; i < regex.length; i++) {
		var character = regex.charAt(i);
		characterStack.push(character);
		if (character == "(") {
			parenthesisStack.push(character);
		} else if (character == ")") {
			if (parenthesisStack.length == 0) {
				return false;
			}
			parenthesisStack.pop();
		} else if (character == "*") {			
			var prevChar = characterStack[i - 1];
			if (prevChar == undefined || prevChar == "(" || prevChar == "+") {
				return false;
			}
		} else if (character == "+") {
			var prevChar = characterStack[i - 1];
			var nextChar = regex.charAt(i+1);
			if (prevChar == undefined || prevChar == "+" || prevChar == "(" ||
				 (nextChar == undefined || nextChar == "+" || nextChar == "*")) {
				return false;
			}
		} else if (["a", "b"].indexOf(character) == -1) {
			return false;
		}
	}
	if (parenthesisStack.length != 0) {
		return false;		
	}
	return true;
}