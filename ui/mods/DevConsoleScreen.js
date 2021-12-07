/*
 *  @Project:       Battle Brothers
 *  @Company:       Overhype Studios
 *
 *  @Copyright:     (c) Overhype Studios | 2013 - 2020
 * 
 *  @Author:        Overhype Studios
 *  @Date:          31.10.2017
 *  @Description:   World Town Screen JS
 */
"use strict";



var DevConsoleScreen = function(_parent)
{

    this.mSQHandle = null;
    this.mContainer = null;
    this.mDialogContainer = null;
    this.mLogModule = null;
    this.mIsVisible = false;

    this.createModules();

}


DevConsoleScreen.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};

DevConsoleScreen.prototype.onConnection = function (_handle)
{
    this.mSQHandle = _handle;
    this.register($('.root-screen'));
};

DevConsoleScreen.prototype.onDisconnection = function ()
{
    
    this.mLogModule.onDisconnection();
    this.mSQHandle = null;
    this.unregister();
};

DevConsoleScreen.prototype.onModuleOnConnectionCalled = function (_module)
{
    // check if every module is connected
    if (this.mDialogContainer !== null && this.mDialogContainer.isConnected())
    {
        this.notifyBackendOnConnected();
    }
};

DevConsoleScreen.prototype.onModuleOnDisconnectionCalled = function (_module)
{
    // check if every module is disconnected
    if (this.mDialogContainer === null && !this.mDialogContainer.isConnected())
    {
        this.notifyBackendOnDisconnected();
    }
};

DevConsoleScreen.prototype.createModules = function()
{
    this.mLogModule = new DevScreenLogModule();
    this.mLogModule.registerEventListener(this);

};

DevConsoleScreen.prototype.registerModules = function ()
{
    this.mLogModule.register(this.mDialogContainer.findDialogContentContainer());
};

DevConsoleScreen.prototype.unregisterModules = function ()
{
    this.mLogModule.unregister();
};

DevConsoleScreen.prototype.createDIV = function (_parentDiv)
{
    var self = this;

    // create: containers (init hidden!)
    this.mContainer = $('<div class="dialog-screen ui-control dialog-mod display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);

    // create: dialog container
    var dialogLayout = $('<div class="l-dialog-container-mod"/>');
    this.mContainer.append(dialogLayout);
    this.mDialogContainer = dialogLayout.createDialog('Mod Console', null, null, false);

    // create footer button bar
    var footerButtonBar = $('<div class="l-button-bar"></div>');
    this.mDialogContainer.findDialogFooterContainer().append(footerButtonBar);

    // create: buttons
    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    var button = layout.createTextButton("Run", function ()
    {
        self.notifyBackendOkButtonPressed();
    }, '', 4);

    var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Run in console", function ()
    {
        self.notifyBackendOkInConsoleButtonPressed();
    }, '', 4);

     var layout = $('<div class="l-ok-button"/>');
    footerButtonBar.append(layout);
    button = layout.createTextButton("Clear console", function ()
    {
        self.clearConsole();
    }, '', 4);
    
    var layout = $('<div class="l-cancel-button"/>');
    footerButtonBar.append(layout);
    this.mNoButton = layout.createTextButton("Cancel", function ()
    {
        self.notifyBackendCancelButtonPressed();
    }, '', 4);

    this.mIsVisible = false;
};


DevConsoleScreen.prototype.destroyDIV = function ()
{

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


DevConsoleScreen.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.registerModules();
};

DevConsoleScreen.prototype.destroy = function()
{
    this.unregisterModules();
    this.destroyDIV();
};


