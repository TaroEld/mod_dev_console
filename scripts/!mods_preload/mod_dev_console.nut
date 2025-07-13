::DevConsole <- {
	ID = "mod_dev_console",
	Version = "2.5.0",
	Name = "Dev Console",
	IsEventsEnabled = true,
}
::mods_registerMod(::DevConsole.ID, ::DevConsole.Version);
::mods_queue(::DevConsole.ID, "mod_msu(>=1.3.0)", function()
{	
	::DevConsole.Mod <- ::MSU.Class.Mod(::DevConsole.ID, ::DevConsole.Version, ::DevConsole.Name);

	::DevConsole.Mod.Registry.addModSource(::MSU.System.Registry.ModSourceDomain.NexusMods, "https://www.nexusmods.com/battlebrothers/mods/380");
	::DevConsole.Mod.Registry.addModSource(::MSU.System.Registry.ModSourceDomain.GitHubTags, "https://github.com/TaroEld/mod_dev_console/");
	::DevConsole.Mod.Registry.addModSource(::MSU.System.Registry.ModSourceDomain.GitHub, "https://github.com/TaroEld/mod_dev_console");
	::DevConsole.Mod.Registry.setUpdateSource(::MSU.System.Registry.ModSourceDomain.GitHub);

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
	::include("dev_console/settings");
	::include("dev_console/hooks");
})
