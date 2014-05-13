//JSHint globals
/*global
window:true,
document:true,
*/
//--------------------------------------

(function(){
    var out = window.coolText = function(el){
        $(el).on("keypress paste", function(){out.inputEventsHandler.apply(out,arguments);});
    };

    out.rangeEndContainer = function(){
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        return range.endContainer;
    };

    //ref: http://stackoverflow.com/a/6691294/689223
    out.insertNodeAtCaret = function(node) {
        console.log("\n");
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                var containerNode = $(range.endContainer).closest(".inserted");
                console.log("containerNode");
                console.log(containerNode[0]);
                console.log(range.endOffset);

                // Preserve the selection
                var preserveSelection = function(){
                    console.log("node");
                    console.log(node);
                    if (node) {
                        range = range.cloneRange();
                        range.setStartAfter(node);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                };

                //ref: https://developer.mozilla.org/en-US/docs/DOM/range
                if( !containerNode.length){
                    range.insertNode(node);
                }
                else if (range.endOffset === 0 && containerNode.text().length > 0){//&& containerNode.text().length > 0){
                    node = $(node).insertBefore(containerNode)[0];
                    console.log("insert previously");
                }
                else{
                    node = $(node).insertAfter(containerNode)[0];
                    console.log("insert after");
                }
                preserveSelection();
                node.scrollIntoView(true);
                return node;
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(node.outerHTML);
        }
    };

    out.getClipboardData = function(e) {
        if (window.clipboardData && window.clipboardData.getData){ // IE
            return window.clipboardData.getData('Text');//ref: http://msdn.microsoft.com/es-es/library/ie/ms536436(v=vs.85).aspx
        }
        else if (e.clipboardData && e.clipboardData.getData){
            return e.clipboardData.getData('text/html');
        }
    };

    out.generateNode = function (innerHTML){
        innerHTML = innerHTML || "";
        var el = document.createElement("span");
        el.innerHTML = innerHTML;
        el.classList.add("inserted");
        return el;
    };

    out.pasteHandler = function(e){
        var data = this.getClipboardData(e.originalEvent);
    };

    out.keypressHandler = function(e){
        return String.fromCharCode(e.which);
    };

    out.newLineHandler = function(e){
        var node1 = $("<br>")[0];
        node1 = this.insertNodeAtCaret( node1 );
        var node2 = this.insertNodeAtCaret( $("<br>")[0] );
        $(node1).remove();
        e.preventDefault();
    };

    //ref:http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    out.isNewLine = function(e){
        return e.which == 13;
    };

    out.isArrowKey = function(e){
        return (e.charCode <= 40 && e.charCode >= 37) || e.charCode === 0/*firefox*/;
    };

    out.inputEventsHandler = function(e){
        var c;
        console.log("which key: "+e.which);
        console.log(e);
        if (e.metaKey || e.ctrKey) return;//in firefox keypress also captures commands like: ctr+a, ctr+c, ctr+v (cmd also included for MacOS)

        if (e.type === "paste"){
            c = this.pasteHandler(e);
        }
        else{
            c = this.keypressHandler(e);
        }
        if (this.isNewLine(e)){
           c = this.newLineHandler(e);
        }
        console.log("input:"+c);

        if (c && c!==" " && !this.isArrowKey(e) ){
            var node = out.generateNode(c);
            node = this.insertNodeAtCaret( node );
            e.preventDefault();
        }
    };
})(window);

$(function(){
    window.coolText(".input");
});