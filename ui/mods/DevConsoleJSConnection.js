var DevConsoleJSConnection = function(_parent)
{
    MSUBackendConnection.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleJSConnection";
    this.mRegisteredCSSHooks = {};
    this.mRegisteredJSHooks = {};
}

DevConsoleJSConnection.prototype = Object.create(MSUBackendConnection.prototype);
Object.defineProperty(DevConsoleJSConnection.prototype, 'constructor', {
    value: DevConsoleJSConnection,
    enumerable: false,
    writable: true
});

DevConsoleJSConnection.prototype.onConnection = function(handle)
{
	MSUBackendConnection.prototype.onConnection.call(this, handle);
	var self = this;
	console.error("onConnection ruins")
	SQ.call(this.mSQHandle, "getRegisteredHooks", null, function(_tables) {
		var path;
		var registeredJS = document.getElementsByTagName("link");
		var registeredCSS = document.getElementsByTagName("script");
		for (var i=0; i<_tables.css.length; i++)
		{
			path = _tables.css[i];
			for (var y = 0; y < registeredCSS.length; y++) {
				if (registeredCSS[i].src = path)
				{
					self.mRegisteredCSSHooks[path] = registeredCSS[i]
					break;
				}

			}
		}
		for (var i=0; i<_tables.js.length; i++)
		{
			path = _tables.js[i];
			for (var y = 0; y < registeredJS.length; y++) {
				if (registeredJS[i].src = path)
				{
					self.mRegisteredJSHooks[path] = registeredJS[i]
					break;
				}
			}
		}
	});
}

DevConsoleJSConnection.prototype.registerCSSHook = function(_path)
{
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = _path;
	this.mRegisteredCSSHooks[_path] = link;
	document.body.appendChild(link);
};

DevConsoleJSConnection.prototype.registerJSHook = function(_path)
{
	var js = document.createElement("script");
	js.src = _path;
	this.mRegisteredJSHooks[_path] = js;
	document.body.appendChild(js);
};

DevConsoleJSConnection.prototype.reloadCSSFile = function(_path)
{
	console.error("reloading " +  _path)
	if (!(_path in this.mRegisteredCSSHooks))
	{
		console.error("No registered css file with path " + _path + " + to reset!")
		return;
	}
	this.mRegisteredCSSHooks[_path].remove();
	this.registerCSSHook(_path);
};

DevConsoleJSConnection.prototype.reloadJSFile = function(_path)
{
	if (!(_path in this.mRegisteredJSSHooks))
	{
		console.error("No registered js file with path " + _path + " + to reset!")
		return;
	}
	this.mRegisteredJSSHooks[_path].remove();
	this.registerJSHook(_path);
};

DevConsoleJSConnection.prototype.reloadCSS = function(_path)
{
	var self = this;
	if (_path !== null && _path !== undefined)
		return this.reloadCSSFile(_path)
	MSU.iterateObject(this.mRegisteredCSSHooks, function(_key, _value){
		self.reloadCSSFile(_key)
	})
};

DevConsoleJSConnection.prototype.reloadJS = function(_path)
{
	if (_path != null)
		return this.reloadJSFile(_path)
	for (var i=0; i < this.mRegisteredJSHooks.length; i++)
	{
		this.reloadJSFile(this.mRegisteredJSHooks[i].src)
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
