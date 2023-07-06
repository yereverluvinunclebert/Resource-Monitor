// Menu Class - using popupMenu(), 30 March, 2013, Copyright 2004-2013 Harry Whitfield

/*properties
    alphaLockKey, altKey, checked, ctrlKey, data, event, hOff, hOffset, 
    hasOwnProperty, i, image, length, menuAction, menus, onSelect, opacity, 
    prototype, reset, select, selected, setTick, shiftKey, show, title, vOff, 
    vOffset
*/

function Menu(menuImage, menuStringsArray, selectedString, menuActionFunction) {
    var i;
    
    this.image = menuImage;
    this.menus = [];
    for (i = 0; i < menuStringsArray.length; i += 1) {
    	this.menus[i] = menuStringsArray[i];
    }
    this.selected = selectedString;
    this.menuAction = menuActionFunction;
    this.hOff = menuImage.hOffset;
    this.vOff = menuImage.vOffset;
}

Menu.prototype.reset = function (menuStringsArray, selectedString) {
	var i;
	
	this.menus = null;
	this.menus = [];
    for (i = 0; i < menuStringsArray.length; i += 1) {
    	this.menus[i] = menuStringsArray[i];
    }
    this.selected = selectedString;
};

Menu.prototype.show = function (opacity) {
	this.image.opacity = opacity;
};

Menu.prototype.setTick = function (selected) {
	this.selected = selected;
};

Menu.prototype.select = function () {
    var contextItems = [], items;
    for (items in this.menus) {
    	if (this.menus.hasOwnProperty(items)) {
        	contextItems[items] = new MenuItem();
        	contextItems[items].title = this.menus[items];
        	contextItems[items].checked = (this.selected === this.menus[items]);
        	contextItems[items].i = items;
            contextItems[items].altKey = system.event.altKey;
            contextItems[items].shiftKey = system.event.shiftKey;
            contextItems[items].ctrlKey = system.event.ctrlKey;
            contextItems[items].alphaLockKey = system.event.alphaLockKey;
        	contextItems[items].data = this.menus[items];
        	contextItems[items].onSelect = this.menuAction;
        }
    }
    popupMenu(contextItems, system.event.hOffset - 18, system.event.vOffset - 12);
    updateNow();
};
