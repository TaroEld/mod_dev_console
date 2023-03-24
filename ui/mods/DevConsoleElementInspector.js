// Idea by KFox#2537
function ElementInspector()
{
	this.Tooltip = $('<div class="dom-element-inspector"/>');
	this.Tooltip.appendTo($('body'));
	this.States = {
		None : 0,
		Simple : 1,
		Border : 2,
		Full : 3
	};
	this.State = 0;
	this.NodeLevel = 0;
	this.LastElement = null;
}
ElementInspector.prototype.toggleState = function()
{
	this.State++;
	if (this.State > this.States.Full)
		this.State = this.States.None
	return this.inspectElement(this.LastElement);
};
ElementInspector.prototype.changeNodeLevel = function(_int)
{
	this.NodeLevel = Math.max(0, this.NodeLevel + _int);
	return this.inspectElement(this.LastElement);
};
ElementInspector.prototype.inspectElement = function(_target)
{
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

	var text = "<div>Node Level= " + this.NodeLevel + "</div>";
	text += "<div>Inspector State: " + this.State + "</div>";
	text += "<div>Type: " + elem.tagName + "</div>";
	text += "<div>Classes: " + elem.classList + "</div>";
	if (this.State > this.States.Simple)
		$(elem).addClass("dom-element-inspector-selected");
	if (this.State > this.States.Border)
		text += "<div> Styles: " + JSON.stringify(this.getUniqueUserStyling(elem)) + " </div>";
	this.Tooltip.html(text)
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

var ElementInspector = new ElementInspector();
$(document.body).mouseover(function (ev) {
	return ElementInspector.inspectElement(ev.target);
})
