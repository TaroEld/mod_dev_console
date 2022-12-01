var DevConsole = {
	mModID : "mod_dev_console",
	Environments : {
		Squirrel : 0,
		JS : 1,
	},
}

var logConsole = function(_args)
{
	console.error.call(console, _args);
	if (Screens.DevConsoleScreen)
		Screens.DevConsoleScreen.log({Text : _args, Type : "error"})
}
