::DevConsole <- {
	ID = "mod_dev_console",
	Version = "2.2.1",
	Name = "Dev Console",
}
::mods_registerMod(::DevConsole.ID, ::DevConsole.Version);
::mods_queue(::DevConsole.ID, "mod_msu", function()
{	
	::DevConsole.Mod <- ::MSU.Class.Mod(::DevConsole.ID, ::DevConsole.Version, ::DevConsole.Name);
	::Const.AI.ParallelizationMode = false;
	::include("dev_console/dev_console_js_connection");
	::include("dev_console/dev_console_utils");
	::mods_registerJS("DevConsoleUtils.js");
	::mods_registerJS("DevConsoleElementInspector.js");
	::mods_registerJS("DevConsoleJSConnection.js");
	::mods_registerJS("DevConsoleScreen.js");
	::mods_registerCSS("DevConsoleScreen.css");

	::DevConsole.Mod.Debug.disable(); 
	::DevConsole.Screen <- this.new("scripts/ui/screens/dev_console_screen");
	::DevConsole.JSConnection <- this.new("dev_console/dev_console_js_connection");
	::MSU.UI.registerConnection(::DevConsole.JSConnection);
	::MSU.UI.registerConnection(::DevConsole.Screen);
	::MSU.UI.addOnConnectCallback(::DevConsole.JSConnection.finalize.bindenv(::DevConsole.JSConnection));

	::include("dev_console/keybinds");


	local generalPage = ::DevConsole.Mod.ModSettings.addPage("General");
	generalPage.addBooleanSetting("EnableDebugKeybinds", false, "Enable debug keybinds", "Enables debug keybinds.");
	generalPage.addBooleanSetting("PrintForParser", false, "Print for Parser", "Prints all lines to the log to be parsed.");
	generalPage.addColorPickerSetting("BackgroundColor", "0,0,0,0.5", "Background Color");
	generalPage.addColorPickerSetting("message", "36,140,182, 1.0", "Font Color logInfo");
	generalPage.addColorPickerSetting("warning", "241,90,34,1.0", "Font Color logWarning");
	generalPage.addColorPickerSetting("error", "255,0,0,1.0", "Font Color logError");
	generalPage.addRangeSetting("ElementInspectorDefaultLevel", 0, 0, 4, 1, "Element Inspector Level", "The default level of the element inspector.")
		.addAfterChangeCallback(function(_){
			::DevConsole.JSConnection.setElementInspectorState(this.getValue());
	})


	local logInfo = ::logInfo
	::logInfo = function(_msg, _dev = true)
	{
		if(_dev && ::DevConsole.Screen != null && ::DevConsole.Screen.isConnected())
			::DevConsole.Screen.log(_msg);
		return logInfo(_msg);
	}
	local logWarning = ::logWarning
	::logWarning = function(_msg, _dev = true)
	{
		if(_dev && ::DevConsole.Screen != null && ::DevConsole.Screen.isConnected())
			::DevConsole.Screen.log(_msg, "warning");
		return logWarning(_msg);
	}
	local logError = ::logError
	::logError = function(_msg, _dev = true)
	{
		if(_dev && ::DevConsole.Screen != null && ::DevConsole.Screen.isConnected())
			::DevConsole.Screen.log(_msg, "error");
		return  logError(_msg);
	}
})
