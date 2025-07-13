local generalPage = ::DevConsole.Mod.ModSettings.addPage("General");
generalPage.addBooleanSetting("EnableDebugKeybinds", false, "Enable debug keybinds", "Enables debug keybinds.")
	.addAfterChangeCallback(function(_oldState)
	{
		::DevConsole.JSConnection.updateGlobalDebugState(this.getValue());
	});

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
