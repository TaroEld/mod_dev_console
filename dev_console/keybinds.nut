::DevConsole.Mod.Keybinds.addSQKeybind("toggleDevConsoleScreen", "ctrl+g", ::MSU.Key.State.All,  ::DevConsole.Screen.toggle.bindenv( ::DevConsole.Screen),
	"Toggle Screen", null, "Toggles between half-screen, fullscreen and hidden.");
::DevConsole.Mod.Keybinds.addSQKeybind("closeDevConsoleScreen", "escape", ::MSU.Key.State.All,  ::DevConsole.Screen.hide.bindenv( ::DevConsole.Screen)
	"Close Screen");

::DevConsole.Mod.Keybinds.addJSKeybind("RunCommandInConsole", "shift+return", "Run in console", "Runs the command without closing the console.");
::DevConsole.Mod.Keybinds.addJSKeybind("RunCommand", "shift+ctrl+return", "Run", "Closes the console and then runs the command.");

::DevConsole.Mod.Keybinds.addSQKeybind("onUpPressedDevConsoleScreen", "ctrl+up", ::MSU.Key.State.All, ::DevConsole.Screen.onUpArrowPressed.bindenv( ::DevConsole.Screen)
	"Previous command", null, "Switches to the previous command and environment.");
::DevConsole.Mod.Keybinds.addSQKeybind("onDownPressedDevConsoleScreen", "ctrl+down",  ::MSU.Key.State.All, ::DevConsole.Screen.onDownArrowPressed.bindenv( ::DevConsole.Screen)
	"Next command", null, "Switches to the next command and environment.");
::DevConsole.Mod.Keybinds.addSQKeybind("onSpawnUnitDevConsoleScreen", "ctrl+z", ::MSU.Key.State.Tactical, ::DevConsole.Screen.onSpawnUnitPressed.bindenv( ::DevConsole.Screen)
	"Spawn Unit", null, "Spawns the unit designated with ::setSpawn()");

::DevConsole.Mod.Keybinds.addSQKeybind("reloadCSS", "ctrl+shift+c", ::MSU.Key.State.All,  ::reloadCSS, "Reload CSS", null, "Reloads all CSS files.");
::DevConsole.Mod.Keybinds.addSQKeybind("reloadJS", "ctrl+shift+j", ::MSU.Key.State.All,  ::reloadJS, "Reload JS", null, "Reloads all JS files.");

::DevConsole.Mod.Keybinds.addDivider("inspectorDivider");
::DevConsole.Mod.Keybinds.addTitle("inspector", "Element Inspector");
::DevConsole.Mod.Keybinds.addSQKeybind("toggleElementInspectorState", "ctrl+i", ::MSU.Key.State.All,
	::DevConsole.JSConnection.toggleElementInspectorState.bindenv( ::DevConsole.JSConnection), "Toggle State", null, "Toggles the state of the element inspector.");
::DevConsole.Mod.Keybinds.addSQKeybind("increaseElementInspectorLevel", "ctrl+up", ::MSU.Key.State.All,
	function(){
		return ::DevConsole.JSConnection.changeElementInspectorLevel(1);
	} , "Increase Level", null, "Increases the DOM node level of the element inspector. It will go up one parent node of the hovered element for each level.");
::DevConsole.Mod.Keybinds.addSQKeybind("decreaseElementInspectorLevel", "ctrl+down", ::MSU.Key.State.All,
	function(){
		return ::DevConsole.JSConnection.changeElementInspectorLevel(-1);
	}, "Decrease Level", null, "Decreases the DOM node level of the element inspector.");

local function canExecuteBind()
{
	return ::DevConsole.Mod.ModSettings.getSetting("EnableDebugKeybinds").getValue() && !::DevConsole.Screen.isVisible();
}

::DevConsole.Mod.Keybinds.addDivider("DebugBinds");
::DevConsole.Mod.Keybinds.addTitle("DebugBindsTitle", "Debug Keybinds");
::DevConsole.Mod.Keybinds.addTitle("DebugWorldTitle", "World Debug Keybinds");

//Debug
::DevConsole.Mod.Keybinds.addSQKeybind("worldJump", "j", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	if (::World.State.m.LastTileHovered != null)
	{
	  local tilePos = this.m.LastTileHovered.Pos;
	  this.World.State.getPlayer().setPos(tilePos);
	  this.World.setPlayerPos(tilePos);
	  ::logConsole("Debug: Jumped to: X:" + tilePos.X + " Y:" + tilePos.Y);
	}
}, "Jump");

::DevConsole.Mod.Keybinds.addSQKeybind("worldReveal", "f1", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	this.World.setFogOfWar(!this.World.isUsingFogOfWar());
	::logConsole("Debug: Fog of War: " + this.World.isUsingFogOfWar());
}, "Reveal Map");

