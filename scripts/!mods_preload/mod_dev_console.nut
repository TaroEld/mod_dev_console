local modName = "zmod_dev_console"
::mods_registerMod("zmod_dev_console", 1.0);
::mods_registerJS("DevScreenLogModule.js");
::mods_registerCSS("DevScreenLogModule.css");
::mods_registerJS("DevConsoleScreen.js");
::mods_registerCSS("DevConsoleScreen.css");
::mods_queue(modName, null, function()
{	
	local gt = this.getroottable()
	if (!("DevConsole" in gt)) gt.DevConsole <- {
		SpawnUnit = {
			SpawnUnitScript = "",
			SpawnUnitFaction = this.Const.Faction.Enemy
		}	
	};
	::mods_hookNewObjectOnce("states/world_state", function(o) 
	{
		local ws_init_ui = o.onInitUI;
		o.onInitUI = function()
		{
			ws_init_ui();
			this.m.DevConsoleScreen <- this.new("scripts/ui/screens/dev_console_screen");
			this.m.DevConsoleScreen.setOnClosePressedListener(this.town_screen_main_dialog_module_onLeaveButtonClicked.bindenv(this));
			this.initLoadingScreenHandler();
		}

		local ws_destroy_ui = o.onDestroyUI;
		o.onDestroyUI = function()
		{
			ws_destroy_ui();
			this.m.DevConsoleScreen.destroy();
			this.m.DevConsoleScreen = null;
		}

		o.showDevConsoleScreen <- function()
		{
			if (!this.m.DevConsoleScreen.isVisible() && !this.m.DevConsoleScreen.isAnimating())
			{
				this.m.CustomZoom = this.World.getCamera().Zoom;
				this.World.getCamera().zoomTo(1.0, 4.0);
				this.World.Assets.updateFormation();
				this.setAutoPause(true);
				this.m.DevConsoleScreen.show();
				this.m.WorldScreen.hide();
				this.Cursor.setCursor(this.Const.UI.Cursor.Hand);
				this.m.MenuStack.push(function ()
				{
					this.World.getCamera().zoomTo(this.m.CustomZoom, 4.0);
					this.m.DevConsoleScreen.hide();
					this.m.WorldScreen.show();
					this.World.Assets.refillAmmo();
					this.updateTopbarAssets();
					this.setAutoPause(false);
				}, function ()
				{
					return !this.m.DevConsoleScreen.isAnimating();
				});
			}
		}

		o.toggleDevConsoleScreen <- function()
		{
			if (this.m.DevConsoleScreen.isVisible())
			{
				this.m.MenuStack.pop();
			}
			else
			{
				this.showDevConsoleScreen();
			}
		}


		local keyHandler = o.helper_handleContextualKeyInput;
		o.helper_handleContextualKeyInput = function(key)
		{
			if(!keyHandler(key) && key.getState() == 0)
			{
				if (key.getKey() == 17 && key.getModifier() == 2)//SHIFT + X
				{
					if (!this.m.CharacterScreen.isVisible() && !this.m.WorldTownScreen.isVisible() && !this.m.EventScreen.isVisible() && !this.m.EventScreen.isAnimating())
					{
						this.toggleDevConsoleScreen()
						return true;
					}
				}
				if (key.getKey() == 49 && this.m.DevConsoleScreen.isVisible())
				{
					this.m.DevConsoleScreen.onUpArrowPressed()
					return true;
				}
				if (key.getKey() == 51 && this.m.DevConsoleScreen.isVisible())
				{
					this.m.DevConsoleScreen.onDownArrowPressed()
					return true;
				}
			}
		}
	})

	::mods_hookNewObjectOnce("states/tactical_state", function(o) 
	{
		local ws_init_ui = o.onInitUI;
		o.onInitUI = function()
		{
			ws_init_ui();
			this.m.DevConsoleScreen <- this.new("scripts/ui/screens/dev_console_screen");
			this.m.DevConsoleScreen.setOnClosePressedListener(this.onDialogHidden.bindenv(this));
			this.initLoadingScreenHandler();
		}

		local ws_destroy_ui = o.onDestroyUI;
		o.onDestroyUI = function()
		{
			ws_destroy_ui();
			this.m.DevConsoleScreen.destroy();
			this.m.DevConsoleScreen = null;
		}

		o.showDevConsoleScreen <- function()
		{
			if (!this.m.DevConsoleScreen.isVisible() && !this.m.DevConsoleScreen.isAnimating())
			{
				this.setPause(true);
				this.Tooltip.hide();
				this.m.TacticalScreen.hide();
				this.m.DevConsoleScreen.show();
				this.Cursor.setCursor(this.Const.UI.Cursor.Hand);
				this.m.MenuStack.push(function ()
				{
					this.setPause(false);
					this.m.DevConsoleScreen.hide();
					this.m.TacticalScreen.show();
				}, function ()
				{
					return !this.m.DevConsoleScreen.isAnimating();
				});
			}
		}

		o.toggleDevConsoleScreen <- function()
		{
			if (this.m.DevConsoleScreen.isVisible())
			{
				this.m.MenuStack.pop();
			}
			else
			{
				this.showDevConsoleScreen();
			}
		}


		local keyHandler = o.helper_handleContextualKeyInput;
		o.helper_handleContextualKeyInput = function(key)
		{
			if(key.getState() == 0)
			{
				// 49 up arrow, 51 down arrow
				if (key.getKey() == 17 && key.getModifier() == 2) // ctrl + g
				{
					if (!this.m.CharacterScreen.isVisible() && !this.m.TacticalDialogScreen.isVisible() && !this.m.TacticalDialogScreen.isAnimating())
					{
						this.toggleDevConsoleScreen()
						return true;
					}
				}
				if (key.getKey() == 49 && this.m.DevConsoleScreen.isVisible())
				{
					this.m.DevConsoleScreen.onUpArrowPressed()
					return true;
				}
				if (key.getKey() == 51 && this.m.DevConsoleScreen.isVisible())
				{
					this.m.DevConsoleScreen.onDownArrowPressed()
					return true;
				}

				if (key.getKey() == 36 && key.getModifier() == 2) // ctrl + z
				{
					if (this.m.LastTileHovered != null && this.m.LastTileHovered.IsEmpty && this.DevConsole.SpawnUnit.SpawnUnitScript != "")
					{
						local script = this.DevConsole.SpawnUnit.SpawnUnitScript
						local entity = this.Tactical.spawnEntity(script);
						local faction;
						local selectedFaction = this.DevConsole.SpawnUnit.SpawnUnitFaction
						if (selectedFaction != this.Const.Faction.Player && selectedFaction != this.Const.Faction.Enemy) selectedFaction = this.World.FactionManager.getFactionOfType(selectedFaction).getID()
						entity.setFaction(selectedFaction);
						entity.assignRandomEquipment();
					}
					return true;
				 }
			}
			keyHandler(key)
		}
	})
	

})