DevConsoleScreen.prototype.register = function (_parentDiv)
{
    console.log('DevConSoleScreen::REGISTER');

    if(this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Dev Console Screen. Reason: Dev Console Screen is already initialized.');
        return;
    }

    if(_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};

DevConsoleScreen.prototype.unregister = function ()
{
    console.log('DevConsoleScreen::UNREGISTER');

    if(this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Dev Console Screen. Reason: Dev Console Screen is not initialized.');
        return;
    }

    this.destroy();
};

DevConsoleScreen.prototype.show = function (_data)
{
    var self = this;
    this.mContainer.velocity("finish", true).velocity({ opacity: 1 },
    {
        duration: 0,
        easing: 'swing',
        begin: function ()
        {
            $(this).css({ opacity: 0 });
            $(this).removeClass('display-none').addClass('display-block');
            self.notifyBackendOnAnimating();
        },
        complete: function ()
        {
            self.mIsVisible = true;
            self.notifyBackendOnShown();
            self.mDialogContainer.find('input')[0].focus();
        }
    });
};
DevConsoleScreen.prototype.changeLatestInput = function (_data)
{
    this.mLogModule.changeLatestInput(_data)
};

DevConsoleScreen.prototype.log = function(_data)
{
    this.mLogModule.log(_data)
}
DevConsoleScreen.prototype.clearConsole = function()
{
    this.mLogModule.clearConsole()
}

DevConsoleScreen.prototype.hide = function ()
{
    this.mLogModule.clearConsole();
    var self = this;
    this.mContainer.velocity("finish", true).velocity({ opacity: 0 },
    {
        duration: 0,
        easing: 'swing',
        begin: function()
        {
            self.notifyBackendOnAnimating();
        },
        complete: function()
        {
            self.mIsVisible = false;
            $(this).css({ opacity: 0 });
            $(this).removeClass('display-block').addClass('display-none');
            self.notifyBackendOnHidden();
        }
    });
};

DevConsoleScreen.prototype.notifyBackendOkButtonPressed = function ()
{
    if (this.mSQHandle !== null)
    {
        var inputFields = this.mDialogContainer.find('input');
        SQ.call(this.mSQHandle, 'onOkButtonPressed', [ $(inputFields[0]).getInputText(),  $(inputFields[1]).getInputText()]);
    }
};

DevConsoleScreen.prototype.notifyBackendOkInConsoleButtonPressed = function ()
{
    if (this.mSQHandle !== null)
    {
        
        var inputFields = this.mDialogContainer.find('input');
        SQ.call(this.mSQHandle, 'onOkInConsoleButtonPressed', [ $(inputFields[0]).getInputText(),  $(inputFields[1]).getInputText()]);
        this.mLogModule.insertCommand($(inputFields[0]).getInputText())

    }
};

DevConsoleScreen.prototype.notifyBackendCancelButtonPressed = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onCancelButtonPressed');
    }
};


DevConsoleScreen.prototype.notifyBackendOnConnected = function ()
{
    if(this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenConnected');
    }
};

DevConsoleScreen.prototype.notifyBackendOnDisconnected = function ()
{
    if(this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenDisconnected');
    }
};

DevConsoleScreen.prototype.notifyBackendOnShown = function ()
{
    if(this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenShown');
    }
};

DevConsoleScreen.prototype.notifyBackendOnHidden = function ()
{
    if(this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenHidden');
    }
};

DevConsoleScreen.prototype.notifyBackendOnAnimating = function ()
{
    if(this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenAnimating');
    }
};
DevConsoleScreen.prototype.setPreviousCommands = function (_data)
{
    this.mLogModule.mLatestCommandArray = _data;
    this.mLogModule.mLatestCommandIndex = _data.length
};




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
    
/*  result.attr('style', 'background-size: 9.8rem 4.3rem")');
    result.attr('style', 'background-image: url("coui://gfx/ui/skin/button_02_hovered.png")'); */

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

        if(code === KeyConstants.Return || code === KeyConstants.Enter)
        {
            if(_acceptCallback !== undefined && jQuery.isFunction(_acceptCallback))
            {
                $(this).blur();
                _acceptCallback($(this));
            }

            return;
        }

        if(_inputUpdatedCallback !== undefined && jQuery.isFunction(_inputUpdatedCallback))
        {
            _inputUpdatedCallback($(this), self.getInputTextLength());
        }

        self.data('input', data);
    });

    result.data('input', data);

    this.append(result);

    return result;
};
registerScreen("DevConsoleScreen", new DevConsoleScreen());
registerScreen("TacticalDevConsoleScreen", new DevConsoleScreen());


