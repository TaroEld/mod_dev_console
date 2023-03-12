## Dev Console
A mod that aims to improve the modding experience by providing an ingame console, as well as a number of utilities.

# How to install
Just copy the .zip into your data folder. This mod requires MSU. If you don't want the MSU requirement, there's an older version available on Nexus.

# Capabilities

## Console
The console can be shown in any state by pressing ctrl+g. It toggles between half-width and fullscreen with subsequent presses.\
The console screen three main elements: a textarea to enter commands, an output window, and a footer bar.\
In the textarea, you can enter any valid Squirrel or JavaScript syntax. The default language is Squirrel. To switch to JS, press the "Squirrel" footer button.\
You can run the command in two ways: while staying in the console window ("Run in console" or shift+enter), or after closing the console window ("Run" or shift+ctrl+enter). The latter can be necessary in some cases, for example to invoke events.\
The commands are evaluated using `compilestring(_input).call(this);` in SQ and `Function(_input)()` in JS.

## Logging
The currently executed command, as well as any return values, are printed to the console.\
Furthermore, I have added the global functions `::logConsole` (SQ) and `logConsole` (JS) to print to the console.\
Finally, print statements by the game engine(s) (`::logInfo`, `::logWarning`, `::logError`, `console.error`) are also printed to the console.\
In JS, objects can generally be printed rather easily, either directly or by using `JSON.stringify`. For SQ, you can use the MSU function `::MSU.Log.printData` to print tables and such.

## Utility Functions

#### `::reloadCSS(_path = null)` and `::reloadJS(_path = null)`
These functions hot-load CSS and JS files. If a path is specified, only that file will be reloaded. `coui://ui/` will be prefixed automatically.\
For example, to reload the file `data/ui/mods/DevConsoleScreen.css`, call `::reloadCSS("mods/DevConsoleScreen.css")` in the SQ environment.\
The default keybinds are `ctrl+shift+c` and `ctrl+shift+j`, respectively. `null` path is passed.

#### `::addItem(_fileName)`
Adds the item with the filename `_fileName` to the player stash. Iterates through the files in `scripts/items/` to find the item.\
Alternatively, you can also pass a path as `_fileName`. This will only be checked against if no item with the same name was found.\
The created item will be returned.

#### `::getBro(_name = null)`
Returns a brother from the player roster. If `_name` is null, returns a random brother. Otherwise, it loops through the player roster to find a bro with the correct name.\
First checks for first name only, then for name plus title. If multiple bros are found, returns `null` with an error message.

#### `::getTown(_townName)`
Returns a worldmap town with `_townName`.

## Debug Keybinds
I've included a number of useful debug keybinds. They've been lifted from the unused ingame debug module, respectively the Debug Mod by VilainJoueur.\
Debug Keybinds are disabled by default. They can be enabled by toggling the `Enable debug keybinds` setting.\
To get a list of available keybinds, check the Mod Settings.

## Known issues:
There are some issues with the `compilescript()` squirrel function. It will complain about missing `;` or `lf` despite the syntax being correct.\
This seems to be related to `if | if / else  | if/ else if`. Try semicolons after the closing if curly braces, and either don't use else if, or don't put any other statement in the same scope after it.\
If everything else fails, you can try to use the this.include() function, which allows you to add and run a .nut file. Place it in your data folder, and run 'this.include("my_file"), without .nut. A file can only be run once per game start this way, so you'll need to rename it or restart the game if you need to do it more than once.


