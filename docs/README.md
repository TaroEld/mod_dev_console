## Dev Console
A mod that aims to improve the modding experience by providing an ingame console, as well as a number of utilities.
Github repo: https://github.com/TaroEld/mod_dev_console

# How to install
Just copy the .zip into your data folder. This mod requires MSU. If you don't want the MSU requirement, there's an older version available on Nexus.

# Capabilities

## Console
The console can be shown in any state by pressing ctrl+g. It toggles between half-width and fullscreen with subsequent presses.\
The console screen three main elements: a textarea to enter commands, an output window, and a footer bar.\
In the textarea, you can enter any valid Squirrel or JavaScript syntax. The default language is Squirrel. To switch to JS, press the "Squirrel" footer button.\
You can run the command in two ways: while staying in the console window ("Run in console" or shift+enter), or after closing the console window ("Run" or shift+ctrl+enter). The latter can be necessary in some cases, for example to invoke events.\
The commands are evaluated using `compilestring(_input).call(this);` in SQ and `Function(_input)()` in JS.\
As these inputs are executed as functions, you will need to return a value if you want to print it (or use ::logInfo() or console.error(), of course): `return 1+2`;

## Logging
The currently executed command, as well as any return values, are printed to the console.\
Furthermore, I have added the global functions `::logConsole` (SQ) and `logConsole` (JS) to print to the console.\
Finally, print statements by the game engine(s) (`::logInfo`, `::logWarning`, `::logError`, `console.error`) are also printed to the console.\
In JS, objects can generally be printed rather easily, either directly or by using `JSON.stringify`. For SQ, you can use the MSU function `::MSU.Log.printData` to print tables and such.  
### kwarg options for logging
You can pass options to the logging functions (`::logInfo`, `::logWarning`, `::logError`, `console.error`, `::logConsole`, `logConsole`):
- `Type`: One of `message`, `warning`, `error`, `system`. Colours the output, and is set by default by `::logInfo`, `::logWarning`, `::logError`.
- `ParseHTML`: `true` or `false`. Defaults to `true` By default, console output is parsed and rendered as HTML. This can be undesirable in some situations.  

Example: `::logConsole("My message", {ParseHTML = false, type = "warning"})`
## Debug Keybinds
I've included a number of useful debug keybinds. They've been lifted from the unused ingame debug module, respectively the Debug Mod by VilainJoueur.\
Debug Keybinds are disabled by default. They can be enabled by toggling the `Enable debug keybinds` setting.\
To get a list of available keybinds, check the Mod Settings.

## Element Inspector
I've added a HTML element inpector based on a suggestion/idea by KFox#2537.  
This allows you to look at elements below the cursor to see details such as the type, classes, and styling.  
#### States
At this time it has 4 states, which can be toggled via ctrl+i (modsetting keybind):  
- None: Disabled  
- Simple: Type, Class  
- Border: Simple plus renders a border around the current element  
- Full: Adds CSS styling  
The default state can be set via modsetting.  
#### Node Level
Often, it's useful to be able to look at an element that is below the current one. This is the `Node Level` value.  
The Node Level can be changed via `ctrl` + `up` | `down`. (modsetting keybind).  
#### Changing CSS values and locking elements
You can change CSS values by typing in the input field at the top left. To get there without losing track of your current element, either use tab to focus it, or press ctrl+l (L) to "lock" the current element, so that it doesn't change when you move the cursor. To change css values, first write the class, then the new value, without any extra characters like you would in JS or something: width 10px instead of width: "10px". You can also have multiple values: border 10px solid black.
#### Other
The currently selected element is available in the global (JS) scope via `ElementInspector.LastElement`. This can be useful to, for example, change its text. It is a DOM node, so you'll need to wrap it in `$()` to use jQuery functions on it. 

## CSS/JS hot reloading
Press ctrl+shift+c to reload CSS files, ctrl+shift+j to reload JS files. The former can be very useful if you are working on UI, although sometimes the re-layouting breaks and you will need to restart the game anyways. The latter tends to be situational, as generally everything breaks. But maybe you have some constant values that you want to refresh.
To make this work, you will of course update the .zip folders of your mod. I use my (bbbuilder)[https://github.com/TaroEld/BBbuilder] application with "Update mod" to quickly refresh the file.


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

## Known issues:
There are some issues with the `compilescript()` squirrel function. It will complain about missing `;` or `lf` despite the syntax being correct.\
This seems to be related to `if | if / else  | if/ else if`. Try semicolons after the closing if curly braces, and either don't use else if, or don't put any other statement in the same scope after it.\
If everything else fails, you can try to use the this.include() function, which allows you to add and run a .nut file. Place it in your data folder, and run 'this.include("my_file"), without .nut. A file can only be run once per game start this way, so you'll need to rename it or restart the game if you need to do it more than once.


