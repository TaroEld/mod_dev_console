::JSONParseToString <- function(_data)
{
	this.DevConsole.JSConnection.JSONParseToString(_data);
}
::JSONParseFromString <- function(_string)
{
	::DevConsole.JSConnection.JSONParseFromString(_string)
}
::getParsedJSONData <- function()
{
	return ::DevConsole.JSConnection.m.LastParsedData;
}

//library of useful functions
::logConsole <- function(_text = "", _options = null)
{
	local options = ::DevConsole.Screen.mergeOptions(_options);
	::DevConsole.Screen.log(_text, options);
}

//add item to player roster, pass the script
::addItem <- function(_script)
{

	local items = this.IO.enumerateFiles("scripts/items/");
	foreach (item in items) {
		local sp = split(item, "/")
	    if(sp[sp.len()-1] == _script){
	    	::logConsole("Adding item: " + item )
	    	local ret = this.new(item);
	    	this.World.Assets.getStash().add(ret);
	    	return ret;
	    }
	}
	local tryToParse = this.new(_script)
	if (tryToParse != null){
		::logConsole("Adding item: " + _script )
		this.World.Assets.getStash().add(tryToParse)
		return tryToParse
	}
	::logConsole("did not find item with script " + _script)
	return
}

//sets the next units spawned on the tactical map
//pass faction if you don't want it to be enemy
::setSpawn <- function(_script, _faction = this.Const.Faction.Enemy)
{
	local units = this.IO.enumerateFiles("scripts/entity/tactical");
	foreach (unit in units) {
		local sp = split(unit, "/")
	    if(sp[sp.len()-1] == _script){
	    	::logConsole("Next unit to spawn: " + unit )

	    	::DevConsole.Screen.m.SpawnUnit.SpawnUnitScript = unit
    		if (_faction == "player") ::DevConsole.Screen.m.SpawnUnit.SpawnUnitFaction = this.Const.Faction.Player
    		else if (_faction == "enemy") ::DevConsole.Screen.m.SpawnUnit.SpawnUnitFaction = this.Const.Faction.Enemy
    		else ::DevConsole.Screen.m.SpawnUnit.SpawnUnitFaction = _faction
	    	return
	    }
	}

	::logConsole("did not find unit with script " + _script)
	return
}

//get bro from player roster, either specific one by passing name or random bro
::getBro <- function(_name = null)
{
	if (!(_name == null || typeof _name == "string")){
		::logConsole("name not null or string");
		return;
	}

	local roster = this.World.getPlayerRoster().getAll();
	if (_name == null) return ::MSU.Array.rand(roster);

	local retBro, retBroFull = [], retBroNameOnly = []; 
	//delete character somehow gets added to renamed bros
	local function stripDel(_str){
		local del = 127
		if (_str.find(del.tochar()) != null){
			_str = split(_str, del.tochar()).reduce(@(a, b) a+b)
		}
		return _str
	}

	foreach (bro in roster) {
	    if (stripDel(bro.getNameOnly()) == _name) {
	        retBroNameOnly.push(bro);
	    }
	    else if(stripDel(bro.getName()) == _name)
	    {
	    	retBroFull.push(bro)
	    }
	}
	if (retBroNameOnly.len() == 1){
		::logConsole("returning bro : " + retBroNameOnly[0].getName());
		return retBroNameOnly[0]
	}
	else if (retBroFull.len() == 1){
		::logConsole("returning bro : " + retBroNameOnly[0].getName());
		return  retBroFull[0]
	}
	else if (retBroNameOnly.len() > 1 || retBroFull.len() > 1 )
	{
		::logConsole("Found multiple bros with name \"" + _name + "\" , returning null");
		return
	}
	else{
		::logConsole("Found no bro with name \"" + _name + "\" , returning null");
		return
	}
}

::getTown <- function(_townName)
{
	foreach(town in ::World.EntityManager.getSettlements())
	{
		if (town.getName() == _townName)
		{
			return town;
		}
	}
}

::reloadCSS <- function(_path = null)
{
	::DevConsole.JSConnection.reloadCSS(_path);
	return true;
}

::reloadJS <- function(_path = null)
{
	::DevConsole.JSConnection.reloadJS(_path);
	return true;
}
