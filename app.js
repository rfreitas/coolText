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


$(function(){
	var input = $(".input");
	var previousHtml = input.html();
	input.on("input", function(){
		if (previousHtml === input.html() ) return;

		console.log("hey");
		var contents = input.contents();

		var unwrappedElements = window.unwrappedElements = [];

		contents.each( function(index, value){
			value = $(value);
			var contentClass = value.attr("class");
			if ( contentClass != "fader"){
				unwrappedElements.push( value[0] );
			}
		});

		console.log( unwrappedElements.map( function(value){ return $(value).text();}) );


		unwrappedElements.forEach( function(node){
			node = $(node);
			window.node = node;
			var nodeText = node.text();
			//BUG: repeated accents are still reseting the caret
			if ( !nodeText || nodeText == "´" || nodeText == '`') return;
			console.log("node_text:"+nodeText);


			var newNode = $( '<span contentEditable="false">' + node.text() + '</span>' );
			newNode.insertBefore(node);
			
			//node.replaceWith("");//replacing the text node completely resets the caret

			//http://stackoverflow.com/a/680447/689223
			node[0].nodeValue = "";

			node.html("");

			nextRun( function(){
				newNode.addClass("fader");
			});
		});
	});
});