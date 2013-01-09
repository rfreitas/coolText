//JSHint globals
/*global
sclock: true,
window:true,
sharejs:true,
ko:true,
document:true,
_:true,
sko:true,
YT:true,
cuid:true
*/
//--------------------------------------


var nextRun = function(routine){
	return timeout( routine, 0);
};

var timeout = function( routine, miliseconds ){
	var id = window.setTimeout( routine, miliseconds);

	return {
		cancel: function(){
			return window.clearTimeout(id);
		}
	};
};


$.fn.forEach = function(){
	return [].forEach.apply( this, arguments );
};


function insertNodeAtCaret(node) {
    var sel = rangy.getSelection();
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(node);
        range.collapseAfter(node);
        sel.setSingleRange(range);
    }
}

$(function(){
	var input = $(".input");

	var fadeNode = function(node){
		return $(node).wrap('<span class="fader" />').parent()[0];//wrap returns the wrapped element, not the wrapper
	};


	$(".input").mutationSummary("connect", function(summary){
		var changes = summary[0];
		window.changes = changes;


		changes.added.forEach(function(addedNode){
			fadeNode(addedNode);
		});


		changes.characterDataChanged.forEach(function(changedTextNode){
			window.changedTextNode = changedTextNode;

			var newText = changedTextNode.data;
			var oldText = changes.getOldCharacterData(changedTextNode);

			//flesh out the inserted piece of text
			var lengthCharsInserted = newText.length - oldText.length;
			if (lengthCharsInserted <= 0) return;

			var diffCharIndex = -1;
			var i = 0;
			while ( i<newText.length && diffCharIndex === -1){
				if ( newText[i] !== oldText[i]){
					diffCharIndex = i;
				}
				i++;
			}

			var insertedTextNode = changedTextNode.splitText(diffCharIndex);
			insertedTextNode.splitText(lengthCharsInserted);


			var nodeClone = fadeNode( $(insertedTextNode).clone() );
			
			insertNodeAtCaret( nodeClone );

			nextRun( function(){
				nodeClone.addEventListener("animationend", function(){
					console.log("animationend");
					$(nodeClone).unwrap();
				}, false);
			});


			insertedTextNode.data = "";
			
		});

	}, false, [{ all: true }]);

});