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

    //ref: http://stackoverflow.com/a/6691294/689223
    out.insertNodeAtCaret = function(node) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                var containerNode = $(range.endContainer).parent();
                console.log("containerNode");
                console.log(containerNode[0]);

                //ref: https://developer.mozilla.org/en-US/docs/DOM/range
                if( $(containerNode).is("div.input") || $(containerNode).children().is("div.input"))
                    range.insertNode(node);
                else
                    $(containerNode).after(node);
                //range.insertNode(node);

                // Preserve the selection
                if (node) {
                    range = range.cloneRange();
                    range.setStartAfter(node);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
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
        var el = document.createElement("span");
        el.innerHTML = innerHTML;
        el.classList.add("inserted");
        return el;
    };

    out.pasteHandler = function(e){
        return this.getClipboardData(e.originalEvent);
    };

    out.keypressHandler = function(e){
        return String.fromCharCode(e.which);
    };

    out.inputEventsHandler = function(e){
        var c;
        if (e.type === "paste"){
            c = this.pasteHandler(e);
        }
        else{
            c = this.keypressHandler(e);
        }

        if (c && c!==" " && e.charCode !== 13/*new line ref:http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes*/){
            var node = out.generateNode(c);
            this.insertNodeAtCaret( node );
            e.preventDefault();
        }
    };
})(window);

$(function(){
    window.coolText(".input");
});