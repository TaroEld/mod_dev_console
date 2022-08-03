::DevConsole <- {
	ID = "mod_dev_console",
	Version = "1.0.0",
	Name = "Dev Console"
}
::mods_registerMod(::DevConsole.ID, ::DevConsole.Version);
::mods_queue(::DevConsole.ID, "mod_msu", function()
{	
	::mods_registerJS("DevConsoleScreen.js");
	::mods_registerCSS("DevConsoleScreen.css");
	
	::DevConsole.Mod <- ::MSU.Class.Mod(::DevConsole.ID, ::DevConsole.Version, ::DevConsole.Name); 
	::DevConsole.Mod.Debug.disable(); 
	::DevConsole.Screen <- this.new("scripts/ui/screens/dev_console_screen");
	::MSU.UI.registerConnection(::DevConsole.Screen);

	::DevConsole.Mod.Keybinds.addSQKeybind("toggleDevConsoleScreen", "ctrl+g", ::MSU.Key.State.All,  ::DevConsole.Screen.toggle.bindenv( ::DevConsole.Screen));
	::DevConsole.Mod.Keybinds.addSQKeybind("closeDevConsoleScreen", "escape", ::MSU.Key.State.All,  ::DevConsole.Screen.hide.bindenv( ::DevConsole.Screen));
	::DevConsole.Mod.Keybinds.addSQKeybind("onUpPressedDevConsoleScreen", "ctrl+up", ::MSU.Key.State.All, ::DevConsole.Screen.onUpArrowPressed.bindenv( ::DevConsole.Screen));
	::DevConsole.Mod.Keybinds.addSQKeybind("onDownPressedDevConsoleScreen", "ctrl+down",  ::MSU.Key.State.All, ::DevConsole.Screen.onDownArrowPressed.bindenv( ::DevConsole.Screen));
	::DevConsole.Mod.Keybinds.addSQKeybind("onSpawnUnitDevConsoleScreen", "ctrl+z", ::MSU.Key.State.Tactical, ::DevConsole.Screen.onSpawnUnitPressed.bindenv( ::DevConsole.Screen));

	// ::DevConsole.Mod.Keybinds.addSQKeybind("Run", "enter",  ::MSU.Key.State.All, ::DevConsole.Screen.checkRunCommand.bindenv( ::DevConsole.Screen));
	// ::DevConsole.Mod.Keybinds.addSQKeybind("RunInConsole", "shift+enter", ::MSU.Key.State.All, ::DevConsole.Screen.checkRunCommandInConsole.bindenv( ::DevConsole.Screen));

	// ::DevConsole.Mod.Keybinds.addJSKeybind("Run", "return");
	::DevConsole.Mod.Keybinds.addJSKeybind("RunInConsole", "shift+return");

	local generalPage = ::DevConsole.Mod.ModSettings.addPage("General");
	generalPage.addBooleanSetting("PrintForParser", false, "Print for Parser", "Prints all lines to the log to be parsed.");
	generalPage.addColorPickerSetting("BackgroundColor", "0,0,0,1.0", "Background Color");
	generalPage.addColorPickerSetting("message", "36,140,182, 1.0", "Font Color logInfo");
	generalPage.addColorPickerSetting("warning", "241,90,34,1.0", "Font Color logWarning");
	generalPage.addColorPickerSetting("error", "255,0,0,1.0", "Font Color logError");
	local resetButton = generalPage.addButtonSetting("reset", null, "Reset Settings");
	resetButton.addCallback(function(_data = null){
		foreach(setting in ::DevConsole.Mod.ModSettings.getAllSettings())
		{
			if(setting.getID() != "reset")
			{
				setting.reset();
			}
		}
	})

	local logInfo = ::logInfo
	::logInfo = function(_msg)
	{
		if(::DevConsole.Screen != null && ::DevConsole.Screen.isConnected()) ::DevConsole.Screen.log(_msg)
		logInfo(_msg)
	}
	local logWarning = ::logWarning
	::logWarning = function(_msg)
	{
		if(::DevConsole.Screen != null && ::DevConsole.Screen.isConnected()) ::DevConsole.Screen.log(_msg, "warning")
		logWarning(_msg)
	}
	local logError = ::logError
	::logError = function(_msg)
	{
		if(::DevConsole.Screen != null && ::DevConsole.Screen.isConnected()) ::DevConsole.Screen.log(_msg, "error")
		logError(_msg)
	}
})
