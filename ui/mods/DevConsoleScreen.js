"use strict";

var console_error = console.error;
console.error = function(args)
{
	console_error.call(console, args);
	if (Screens.DevConsoleScreen) Screens.DevConsoleScreen.log({Text : arguments[0], Type : "error"})
}

var DevConsole = {
	mModID : "mod_dev_console"
}

var DevConsoleScreen = function(_parent)
{
    MSUUIScreen.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleScreen";
    this.mContainer = null;
    this.mDialogContainer = null;

    this.mInputCommandContainer = null;
    this.mInputArgumentContainer = null;

    this.mOutputContainer = null;
    this.mOutputScrollContainer = null;
    this.mCurrentEntries = [];

    this.mLatestCommandArray = [];
    this.mLatestCommandIndex = 0;
    this.mEnvironment = true;

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
	if (this.mOutputScrollContainer.children().length > 0)
		this.mOutputContainer.scrollListToBottom();
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
    }, '', 4);

    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Run in console", function ()
    {
        self.checkRunCommand(true);
    }, '', 4);

     var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Clear console", function ()
    {
        self.clearConsole();
    }, '', 4);

    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    this.mEnvButton = layout.createTextButton("Squirrel", function ()
    {
        self.setEnvironment(!self.mEnvironment);
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

    var row = $('<div class="row"/>');
    this.mLogModule.append(row);
    var label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Command</div>');
    row.append(label);

    var inputLayout = $('<div class="l-input"/>');
    row.append(inputLayout);
    this.mInputCommandContainer = inputLayout.mod_createInput('', 0, 10000, 1, null, 'text-font-small font-color-brother-name custom-input-width');
    // create: log container
    var eventLogsContainerLayout = $('<div class="mod-logs-container"/>');
    this.mLogModule.append(eventLogsContainerLayout);
    this.mOutputContainer = eventLogsContainerLayout.createList(2);
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

DevConsoleScreen.prototype.setEnvironment = function (_env)
{
    this.mEnvironment = _env;
    if(this.mEnvironment)
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

    if (this.mCurrentEntries != null)
    {
    	this.mCurrentEntries.forEach($.proxy(function(_entry){
    	    _entry.css("color", "rgba(" + this.mColors[_entry.data("type")] + ")");
    	}, this))
    }
}

DevConsoleScreen.prototype.log = function(_message)
{
	if (this.mOutputScrollContainer == null)
		return
    var entry = this.createEventLogEntryDIV(_message.Text, _message.Type);
    if (entry !== null)
    {
        if (this.mOutputScrollContainer.children().length > this.mMaxVisibleEntries)
        {
            var firstDiv = this.mOutputScrollContainer.children(':first');
            if (firstDiv.length > 0)
            {
                firstDiv.remove();
            }
        }
        this.mOutputScrollContainer.append(entry);
        this.mCurrentEntries.push(entry);
        this.mOutputContainer.scrollListToBottom();
    }
}

DevConsoleScreen.prototype.createEventLogEntryDIV = function (_text, _type)
{
    if (_text === null || typeof(_text) != 'string')
    {
        return null;
    }

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
    this.mCurrentEntries = [];
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
    if(this.mEnvironment == true)
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

    var result = $('<input type="text" class="ui-control"/>');
    var data = { minLength: _minLength || 0, maxLength: _maxLength || null, inputUpdatedCallback: null, acceptCallback: null, inputDenied: false };
    
    if (_inputid == 2)
    {
        result.css('background-image', 'url("coui://gfx/ui/skin/input_2_default.png")');
        result.css('background-size', '12.4rem 2.8rem');
        result.css('text-align', 'center');
    }
    else if (_inputid == 3)
    {
        result.css('background-image', 'url("coui://gfx/ui/skin/input_3_default.png")');
        result.css('background-size', '5.6rem 2.8rem');
        result.css('text-align', 'center');
    }
    else if (_inputid == 4)
    {
        result.css('background-image', 'url("coui://gfx/ui/skin/input_4_default.png")');
        result.css('background-size', '20.0rem 2.8rem');
        result.css('text-align', 'center');
    }
    else if (_inputid == 5)
    {
        result.css('background-image', 'url("coui://gfx/ui/skin/input_5_default.png")');
        result.css('background-size', '45.0rem 2.8rem');
        result.css('text-align', 'center');
    }

    if (maxLength !== null)
    {
        result.attr('maxlength', maxLength);
    }

    if (tabIndex !== null)
    {
        result.attr('tabindex', tabIndex);
    }

    if (_classes !== undefined && _classes !== null && typeof(_classes) === 'string')
    {
        result.addClass(_classes);
    }

    if (_inputUpdatedCallback !== undefined && jQuery.isFunction(_inputUpdatedCallback))
    {
        data.inputUpdatedCallback = _inputUpdatedCallback;
    }

    if (_acceptCallback !== undefined && jQuery.isFunction(_acceptCallback))
    {
        data.acceptCallback = _acceptCallback;
    }

/*  result.onmouseover = function ()
    {
        var imgstringa = 'url("coui://gfx/ui/skin/button_0'+2+'_inactive.png")';
        result.css('background-image', imgstringa);
        result.css('background-size', '9.8rem 4.3rem');
    };
     */
    result.on('mouseover.input', null, result, function (_event)
    {
        if (_inputid == 2)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_2_active.png")');
        }
        else if (_inputid == 3)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_3_active.png")');
        }
        else if (_inputid == 4)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_4_active.png")');
        }
        else if (_inputid == 5)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_5_active.png")');
        }
    });
    
    result.on('mouseout.input', null, result, function (_event)
    {
        if (_inputid == 2)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_2_default.png")');
        }
        else if (_inputid == 3)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_3_default.png")');
        }
        else if (_inputid == 4)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_4_default.png")');
        }
        else if (_inputid == 5)
        {
            result.css('background-image', 'url("coui://gfx/ui/skin/input_5_default.png")');
        }
    });
    
    result.on('click.input', null, result, function (_event)
    {
        if(_inputClickCallback !== undefined && jQuery.isFunction(_inputClickCallback))
        {
            _inputClickCallback($(this));
        }
    });
    
    result.on('focusout.input', null, result, function (_event)
    {
        if (_inputid == 2 || _inputid == 3 || _inputid == 4 || _inputid == 5)
        {
            if(_acceptCallback !== undefined && jQuery.isFunction(_acceptCallback))
            {
                _acceptCallback($(this));
            }
        }
    });
    
    // input handler
    result.on('keydown.input', null, result, function (_event)
    {
        var code = _event.which || _event.keyCode;
        var inputDenied = false;

        if (code === KeyConstants.Home){
            code = KeyConstants.ArrowUp
        }
        if (code === KeyConstants.End){
            code = KeyConstants.ArrowDown
        }
        
        if (code === KeyConstants.Tabulator ||
            code === KeyConstants.ArrowUp ||
            code === KeyConstants.ArrowDown
            )
        {
            return true;
        }
        if ((code === KeyConstants.ArrowLeft || code === KeyConstants.ArrowRight) && _event.data.data('input').inputDenied === false)
        {
            _event.data.data('input').inputDenied = true;
            return true;
        }

        if (code < KeyConstants.Zero ||
            code > KeyConstants.Z)
        {
            if (code !== KeyConstants.Backspace &&
                code !== KeyConstants.Delete &&
                code !== KeyConstants.Space
                )
            {
                return false;
            }
        }



        var self = _event.data;
        var data = self.data('input');
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


        if (_event[KeyModiferConstants.CtrlKey] === true && code === KeyConstants.V && data.inputDenied === true)
        {
            inputDenied = true;
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
        if (_event[KeyModiferConstants.CtrlKey] === true && code === KeyConstants.V)
        {
            data.inputDenied = true;
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
        var code = _event.which || _event.keyCode;
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

