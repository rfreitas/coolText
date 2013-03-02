//JSHint globals
/*global
window:true,
document:true,
*/
//--------------------------------------


function insertNodeAtCaret(node) {
	pasteHtmlAtCaret(node);
}

//ref: http://stackoverflow.com/a/6691294/689223
function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            console.log(frag);
            console.log(lastNode);
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}



$(function(){

	$(".input").on("keypress", function(e){	
		var c = String.fromCharCode(e.which);
		console.log(e);
		if (c && e.charCode !== 13 && c!==" "){
			console.log("char:"+c);
			var node = '<fader>'+c+'<fader/>';
			console.log(node);
			insertNodeAtCaret( node );
			e.preventDefault();
		}
	});

	
});