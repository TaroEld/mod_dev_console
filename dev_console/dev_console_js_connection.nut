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

	function toggleElementInspectorState()
	{
		this.m.JSHandle.asyncCall("toggleElementInspectorState", null);
		return true;
	}

	function setElementInspectorState(_int)
	{
		if (this.m.JSHandle == null)
			return
		this.m.JSHandle.asyncCall("setElementInspectorState", _int);
		return true;
	}

	function changeElementInspectorLevel(_int)
	{
		this.m.JSHandle.asyncCall("changeElementInspectorLevel", _int);
		return true;
	}

	function lockElementInspector()
	{
		this.m.JSHandle.asyncCall("lockElementInspector", null);
		return true;
	}


	function finalize()
	{
		this.m.JSHandle.asyncCall("finalize", null);
		return true;
	}

	function updateGlobalDebugState(_newState)
	{
		if (this.m.JSHandle == null)
			return
		this.m.JSHandle.asyncCall("updateGlobalDebugState", {newState = _newState});
	}

	function updateRowDebugState(_key, _newState)
	{
		if (this.m.JSHandle == null)
			return
		this.m.JSHandle.asyncCall("updateRowDebugState", {key = _key, newState = _newState});
	}

	function addDebugInfo(_text)
	{
		::logConsole("Debug: " + _text);
		if (this.m.JSHandle == null)
			return
		this.m.JSHandle.asyncCall("addDebugInfo", _text);
	}
})
