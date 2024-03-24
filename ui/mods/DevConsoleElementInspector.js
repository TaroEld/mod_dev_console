// Idea by KFox#2537
function ElementInspector()
{
	this.Tooltip = $('<div class="dom-element-inspector"/>');
	this.Tooltip.appendTo($('body'));
	this.TooltipText = $('<div class="dom-element-inspector-text"/>')
		.appendTo(this.Tooltip);
	this.Input = $('<input type="text" class="dom-element-inspector-input"/>')
		.hide()
		.appendTo(this.Tooltip);
	this.Tooltip.drag(function( ev, dd ){
	    var clamp = function(num, min, max){
	        return Math.min(Math.max(num, min), max);
	    }

	      $( this ).css({
	         top: clamp(dd.offsetY, 0, $(document).height()),
	         left: clamp(dd.offsetX, 0, $(document).width())
	      });
	});
	this.States = {
		None : 0,
		Simple : 1,
		Border : 2,
		Full : 3
	};
	this.State = 0;
	this.NodeLevel = 0;
	this.LastElement = null;
	this.Locked = false;
	this.CursorPosX = 0;
	this.CursorPosY = 0;
}
ElementInspector.prototype.setState = function(_val)
{
	this.State = _val;
}
ElementInspector.prototype.toggleState = function()
{
	var self = this;
	this.State++;
	if (this.State > this.States.Full)
	{
		this.State = this.States.None
		this.Locked = false;
	}
	if (this.State == this.States.Full)
	{
		this.Input.show();
		this.Input.prop('disabled', false);
		this.Input.keypress(function (e) {
			e.stopPropagation();
		    if (e.which == 13) {
		    	self.Input.css("outline", "2px solid green");
		    	setTimeout(function(){
		    		self.Input.css("outline", "1px solid white");
		    	},500);
		       self.setClass(self.Input.val())
		    }
		});
	}
	else
	{
		this.Input.hide();
		this.Input.off("keypress")
		this.Input.prop('disabled', true);
	}
	return this.inspectElement(this.getElementFromCursor());
};
ElementInspector.prototype.lockElement = function()
{
	this.Locked = !this.Locked;
}
ElementInspector.prototype.changeNodeLevel = function(_int)
{
	this.NodeLevel = Math.max(0, this.NodeLevel + _int);
	return this.inspectElement(this.getElementFromCursor());
};
ElementInspector.prototype.setCursorPos = function(_ev)
{
	this.CursorPosX = _ev.clientX;
	this.CursorPosY = _ev.clientY;
};
ElementInspector.prototype.getElementFromCursor = function()
{
	return document.elementFromPoint(this.CursorPosX, this.CursorPosY);
}
ElementInspector.prototype.inspectElement = function(_target)
{
	if (this.Locked)
		return;
	if (this.LastElement !== null)
		$(this.LastElement).removeClass("dom-element-inspector-selected")
	this.LastElement = null;
	if (this.State == this.States.None || _target === null)
	{
		this.Tooltip.hide();
		return;
	}
	var elem = this.getParentByLevel(_target, this.NodeLevel);
	this.Tooltip.show();
	this.LastElement = elem;

	var text = "<div>Node Level: " + this.NodeLevel + "</div>";
	text += "<div>Inspector State: " + this.State + "</div>";
	text += "<div>Type: " + elem.tagName + "</div>";
	text += "<div>Classes: " + elem.classList + "</div>";
	if (this.State > this.States.Simple)
		$(elem).addClass("dom-element-inspector-selected");
	if (this.State > this.States.Border)
		text += "<div> Styles: " + JSON.stringify(this.getUniqueUserStyling(elem)) + " </div>";
	this.TooltipText.html(text)
};
ElementInspector.prototype.getParentByLevel = function(element, level) {
	var parent = element;
	for (var i = 0; i < level; i++) {
		parent = parent.parentNode;
	}
	return parent;
};
// Copied from https://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
ElementInspector.prototype.getDefaultStyling = function(tagName){
    if(!tagName) tagName = "dummy-tag-name";

    //  Create dummy iframe

    var iframe = document.createElement("iframe");

    document.body.appendChild(iframe);

    //  Create element within the iframe's document

    var iframeDocument = iframe.contentDocument;
    var targetElement = iframeDocument.createElement(tagName);

    iframeDocument.body.appendChild(targetElement);

    //  Grab styling (CSSStyleDeclaration is live, and all values become "" after element removal)

    var styling = iframe.contentWindow.getComputedStyle(targetElement);
    var clonedStyling = {};

    for(var i = 0, len = styling.length; i < len; i++){
        var property = styling[i];

        clonedStyling[i] = property;
        clonedStyling[property] = styling[property];
    }

    //  Remove iframe

    document.body.removeChild(iframe);

    //  Return cloned styling

    return clonedStyling;
};
// Copied from https://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
ElementInspector.prototype.getUniqueUserStyling = function(element){
    var allStyling = window.getComputedStyle(element);
    var defaultStyling = this.getDefaultStyling(element.tagName);

    var userStyling = {};

    for(var i = 0, len = allStyling.length; i < len; i++){
        var property = allStyling[i];
        var value = allStyling[property];
        var defaultValue = defaultStyling[property];

        if(value != defaultValue){
            userStyling[property] = value;
        }
    }

    return userStyling;
}

ElementInspector.prototype.setClass = function(_text) {
	var cssClass = _text.substring(0, _text.indexOf(' '))
	var cssValue = _text.substring(_text.indexOf(' ') + 1)
	$(this.LastElement).css(cssClass, cssValue);
	return this.inspectElement(this.LastElement);
};

var ElementInspector = new ElementInspector();
$(document.body).on("mousemove.devconsole", function (ev) {
	ElementInspector.setCursorPos(ev);
})

$(document.body).on("mouseover.devconsole", function (ev) {
	return ElementInspector.inspectElement(ev.target);
})
