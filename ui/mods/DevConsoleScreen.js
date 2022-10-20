"use strict";

var console_error = console.error;

console.error = function(args)
{
	console_error.call(console, args);
	if (Screens.DevConsoleScreen) Screens.DevConsoleScreen.log({Text : arguments[0], Type : "error"})
}

var DevConsole = {
	mModID : "mod_dev_console",
	Environments : {
		Squirrel : 0,
		JS : 1,
	}
}

var DevConsoleScreen = function(_parent)
{
    MSUUIScreen.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleScreen";
    this.mContainer = null;
    this.mDialogContainer = null;
    this.mTimerHandle = null;
    this.mMessageQueue = [];

    this.mInputCommandContainer = null;
    this.mInputArgumentContainer = null;

    this.mOutputContainer = null;
    this.mOutputScrollContainer = null;

    this.mLatestCommandArray = [];
    this.mLatestCommandIndex = 0;
    this.mEnvironment = DevConsole.Environments.Squirrel;

    // constants
    this.mMaxVisibleEntries = 1000;

    this.mColors = {
    	BackgroundColor : null,
    	message : null,
    	warning : null,
    	error : null,
    }
}

DevConsoleScreen.prototype = Object.create(MSUUIScreen.prototype);
Object.defineProperty(DevConsoleScreen.prototype, 'constructor', {
    value: DevConsoleScreen,
    enumerable: false,
    writable: true
});

DevConsoleScreen.prototype.onShow = function()
{
	this.mInputCommandContainer.focus();
	this.adjustDivHeights()
	this.scrollToBottom();
}

DevConsoleScreen.prototype.createDIV = function (_parentDiv)
{
	this.updateColorSettings();
    var self = this;

    // create: containers (init hidden!)
    this.mContainer = $('<div class="dialog-screen ui-control dialog-mod display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);

    // create: dialog container
    var dialogLayout = $('<div class="l-dialog-container-mod"/>');
    this.mContainer.append(dialogLayout);
    this.mDialogContainer = dialogLayout.createDialog('Mod Console', null, null, false);
    this.mDialogContentContainer = this.mDialogContainer.findDialogContentContainer();

    // create footer button bar
    var footerButtonBar = $('<div class="l-button-bar"></div>');
    this.mDialogContainer.findDialogFooterContainer().append(footerButtonBar);

    // create: buttons
    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    var button = layout.createTextButton("Run", function ()
    {
        self.checkRunCommand();
        self.mInputCommandContainer.focus();
    }, '', 4);

    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Run in console", function ()
    {
        self.checkRunCommand(true);
        self.mInputCommandContainer.focus();
    }, '', 4);

     var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Clear console", function ()
    {
        self.clearConsole();
        self.mInputCommandContainer.focus();
    }, '', 4);

    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    this.mEnvButton = layout.createTextButton("Squirrel", function ()
    {
        self.toggleEnvironment();
        self.mInputCommandContainer.focus();
    }, '', 4);
    
    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    this.mNoButton = layout.createTextButton("Cancel", function ()
    {
        self.notifyBackendHide();
    }, '', 4);

    this.mIsVisible = false;
    this.createLogContent()
};

DevConsoleScreen.prototype.createLogContent = function ()
{
    var self = this;

    // create: container
    this.mLogModule = $('<div class="mod-log-module"/>');
    this.mDialogContentContainer.append(this.mLogModule);

    var inputLayout = $('<div class="devconsole-input-layout"/>').appendTo(this.mLogModule);
    var label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Command</div>').appendTo(inputLayout);

    var textAreaLayout = $('<div class="l-input"/>').appendTo(inputLayout);
    this.mInputCommandContainer = textAreaLayout.mod_createInput('', 0, 10000, 1, null);
    // this.mInputCommandContainer = $('<textarea class="text-font-small font-color-brother-name"/>').appendTo(inputLayout);
    // this.mInputCommandContainer = $('<textarea class="text-font-small font-color-brother-name"/>').appendTo(inputLayout);

    // create: log container
    var outputLayout = $('<div class="devconsole-output-layout"/>').appendTo(this.mLogModule);
    this.mOutputContainer = outputLayout.createList(2);
    this.mOutputContainer.css("background-color", "rgba(" + this.mColors.BackgroundColor + ")");
    this.mOutputScrollContainer = this.mOutputContainer.findListScrollContainer();
};

