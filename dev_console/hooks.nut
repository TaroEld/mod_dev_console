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
::mods_hookNewObject("events/event_manager", function(o){
	local update = o.update;
	o.update = function()
	{
		if (!::DevConsole.IsEventsEnabled)
		{
			return false;
		}
		return update();
	}

	local fire = o.fire;
	o.fire = function( _id, _update = true )
	{
		if (!::DevConsole.IsEventsEnabled)
		{
			return false;
		}
		return fire(_id, _update);
	}
})
::mods_hookNewObject("states/world/asset_manager", function(o){
	// update last updated dates in case we disabled it to not bomb us with consumption afterwards
	local update = o.update;
	o.update = function( _worldState )
	{
		if (!this.m.IsConsumingAssets)
		{
			if (this.World.getTime().Days > this.m.LastDayPaid && this.World.getTime().Hours > 8)
			{
				this.m.LastDayPaid = this.World.getTime().Days;
			}
			if (this.World.getTime().Hours != this.m.LastHourUpdated)
			{
				this.m.LastHourUpdated = this.World.getTime().Hours;
			}
		}
		return update(_worldState);
	}
})
