this.dev_console_screen <- ::inherit("scripts/mods/msu/ui_screen", {
	MAX_COMMAND_HISTORY = 100,
	m = {
		ID = "DevConsoleScreen",
		PreviousCommands = [],
		PreviousCommandIndex = 0,
		SpawnUnit = {
			SpawnUnitScript = "",
			SpawnUnitFaction = this.Const.Faction.Enemy
		},
		States = {
			Hidden = 0,
			Small = 1,
			Large = 2
		}
		CurrentState = 0
		BufferMax = 1000
		Buffer = []
	},

	function show()
	{
		this.m.CurrentState = this.m.States.Small;
		local activeState = ::MSU.Utils.getActiveState();
		switch(activeState.ClassName)
		{
			case "tactical_state":
				::DevConsole.Mod.Debug.printWarning("Show in tactical")
				activeState.setPause(true);
				activeState.m.MenuStack.push(function ()
				{
					this.setPause(false);
				});
				break;

			case "world_state":
				::DevConsole.Mod.Debug.printWarning("Show in world")
				activeState.setAutoPause(true);
				activeState.m.MenuStack.push(function ()
				{
					this.setAutoPause(false);
				});
				break;

			case "main_menu_state":
				::DevConsole.Mod.Debug.printWarning("Show in main menu")
				activeState.m.MenuStack.push(function (){});
				break;
		}
		this.Tooltip.hide();
		this.setPreviousCommands();
		this.m.JSHandle.asyncCall("show", null);
		return false;
	}

	function enlarge()
	{
		this.m.CurrentState = this.m.States.Large;
		this.m.JSHandle.asyncCall("enlarge", null);
	}
	
	function hide()
	{
		this.m.CurrentState = this.m.States.Hidden;
		::DevConsole.Mod.Debug.printWarning("Hide called")
		if (this.isVisible())
		{
			this.updatePreviousCommands()
			this.m.JSHandle.asyncCall("hide", null);
			::MSU.Utils.getActiveState().m.MenuStack.pop();
			return false
		}
	}

	function toggle()
	{
		if(this.m.Animating)
		{
			return false
		}
		if (this.m.CurrentState == this.m.States.Hidden)
		{
			this.show();
		}
		else if (this.m.CurrentState == this.m.States.Small)
		{
			this.enlarge();
		}
		else
		{
			this.hide();
		}
		return true;
	}

	function onCancelButtonPressed()
	{
		this.hide()
	}

	function onUpArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.changeLatestInput(1);
			return true;
		}
	}

	function onDownArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.changeLatestInput(-1);
			return true;
		}
	}

	function changeLatestInput(_int)
	{
	    local currentLen = this.m.PreviousCommands.len();
	    local previousLen = this.m.PreviousCommandIndex;
	    local nextLen = previousLen + _int;
	    if (nextLen < 0)
	    	nextLen = 0;
	    if (nextLen > this.MAX_COMMAND_HISTORY)
	    	nextLen = this.MAX_COMMAND_HISTORY;
	    if (nextLen == currentLen)
	    	nextLen -= 1;
	    this.m.PreviousCommandIndex = nextLen;
	    local command = this.m.PreviousCommands[nextLen][0];
	    local environment = this.m.PreviousCommands[nextLen][1];
	    this.m.JSHandle.asyncCall("changeLatestInput", {
	    	command = command,
	    	environment = environment
	    });
	}

	function onSpawnUnitPressed()
	{
		local tile = ::Tactical.State.m.LastTileHovered;
		if (tile != null && tile.IsEmpty && this.m.SpawnUnit.SpawnUnitScript != "")
		{
			local script = this.m.SpawnUnit.SpawnUnitScript
			local entity = this.Tactical.spawnEntity(script, tile.Coords.X, tile.Coords.Y);
			local selectedFaction = this.m.SpawnUnit.SpawnUnitFaction
			if (selectedFaction != this.Const.Faction.Player && selectedFaction != this.Const.Faction.Enemy) selectedFaction = this.World.FactionManager.getFactionOfType(selectedFaction).getID()
			entity.setFaction(selectedFaction);
			entity.assignRandomEquipment();
		}
	}

	function onDevConsoleCommand(_data)
	{
		local cmd = _data
		if (cmd == null || cmd == "") return;

		this.updatePreviousCommands()

		local logOptions = this.mergeOptions({ParseHTML=false, Type="system"});
		//remove ominous ctrl character
		local ctrl = ""
		if (cmd.find(ctrl) != null)
		{
			cmd = split(cmd, ctrl).reduce(@(a,b) a+b)
		}

		::logInfo("Command: " + cmd, logOptions)

		local compiledScript, output;
		try {
			compiledScript = compilestring(cmd)
		}
		catch(exception)
		{
			::logError("Failed to compile command, Error: "  + exception, logOptions)
		}

		if (compiledScript != null)
		{
			try
			{
				output = compiledScript.call(this)
			}
			catch (exception)
			{
				::logError("Failed to run command, Error: " + exception, logOptions)
			}
			::logInfo("Output: " + ::MSU.Log.getLocalString(output, 10, 2, true, true), logOptions);
		}
	}

	function log( _text, _options)
	{
		if (_text == null) _text = "null";
		else {
			try {
				local tostr = _text.tostring();
				_text = tostr;
			}
			catch (error){}
		}
		this.m.Buffer.push({Text = _text, Environment = 0, Type = _options.Type, Options = _options})
		local l = this.m.Buffer.len();
		if (l >= this.m.BufferMax * 2) {
			this.m.Buffer = this.m.Buffer.slice(l - this.m.BufferMax, l);
		}
	}

	function pullBuffer() {
		local buffer = this.m.Buffer;
		this.m.Buffer = [];
		return buffer;
	}

	function addPreviousCommand(_data)
	{
		if (this.m.PreviousCommands.len() > 0
			&& this.m.PreviousCommands[this.m.PreviousCommandIndex][0] == _data[0]
			&& this.m.PreviousCommands[this.m.PreviousCommandIndex][1] == _data[1]
		) {
			return;
		}
		this.m.PreviousCommands.insert(0, _data);
		if (this.m.PreviousCommands.len() > this.MAX_COMMAND_HISTORY)
			this.m.PreviousCommands.pop();
		this.m.PreviousCommandIndex = 0;
	}

	function updatePreviousCommands()
	{
		if(this.m.PreviousCommands.len() == 0)
			return
		::DevConsole.Mod.PersistentData.createFile("PreviousCommands", this.m.PreviousCommands);
	}

	function setPreviousCommands()
	{
		this.m.PreviousCommands.clear();
		if (!::DevConsole.Mod.PersistentData.hasFile("PreviousCommands"))
			return;
		local commands = ::DevConsole.Mod.PersistentData.readFile("PreviousCommands");
		for (local i = commands.len() - 1; i != -1; i--)
		{
			this.addPreviousCommand(commands[i]);
		}
	}

	function checkRunCommandInConsole()
	{
		return this.checkRunCommand(true);
	}

	function checkRunCommand(_bool = false)
	{
		if (this.isVisible)
		{
			this.m.JSHandle.asyncCall("checkRunCommand", _bool);
			return true;
		}
	}

	function printCommands(_idx)
	{
		::logInfo("-----")
		foreach(idx, entry in this.m.PreviousCommands)
		{
			local idxStr = (idx == _idx) ? "* " + idx : idx;
			::logInfo(idxStr + " : " + entry[0]);
		}
	}

	function mergeOptions(_options)
	{
		local defaultOptions = {
			Dev = true,
			Type = "message",
			ParseHTML = true,
		}
		if (_options == null)
			return defaultOptions;
		foreach(key, value in _options){
			defaultOptions[key] = value;
		}
		return defaultOptions;
	}
});