DevConsoleScreen.prototype.destroyDIV = function ()
{
    this.mOutputScrollContainer.empty();
    this.mOutputScrollContainer = null;
    this.mOutputContainer.destroyList();
    this.mOutputContainer.remove();
    this.mOutputContainer = null;

    this.mInputCommandContainer.empty();
    this.mInputCommandContainer = null;

    if (this.mContentContainer != null){
        this.mContentContainer.remove();
        this.mContentContainer = null;
    }

    this.mDialogContainer.empty();
    this.mDialogContainer.remove();
    this.mDialogContainer = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};

DevConsoleScreen.prototype.toggleEnvironment = function()
{
	this.setEnvironment(this.mEnvironment == DevConsole.Environments.Squirrel ? DevConsole.Environments.JS : DevConsole.Environments.Squirrel);
}

DevConsoleScreen.prototype.setEnvironment = function (_env)
{
    this.mEnvironment = _env;
    if(this.mEnvironment ==  DevConsole.Environments.Squirrel)
    {
    	this.mInputCommandContainer.removeClass("font-color-JS").addClass("font-color-brother-name")
        this.mEnvButton.changeButtonText("Squirrel");
    }
    else
    {
    	this.mInputCommandContainer.removeClass("font-color-brother-name").addClass("font-color-JS")
        this.mEnvButton.changeButtonText("JavaScript");
    }
}

DevConsoleScreen.prototype.updateColorSettings = function ()
{
	var self = this;
	this.mColors = {
		BackgroundColor : MSU.getSettingValue(this.mModID, "BackgroundColor"),
		message : MSU.getSettingValue(this.mModID, "message"),
		warning : MSU.getSettingValue(this.mModID, "warning"),
		error : MSU.getSettingValue(this.mModID, "error"),
	}
	if (this.mOutputContainer != null)
	{
		this.mOutputContainer.css("background-color", "rgba(" + this.mColors.BackgroundColor + ")");
	}

	$(".log-entry").each(function(){
	    $(this).css("color", "rgba(" + self.mColors[$(this).data("type")] + ")");
	})
}

DevConsoleScreen.prototype.log = function(_message)
{
	var self = this;
	this.mMessageQueue.push(_message);
	if (this.mTimerHandle !== null)
	{
		this.mTimerHandle = clearTimeout(this.mTimerHandle);
	}
	this.mTimerHandle = setTimeout(function() {
		self.processQueue();
	}, 10);
}

DevConsoleScreen.prototype.processQueue = function()
{
	var self = this;
	this.mMessageQueue.forEach(function(_message){
		if (self.mOutputScrollContainer == null || _message.Text === null || typeof(_message.Text) != 'string')
			return
	    var entry = self.createEventLogEntryDIV(_message.Text, _message.Type);
	    if (self.mOutputScrollContainer.children().length > self.mMaxVisibleEntries)
	    {
	        var firstDiv = self.mOutputScrollContainer.children(':first');
	        if (firstDiv.length > 0)
	        {
	            firstDiv.remove();
	        }
	    }
	    self.mOutputScrollContainer.append(entry);
	})
	this.mMessageQueue = [];
	self.scrollToBottom();
}

DevConsoleScreen.prototype.createEventLogEntryDIV = function (_text, _type)
{
    var entry = $('<div class="log-entry text-font-small"></div>');
    entry.data("type", _type);
    entry.css("color", "rgba(" + this.mColors[_type] + ")");
    var parsedText = XBBCODE.process({
        text: _text,
        removeMisalignedTags: false,
        addInLineBreaks: true
    });

    entry.html(parsedText.html);
    return entry;
};

DevConsoleScreen.prototype.clearConsole = function()
{
    this.mInputCommandContainer.val('');
    this.mOutputScrollContainer.empty();
    this.mInputCommandContainer.focus();
    this.adjustDivHeights();
}

