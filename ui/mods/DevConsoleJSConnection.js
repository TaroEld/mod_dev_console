var DevConsoleJSConnection = function(_parent)
{
    MSUBackendConnection.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleJSConnection";
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

DevConsoleJSConnection.prototype.toggleElementInspectorState = function()
{
    ElementInspector.toggleState();
}

DevConsoleJSConnection.prototype.setElementInspectorState = function(_val)
{
    ElementInspector.setState(_val);
}

DevConsoleJSConnection.prototype.changeElementInspectorLevel = function(_int)
{
  	ElementInspector.changeNodeLevel(_int);
}

DevConsoleJSConnection.prototype.lockElementInspector = function()
{
  	ElementInspector.lockElement();
}

DevConsoleJSConnection.prototype.finalize = function(){
	ElementInspector.State = MSU.getSettingValue(DevConsole.mModID, "ElementInspectorDefaultLevel");
}

DevConsoleJSConnection.prototype.setKeybindsDisabled = function(_val)
{
  	SQ.call(this.mSQHandle, "setKeybindsDisabled", _val);
}


registerScreen("DevConsoleJSConnection", new DevConsoleJSConnection());
