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
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0);
            range.collapse(false);
            range.insertNode(node);
            range = range.cloneRange();
            range.selectNodeContents(node);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var html = (node.nodeType == 1) ? node.outerHTML : node.data;
        var id = "marker_" + ("" + Math.random()).slice(2);
        html += '<span id="' + id + '"></span>';
        var textRange = document.selection.createRange();
        textRange.collapse(false);
        textRange.pasteHTML(html);
        var markerSpan = document.getElementById(id);
        textRange.moveToElementText(markerSpan);
        textRange.select();
        markerSpan.parentNode.removeChild(markerSpan);
    }
}

$(function(){
	var input = $(".input");

	var fadeNode = function(node){
		return $(node).wrap('<span class="fader" />').parent();//wrap returns the wrapped element, not the wrapper
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

			var nodeClone = fadeNode( $(insertedTextNode).clone() )[0];
			
			insertNodeAtCaret( nodeClone );

			insertedTextNode.data = "";
			
		});

	}, false, [{ all: true }]);

});