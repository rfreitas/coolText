//JSHint globals
/*global
window:true,
document:true,
rangy:true,
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

(function($){
    $.fn.moveTo = function(selector){
        return this.each(function(){
            var cl = $(this).clone();
            $(cl).appendTo(selector);
            $(this).remove();
        });
    };
})(jQuery);

$(function(){
	var input = $(".input");

	var sanatizeHtmlColor = function( stringHtml ){
		return stringHtml.replace(/<\/?(fader)[^>]*>/g,"").//removes fader elements, since they are doing nothing on this case
			replace(/(color="[^"]*"|color:[^;]*;)(?=[^><]*>)/g, "").//remove color coding, inside styling and as attribute
			replace(/style="[ ]*"/g, "");//delete empty styles that may end up remaining
	};

	var fadeNode = function(node){
		if ( $(node).text().length === 0) return;//no need to fade without any text in it

		var outNode = $(node).wrap('<fader />').parent()[0];//wrap returns the wrapped element, not the wrapper
		$(outNode).css({
			//"-webkit-animation-name":		"cooling-lava",
			//"-webkit-animation-duration":	"5s"
		});
		console.log("html: "+outNode.innerHTML);
		outNode.innerHTML = sanatizeHtmlColor(outNode.innerHTML);
		console.log("san_html: "+outNode.innerHTML);
		return outNode;
	};

	var fleshOutInsertedTextNode = function(textNode, oldText){
		var newText = textNode.data;

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


		var insertedTextNode = textNode.splitText(diffCharIndex);
		insertedTextNode.splitText(lengthCharsInserted);

		return insertedTextNode;
	};


	$(".input").mutationSummary("connect", function(summary){
		var changes = summary[0];
		window.changes = changes;


		changes.added.forEach(function(addedNode){
			fadeNode(addedNode);
		});


		changes.characterDataChanged.forEach(function(changedTextNode){
			window.changedTextNode = changedTextNode;

			var insertedTextNode = fleshOutInsertedTextNode(changedTextNode, changes.getOldCharacterData(changedTextNode) );

			var nodeClone = fadeNode( $(insertedTextNode).clone() );
			
			insertNodeAtCaret( nodeClone );
			//console.log(nodeClone);
			

			//$(nodeClone).moveTo( $(nodeClone).parent() );


			insertedTextNode.data = "";

			input[0].normalize();

			return;
			$(nodeClone).on("webkitAnimationEnd", function(){
				console.log("animationend");
				if ( nodeClone.parentElement !== input[0] ){
					$(nodeClone).removeClass("fader");
					var savedSel = rangy.saveSelection();
					$(nodeClone).unwrap();
					rangy.restoreSelection(savedSel);
				}
			});
			
		});

	}, false, [{ all: true }]);

});