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
	var registeredFiles = document.getElementsByTagName("link");
	for (var idx = 0; idx < registeredFiles.length; idx++) {
		if (_path !== undefined && _path !== null)
		{
			if (registeredFiles[idx].href == ("coui://ui/" + _path))
			{
				logConsole("updating " + registeredFiles[idx].href)
				registeredFiles[idx].href = registeredFiles[idx].href;
				return;
			}
		}
		else
		{
			logConsole("updating " + registeredFiles[idx].href)
			registeredFiles[idx].href = registeredFiles[idx].href;
		}
	}
};

DevConsoleJSConnection.prototype.reloadJS = function(_path)
{
	var self = this;
	var registeredFiles = document.getElementsByTagName("script");
	for (var idx = 0; idx < registeredFiles.length; idx++) {
		if (_path !== undefined && _path !== null)
		{
			if (registeredFiles[idx].src == ("coui://ui/" + _path))
			{
				logConsole("updating " + registeredFiles[idx].src)
				registeredFiles[idx].src = registeredFiles[idx].src;
				return;
			}
		}
		else
		{
			logConsole("updating " + registeredFiles[idx].src)
			registeredFiles[idx].src = registeredFiles[idx].src;
		}
	}
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


registerScreen("DevConsoleJSConnection", new DevConsoleJSConnection());