DevConsoleScreen.prototype.insertCommand = function (_command)
{
    this.mLatestCommandArray.splice(0, 0, [_command, this.mEnvironment])
    if(this.mLatestCommandArray.length > 10) this.mLatestCommandArray.pop()
};

DevConsoleScreen.prototype.changeLatestInput = function (_data)
{
    var currentLen = this.mLatestCommandArray.length
    var previousLen = this.mLatestCommandIndex
    var nextLen = previousLen + _data
    if(nextLen < 0) nextLen = 0;
    if(nextLen > 10) nextLen = 10;
    if(nextLen == currentLen) nextLen -= 1;
    this.mLatestCommandIndex = nextLen;
    this.mInputCommandContainer.val(this.mLatestCommandArray[nextLen][0]);
    this.setEnvironment(this.mLatestCommandArray[nextLen][1])
    return true
}

DevConsoleScreen.prototype.setPreviousCommands = function (_data)
{
    this.mLatestCommandArray = _data;
    this.mLatestCommandIndex = 0;
};

DevConsoleScreen.prototype.checkRunCommand = function (_inConsole)
{
    var command = this.mInputCommandContainer.getInputText();
    this.insertCommand(command);
    if(this.mEnvironment == DevConsole.Environments.Squirrel)
    {
        this.notifyBackendRunCommand(command);
    }
    else
    {
        SQ.call(this.mSQHandle, 'addPreviousCommand', [command, false]);
        this.runCommandInJs(command);
    }
    if ( !_inConsole)
    {
        this.notifyBackendHide();
    }
};

DevConsoleScreen.prototype.runCommandInJs = function (command)
{
	command = command.replace(/[\u0127]/g, '');
	console.error("Command: " + command);
    var ret = Function(command)();
    if (ret !== undefined && ret !== null)
    {
    	console.error("Output: " + ret);
    }
};

DevConsoleScreen.prototype.adjustDivHeights = function ()
{
	var inputContainer = this.mInputCommandContainer;
	var outputContainer = this.mOutputContainer;
	// set to auto so that scrollheight resets
	inputContainer.css("height", "auto");

	//depends on lines of content in the input container
	var inputHeight = Math.min(this.mLogModule.height() / 2.5, inputContainer.prop('scrollHeight')) + 2
	var outputHeight = Screens.DevConsoleScreen.mLogModule.height() - inputHeight - 100;

	inputContainer.css("height", inputHeight + "px");
	outputContainer.css("height", outputHeight + "px");
};

DevConsoleScreen.prototype.scrollToBottom = function()
{
	this.mOutputContainer.scrollListToBottom();
}

DevConsoleScreen.prototype.notifyBackendRunCommand = function(_command)
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onDevConsoleCommand', _command);
    }
}

