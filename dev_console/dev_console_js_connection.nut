this.dev_console_js_connection <- ::inherit("scripts/mods/msu/js_connection", {
	m = {
		ID = "DevConsoleJSConnection",
		LastParsedData = null,
	}

	function connect()
	{
		this.m.JSHandle = this.UI.connect(this.m.ID, this);
	}

	function JSONParseToString(_data)
	{
		this.m.JSHandle.call("JSONParseToString", _data);
	}

	function JSONParseFromString(_data)
	{
		this.m.JSHandle.call("JSONParseFromString", _data);
	}

	function receiveJSONData(_data)
	{
		this.m.LastParsedData <- _data;
	}


	function reloadCSS(_path = null)
	{
		this.m.JSHandle.asyncCall("reloadCSS", _path);
	}

	function reloadJS(_path = null)
	{
		this.m.JSHandle.asyncCall("reloadJS", _path);
	}
})
