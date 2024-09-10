var DevConsole = {
	mModID : "mod_dev_console",
	Environments : {
		Squirrel : 0,
		JS : 1,
	},
}

var logConsole = function(_args, _options)
{
	console.error.call(console, _args);
	if (Screens.DevConsoleScreen)
	{
		var options = Screens.DevConsoleScreen.mergeOptions(_options);
		if (options.Dev)
			Screens.DevConsoleScreen.log({Text : _args, Type : options.Type, Environment : DevConsole.Environments.JS, Options : options})
	}
}
