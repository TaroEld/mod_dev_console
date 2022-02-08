this.dev_console_screen <- {
	m = {
		JSHandle = null,
		Visible = null,
		Animating = null,
		OnConnectedListener = null,
		OnDisconnectedListener = null,
		OnScreenShownListener = null,
		OnScreenHiddenListener = null,
		OnClosePressedListener = null,
		PreviousCommands = [],
		SpawnUnit = {
			SpawnUnitScript = "",
			SpawnUnitFaction = this.Const.Faction.Enemy
		},
	},

	function create()
	{
		this.m.Visible = false;
		this.m.Animating = false;
		this.m.JSHandle = this.UI.connect("DevConsoleScreen", this);
	}

	function destroy()
	{
		this.clearEventListener();
		this.m.JSHandle = this.UI.disconnect(this.m.JSHandle);
	}

	function toggle(){
		if (this.isVisible()){
			this.hide();
		}
		else{
			this.show();
		}
	}

	function show()
	{
		::printLog("Show called", "zmod_dev_console")
		if (this.Tactical.isActive()){
			::printLog("Show in tactical", "zmod_dev_console")
			local state = this.Tactical.State
			state.setPause(true);
			#state.Tooltip.hide();
			state.m.TacticalScreen.hide();
			this.Cursor.setCursor(this.Const.UI.Cursor.Hand);
			state.m.MenuStack.push(function ()
			{
				this.setPause(false);
				this.m.TacticalScreen.show();
			}.bindenv(state), function ()
			{
				return true
			});
		}
		else{
			::printLog("Show in world", "zmod_dev_console")
			local state = this.World.State
			state.m.CustomZoom = this.World.getCamera().Zoom;
			this.World.getCamera().zoomTo(1.0, 4.0);
			this.World.Assets.updateFormation();
			state.setAutoPause(true);
			state.m.WorldScreen.hide();
			this.Cursor.setCursor(this.Const.UI.Cursor.Hand);
			state.m.MenuStack.push(function ()
			{
				this.logInfo("menustack called")
				this.World.getCamera().zoomTo(this.m.CustomZoom, 4.0);
				this.m.WorldScreen.show();
				this.World.Assets.refillAmmo();
				this.updateTopbarAssets();
				this.setAutoPause(false);
			}.bindenv(state), function ()
			{
				return true
			});
		}

		this.Tooltip.hide();
		this.setPreviousCommands();
		this.m.JSHandle.asyncCall("show", null);
		return false;
	}
	

	function hide()
	{
		::printLog("Hide called", "zmod_dev_console")
		::printLog("visible: " + this.isVisible(), "zmod_dev_console")
		local state = this.Tactical.isActive() ? this.Tactical.State : this.World.State
		if(this.isVisible()){
			this.Tooltip.hide();
			this.updatePreviousCommands()
			this.m.JSHandle.asyncCall("hide", null);
			state.m.MenuStack.pop();
			return false
		}
	}

	function isVisible()
	{
		return this.m.Visible != null && this.m.Visible == true;
	}

	function isAnimating()
	{
		return this.m.Animating != null && this.m.Animating == true;
	}

	function setOnConnectedListener( _listener )
	{
		this.m.OnConnectedListener = _listener;
	}

	function setOnDisconnectedListener( _listener )
	{
		this.m.OnDisconnectedListener = _listener;
	}
	
	function setOnClosePressedListener( _listener )
	{
		this.m.OnClosePressedListener = _listener;
	}


	function onCancelButtonPressed()
	{
		this.hide()
	}

	function clearEventListener()
	{
		this.m.OnConnectedListener = null;
		this.m.OnDisconnectedListener = null;
		this.m.OnScreenHiddenListener = null;
		this.m.OnScreenShownListener = null;
	}

	function onOkButtonPressed(_data)
	{
		
		this.hide();
		this.onDevConsoleCommand(_data)
	}

	function onOkInConsoleButtonPressed(_data)
	{
		this.onDevConsoleCommand(_data, true)
	}

	function onSpawnUnitPressed(){
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

	function onDevConsoleCommand(_data, _fromConsole = false)
	{
		local printcall = function(_text){
			if (_fromConsole) this.logConsole(_text)
			else this.logInfo(_text)
		}
		local cmd = _data[0]
		if (cmd == null || cmd == "") return;
		this.m.PreviousCommands.push(cmd)
		this.updatePreviousCommands()
		//remove ominous ctrl character
		local ctrl = ""
		if (cmd.find(ctrl) != null){
			cmd = split(cmd, ctrl).reduce(@(a,b) a+b)
		}
		local args = _data[1]
		args = split(args, ",")
		local compiledScript, output;
		
		local compiled = true;

		printcall(cmd)
		try{
			compiledScript = compilestring(cmd)
		}
		catch(exception){
			printcall("Failed to compile command, Error: "  + exception)
			compiled = false;
		}
		if(compiled){
			try{
				output = compiledScript.call(this, args)
			}
			catch(exception){
				printcall("Failed to run command, Error: " + exception)
			}
		}
		if (output != null){
			printcall(output)
		}

		printcall("-------------------------------------------------------------------------------------------------------------------------------------------------------------\n")
	}


	function log_newline()
	{
		this.m.JSHandle.asyncCall("log", "\n");
	}

	function logEx( _text )
	{
		this.m.JSHandle.asyncCall("log", _text);
	}

	function log( _text )
	{
		this.m.JSHandle.asyncCall("log", "\n" + _text);
	}

	function onScreenConnected()
	{
		if (this.m.OnConnectedListener != null)
		{
			this.m.OnConnectedListener();
		}
	}

	function onScreenDisconnected()
	{
		if (this.m.OnDisconnectedListener != null)
		{
			this.m.OnDisconnectedListener();
		}
	}


	function onScreenShown()
	{
		this.m.Visible = true;
		this.m.Animating = false;
	}

	function onScreenHidden()
	{
		this.m.Visible = false;
		this.m.Animating = false;

	}

	function onScreenAnimating()
	{
		this.m.Animating = true;
	}

	function onUpArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.m.JSHandle.asyncCall("changeLatestInput", -1);
			return false
		}
	}
	function onDownArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.m.JSHandle.asyncCall("changeLatestInput", 1);
			return false
		}
	}

	function updatePreviousCommands()
	{
		if(this.m.PreviousCommands.len() == 0) return
		local commands = clone(this.m.PreviousCommands)
		commands.reverse()
		foreach(idx, command in commands)
		{
			this.World.Statistics.getFlags().set("DevCommand" + idx, command)
			if (idx == 10) return
		}
	}

	function setPreviousCommands()
	{
		if (this.m.JSHandle != null)
		{
			local commands = []
			local idx = 0
			while (this.World.Statistics.getFlags().has("DevCommand" + idx)){
				commands.push(this.World.Statistics.getFlags().get("DevCommand" + idx))
				idx++
			}
			commands.reverse()
			this.m.JSHandle.asyncCall("setPreviousCommands", commands);
		}
	}

};

