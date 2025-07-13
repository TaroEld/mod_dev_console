function DebugInfoElement(_parent)
{
   this.mContainer = null;
   this.mPopupContainer = null;
   this.createDIV($('.root-screen'));
}
DebugInfoElement.prototype.createDIV = function(_parent)
{
   this.mContainer = $("<div class='dev-console-debug-info'/>")
   	.appendTo(_parent);

   this.mPopupContainer = $("<div class='dev-console-popup-container'/>")
   	.appendTo(this.mContainer);

   this.InfoRows = {
   	"GlobalDebug" : this.createInfoRow("Debug Keys ENABLED"),
   	"Hunger" : this.createInfoRow("World: No Assets (Hunger, Crowns)"),
   	"Attackable" : this.createInfoRow("World: Not Attackable"),
   	"WorldFoW" : this.createInfoRow("World: No Fog of War"),
   	"Events" : this.createInfoRow("World: No Events"),
   	"TacticalFoW" : this.createInfoRow("Tactical: No Fog of War"),
   };
   // set to green
   this.toggleRowState("GlobalDebug", true);
}
DebugInfoElement.prototype.destroyDIV = function(_parent)
{
   this.mContainer.remove();
   this.mPopupContainer.remove();
   this.mContainer = null;
   this.mPopupContainer = null;
}
DebugInfoElement.prototype.toggleVisible = function(_bool)
{
   this.mContainer.toggle(_bool);
}
DebugInfoElement.prototype.createInfoRow = function(_name)
{
   var container = $("<div class='dev-console-debug-info-row'/>");
   container.html(_name);
   container.appendTo(this.mContainer);
   function updateValue(_bool)
   {
   	container.toggleClass("enabled", _bool);
   }
   return {
   	"Container" : container,
   	"updateValue" : updateValue
   }
}
DebugInfoElement.prototype.toggleRowState = function(_key, _bool)
{
   this.InfoRows[_key].updateValue(_bool);
}

DebugInfoElement.prototype.showInfoPopup = function(_text, _duration)
{
	var duration = _duration || 3000;

	var popup = $("<div class='dev-console-info-popup'/>")
		.html(_text)
		.css({opacity: 0})
		.appendTo(this.mPopupContainer);

	popup.animate({opacity: 1}, 200);

	setTimeout(function() {
		popup.animate({opacity: 0}, 500, function() {
			popup.remove();
		});
	}, duration);
}
