var DevConsoleJSConnection = function(_parent)
{
    MSUBackendConnection.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleJSConnection";

    // Idea by KFox#2537
    this.mElementInspector = {
    	Tooltip : $('<div class="dom-element-inspector"/>'),
    	States : {
    		None : 0,
    		Simple : 1,
    		Border : 2,
    		Full : 3
    	},
    	State : 0,
    	NodeLevel : 0,
    	LastElement : null,
    	toggleState : function()
    	{
    		this.State++;
    		if (this.State > this.States.Full)
    			this.State = this.States.None
    		return this.inspectElement(this.LastElement);
    	},
    	changeNodeLevel : function(_int)
    	{
    		this.NodeLevel = Math.max(0, this.NodeLevel + _int);
    		return this.inspectElement(this.LastElement);
    	},
    	inspectElement : function(_target)
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

			var text = "<div>Node Level: " + this.NodeLevel + "</div>";
			text += "<div>Inspector State: " + this.State + "</div>";
			text += "<div>Type: " + elem.tagName + "</div>";
			text += "<div>Classes: " + elem.classList + "</div>";
			if (this.State > this.States.Simple)
				$(elem).addClass("dom-element-inspector-selected");
			if (this.State > this.States.Border)
				text += "<div> Styles: " + JSON.stringify(this.getUniqueUserStyling(elem)) + " </div>";
			this.Tooltip.html(text)
    	},
    	getParentByLevel : function(element, level) {
    		var parent = element;
    		for (var i = 0; i < level; i++) {
    			parent = parent.parentNode;
    		}
    		return parent;
    	},
    	// Copied from https://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
    	getDefaultStyling : function(tagName){
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
    	},
    	// Copied from https://stackoverflow.com/questions/22907735/get-the-computed-style-and-omit-defaults
    	getUniqueUserStyling : function(element){
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
    }
    this.mElementInspector.Tooltip.appendTo($('body'));

    $(document.body).mouseover(function (ev) {
    	return Screens.DevConsoleJSConnection.mElementInspector.inspectElement(ev.target);
    })
}

DevConsoleJSConnection.prototype = Object.create(MSUBackendConnection.prototype);
Object.defineProperty(DevConsoleJSConnection.prototype, 'constructor', {
    value: DevConsoleJSConnection,
    enumerable: false,
    writable: true
});

DevConsoleJSConnection.prototype.reloadCSS = function(_path)
{
	var self = this;
	var done = false;
	var registeredFiles = document.getElementsByTagName("link");
	var filePath = _path === null ? null : "coui://ui/" + _path
	if(filePath === null)
		logConsole("Reloading all CSS files")

	var queryString = '?reload=' + new Date().getTime();
	$('link[rel="stylesheet"]').each(function () {
		if (done) return;
		if (filePath !== null)
		{
			if (this.href.split("?")[0] === filePath)
			{
				done = true;
				this.href = this.href.replace(/\?.*|$/, queryString);
				logConsole("Reloaded " + filePath)
			}
			return;
		}
	    this.href = this.href.replace(/\?.*|$/, queryString);
	});
	if (filePath !== null && !done)
	{
		logConsole("Did not find CSS file with path " + _path)
	}
};

DevConsoleJSConnection.prototype.reloadJS = function(_path)
{
	var reload = function(_file)
	{
		_file.remove()
		var js = document.createElement("script");
		js.src = _file.src;
		js.type = "text/javascript"
		document.body.appendChild(js);
	}
	var self = this;
	var registeredFiles = document.getElementsByTagName("script");
	var passedPath = _path !== undefined && _path !== null;
	if(!passedPath)
		logConsole("Reloading all JS files")
	for (var idx = 0; idx < registeredFiles.length; idx++) {
		if (passedPath)
		{
			if (registeredFiles[idx].src == ("coui://ui/" + _path))
			{
				logConsole("Reloading JS file " + registeredFiles[idx].src)
				reload(registeredFiles[idx]);
				delete reload;
				return;
			}
		}
		else
		{
			reload(registeredFiles[idx]);
		}
	}
	if (passedPath)
	{
		logConsole("Did not find JS file with path " + _path)
	}
	delete reload;
};


DevConsoleJSConnection.prototype.JSONParseToString = function(_data)
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, "receiveJSONData", JSON.stringify(_data));
    }
}

DevConsoleJSConnection.prototype.JSONParseFromString = function(_string)
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, "receiveJSONData", JSON.parse(_string));
    }
}

DevConsoleJSConnection.prototype.toggleElementInspector = function()
{
    this.mElementInspector.toggleState();
}

DevConsoleJSConnection.prototype.toggleElementInspectorLevel = function(_int)
{
  	this.mElementInspector.changeNodeLevel(_int);
}


registerScreen("DevConsoleJSConnection", new DevConsoleJSConnection());
