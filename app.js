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
	console.log(node);
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
	var input = $(".input")[0];

	var sanatizeColor = function( stringHtml ){
		return stringHtml.replace(/<\/?(fader)[^>]*>/gi,"").//removes fader elements, since css applies color to them, but not its content
			replace(/(color="[^"]*"|color:[^;]*;)(?=[^><]*>)/gi, "").//remove inline color coding, inside style and as attribute
			replace(/style="[ ]*"/gi, "");//delete empty styles that may end up remaining
	};

	var santizeColorInElement = function(node){
		console.log("node.outterHTML: "+node.outterHTML);
		$(node).removeAttr("color");
		if ($(node).attr('style')) $(node).css('color', '');
		if (node.innerHTML) node.innerHTML = sanatizeColor(node.innerHTML);
	};

	var fadeNode = function(node){
		if ( $(node).text().length === 0) return;//no need to fade without any text in it
		console.log("fadeNode");
		console.log(node);
		var outNode = $(node).wrap('<fader />').parent()[0];//wrap returns the wrapped element, not the wrapper
		$(outNode).css({
			//"-webkit-animation-name":		"cooling-lava",
			//"-webkit-animation-duration":	"5s"
		});
		//console.log("html: "+outNode.innerHTML);
		santizeColorInElement(outNode);
		//console.log("san_html: "+outNode.innerHTML);
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
		console.log("newText:"+newText);
		console.log("oldText"+oldText);
		console.log("diffCharIndex:"+diffCharIndex);
		console.log("lengthCharsInserted:"+lengthCharsInserted);

		var insertedTextNode = textNode.splitText(diffCharIndex);
		insertedTextNode.splitText(lengthCharsInserted);

		return insertedTextNode;
	};

	var silentMutation = false;

	$(input).on("webkitAnimationEnd","fader", function(e){
		//console.log("animationend");
		//console.log(this);
		//BUG: unwrapping will cause reflow of its children, which if still fading will restart their animation
		//FAILED ATTEMPTS:
		//	using inline style instead of CSS selectors doesn't work, the reflow still happens
		//Possible solutions:
		//	on mutation don't just wrap the inserted node, but make it a sibling of his parent as well
		return;
		silentMutation = true;
		var savedSel = rangy.saveSelection();
		$(this).contents().unwrap();
		$(this).remove();
		input.normalize();
		rangy.restoreSelection(savedSel);
		
	});
	

	var mutationSummaryHandler = function(summary){
		if (silentMutation){
			console.log("SILENT MUTATION!");
			silentMutation = false;
			return;
		}
		//mutations.disconnect();
		console.log("MUTATION!");
		var changes = summary[0];
		window.changes = changes;


		changes.added.forEach(function(addedNode){
			console.log("added node");
			console.log(addedNode);
			if ( $(addedNode).parent().is("fader") && $(addedNode).parent().children().length === 1 ){
				console.log("already fading");
				santizeColorInElement(addedNode);
				return;
			}
			fadeNode(addedNode);
		});


		changes.removed.forEach(function(removedNode){
			console.log("removedNode");
			console.log(removedNode);
			//not possible to do node clean up, because the node is no longer on the tree,
			//therefore there is no reference to his lost father

			var oldParent = changes.getOldParentNode(removedNode);
			
			var oldParentParents = $(oldParent).parentsUntil(input);

			if ( $(oldParent).is(":empty") && oldParent !== input){
				$(oldParent).remove();
			}

			oldParentParents.each(function(index, node){
				if ($(node).is(":empty") && node !== input){
					$(node).remove();
				}
			});
		});

		$.fn.unshift = function(){

		};

		changes.characterDataChanged.forEach(function(changedTextNode){
			if ( changes.added.indexOf(changedTextNode) !== -1 ){
				console.log("node already dealt as added node");
				return;
			}
			console.log("characterDataChanged");
			console.log(changedTextNode);

			window.changedTextNode = changedTextNode;
			console.log( changedTextNode ? "" : "changedTextNode is null" );

			var oldText = changes.getOldCharacterData(changedTextNode);
			var insertedTextNode = fleshOutInsertedTextNode(changedTextNode, oldText );

			console.log("oldText: "+oldText);
			if (changedTextNode.data!==oldText){
				//textNode that hasn't changed its data, his actually an added node, at least in chrome it is.
				insertedTextNode = changedTextNode;
			}

			console.log("insertedTextNode.data:"+ insertedTextNode && insertedTextNode.data);
			if (!insertedTextNode || !insertedTextNode.data ){
				$(insertedTextNode).remove();
				return;
			}


			var nodeClone = fadeNode( $(insertedTextNode).clone()[0] );

			insertNodeAtCaret( nodeClone );
			
			/*
			//$(nodeClone).moveTo( $(nodeClone).parent() );
			if (nodeClone.parentElement !== input[0]){
				console.log(nodeClone);
				var savedSel = rangy.saveSelection();
				//$(nodeClone).unwrap();//not the way to go, it deletes information, we just want to bump it one level
				rangy.restoreSelection(savedSel);
			}*/

			$(insertedTextNode).remove();
		});
	};

	var mutations = new MutationSummary({
		callback: mutationSummaryHandler, // required
		rootNode: input, // optional, defaults to window.document
		observeOwnChanges: false,// optional, defaults to false
		oldPreviousSibling: false,// optional, defaults to false
		queries: [{ all: true }]
	});
});