//library of useful functions


::setupDebugLog <- function (_enabled = false, _name = "default")
{
	local gt = this.getroottable()
	//keep table of mod names so that you can turn it on and off for specific mods
	if (!("debugLog" in gt)){
		gt.debugLog <- {}
	}
	if (!(_name in gt.debugLog))
	{
		gt.debugLog[_name] <- false
	}
	gt.debugLog[_name] <- _enabled
	if (gt.debugLog[_name]) this.logInfo("debug log set to true for " + _name)

	gt.printDebug <- function(arg = "No argument for debug log", _name = "default")
	{
		if (_name in this.debugLog && this.debugLog[_name]){
			local src = getstackinfos(2).src.slice(0, -4)
			src = split(src, "/")[split(src, "/").len()-1]
			this.logInfo(_name +  " " + src + " : " + arg)
		}
	}
	gt.isDebug <- function(_str)
	{
		return (_str in this.debugLog && this.debugLog[_str])
	}
}
::logConsole <- function(_text = "", _log = true)
{
	if (this.Tactical.isActive()){
		if(this.Tactical.State.m.DevConsoleScreen.isVisible()) this.Tactical.State.m.DevConsoleScreen.log(_text)
	}
	else{
		if(this.World.State.m.DevConsoleScreen.isVisible()) this.World.State.m.DevConsoleScreen.log(_text)
	}
	
	if (_log) this.logInfo("logConsole: " + _text)
}

//print out an array or table. _maxDepth defines the recursion level.  _console = true prints to console only
::printData <- function(_obj, _maxdepth = 9999, _name = null, _tabs = 0, _console=false)
{
	local logFunc = function(_data){
		if (_console) this.logConsole(_data, false)
		else this.logInfo(_data)
	}
	if(_name != null) logFunc("Printing " + _name + "\n")
	if(typeof _obj == "array" || typeof _obj == "table")
	{
		foreach (i, val in _obj)
		{
			if((typeof val == "array" || typeof val == "table") && _maxdepth > _tabs){
				local toprint = ""
				for (local i = 0; i <_tabs; i++) {
				    toprint += "----"
				}
				toprint += typeof val == "array" ? "Index: " : "Key: "
				logFunc(toprint + i + ", new nested " + typeof val + "\n")
				printData(val, _maxdepth, null, _tabs+1, _console)
			}
			else{
				local toprint = ""
				for (local i = 0; i <_tabs; i++) {
				    toprint += "----"
				}
				toprint += typeof _obj == "array" ? "Index: " : "Key: "
				logFunc(toprint + i + "  ||   value: " + val + "\n")
			}
		}
	}
	else logFunc("Printing data: " + _obj)
}

//convenience function for ::printData(_console=true)
::printDataToConsole <- function(_obj, _maxdepth=9999, _name = null, _tabs = 0)
{
	this.printData(_obj, _maxdepth, _name, _tabs, true)
}

this.getroottable().Math.randArray <- function(_array){

	if (typeof _array != "array" || _array.len() == 0) {
		this.logWarning("_array not an array or empty")
		return
	}
	return _array[this.Math.rand(0, _array.len()-1)]
}

//add item to player roster, pass the script
::addItem <- function(_script)
{

	local items = this.IO.enumerateFiles("scripts/items/");
	foreach (item in items) {
		local sp = split(item, "/")
	    if(sp[sp.len()-1] == _script){
	    	::logConsole("Adding item: " + item )
	    	this.World.Assets.getStash().add(this.new(item))
	    	return item
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
	    	local gt = this.getroottable()

	    	gt.DevConsole.SpawnUnit.SpawnUnitScript = unit
    		if (_faction == "player") gt.DevConsole.SpawnUnit.SpawnUnitFaction = this.Const.Faction.Player
    		else if (_faction == "enemy") gt.DevConsole.SpawnUnit.SpawnUnitFaction = this.Const.Faction.Enemy
    		else gt.DevConsole.SpawnUnit.SpawnUnitFaction = _faction
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
	if (_name == null) return this.Math.randArray(roster)

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

