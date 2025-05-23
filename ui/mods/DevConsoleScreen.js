"use strict";
var DevConsoleScreen = function(_parent)
{
    MSUUIScreen.call(this);
    this.mModID = "mod_dev_console"
    this.mID = "DevConsoleScreen";
    this.mContainer = null;
    this.mDialogContainer = null;
    this.mTimerHandle = null;
    this.mMessageQueue = [];

    this.mInputContainer = null;

    this.mOutputContainer = null;
    this.mOutputScrollContainer = null;

    this.mEnvironment = DevConsole.Environments.Squirrel;

    // constants
    this.mMaxVisibleEntries = 1000;

    this.mColors = {
    	BackgroundColor : null,
    	message : null,
    	warning : null,
    	error : null,
    	system : null,
    }
}

DevConsoleScreen.prototype = Object.create(MSUUIScreen.prototype);
Object.defineProperty(DevConsoleScreen.prototype, 'constructor', {
    value: DevConsoleScreen,
    enumerable: false,
    writable: true
});

DevConsoleScreen.prototype.createDIV = function (_parentDiv)
{
	this.updateColorSettings();
    var self = this;

    // create: containers (init hidden!)
    this.mContainer = $('<div class="dev-console-main-container display-none"/>');
    _parentDiv.append(this.mContainer);

    // create: dialog container
    var dialogLayout = $('<div class="dev-console-dialog"/>');
    this.mContainer.append(dialogLayout);
    this.mLogModule = $('<div class="input-output-container"/>');
    dialogLayout.append(this.mLogModule);
    this.createLogContent()

    // create footer and  button bar
    this.mFooter = $('<div class="dev-console-footer"/>');
    dialogLayout.append(this.mFooter);
    this.createFooterButtons();

    this.mIsVisible = false;
};

DevConsoleScreen.prototype.createLogContent = function ()
{
    var self = this;

    // create: container
    var inputLayout = $('<div class="devconsole-input-layout"/>').appendTo(this.mLogModule);

    var textAreaLayout = $('<div class="l-input"/>').appendTo(inputLayout);
    this.mInputContainer = textAreaLayout.mod_createInput('', 0, 10000, 1, null);

    // create: log container
    var outputLayout = $('<div class="devconsole-output-layout"/>').appendTo(this.mLogModule);
    this.mOutputContainer = outputLayout.createList(2);
    this.mOutputContainer.css("background-color", "rgba(" + this.mColors.BackgroundColor + ")");
    this.mOutputScrollContainer = this.mOutputContainer.findListScrollContainer();
};

DevConsoleScreen.prototype.createFooterButtons = function ()
{
	 var footerButtonBar = $('<div class="l-button-bar"></div>');
	this.mFooter.append(footerButtonBar);
	var self = this;

	 // create: buttons
	 var layout = $('<div class="l-ok-button"/>');
	 footerButtonBar.append(layout);
	 var button = layout.createTextButton("Run", function ()
	 {
	     self.checkRunCommand();
	     self.mInputContainer.focus();
	 }, '', 4);

	 var layout = $('<div class="l-ok-button"/>');
	 footerButtonBar.append(layout);
	 button = layout.createTextButton("Run in console", function ()
	 {
	     self.checkRunCommand(true);
	     self.mInputContainer.focus();
	 }, '', 4);

	  var layout = $('<div class="l-ok-button"/>');
	 footerButtonBar.append(layout);
	 button = layout.createTextButton("Clear console", function ()
	 {
	     self.clearConsole();
	     self.mInputContainer.focus();
	 }, '', 4);

	 var layout = $('<div class="l-ok-button"/>');
	 footerButtonBar.append(layout);
	 this.mEnvButton = layout.createTextButton("Squirrel", function ()
	 {
	     self.toggleEnvironment();
	     self.mInputContainer.focus();
	 }, '', 4);

	 var layout = $('<div class="l-ok-button"/>');
	 footerButtonBar.append(layout);
	 this.mNoButton = layout.createTextButton("Cancel", function ()
	 {
	     self.notifyBackendHide();
	 }, '', 4);
}

