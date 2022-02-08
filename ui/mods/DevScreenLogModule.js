/*
 *  @Project:		Battle Brothers
 *	@Company:		Overhype Studios
 *
 *	@Copyright:		(c) Overhype Studios | 2013 - 2020
 * 
 *  @Author:		Overhype Studios
 *  @Date:			03.03.2017 (refactored: 25.10.2017)
 *  @Description:	Tactical Screen - Topbar: Event Log Module JS
 */
"use strict";


var DevScreenLogModule = function()
{
	this.mSQHandle  = null;
	
	// event listener
	this.mEventListener = null;

	// container
	this.mContainer = null;
	this.mInputCommandContainer = null;
	this.mInputArgumentContainer = null;

	this.mEventsListContainer = null;
	this.mEventsListScrollContainer = null;

	this.mLatestCommandArray = [];
    this.mLatestCommandIndex = 0;

	// constants
	this.mMaxVisibleEntries = 1000;

};


DevScreenLogModule.prototype.isConnected = function ()
{
	return this.mSQHandle !== null;
};

DevScreenLogModule.prototype.onConnection = function (_handle)
{
	this.mSQHandle = _handle;

	// notify listener
	if (this.mEventListener !== null && ('onModuleOnConnectionCalled' in this.mEventListener))
    {
		this.mEventListener.onModuleOnConnectionCalled(this);
	}
};

DevScreenLogModule.prototype.onDisconnection = function ()
{
	this.mSQHandle = null;

	// notify listener
	if (this.mEventListener !== null && ('onModuleOnDisconnectionCalled' in this.mEventListener))
    {
		this.mEventListener.onModuleOnDisconnectionCalled(this);
	}
};

DevScreenLogModule.prototype.registerEventListener = function (_listener)
{
	this.mEventListener = _listener;
};

DevScreenLogModule.prototype.createDIV = function (_parentDiv)
{
    var self = this;

	// create: container
	this.mContainer = $('<div class="mod-log-module"/>');
    _parentDiv.append(this.mContainer);

    var row = $('<div class="row"/>');
    this.mContainer.append(row);
    var label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Command</div>');
    row.append(label);

    var inputLayout = $('<div class="l-input"/>');
    row.append(inputLayout);
    this.mInputCommandContainer = inputLayout.mod_createInput('', 0, 10000, 1, null, 'text-font-small font-color-brother-name custom-input-width', function (_input)
    {
        self.mEventListener.notifyBackendOkButtonPressed();
    });


    // create & set title
    row = $('<div class="row"/>');
    this.mContainer.append(row);
    label = $('<div class="label text-font-normal font-color-label font-bottom-shadow">Arguments</div>');
    row.append(label);

    inputLayout = $('<div class="l-input"/>');
    row.append(inputLayout);
    this.mInputArgumentContainer = inputLayout.mod_createInput('', 0, 10000, 1, null, 'text-font-small font-color-brother-name custom-input-width', function (_input)
    {
        self.mEventListener.notifyBackendCancelButtonPressed();
    });

	// create: log container
	var eventLogsContainerLayout = $('<div class="mod-logs-container"/>');
	this.mContainer.append(eventLogsContainerLayout);
    this.mEventsListContainer = eventLogsContainerLayout.createList(15);
    this.mEventsListScrollContainer = this.mEventsListContainer.findListScrollContainer();

};

DevScreenLogModule.prototype.destroyDIV = function ()
{
    this.mEventsListScrollContainer.empty();
    this.mEventsListScrollContainer = null;
    this.mEventsListContainer.destroyList();
    this.mEventsListContainer.remove();
    this.mEventsListContainer = null;

	this.mInputCommandContainer.empty();
    this.mInputCommandContainer = null;
    

	this.mInputArgumentContainer.empty();
	this.mInputArgumentContainer = null;


    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};


DevScreenLogModule.prototype.createEventLogEntryDIV = function (_text)
{
	if (_text === null || typeof(_text) != 'string')
	{
		return null;
	}

	var entry = $('<div class="entry text-font-small"></div>');
	var parsedText = XBBCODE.process({
		text: _text,
		removeMisalignedTags: false,
		addInLineBreaks: true
	});

	entry.html(parsedText.html);
	return entry;
};


DevScreenLogModule.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
};

DevScreenLogModule.prototype.destroy = function()
{
    this.destroyDIV();
};


DevScreenLogModule.prototype.register = function (_parentDiv)
{
    console.log('DevScreenLogModule::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register DevScreenLogModule. Reason: DevScreenLogModule is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);
    }
};


DevScreenLogModule.prototype.unregister = function ()
{
    console.log('DevScreenLogModule::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister DevScreenLogModule. Reason: DevScreenLogModule is not initialized.');
        return;
    }

    this.destroy();
};


DevScreenLogModule.prototype.isRegistered = function ()
{
	if (this.mContainer !== null)
	{
		return this.mContainer.parent().length !== 0;
	}

	return false;
};


DevScreenLogModule.prototype.log = function (_text)
{
	var entry = this.createEventLogEntryDIV(_text);
	if (entry !== null)
	{
		if (this.mEventsListScrollContainer.children().length > this.mMaxVisibleEntries)
		{
			var firstDiv = this.mEventsListScrollContainer.children(':first');
			if (firstDiv.length > 0)
			{
				firstDiv.remove();
			}
		}

		this.mEventsListScrollContainer.append(entry);
        this.mEventsListContainer.scrollListToBottom();
	}

};


DevScreenLogModule.prototype.clearConsole = function ()
{
	this.mInputCommandContainer.val('');
	this.mInputArgumentContainer.val('');
	this.mEventsListScrollContainer.empty();
	this.mInputCommandContainer.focus();
};
DevScreenLogModule.prototype.insertCommand = function (_command)
{
	this.mLatestCommandIndex += 1
	this.mLatestCommandArray.push(_command)
};

DevScreenLogModule.prototype.changeLatestInput = function (_data)
{
    var currentLen = this.mLatestCommandArray.length
    var previousLen = this.mLatestCommandIndex
    var nextLen = previousLen + _data
    if (nextLen < 0 || nextLen >= currentLen){
    	return false
    }
    this.mLatestCommandIndex += _data
    this.mInputCommandContainer.val(this.mLatestCommandArray[nextLen]);
    return true

}

