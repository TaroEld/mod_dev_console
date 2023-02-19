this.dev_console_screen <- ::inherit("scripts/mods/msu/ui_screen", {
	m = {
		ID = "DevConsoleScreen",
		PreviousCommands = [],
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
			this.m.JSHandle.asyncCall("changeLatestInput", 1);
			return true
		}
	}

	function onDownArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.m.JSHandle.asyncCall("changeLatestInput", -1);
			return true
		}
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

		//remove ominous ctrl character
		local ctrl = ""
		if (cmd.find(ctrl) != null)
		{
			cmd = split(cmd, ctrl).reduce(@(a,b) a+b)
		}

		this.logInfo("Command: " + cmd)
		::logInfo("-------------------------------------------------------------------------------------------------------------------------------------------------------------\n")

		local compiledScript, output;
		try {
			compiledScript = compilestring(cmd)
		}
		catch(exception)
		{
			::logError("Failed to compile command, Error: "  + exception)
		}

		if (compiledScript != null)
		{
			try
			{
				output = compiledScript.call(this)
			}
			catch (exception)
			{
				::logError("Failed to run command, Error: " + exception)
			}
			::logInfo("Output: " + ::MSU.Log.getLocalString(output, 10, 2, true, true));
		}

		::logInfo("-------------------------------------------------------------------------------------------------------------------------------------------------------------\n")
	}

	function logEx( _text, _type = "message")
	{
		if (this.m.JSHandle != null)
		{
			try {
				this.m.JSHandle.asyncCall("log", {
					Text = _text,
					Type = _type
				});
			}
			catch (exception){
				::logError("Dev console would have crashed for some reason")
			}
		}
	}

	function log( _text, _type = "message")
	{
		this.logEx("\n" + _text, _type);
	}

	function addPreviousCommand(_data)
	{
		this.m.PreviousCommands.insert(0, _data);
		if (this.m.PreviousCommands.len() > 10)
			this.m.PreviousCommands.pop();
	}

	function updatePreviousCommands()
	{
		if(this.m.PreviousCommands.len() == 0)
			return
		local activeState = ::MSU.Utils.getActiveState();
		if (activeState.ClassName == "main_menu_state")
			return;
		if (activeState.ClassName == "tactical_state" && this.Tactical.State.isScenarioMode())
			return
		foreach (idx, command in this.m.PreviousCommands)
		{
			this.World.Statistics.getFlags().set("DevCommand" + idx, command[0])
			this.World.Statistics.getFlags().set("DevCommandEnv" + idx, command[1])
			if (idx == 10) return
		}
	}

	function setPreviousCommands()
	{
		local activeState = ::MSU.Utils.getActiveState();
		if (activeState.ClassName == "main_menu_state")
			return;
		if (activeState.ClassName == "tactical_state" && this.Tactical.State.isScenarioMode())
			return
		this.m.PreviousCommands.clear();
		for (local i = 10; i != -1; i--)
		{
			local command = this.World.Statistics.getFlags().get("DevCommand" + i);
			if (command)
			{
				this.addPreviousCommand([command, this.World.Statistics.getFlags().get("DevCommandEnv" + i)]);
			}
		}

		if (this.m.JSHandle != null)
		{
			this.m.JSHandle.asyncCall("setPreviousCommands", this.m.PreviousCommands);
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
});