::DevConsole.Mod.Keybinds.addSQKeybind("worldGlory", "g", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	this.World.Assets.addBusinessReputation(500);
	::logConsole("Debug: Added 500 renown");
}, "Add 500 renown");

::DevConsole.Mod.Keybinds.addSQKeybind("worldHunger", "h", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	this.World.Assets.setConsumingAssets(!this.World.Assets.isConsumingAssets());
	::logConsole("Debug: Consuming assets: " + this.World.Assets.isConsumingAssets());
}, "Enable/Disable asset consumption");

::DevConsole.Mod.Keybinds.addSQKeybind("worldLevel", "l", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	if (!::World.State.isInCharacterScreen())
		return
	foreach (bro in this.World.getPlayerRoster().getAll())
	{
		bro.m.XP = this.Const.LevelXP[bro.m.Level] + 1;
		bro.updateLevel();
	}
	::World.State.m.CharacterScreen.loadBrothersList();
	::logConsole("Debug: Added 1 level to each bro");
}, "Level Bros");

::DevConsole.Mod.Keybinds.addSQKeybind("worldKill", "k", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	if (::World.State.m.LastEntityHovered == null)
		return

	local e = ::World.State.m.LastEntityHovered;
	local destroyedString = "";
	if (e.isLocation())
	{
		if (e.m.LocationType == this.Const.World.LocationType.Settlement)
		{
			destroyedString = "Settlement";
			e.addSituation(this.new("scripts/entity/world/settlements/situations/raided_situation"), 14);
		}
		else if (e.m.LocationType == this.Const.World.LocationType.AttachedLocation)
		{
			destroyedString = "Attached Location";
			e.setActive(false);
		}
		else
		{
			destroyedString = "Location";
			e.onCombatLost();
		}
		}
	else
	{
		destroyedString = "Party";
		e.onCombatLost();
	}
	if (destroyedString != "")
		::logConsole("Debug: Destroyed: " + destroyedString);
}, "Kill Hovered Entity");

::DevConsole.Mod.Keybinds.addSQKeybind("worldRelations", "l", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	local factionTypes = {
	  villages = this.World.FactionManager.getFactionsOfType(this.Const.FactionType.Settlement),
	  nobleHouses = this.World.FactionManager.getFactionsOfType(this.Const.FactionType.NobleHouse)
	};
	local reason = "Used Vilain's debug mode with discretion";
	foreach(factionType, factions in factionTypes)
	{
	  foreach(faction in factions) {faction.addPlayerRelation(10, "Debug Mode");}
	}
	::logConsole("Debug: Added 10 relation to each faction");
}, "Add 10 relations to each faction");

::DevConsole.Mod.Keybinds.addSQKeybind("worldMoney", "m", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	this.World.Assets.addMoney(10000);
	::World.State.updateTopbarAssets();
	::logConsole("Debug: Added 10000 crowns");
}, "Add 10000 crowns.");

::DevConsole.Mod.Keybinds.addSQKeybind("worldUnkillable", "u", ::MSU.Key.State.World, function(){
	if (!canExecuteBind())
		return;
	::World.State.m.Player.setAttackable(!::World.State.m.Player.isAttackable());
	::logConsole("Debug: Player attackable: " + ::World.State.m.Player.isAttackable());
}, "Toggle player being attackable.");

local function setWorldSpeedMult(_speed)
{
	if (!canExecuteBind() || this.getMenuStack().hasBacksteps())
		return false;
	this.setPause(false);
	this.World.setSpeedMult(_speed);
	::logConsole("Debug: Set speed mult to " + _speed);
	return true;
}

::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed4", "3", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(4.0);
}, "World Speed 4x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed8", "4", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(8.0);
}, "World Speed 8x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed16", "5", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(16.0);
}, "World Speed 16x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed32", "6", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(32.0);
}, "World Speed 32x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed64", "7", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(64.0);
}, "World Speed 64x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed128", "8", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(128.0);
}, "World Speed 128x");
::DevConsole.Mod.Keybinds.addSQKeybind("worldSpeed256", "9", ::MSU.Key.State.World, function(){
	return setWorldSpeedMult(256.0);
}, "World Speed 256x");



