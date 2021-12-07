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
		PreviousCommands = []
	},
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


	function onOkButtonPressed()
	{
		if (this.m.OnOkButtonPressedListener != null)
		{
			this.m.OnOkButtonPressedListener();
		}
	}

	function onCancelButtonPressed()
	{
		if (this.m.OnCancelButtonPressedListener != null)
		{
			this.m.OnCancelButtonPressedListener();
		}
	}
	function clearEventListener()
	{
		this.m.OnConnectedListener = null;
		this.m.OnDisconnectedListener = null;
		this.m.OnScreenHiddenListener = null;
		this.m.OnScreenShownListener = null;
	}

	function create()
	{
		this.m.Visible = false;
		this.m.Animating = false;
		if (this.Tactical.isActive())
		{
			this.m.JSHandle = this.UI.connect("TacticalDevConsoleScreen", this);
		}
		else
		{
			this.m.JSHandle = this.UI.connect("DevConsoleScreen", this);
		}
	}

	function destroy()
	{
		this.clearEventListener();
		this.m.JSHandle = this.UI.disconnect(this.m.JSHandle);
	}

	function show()
	{

		if (this.m.JSHandle != null && !this.isVisible())
		{
			this.Tooltip.hide();
			this.setPreviousCommands()
			this.m.JSHandle.asyncCall("show", null);
		}
	}
	

	function hide()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.Tooltip.hide();
			this.updatePreviousCommands()
			this.m.JSHandle.asyncCall("hide", null);
		}
	}

	function onOkButtonPressed(_data)
	{
		
		if(this.Tactical.isActive()) this.Tactical.State.toggleDevConsoleScreen()
		else this.World.State.toggleDevConsoleScreen()
		this.onDevConsoleCommand(_data)
	}

	function onOkInConsoleButtonPressed(_data)
	{
		this.onDevConsoleCommand(_data, true)
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

	function onCancelButtonPressed()
	{
		if(this.Tactical.isActive()) this.Tactical.State.toggleDevConsoleScreen()
		else this.World.State.toggleDevConsoleScreen()
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
		}
	}
	function onDownArrowPressed()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
			this.m.JSHandle.asyncCall("changeLatestInput", 1);
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

