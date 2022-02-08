local modName = "zmod_dev_console"
::mods_registerMod("zmod_dev_console", 1.0);
::mods_registerJS("DevScreenLogModule.js");
::mods_registerCSS("DevScreenLogModule.css");
::mods_registerJS("DevConsoleScreen.js");
::mods_registerCSS("DevConsoleScreen.css");
::mods_queue(modName, ">mod_MSU", function()
{	
	local gt = this.getroottable()

	this.MSU.Debug.registerMod(modName, true);
	local function toggleDevConsoleScreen(){
		return this.DevConsole.toggle()
	}
	local function hideDevConsoleScreen(){
		return this.DevConsole.hide()
	}
	local function onUpPressed(){
		return this.DevConsole.onUpArrowPressed()
	}
	local function onDownPressed(){
		return this.DevConsole.onDownArrowPressed()
	}
	local function onSpawnUnitPressed(){
		return this.DevConsole.onSpawnUnitPressed()
	}


	gt.MSU.GlobalKeyHandler.AddHandlerFunction("toggleDevConsoleScreen", "g+ctrl",  toggleDevConsoleScreen, gt.MSU.GlobalKeyHandler.States.All)
	gt.MSU.GlobalKeyHandler.AddHandlerFunction("hideDevConsoleScreen", "escape",  hideDevConsoleScreen, gt.MSU.GlobalKeyHandler.States.All)
	gt.MSU.GlobalKeyHandler.AddHandlerFunction("onUpPressedDevConsoleScreen", "up",  onUpPressed, gt.MSU.GlobalKeyHandler.States.All)
	gt.MSU.GlobalKeyHandler.AddHandlerFunction("onDownPressedDevConsoleScreen", "down",  onDownPressed, gt.MSU.GlobalKeyHandler.States.All)
	gt.MSU.GlobalKeyHandler.AddHandlerFunction("onSpawnUnitDevConsoleScreen", "z+ctrl",  onSpawnUnitPressed, gt.MSU.GlobalKeyHandler.States.Tactical)

	::mods_hookNewObjectOnce("states/main_menu_state", function(o)  
	{
		local main_menu_screen_onConnected = o.main_menu_screen_onConnected;
		o.main_menu_screen_onConnected = function()
		{
			main_menu_screen_onConnected();
			this.DevConsole <- this.new("scripts/ui/screens/dev_console_screen")
		}
	});
})
