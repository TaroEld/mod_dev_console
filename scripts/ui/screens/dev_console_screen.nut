this.dev_console_screen <- ::inherit("scripts/mods/msu/ui_screen", {
	m = {
		ID = "DevConsoleScreen",
		PreviousCommands = [],
		SpawnUnit = {
			SpawnUnitScript = "",
			SpawnUnitFaction = this.Const.Faction.Enemy
		},
	},

	function show()
	{
		local activeState = ::MSU.Utils.getActiveState();
		activeState.onHide();
		switch(activeState.ClassName)
		{
			case "tactical_state":
				::DevConsole.Mod.Debug.printWarning("Show in tactical")
				activeState.setPause(true);
				activeState.m.MenuStack.push(function ()
				{
					::DevConsole.Screen.hide();
					this.onShow();
					this.setPause(false);
				});
				break;

			case "world_state":
				::DevConsole.Mod.Debug.printWarning("Show in world")
				activeState.setAutoPause(true);
				activeState.m.MenuStack.push(function ()
				{
					::DevConsole.Screen.hide();
					this.onShow();
					this.setAutoPause(false);
				});
				break;

			case "main_menu_state":
				::DevConsole.Mod.Debug.printWarning("Show in main menu")
				activeState.m.MenuStack.push(function ()
				{
					::DevConsole.Screen.hide();
					this.onShow();
				});
				break;
		}
		this.Tooltip.hide();
		this.setPreviousCommands();
		this.m.JSHandle.asyncCall("show", null);
		return false;
	}
	
	function hide()
	{
		::DevConsole.Mod.Debug.printWarning("Hide called")
		if (this.isVisible())
		{
			local activeState = ::MSU.Utils.getActiveState();
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

		if (this.isVisible())
		{
			this.hide();
		}
		else
		{
			this.show();
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
		if (this.m.LastTileHovered != null && this.m.LastTileHovered.IsEmpty && this.m.SpawnUnit.SpawnUnitScript != "")
		{
			local script = this.m.SpawnUnit.SpawnUnitScript
			local entity = this.Tactical.spawnEntity(script);
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

		this.addPreviousCommand([cmd, true]);
		this.updatePreviousCommands()

		//remove ominous ctrl character
		local ctrl = ""
		if (cmd.find(ctrl) != null)
		{
			cmd = split(cmd, ctrl).reduce(@(a,b) a+b)
		}

		this.logInfo("Command: " + cmd)

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
			if (output)
			{
				::logInfo("Output: " + ::MSU.Log.getLocalString(output, 10, 2, true, true));
			}
		}

		::logInfo("-------------------------------------------------------------------------------------------------------------------------------------------------------------\n")
	}

	function logEx( _text, _type = "message")
	{
		if (this.m.JSHandle != null)
		{
			this.m.JSHandle.asyncCall("log", {
				Text = _text,
				Type = _type
			});
		}
	}

	function log( _text, _type = "message")
	{
		this.logEx("\n" + _text, _type);
	}

	function addPreviousCommand(_data)
	{
		this.m.PreviousCommands.insert(0, _data);
		if(this.m.PreviousCommands.len() > 10) this.m.PreviousCommands.pop();
	}

	function updatePreviousCommands()
	{
		if(this.m.PreviousCommands.len() == 0) return
		local activeState = ::MSU.Utils.getActiveState();
		if(activeState.ClassName == "main_menu_state") return;
		foreach(idx, command in this.m.PreviousCommands)
		{
			this.World.Statistics.getFlags().set("DevCommand" + idx, command[0])
			this.World.Statistics.getFlags().set("DevCommandEnv" + idx, command[1])
			if (idx == 10) return
		}
	}

	function setPreviousCommands()
	{
		local activeState = ::MSU.Utils.getActiveState();
		if(activeState.ClassName == "main_menu_state") return;
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