DevConsoleScreen.prototype.notifyBackendHide = function()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'hide');
    }
}

 $.fn.mod_createInput = function(_text, _minLength, _maxLength, _tabIndex, _inputUpdatedCallback, _classes, _acceptCallback, _inputid, _inputClickCallback)
 {
    var minLength = _minLength || 0;
    var maxLength = _maxLength || null;
    var tabIndex = _tabIndex || null;

    // var result = $('<input type="text" class="ui-control"/>');
    var result = $('<textarea autofocus rows="5" cols="200" type="text" class="text-font-small font-color-brother-name custom-input-width custom-input-width"/>');
    var data = { minLength: _minLength || 0, maxLength: _maxLength || null, inputUpdatedCallback: null, acceptCallback: null, inputDenied: false };

    if (maxLength !== null)
    {
        result.attr('maxlength', maxLength);
    }

    if (tabIndex !== null)
    {
        result.attr('tabindex', tabIndex);
    }

    if (_inputUpdatedCallback !== undefined && jQuery.isFunction(_inputUpdatedCallback))
    {
        data.inputUpdatedCallback = _inputUpdatedCallback;
    }

    if (_acceptCallback !== undefined && jQuery.isFunction(_acceptCallback))
    {
        data.acceptCallback = _acceptCallback;
    }

    result.on('click.input', null, result, function (_event)
    {
        if(_inputClickCallback !== undefined && jQuery.isFunction(_inputClickCallback))
        {
            _inputClickCallback($(this));
        }
    });

    // input handler
    result.on('keydown.input', null, result, function (_event)
    {
        var code = _event.which || _event.keyCode;
        var inputDenied = false;
        var self = _event.data;
        var data = self.data('input');
        var inputDeniedUntil = data.inputDeniedUntil || 0;
        var inputDelay = inputDeniedUntil == 0 ? 40 : 500;

        if (MSU.Keybinds.isKeybindPressed(DevConsole.mModID, "RunInConsole", _event))
        {
        	if (!data.inputDenied)
        	{
        		Screens.DevConsoleScreen.checkRunCommand(true);
        		data.inputDenied = true;
        		self.data("input", data)
        	}
        	return false;
        }

        // copied from https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea
        if (code === KeyConstants.Tabulator) {
            _event.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) + "    " + this.value.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 4;
            return false;
        }

        if (code === KeyConstants.Home)
            code = KeyConstants.ArrowUp

        if (code === KeyConstants.End)
            code = KeyConstants.ArrowDown

        // set a delay between inputs
        if (   code === KeyConstants.ArrowLeft
        	|| code === KeyConstants.ArrowRight
        	|| code === KeyConstants.ArrowUp
        	|| code === KeyConstants.ArrowDown
        	|| code === KeyConstants.Delete
        	|| code === KeyConstants.Backspace
        	|| (_event[KeyModiferConstants.CtrlKey] === true && code === KeyConstants.V))
        {
        	var stop = false;
        	var inputDelay = inputDeniedUntil == 0 ? 40 : 500;
        	// special case for ctrl v
        	inputDelay = (_event[KeyModiferConstants.CtrlKey] === true && code === KeyConstants.V) ? 500 : inputDelay;
        	if (data.inputDenied === undefined || data.inputDenied === false)
        	{
        		data.inputDenied = true;
        		data.inputDeniedUntil = (new Date()).getTime() + inputDelay;
        	}
        	else if (inputDeniedUntil > (new Date()).getTime())
        	{
        		stop = true;
        	}
        	else
        	{
        		data.inputDenied = false;
        		delete data.inputDeniedUntil;
        	}
        	self.data("input", data)
        	if (stop)
        	{
        		return false;
        	}

        }

        var textLength = self.getInputTextLength();
        var assumedTextLength = textLength;
        
        if (code === KeyConstants.Backspace || code === KeyConstants.Delete)
        {
            if (minLength > 0)
            {
                inputDenied = ((textLength-1) < data.minLength);
            }

            if (inputDenied !== true)
            {
                assumedTextLength -= 1;
            }
        }
        else
        {
            inputDenied = ((textLength+1) > data.maxLength);

            if (inputDenied !== true)
            {
                assumedTextLength += 1;
            }
        }
        
        if (inputDenied === true)
        {
            var wasAlreadyDenied = data.inputDenied;
            if (wasAlreadyDenied === undefined || wasAlreadyDenied === false)
            {
                data.inputDenied = true;

                self.shakeLeftRight(3);
            }

            _event.preventDefault();
            _event.stopPropagation();
            //return false;
        }

        self.data('input', data);

        if (_inputUpdatedCallback !== undefined && jQuery.isFunction(_inputUpdatedCallback))
        {
            _inputUpdatedCallback($(this), assumedTextLength);
        }

        return !inputDenied;
    });

    result.on('keyup.input', null, result, function (_event)
    {
        var self = _event.data;
        var data = self.data('input');
        data.inputDenied = false;
        if(_inputUpdatedCallback !== undefined && jQuery.isFunction(_inputUpdatedCallback))
        {
            _inputUpdatedCallback($(this), self.getInputTextLength());
        }

        self.data('input', data);
    });

    result.on("input", function () {
      Screens.DevConsoleScreen.adjustDivHeights();
    });

    result.data('input', data);

    this.append(result);

    return result;
};

registerScreen("DevConsoleScreen", new DevConsoleScreen());

