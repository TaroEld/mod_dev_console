::DevConsole <- {
	ID = "mod_dev_console",
	Version = "2.3.0",
	Name = "Dev Console",
}
::mods_registerMod(::DevConsole.ID, ::DevConsole.Version);
::mods_queue(::DevConsole.ID, "mod_msu(>=1.3.0)", function()
{	
	::DevConsole.Mod <- ::MSU.Class.Mod(::DevConsole.ID, ::DevConsole.Version, ::DevConsole.Name);

	::DevConsole.Mod.Registry.addModSource(::MSU.System.Registry.ModSourceDomain.NexusMods, "https://www.nexusmods.com/battlebrothers/mods/380");
	// upcoming MSU feature
	if ("GitHubTags" in ::MSU.System.Registry.ModSourceDomain)
	{
		::DevConsole.Mod.Registry.addModSource(::MSU.System.Registry.ModSourceDomain.GitHubTags, "https://github.com/TaroEld/mod_dev_console");
		::DevConsole.Mod.Registry.setUpdateSource(::MSU.System.Registry.ModSourceDomain.GitHubTags);
	}

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

	local colorCallback = function(_){
		if (::DevConsole.Screen.m.JSHandle != null)
			::DevConsole.Screen.m.JSHandle.asyncCall("updateColorSettings", null);
	}
	generalPage.addColorPickerSetting("BackgroundColor", "0,0,0,0.5", "Background Color").addAfterChangeCallback(colorCallback);
	generalPage.addColorPickerSetting("message", "36,140,182, 1.0", "Font Color logInfo").addAfterChangeCallback(colorCallback);
	generalPage.addColorPickerSetting("warning", "241,90,34,1.0", "Font Color logWarning").addAfterChangeCallback(colorCallback);
	generalPage.addColorPickerSetting("error", "255,0,0,1.0", "Font Color logError").addAfterChangeCallback(colorCallback);
	generalPage.addColorPickerSetting("system", "153,50,204,1.0", "Font Color system").addAfterChangeCallback(colorCallback);
	generalPage.addRangeSetting("ElementInspectorDefaultLevel", 0, 0, 4, 1, "Element Inspector Level", "The default level of the element inspector.")
		.addAfterChangeCallback(function(_){
			::DevConsole.JSConnection.setElementInspectorState(this.getValue());
		})


	local logInfo = ::logInfo
	::logInfo = function(_msg,  _options = null)
	{
		local options = ::DevConsole.Screen.mergeOptions(_options);
		if(options.Dev)
			::DevConsole.Screen.log(_msg, options);
		return logInfo(_msg);
	}
	local logWarning = ::logWarning
	::logWarning = function(_msg, _options = null)
	{

		local options = ::DevConsole.Screen.mergeOptions(_options);
		options.Type = "warning";
		if(options.Dev)
			::DevConsole.Screen.log(_msg, options);
		return logWarning(_msg);
	}
	local logError = ::logError
	::logError = function(_msg, _options = null)
	{
		local options = ::DevConsole.Screen.mergeOptions(_options);
		options.Type = "error";
		if(options.Dev)
			::DevConsole.Screen.log(_msg, options);
		return  logError(_msg);
	}
})
