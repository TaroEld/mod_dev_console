var DevConsole = {
	mModID : "mod_dev_console",
	Environments : {
		Squirrel : 0,
		JS : 1,
	},
}

var console_error = console.error;

console.error = function(args)
{
	console_error.call(console, args);
	if (Screens.DevConsoleScreen) Screens.DevConsoleScreen.log({Text : arguments[0], Type : "error"})
}