DevConsoleScreen.prototype.destroyDIV = function ()
{
    this.mOutputScrollContainer.empty();
    this.mOutputScrollContainer = null;
    this.mOutputContainer.destroyList();
    this.mOutputContainer.remove();
    this.mOutputContainer = null;

    this.mInputContainer.empty();
    this.mInputContainer = null;

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

DevConsoleScreen.prototype.show = function (_moveLeftRight, _considerParent)
{
	this.mIsVisible = true;
	this.mContainer.css("opacity", 1)
	this.mContainer.css("height", "50%")
	this.mContainer.removeClass('display-none').addClass('display-block');
	this.notifyBackendOnShown();
	this.onShow();

    // new
    this.mPuller = setInterval(this.pullBuffer.bind(this), 200);
};

DevConsoleScreen.prototype.pullBuffer = function ()
{
    if (!this.mIsVisible && this.mPuller) {
        clearInterval(this.mPuller);
        this.mPuller = null;
        return
    }
    SQ.call(this.mSQHandle, "pullBuffer", null, this.receiveBuffer.bind(this));
};

DevConsoleScreen.prototype.receiveBuffer = function (buffer) {
    var n = this.mMaxVisibleEntries;
    this.mMessageQueue = buffer.length >= n ? buffer : this.mMessageQueue.concat(buffer);
    if (this.mMessageQueue.length > n) {
        this.mMessageQueue.splice(0, this.mMessageQueue.length - n);
    }
    if (this.mMessageQueue.length > 0) this.scheduleProcessQueue();
}

DevConsoleScreen.prototype.scheduleProcessQueue = function () {
    if (this.mTimerHandle !== null)
    {
        this.mTimerHandle = clearTimeout(this.mTimerHandle);
    }
    this.mTimerHandle = setTimeout(this.processQueue.bind(this), 10);
}

DevConsoleScreen.prototype.enlarge = function ()
{
	this.mContainer.css("height", "100%")
	this.onShow();
};


DevConsoleScreen.prototype.onShow = function()
{
	this.mInputContainer.focus();
	this.adjustDivHeights()
}

DevConsoleScreen.prototype.toggleEnvironment = function()
{
	this.setEnvironment(this.mEnvironment == DevConsole.Environments.Squirrel ? DevConsole.Environments.JS : DevConsole.Environments.Squirrel);
}

DevConsoleScreen.prototype.setEnvironment = function (_env)
{
    this.mEnvironment = _env;
    if(this.mEnvironment ==  DevConsole.Environments.Squirrel)
    {
    	this.mInputContainer.removeClass("font-color-JS").addClass("font-color-brother-name")
        this.mEnvButton.changeButtonText("Squirrel");
    }
    else
    {
    	this.mInputContainer.removeClass("font-color-brother-name").addClass("font-color-JS")
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
		system : MSU.getSettingValue(this.mModID, "system"),
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
	this.mMessageQueue.push(_message);
    this.scheduleProcessQueue();
}

DevConsoleScreen.prototype.processQueue = function()
{
	var self = this;
	this.mMessageQueue.forEach(function(_message){
		if (self.mOutputScrollContainer == null || _message.Text === null)
			return
		_message.Text = String(_message.Text);
	    var entry = self.createEventLogEntryDIV(_message);
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
	this.scrollToBottom();
}

DevConsoleScreen.prototype.createEventLogEntryDIV = function (_message)
{
    var entry = $('<div class="log-entry text-font-small"></div>');
    entry.data("type", _message.Type);
    entry.css("color", "rgba(" + this.mColors[_message.Type] + ")");
    var leftColumn = $('<span class="devconsole-log-entry-meta"></span>').appendTo(entry);
    leftColumn.append(this.getEnvAndTimeStamp(_message));
    var rightColumn = $('<span class="devconsole-log-entry-text"></span>').appendTo(entry);
    var text = _message.Text
    if (_message.Options != null && _message.Options.ParseHTML === false)
    {
    	rightColumn.text(text);
    }
    else
    {
    	// var parsedText = XBBCODE.process({
    	//     text: text,
    	//     removeMisalignedTags: false,
    	//     addInLineBreaks: true
    	// });

    	rightColumn.html(text);
    }
    return entry;
};

DevConsoleScreen.prototype.getEnvAndTimeStamp = function(_message)
{
	var text = $("<span/>");
	var envText = _message.Environment == DevConsole.Environments.Squirrel ? "<span class='font-color-brother-name'> SQ:</span>" : "<span class='font-color-JS'> JS:</span>";
	var d = new Date()

	var hours = d.getHours();
	var minutes = d.getMinutes();
	var seconds = d.getSeconds();
	text.html((hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes)  + ":" + (seconds < 10 ? "0" + seconds : seconds)  + " " + envText);
	return text
}

DevConsoleScreen.prototype.clearConsole = function()
{
    this.mInputContainer.val('');
    this.mOutputScrollContainer.empty();
    this.mInputContainer.focus();
    this.mMessageQueue = [];
    this.adjustDivHeights();
}

DevConsoleScreen.prototype.changeLatestInput = function (_data)
{
    this.mInputContainer.val(_data.command);
    this.setEnvironment(_data.environment);
    return true
}

DevConsoleScreen.prototype.checkRunCommand = function (_inConsole)
{
    var command = this.mInputContainer.getInputText();
    SQ.call(this.mSQHandle, 'addPreviousCommand', [command, this.mEnvironment]);
    if ( !_inConsole)
    {
        this.notifyBackendHide();
    }
    if (this.mEnvironment == DevConsole.Environments.Squirrel)
    {
        this.notifyBackendRunCommand(command);
    }
    else
    {
        this.runCommandInJs(command);
    }
};

DevConsoleScreen.prototype.runCommandInJs = function (command)
{
	var logOptions = this.mergeOptions({ParseHTML:false, Type:"system"});
	command = command.replace(/[\u0127]/g, '');
	command = command.replace(/\u0127/g, '');
	command = command.replace("", '');
	command = command.replace(//g, '');


	logConsole("Command: " + String(command), logOptions);
	try{
	    var ret = Function(command)();
	    logConsole("Output: " + ret, logOptions);
	}
	catch(err){
		logConsole("Error in command:\n" + err, logOptions)
	}
};

DevConsoleScreen.prototype.adjustDivHeights = function ()
{
	var inputContainer = this.mInputContainer;
	var outputContainer = this.mOutputContainer;
	// set to auto so that scrollheight resets
	inputContainer.css("height", "auto");

	//depends on lines of content in the input container
	var inputHeight = Math.min(this.mLogModule.height() / 2.5, inputContainer.prop('scrollHeight')) + 5
	var outputHeight = Screens.DevConsoleScreen.mLogModule.height() - inputHeight - 50;

	inputContainer.css("height", inputHeight + "px");
	outputContainer.css("height", outputHeight + "px");
	this.scrollToBottom();
};

DevConsoleScreen.prototype.scrollToBottom = function()
{
	if (!this.mIsVisible)
		return;
	var scrollContainer = this.mOutputContainer.findListScrollContainer();
	var element = scrollContainer.children(':last');
	if (element[0] == undefined)
		return false;

	var offsets = scrollContainer[0].offsetTop;
	scrollContainer.trigger('scroll', { top: element[0].offsetTop, duration: 1, animate: 'linear', scrollTo: 'bottom' });
	scrollContainer.trigger('update', true);
	return true;
}

DevConsoleScreen.prototype.onHide = function()
{
	this.mInputContainer.blur();
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


DevConsoleScreen.prototype.mergeOptions = function(_options)
{
	var defaultOptions = {
		Dev : true,
		Type : "message",
		ParseHTML : true,
	}
	if (_options == null || _options == undefined)
		return defaultOptions;
	$.each(_options, function(key, value){
		if (!(key in defaultOptions)) throw new Error('Unknown log parameter: ' + key);
		defaultOptions[key] = value;
	})
	return defaultOptions;
}

 $.fn.mod_createInput = function(_text, _minLength, _maxLength, _tabIndex, _inputUpdatedCallback)
 {
    var minLength = _minLength || 0;
    var maxLength = _maxLength || null;
    var tabIndex = _tabIndex || null;

    // var result = $('<input type="text" class="ui-control"/>');
    var result = $('<textarea autofocus rows="5" cols="200" type="text" class="text-font-small font-color-brother-name console-textarea"/>');
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

    // input handler
    result.on('keydown.input', null, result, function (_event)
    {
        var code = _event.which || _event.keyCode;
        var inputDenied = false;
        var self = _event.data;
        var data = self.data('input');
        var inputDeniedUntil = data.inputDeniedUntil || 0;
        var inputDelay = inputDeniedUntil == 0 ? 40 : 500;
        var runCommand = MSU.Keybinds.isKeybindPressed(DevConsole.mModID, "RunCommand", _event);
        var runCommmandInConsole = MSU.Keybinds.isKeybindPressed(DevConsole.mModID, "RunCommandInConsole", _event);

        if (runCommand || runCommmandInConsole && !data.inputDenied)
        {
        	data.inputDenied = true;
        	data.inputDeniedUntil = (new Date()).getTime() + inputDelay;
        	self.data("input", data)
        	Screens.DevConsoleScreen.checkRunCommand(runCommmandInConsole);
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
        $(this).val($(this).val().replace(/\t/g, "    "));
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