::DevConsole.Mod.Keybinds.addDivider("DebugBindsTactical");
::DevConsole.Mod.Keybinds.addTitle("DebugTacticalTitle", "Tactical Debug Keybinds");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalReveal", "e", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	local state = ::Tactical.State;
	state.m.IsFogOfWarVisible = !state.m.IsFogOfWarVisible;
	if (state.m.IsFogOfWarVisible)
	{
	  this.Tactical.fillVisibility(this.Const.Faction.Player, false);
	  local heroes = this.Tactical.Entities.getInstancesOfFaction(this.Const.Faction.Player);
	  foreach (i, hero in heroes) hero.updateVisibilityForFaction();
	  local activeEntity = this.Tactical.TurnSequenceBar.getActiveEntity();
	  if (activeEntity != null) activeEntity.updateVisibilityForFaction();
	}
	else {this.Tactical.fillVisibility(this.Const.Faction.Player, true);}
	::logConsole("Debug: Map revealed: " + state.m.IsFogOfWarVisible);
}, "Reveal map");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalHeal", "h", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	local state = ::Tactical.State;
	local instances = this.Tactical.Entities.getAllInstancesAsArray();
	foreach (actor in instances)
	{
		if (actor.isAlive() && actor.isPlayerControlled())
		{
		  actor.setHitpointsPct(1);
		  actor.setActionPoints(9);
		  actor.setFatigue(0);
		  actor.setMoraleState(this.Const.MoraleState.Confident);
		  local skills = actor.getSkills();
		  skills.removeByType(this.Const.SkillType.Injury);
		  foreach(item in actor.getItems().getAllItems())
			{
			    if (item.getCondition() < item.getConditionMax()) item.setCondition(item.getConditionMax());
			    if (item.isItemType(this.Const.Items.ItemType.Ammo) && item.getAmmo() < item.getAmmoMax())
			      item.setAmmo(item.getAmmoMax());
			}
		  this.Tactical.TurnSequenceBar.updateEntity(actor.getID());
		}
	}
	::logConsole("Debug: Healed players.");
}, "Heal players");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalJump", "j", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	local tile = ::Tactical.State.m.LastTileHovered;
	if (tile != null && tile.IsEmpty)
	{
	  local entity = this.Tactical.TurnSequenceBar.getActiveEntity();
	  this.Tactical.getNavigator().teleport(entity, tile, null, null, false, 0.0);
	  ::logConsole("Debug: Entity " + entity.getName() + " jumped to: X:" + tile.Pos.X + " Y:" + tile.Pos.Y)
	}
}, "Jump to tile");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalKill", "k", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	local state = ::Tactical.State;
	if (state.m.LastTileHovered == null || state.m.LastTileHovered.IsEmpty)
		return;

	local entity = state.m.LastTileHovered.getEntity();
	if (entity == null || !this.isKindOf(entity, "actor"))
		return;

	if (entity == this.Tactical.TurnSequenceBar.getActiveEntity())
		state.cancelEntityPath(entity);
	::logConsole("Debug: Killed entity " + entity.getName());
	entity.kill();
}, "Kill hovered entity.");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalNuke", "o", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	local state = ::Tactical.State;
	local factions = this.Tactical.Entities.m.Instances;
	for (local f = this.Const.Faction.Player + 1; f != factions.len(); f++)
	{
		if (factions[f].len() != 0 && !this.World.FactionManager.isAlliedWithPlayer(f))
		{
			local instances = clone factions[f];
			foreach (e in instances) {
				e.kill();
			}
		}
	}
	::logConsole("Debug: Killed all enemies.")
}, "Kill all enemy entities.");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed1", "f1", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(1.0);
	::logConsole("Debug: Virtual Speed set to x1.0");
}, "Tactical Speed 1.0");

::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed2", "f2", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(2.0);
	::logConsole("Debug: Virtual Speed set to x2.0");
}, "Tactical Speed 2.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed3", "f3", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(3.0);
	::logConsole("Debug: Virtual Speed set to x3.0");
}, "Tactical Speed 3.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed4", "f4", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(4.0);
	::logConsole("Debug: Virtual Speed set to x4.0");
}, "Tactical Speed 4.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed5", "f5", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(5.0);
	::logConsole("Debug: Virtual Speed set to x5.0");
}, "Tactical Speed 5.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed6", "f6", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(6.0);
	::logConsole("Debug: Virtual Speed set to x6.0");
}, "Tactical Speed 6.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed7", "f7", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(7.0);
	::logConsole("Debug: Virtual Speed set to x7.0");
}, "Tactical Speed 7.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed8", "f8", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(8.0);
	::logConsole("Debug: Virtual Speed set to x8.0");
}, "Tactical Speed 8.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed9", "f9", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(9.0);
	::logConsole("Debug: Virtual Speed set to x9.0");
}, "Tactical Speed 9.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed10", "f10", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(10.0);
	::logConsole("Debug: Virtual Speed set to x10.0");
}, "Tactical Speed 10.0");


::DevConsole.Mod.Keybinds.addSQKeybind("tacticalSpeed11", "f11", ::MSU.Key.State.Tactical, function(){
	if (!canExecuteBind())
		return;
	this.Time.setVirtualSpeed(11.0);
	::logConsole("Debug: Virtual Speed set to x11.0");
}, "Tactical Speed 11.0");
