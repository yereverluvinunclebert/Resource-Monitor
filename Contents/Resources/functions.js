
//===========================================
// this function opens other widgets URL
//===========================================
function otherwidgets() {
	var answer = alert("This button opens a browser window and connects to the Steampunk widgets page on my site. Do you wish to proceed", "Open Browser Window", "No Thanks");

	if (answer === 1) {
		openURL("http://lightquick.co.uk/steampunk-widgets.html?Itemid=264");
		if (preferences.soundPref.value === "enable") {
			play(winding, false);
		}                         
	}
}
//=====================
//End function
//=====================

//===========================================
// this function opens the URL for paypal
//===========================================
function donate() {
    var answer = alert("Help support the creation of more widgets like this, send us a coffee! This button opens a browser window and connects to the Kofi donate page for this widget). Will you be kind and proceed?", "Open Browser Window", "No Thanks");

	if (answer === 1) {
        openURL("https://www.ko-fi.com/yereverluvinunclebert");
		if (preferences.soundPref.value === "enable") {
			play(winding, false);
		}
	}
}
//=====================
//End function
//=====================



//===========================================
// this function opens the rocketdock URL
//===========================================
function rocketdock() {
	var answer = alert("Log in and vote for my widgets on Rocketdock. This button opens a browser window and connects to the Rocketdock page where you can give the widget a 5 star rating... Will you be kind and proceed?", "Open Browser Window", "No Thanks");
	if (answer === 1) {
		openURL("http://rocketdock.com/addon/icons/46779");
		if (preferences.soundPref.value === "enable") {
			play(winding, false);
		}
	}
}
//=====================
//End function
//=====================



//===========================================
// this function opens the browser at the contact URL
//===========================================
function facebookChat() {
    var answer = alert("Visiting the Facebook chat page - this button opens a browser window and connects to our Facebook chat page.). Proceed?", "Open Browser Window", "No Thanks");
    if (answer === 1) {
        openURL("http://www.facebook.com/profile.php?id=100012278951649");
    }
}
//=====================
//End function
//=====================



//===========================================
// this function allows a spacer in the menu
//===========================================
function nullfunction() {
	print("dummy");
}
//=====================
//End function
//=====================


// this function opens the online help file
function menuitem1OnClick() {
	var answer = alert("This button opens a browser window and connects to the help page for this widget. Do you wish to proceed?", "Open Browser Window", "No Thanks");

	if (answer === 1) {
		openURL("http://lightquick.co.uk/instructions-for-the-steampunk-resource-monitor.html?Itemid=264");
	}
}

// this function opens the browser at the contact URL
function menuitem2OnClick() {
	var answer = alert("Visiting the support page - this button opens a browser window and connects to our contact us page where you can send us a support query or just have a chat). Proceed?", "Open Browser Window", "No Thanks");

	if (answer === 1) {
		openURL("http://lightquick.co.uk/contact.html?Itemid=3");
	}
}

// this function opens the download URL
function update() {
	var answer = alert("Download latest version of the widget (this button opens a browser window and connects to the widget download page where you can check and download the latest zipped .WIDGET file). Proceed?", "Open Browser Window", "No Thanks");
	if (answer === 1) {
		openURL("http://lightquick.co.uk/downloads/steampunk-resource-monitor-widget.html?Itemid=264");
	}
}

// this function sets the main context menu
function setmenu() {
	var items = [], item;

	item = new MenuItem();
	item.title = "Online Help";
	item.onSelect = menuitem1OnClick;
	items.push(item);

	item = new MenuItem();
    item.title = "Donate a Coffee with Ko-Fi";	
    item.onSelect = donate;
	items.push(item);

	item = new MenuItem();
	item.title = "";
	item.onSelect = nullfunction;
	items.push(item);

	item = new MenuItem();
	item.title = "See More Steampunk Widgets";
	item.onSelect = otherwidgets;
	items.push(item);

	item = new MenuItem();
	item.title = "Contact Support";
	item.onSelect = menuitem2OnClick;
	items.push(item);

	item = new MenuItem();
	item.title = "Display Licence Agreement...";
	item.onSelect = function () {
		displayLicence();
	};
	items.push(item);

	item = new MenuItem();
	item.title = "Download Latest Version";
	item.onSelect = function () {
		update();
	};
	items.push(item);

        mItem = new MenuItem();
        mItem.title = "";
        mItem.onSelect = function() {
            nullfunction();
        };
	items.push(mItem);

        mItem = new MenuItem();
        mItem.title = "Chat about Steampunk Widgets on Facebook";
        mItem.onSelect = function() {
            facebookChat();
        };
	items.push(mItem);

        item = new MenuItem();
        item.title = "";
        item.onSelect = function () {
            nullfunction();
        };
	items.push(item);

	item = new MenuItem();
	item.title = "Reveal Widget in Windows Explorer";
	item.onSelect = function () {
		findWidget();
	};
	items.push(item);

        item = new MenuItem();
        item.title = "";
        item.onSelect = function () {
            nullfunction();
        };
	items.push(item);


	item = new MenuItem();
	item.title = "Reload Widget (F5)";
	item.onSelect = function () {
		reloadWidget();
	};
	items.push(item);
    
    if (preferences.imageEditPref.value != "" && debugFlg === "1") {
            item = new MenuItem();
            item.title = "Edit Widget using " + preferences.imageEditPref.value ;
            item.onSelect = function () {
                editWidget();
            };
            items.push(item);
    }    
    
    
	mainWindow.contextMenuItems = items;
}

// Function to move the mainWindow onto the main screen in the viewable area
function mainScreen() {
	if (mainWindow.hOffset < 0) {
		mainWindow.hOffset = 10;
	}
	if (mainWindow.vOffset < 32) {
		mainWindow.vOffset = 32; // avoid Mac toolbar
	}
	if (mainWindow.hOffset > screen.width - 50) {
		mainWindow.hOffset = screen.width - mainWindow.width;
	}
	if (mainWindow.vOffset > screen.height - 50) {
		mainWindow.vOffset = screen.height - mainWindow.height; // avoid Mac dock
	}
}



//===========================================
// this function causes explorer to be opened and the file selected
//===========================================
function findWidget() {

 // temporary development version of the widget
    var widgetFullPath = convertPathToPlatform(system.userWidgetsFolder + "/" + widgetName);
    var alertString = "The widget folder is: \n";
    if (filesystem.itemExists(widgetFullPath)) {
        alertString += system.userWidgetsFolder + " \n\n";
        alertString += "The widget name is: \n";
        alertString += widgetName + ".\n ";

        alert(alertString, "Open the widget's folder?", "No Thanks");

        filesystem.reveal(widgetFullPath);
    } else {
        widgetFullPath = resolvePath(".");   
        filesystem.reveal(widgetFullPath);
        print("widgetFullPath " + widgetFullPath);
    }
}
//=====================
//End function
//=====================




//===========================================
// this function edits the widget
//===========================================
function editWidget() {
    //var answer = alert("Editing the widget. Proceed?", "Open Editor", "No Thanks");
    //if (answer === 1) {
        //uses the contents of imageEditPref to initiate your default editor
        performEditCommand("menu");
    //}

}
//=====================
//End function
//=====================