/*
    Resource Monitor - Displays system resource usage.
    Copyright © 2012-2013 Dean Beedell and Harry Whitfield

    This program is free software; you can redistribute it and/or modify it
    under the terms of the GNU General Public licence as published by the
    Free Software Foundation; either version 2 of the licence, or (at your
    option) any later version.

    This program is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the GNU
    General Public licence for more details.

    You should have received a copy of the GNU General Public licence along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin St, Fifth Floor, Boston, MA 02110-1301  USA

    Resource Monitor - version 1.0.4.3
    4 April, 2013
    Copyright © 2012-2013 Dean Beedell and Harry Whitfield
    mailto:g6auc@arrl.net
    mailto:dean.beedell@lightquick.co.uk
*/

/*global
    mainWindow, bg, large_hand, small_hand, amps_hand, cpuText, memText, battText,
    core2indicator, core4indicator, core8indicator, SNOWLEOPARD, getSystemAirport,
    core0gauge, core1gauge, core0Text, core1Text, core0gaugehand, core1gaugehand,
    core2gauge, core3gauge, core2Text, core3Text, core2gaugehand, core3gaugehand,
    batteryindicatorGreen, batteryindicatorRed, chargingindicatorGreen, chargingindicatorAmber,
    batt_hand, amps, stanchion, virt_hand, wireless_hand, sizeText, virtText, wirelessText,
    drip, cpuTap, connectingpipes, pipeSet, cog, ampsTap, crankup, crankdown, maintap,
    wifiTap, redTap2, redTap1, redTap3, driveConsole, consoleslider, consoleknob,
    driveslider, driveknob, togglemute, toggleconfig, toggleabout, togglehelp, toggletooltip,
    togglesmooth, toggle1, toggle2, toggle3, toggle4, toggle5, toggle6, memgauge, wireless,
    clipboard, helpback, helpscreen, toggleback, cpugauge, virtmem, memTap, puff,
    virtmemcurrindicator, virtmemexceedindicator, leftBar, rightBar, bulb, bulbglow, sliderbar,
    cableTrough, sliderset, cable, bellpushes, bellpushmail, bellpushupdate, bellpushhelp,
    bellpush, bellpushed, taskmanager, sliderRight, sliderLeft, counter, percent,
    about, cog2, NETSTAT, Menu, testlicence, createlicence, wirelessindicatorLeft,
    wirelessindicatorRight
*/

/*properties
    ConnectServer, Get, Item, Properties_, Value, airport, altKey, ampsCmdPref, 
    ampsThresholdPref, animationPref, appendChild, availVirtual, available, 
    battery, batteryCount, battswitchPref, clickCount, core0and1switchPref,
    core2and3switchPref, cpu, cpuswitchPref, createObject, currentCapacity, 
    data, defaultValue, description, devicePref, devices, driveCountPref, 
    driveconsolePref, drivesCmdPref, drivethreshholdPref, duration, ease, 
    endAngle, event, floor, freeBytes, getDisplayName, hOffset, 
    hRegistrationPoint, hasOwnProperty, height, hidden, i, ibps, interval, 
    kEaseOut, length, load, maxSpeedPref, memory, memoryCmdPref, memswitchPref, 
    milliseconds, minSpeedPref, soundPref, name, network, 
    networkSmoothPref, networkswitch, noise, numProcessors, obps, onLoad, 
    onMouseDown, onMouseMove, onMouseUp, onMousedown, onPreferencesChanged, 
    onTimerFired, onWillChangePreferences, opacity, open, option, optionValue, 
    path, perfmonCmdPref, platform, pow, powerSourceState, powered, reset, 
    rotation, round, scalePref, select, setTick, showUnmountedPref, signal, 
    size, smoothPref, src, start, startAngle, startTime, sys, taskmgrCmdPref, 
    ticking, timeToEmpty, timeToFullCharge, timerPref, toFixed, tooltip, 
    tooltipswitchPref, totalBytes, totalVirtual, traffic, type, user, vOffset, 
    vRegistrationPoint, value, virtCmdPref, virtampsPref, virtmemthresholdPref,
    virtswitchPref, visible, volumes, width, wirelessCmdPref, wirelessswitch
*/

    


var rightmenuitems = [],
    cogrotation = 5,
    driveCounter = 0,
    scaleit = preferences.scalePref.value / 100,
    clicked = false,
    smooth = preferences.smoothPref.value,
    networkSmooth = preferences.networkSmoothPref.value,
    animationInterval = Number(preferences.animationPref.value),
    animationDuration = animationInterval * Math.floor(1000 / animationInterval - 1),
    vols = filesystem.volumes,
    newvols = 1,
    volscnt = 1,
    max_toggle_count = 0,
    toggle_count = preferences.driveCountPref.value,
    wmiCpuVal = [0],
    wmiCpuValOld = [0],
    wmiNetBytesTotalPersec,
    wmiNetCurrentBandwidth,
    cpuPerc = [0],
    netPerc = [0],
    timestamp,
    oldtimestamp,
    oldnettimestamp,
    nettimestamp,
    virtmemexceedflg = 0,
    a,
    perc = preferences.scalePref.value,
    drivegauge = [6],
    drivepointer = [6],
    drivelamp = [6],
    devTypeOf = [],
    maxSpeed = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64],
    processorCount = system.cpu.numProcessors, // the number of processors in the system (virtual or real cores, hyperthreading shows up as two)
    offset = 0,
    taskcommand = "",
    systemAirport = system.airport,
    clickflg = 0,
    FSWbemLocator,
    wmi,
    devName,
    maxBytes,
    deviceMenu = null,
    timerCount = 1,
    timerCountModulo = 10,
    minSpeedPref = 0,
    ampsflasher,
    theTimer,
    theResetTimer,
    winVersionNo;
    var dummy = function() {}; // to please JSLint
    var debugFlg = "";
    
    // sound variables
    var relay = "Resources/relay.mp3",
    electricDrone = "Resources/electricDrone.mp3",
    shutdown = "Resources/shutdown.mp3",
    sparks = "Resources/sparks.mp3",
    steam = "Resources/steamsound.mp3",
    suck = "Resources/pop.mp3",
    TingingSound = "Resources/ting.mp3",
    clunk = "Resources/newclunk.mp3",
    crank = "Resources/crank.mp3",
    zzzz = "Resources/zzzz.mp3",
    buzzer = "Resources/buzzer.mp3",
    winding = "Resources/winding.mp3";

    var WbemUser            ='';
    var WbemPassword        ='';
    var WbemComputer        ='localhost';
    var FSWbemLocator       = '';
    var wmi                 = '';
        
    ampsflasher = new Timer();
    ampsflasher.ticking = false;
    ampsflasher.interval = 2;
    
    sparkflasherOn = new Timer();
    sparkflasherOn.ticking = true;
    sparkflasherOn.interval = random(12+5);
    
    sparkflasherOff = new Timer();
    sparkflasherOff.ticking = false;
    sparkflasherOff.interval = .7;
    
    theTimer = new Timer();
    theTimer.ticking = false;
    theTimer.interval = .5;
    
    theResetTimer = new Timer();
    theResetTimer.ticking = false;
    theResetTimer.interval = 10;
    
    var widgetName = "Resource monitor.widget";

    include('Resources/Menu.js');
    include('Resources/Licence/Licence.js');
    include('Resources/functions.js');
    include("Resources/getWiFiData.js");
    
    if (system.platform === "windows" ) {
        //these work
        FSWbemLocator = COM.createObject("WbemScripting.SWbemLocator"); // Creates variable to access WMI
        wmi = FSWbemLocator.ConnectServer(WbemComputer, "root/cimv2", WbemUser, WbemPassword);// Connects to WMI interface
    } else {
        FSWbemLocator = null;
        wmi = null;

    }
    
    if (system.platform === "macintosh") {
        include("Resources/NETSTATmac.js");
    } else {
        include("Resources/NETSTATwin.js");
    }
    
    if (SNOWLEOPARD) {
        systemAirport = getSystemAirport();
    }

//======================================================================================
// end 
//======================================================================================




//===============================================================
// this function is called by onload
//===============================================================
function startup() {
    
    debugFlg = preferences.debugflgPref.value;
    if (debugFlg === "1") {
        preferences.imageEditPref.hidden=false;
    } else {
        preferences.imageEditPref.hidden=true;		
    }
    
    // check the windows version
    if (system.platform === "windows") checkWinVer();
    
    turnOffCoreIndicators();
    turnIndicatorsOn();        
    turnGaugesOn();
    checktooltips();
    setPreferenceDescriptions();
    setPreferenceValues();
    createdrives(); // count the drive volumes, create new images for each drive
    
    if (preferences.driveCountPref.value === 0) toggle_count = max_toggle_count;

    displayToggleCount();
    turnOffBatteryGauge();
    scaleTheWidget(Number(preferences.scalePref.value) / 100);
    setvirtmemorbatt();
    setAspect(true, "off", "off");
    
    preferences.maxSpeedPref.option = maxSpeed;
    
    //if (preferences.WMIenabled.value === "enabled" && (system.platform === "windows" && winVersionNo != "10" )){
    if (preferences.WMIenabled.value === "enabled" ){
       getDevices(false);      // get network adapters
       setNetworkPrefs(false); // initial setup
    }
    
    createLicence(mainWindow);
    mainScreen();
    setmenu();
    theTimer.ticking = true;
    theResetTimer.ticking = true;
}
//=====================
//End function
//=====================


//===========================================
// function to get the processor count
//===========================================
 function turnIndicatorsOn() {   

    if (processorCount === 2) {
        core2indicator.visible = true;
    } else if (processorCount === 3 || processorCount === 4) {
        core4indicator.visible = true;
    } else if (processorCount === 8) {
        core8indicator.visible = true;
    }
}
//=====================
//End function
//=====================

 //===========================================
 // function to disable the batt gauge
 //===========================================
  function turnOffBatteryGauge() {   
    // if this is a desktop system, ie. no batteries, then do not show the amps gauge
    if (system.batteryCount === 0) {
        batteryindicatorGreen.visible = false;
        batteryindicatorRed.visible = false;
        chargingindicatorGreen.visible = false;
        chargingindicatorAmber.visible = false;
        batt_hand.visible = false;
        battText.visible = false;
        amps.visible = false;
        stanchion.visible = false;
    }
}
//=====================
//End function
//=====================

//===========================================
// turn on gauges and back end functionality
//===========================================
 function turnGaugesOn() {   
        
        if (processorCount >= 2) {
            preferences.core0and1switchPref.hidden = "false";
            core0gauge.visible = "true";
            core1gauge.visible = "true";
            core0Text.visible = "true";
            core1Text.visible = "true";
            core0gaugehand.visible = "true";
            core1gaugehand.visible = "true";
        }
        if (processorCount === 4 || processorCount === 8) { //4
            preferences.core2and3switchPref.hidden = "false";
            core2gauge.visible = "true";
            core3gauge.visible = "true";
            core2Text.visible = "true";
            core3Text.visible = "true";
            core2gaugehand.visible = "true";
            core3gaugehand.visible = "true";
        }
        if (processorCount === 3) { //4
            preferences.core2and3switchPref.hidden = "false";
            core2gauge.visible = "true";
            core3gauge.visible = "false";
            core2Text.visible = "true";
            core3Text.visible = "false";
            core2gaugehand.visible = "true";
            core3gaugehand.visible = "false";
        }
}
//=====================
//End function
//=====================


 //===========================================
 // setPreferenceDescriptions
 //===========================================
  function setPreferenceDescriptions() {   
         
    if (system.platform === "macintosh") {
        preferences.taskmgrCmdPref.description = "Double-clicking on the cpu gauge will run this command. You may change this to call any utility you desire. The default command for macintosh is : /Applications/Utilities/Activity Monitor.app";
        preferences.perfmonCmdPref.description = "The default command for macintosh is : /Applications/Utilities/Activity Monitor.app";
        preferences.wirelessCmdPref.description = "The default command for macintosh is : /Applications/Utilities/Network Utility.app";
        preferences.ampsCmdPref.description = "The default command for macintosh is : ";
        preferences.virtCmdPref.description = "The default command for macintosh is : /Applications/Utilities/Activity Monitor.app";
        preferences.drivesCmdPref.description = "The default command for macintosh is : /Applications/Utilities/Disk Utility.app";
        preferences.memoryCmdPref.description = "The default command for macintosh is : /Applications/Utilities/Activity Monitor.app";

    } else {
        preferences.taskmgrCmdPref.description = "Double-clicking on the cpu gauge will run this command. You may change this to call any utility you desire. The default command for windows is : %SystemRoot%/system32/taskmgr.exe";
        preferences.perfmonCmdPref.description = "Double-clicking on the cpu core gauges will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/perfmon.exe";
        preferences.wirelessCmdPref.description = "Double-clicking on the wireless gauge will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/ncpa.cpl";
        preferences.ampsCmdPref.description = "Double-clicking on the battery gauge will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/powercfg.cpl";
        preferences.virtCmdPref.description = "Double-clicking on the virtual memory gauge will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/perfmon.exe";
        preferences.drivesCmdPref.description = "Double-clicking on the disc drive gauges will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/diskmgmt.msc";
        preferences.memoryCmdPref.description = "Double-clicking on the memory gauge will run this command. You may change this to call any utility you desire. Windows default is : %SystemRoot%/system32/perfmon.exe";
    }
}
//=====================
//End function
//=====================


 //===========================================
 // turnOffCoreIndicators
 //===========================================
  function turnOffCoreIndicators() {   
    
    if (system.platform !== "windows" ) {
        preferences.core0and1switchPref.value = "off";
        preferences.core2and3switchPref.value = "off";
        preferences.core0and1switchPref.hidden = "true";
        preferences.core2and3switchPref.hidden = "true";
    }
}
//=====================
//End function
//=====================


 //===========================================
 // setPreferenceDescriptions
 //===========================================
  function setPreferenceValues() {   

    if (system.platform === "macintosh") {
        if (preferences.taskmgrCmdPref.value === "") {
            preferences.taskmgrCmdPref.value = "/Applications/Utilities/Activity Monitor.app";
        }
        if (preferences.perfmonCmdPref.value === "") {
            preferences.perfmonCmdPref.value = "/Applications/Utilities/Activity Monitor.app";
        }
        if (preferences.wirelessCmdPref.value === "") {
            preferences.wirelessCmdPref.value = "/Applications/Utilities/Network Utility.app";
        }
        if (preferences.ampsCmdPref.value === "") {
            preferences.ampsCmdPref.value = "";
        }
        if (preferences.virtCmdPref.value === "") {
            preferences.virtCmdPref.value = "/Applications/Utilities/Activity Monitor.app";
        }
        if (preferences.drivesCmdPref.value === "") {
            preferences.drivesCmdPref.value = "/Applications/Utilities/Disk Utility.app";
        }
        if (preferences.memoryCmdPref.value === "") {
            preferences.memoryCmdPref.value = "/Applications/Utilities/Activity Monitor.app";
        }
    } else {
        if (preferences.taskmgrCmdPref.value === "") {
            preferences.taskmgrCmdPref.value = "%SystemRoot%/system32/taskmgr.exe";
        }
        if (preferences.perfmonCmdPref.value === "") {
            preferences.perfmonCmdPref.value = "%SystemRoot%/system32/perfmon.exe";
        }
        if (preferences.wirelessCmdPref.value === "") {
            preferences.wirelessCmdPref.value = "%SystemRoot%/system32/ncpa.cpl";
        }
        if (preferences.ampsCmdPref.value === "") {
            preferences.ampsCmdPref.value = "%SystemRoot%/system32/powercfg.cpl";
        }
        if (preferences.virtCmdPref.value === "") {
            preferences.virtCmdPref.value = "%SystemRoot%/system32/perfmon.exe";
        }
        if (preferences.drivesCmdPref.value === "") {
            preferences.drivesCmdPref.value = "%SystemRoot%/system32/diskmgmt.msc";
        }
        if (preferences.memoryCmdPref.value === "") {
            preferences.memoryCmdPref.value = "%SystemRoot%/system32/perfmon.exe";
        }
    }
}
//=====================
//End function
//=====================



ampsflasher.onTimerFired = function () {
    ampsflash();
};

sparkflasherOn.onTimerFired = function () {
    sparkflash();
};

sparkflasherOff.onTimerFired = function () {
        flash.visible = false;
        sparkflasherOff.ticking = false;
};

theTimer.onTimerFired = function () {
    sample();
};

theResetTimer.onTimerFired = function () {
    resetTimer();
};





//===============================================================
// this function is called when the widget loads
//===============================================================
widget.onload = function() {
    startup();
};
//=====================
//End function
//=====================


wireless_hand.onMouseDown = function () {
    if (system.event.altKey) {
        getDevices(true);
    }
    deviceMenu.select();
};

widget.onWillChangePreferences = function () {
    getDevices(true);
};

widget.onPreferencesChanged = function () {
    setPrefs(true);
    mainScreen();
};

//===========================================
// function to getWindowsVersion
//===========================================
function getWindowsVersion() {
    var found,
        data,
        strVer,
        strEnd;

    if (system.platform === "windows") {
        data = runCommand("ver");
//    print(" data " + data);
        strVer = data.indexOf("Version");
//    print(" strVer " + strVer);
        strEnd = data.indexOf("]");
//    print(" strEnd " + strEnd);
        found = data.substr(strVer+8, strEnd-(strVer+8)) ;
//    print(" found " + found);
        if (found !== null) {
            return found;
        }
    }
    return undefined;
}
//=====================
//End function
//=====================


//===========================================
// function to check WindowsVersion
//===========================================
function checkWinVer() {
    winver = getWindowsVersion();
    print(" winver " + winver);
    if (winver === "5.2" || winver === "5.1" || winver === "5.0") {
        print(" XP version " + getWindowsVersion()+ "" + winver);
        winver = "NT5";
    } else {
        print(" Vista, Win 7, 8, 10 and above, specifically " + winver);
        winVersionNo = parseFloat(winver);
        print(" version " + winVersionNo);
        winver = "NT6";
    }
    winArch = runCommand("echo %PROCESSOR_ARCHITECTURE%");
    print(" Architecture " + winArch);
}
//=====================
//End function
//=====================



//======================================================================================
// Function to check the tooltip switch, called when preferences change
//======================================================================================
function checktooltips() {
    if (preferences.tooltipswitchPref.value === "enable") {
        redTap1.tooltip = "Turn this to turn individual core monitoring ON/OFF.";
        togglemute.tooltip = "press toggle to mute sound";
        toggletooltip.tooltip = "press toggle to remove tooltips";
        toggleconfig.tooltip = "press toggle to configure this widget";
        toggleabout.tooltip = "about this widget";
        togglesmooth.tooltip = "Switch to control smooth CPU gauge animation";
        togglehelp.tooltip = "help regarding this widget";
        toggle1.tooltip = "press to show disc gauges";
        toggle2.tooltip = "press to show disc gauges";
        toggle3.tooltip = "press to show disc gauges";
        toggle4.tooltip = "press to show disc gauges";
        toggle5.tooltip = "press to show disc gauges";
        toggle6.tooltip = "press to show disc gauges";
        leftBar.tooltip = "Lowering the animation interval makes the animation smoother but uses more cpu.";
        rightBar.tooltip = "The lowest sampling interval is one second";
        sliderRight.tooltip = "This slider sets the sampling interval";
        sliderLeft.tooltip = "This slider sets the CPU gauge animation interval";
        sliderbar.tooltip = "A good size for the widget is approximately 30% or so.";
        bellpush.tooltip = "Pressing this bellpush will resize the widget. The slider sets the actual size.";
        sliderset.tooltip = "Use the slider to allocate a size to the widget. The bellpush is used to set the actual widget size.";
        about.tooltip = "click to make me go away";
        bellpushhelp.tooltip = "open the help page";
        bellpushupdate.tooltip = "update the widget";
        bellpushmail.tooltip = "open the contact page";
        core2indicator.tooltip = "This indicates you have a two core CPU";
        if (processorCount === 3) {
            core4indicator.tooltip = "This indicates you have a three core CPU";
        } else {
            core4indicator.tooltip = "This indicates you have a standard four core CPU";
        }
        core8indicator.tooltip = "This indicates you have a four core hyper-threaded CPU";
        consoleslider.tooltip = "open/shut the console cover to show the barebones widget";
        driveslider.tooltip = "enable/disable the display of unmounted drives";
    } else {
        toggletooltip.tooltip = "";
        togglemute.tooltip = "";
        redTap1.tooltip = "";
        toggleconfig.tooltip = "";
        toggleabout.tooltip = "";
        togglesmooth.tooltip = "";
        togglehelp.tooltip = "";
        toggle1.tooltip = "";
        toggle2.tooltip = "";
        toggle3.tooltip = "";
        toggle4.tooltip = "";
        toggle5.tooltip = "";
        toggle6.tooltip = "";
        chargingindicatorAmber.tooltip = "";
        batteryindicatorRed.tooltip = "";
        leftBar.tooltip = "";
        rightBar.tooltip = "";
        sliderRight.tooltip = "";
        sliderLeft.tooltip = "";
        sliderbar.tooltip = "";
        bellpush.tooltip = "";
        sliderset.tooltip = "";
        bellpushhelp.tooltip = "";
        bellpushupdate.tooltip = "";
        bellpushmail.tooltip = "";
        core2indicator.tooltip = "";
        core4indicator.tooltip = "";
        core8indicator.tooltip = "";
        consoleslider.tooltip = "";
        driveslider.tooltip = "";
        consoleknob.tooltip = "";
        driveknob.tooltip = "";
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to allow creation of new images as objects
//======================================================================================
function newImage(parent, src, hOffset, vOffset, width, height, hreg, vreg, opacity, onMouseUp, onMouseDown) {
    var o = new Image();

    o.src = src;
    o.hOffset = hOffset;
    o.vOffset = vOffset;
    o.width = width;
    o.height = height;
    o.opacity = opacity;
    o.hRegistrationPoint = hreg;
    o.vRegistrationPoint = vreg;
    // if (preferences.soundPref.value === "enable") {  play(TingingSound,false);  };
    if (onMouseDown) {
        o.onMousedown = onMouseDown;
    }
    if (onMouseUp) {
        o.onMouseUp = onMouseUp;
    }
    // if (onMultiClick) { o.onMultiClick = onMultiClick; }
    parent.appendChild(o);
    return o;
}
//=====================
//End function
//=====================

//===========================================
// Function to puff a steam image
//===========================================
function puffit() {
    var a;

    if (preferences.soundPref.value === "enable") {
        play(steam, false);
    }

    for (a = 50; a <= 255; a += 1) {
        puff.opacity = a;
        sleep(1);
        a = a + 4;
    }

    for (a = 50; a <= 255; a += 1) {
        puff.opacity = 255 - a;
        sleep(1);
        a = a + 4;
    }

    if (preferences.soundPref.value === "enable") {
        play(TingingSound, false);
    }

    if (taskmanager.visible === true) {
        taskmanager.visible = false;
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to perform commands
//======================================================================================
function performCommand() {
    taskmanager.visible = true;
    puffit();
    if (system.platform === "windows") {
        runCommandInBg(taskcommand, "running task");
    }
    if (system.platform === "macintosh") {
        filesystem.open(taskcommand);
    }
}
//=====================
//End function
//=====================


//=====================
// function to carry out a command
//=====================
function performEditCommand(method) {
    var answer;
    

    if (method === "menu") {
        runCommandInBg(preferences.imageEditPref.value, "runningTask");
    } else {
        print("method "+method);
        if (system.event.altKey) { // filesystem.open() call
            if (preferences.openFilePref.value === "") {
                answer = alert("This widget has not been assigned an alt+double-click function. You need to open the preferences and select a file to be opened. Do you wish to proceed?", "Open Preferences", "No Thanks");
                if (answer === 1) {
                    showWidgetPreferences();
                }
                return;
            }
            filesystem.open(preferences.openFilePref.value);
        } else {
            if (preferences.imageCmdPref.value === "") {
                answer = alert("This widget has not been assigned a double-click function. You need to open the preferences and enter a run command for this widget. Do you wish to proceed?", "Open Preferences", "No Thanks");
                if (answer === 1) {
                    showWidgetPreferences();
                }
                return;
            }
                runCommandInBg(preferences.imageCmdPref.value, "runningTask");

        }
    }
}
//=====================
//End function
//=====================




//======================================================================================
// Function to perform commands
//======================================================================================
function performPress() {
    taskmanager.visible = true;
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    taskmanager.visible = false;
}
//=====================
//End function
//=====================

//======================================================================================
// Function to ting when drives are clicked upon
//======================================================================================
function ting() {
    if (preferences.soundPref.value === "enable") {
        play(TingingSound, false);
    }
    if (system.event.clickCount === 2) {
        taskcommand = preferences.drivesCmdPref.value;
        taskmanager.src = "Resources/popup-disk-management.png";
        log("clickflg " + clickflg);
        if (clickflg === 0) {
            clickflg = 1;
            performCommand();
        }
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to create drives
//======================================================================================
function createdrives(volscnt) {
    var a;
    // count the drive volumes, create new images for each drive
    //print ("creating drives");
    for (a in vols) {
        if (vols.hasOwnProperty(a)) {
            volscnt = Number(a);
            // parent, src, hOffset, vOffset, width, height,  hRegistrationPoint, vRegistrationPoint, opacity, onMouseUp
            if (volscnt <= 5) {
                drivegauge[a] = newImage(mainWindow, "Resources/drive0.png", ((169 * scaleit) + offset), 606 * scaleit, 175 * scaleit, 175 * scaleit, 0, 0, 255, ting, ting);
                drivepointer[a] = newImage(mainWindow, "Resources/point.png", ((250 * scaleit) + offset), 685 * scaleit, 160 * scaleit, 160 * scaleit, 80 * scaleit, 80 * scaleit, 255);
                drivelamp[a] = newImage(mainWindow, "Resources/drivelamp.png", ((243 * scaleit) + offset), 710 * scaleit, 25 * scaleit, 22 * scaleit, 0, 0, 255);
                offset = offset + (171 * scaleit);
                drivegauge[a].visible = "false";
                drivepointer[a].visible = "false";
                drivelamp[a].visible = "false";
                //set the number of toggles according to the number of drives
                //max_toggle_count = Number(a) + 1;
                //toggle_count = max_toggle_count;
            }
        }
    }
    preferences.driveCountPref.value = parseInt(a, 10) + 1;
    toggle_count = preferences.driveCountPref.value;
    //print ("vols "+ volscnt);
}
//=====================
//End function
//=====================

//======================================================================================
// Function to set the maxium number of drive toggles
//======================================================================================
function displayToggleCount() {
    toggle1.visible = false;
    toggle2.visible = false;
    toggle3.visible = false;
    toggle4.visible = false;
    toggle5.visible = false;
    toggle6.visible = false;
    if (toggle_count === 1) {
        toggle1.visible = true;
    }
    if (toggle_count === 2) {
        toggle2.visible = true;
    }
    if (toggle_count === 3) {
        toggle3.visible = true;
    }
    if (toggle_count === 4) {
        toggle4.visible = true;
    }
    if (toggle_count === 5) {
        toggle5.visible = true;
    }
    if (toggle_count >= 6) {
        toggle6.visible = true;
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to count the number of drives
//======================================================================================
function countdrives() {
    var a;
    // count the drive volumes,
    //print ("counting drives");
    newvols = 0;
    for (a in vols) {
        if (vols.hasOwnProperty(a)) {
            if (vols[a].freeBytes === 0 && vols[a].totalBytes === 0 && preferences.showUnmountedPref.value === "disable") {
                //newvols= newvols + 0;
                dummy();
            } else {
                newvols = newvols + 1;
                //print ("newvols "+ newvols);
            }
        }
    }
    //   newvols = Number(a);
    //print(preferences.showUnmountedPref.value);
    //var answer = alert("Volscnt "+volscnt);  
    print ("volscnt "+ volscnt);
    max_toggle_count = newvols;
    toggle_count = max_toggle_count;
}
//=====================
//End function
//=====================

//======================================================================================
// Function to move the mainWindow onto the main screen
//======================================================================================
function mainScreen() {
    // if the widget is off screen then move into the viewable window
    if (mainWindow.hOffset < 0) {
        mainWindow.hOffset = 10;
    }
    if (mainWindow.vOffset < 32) {
        mainWindow.vOffset = 32;	// avoid Mac toolbar
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to check the scale of the whole widget, called when preferences change
//======================================================================================
function scaleTheWidget(scale) {
    var a;                   
    
    mainWindow.width = 1528 * scale;
    mainWindow.height = 1428 * scale;
    flash_window.width = 898 * scale;
    flash_window.height = 640 * scale;
    flash.hOffset = 1 * scale;
    flash.vOffset = 1 * scale; // was 1 * scale
    flash.width = 898 * scale;
    flash.height = 640 * scale;

    scaleit = scale;
    large_hand.width = 221 * scale;
    large_hand.height = 206 * scale;
    large_hand.hOffset = 371 * scale;
    large_hand.vOffset = 332 * scale;
    large_hand.hRegistrationPoint = 138 * scale;
    large_hand.vRegistrationPoint = 108 * scale;
    small_hand.width = 192 * scale;
    small_hand.height = 234 * scale;
    small_hand.hOffset = 672 * scale;
    small_hand.vOffset = 206 * scale;
    small_hand.hRegistrationPoint = 98 * scale;
    small_hand.vRegistrationPoint = 120 * scale;
    batt_hand.width = 221 * scale;
    batt_hand.height = 206 * scale;
    batt_hand.hOffset = 1001 * scale;
    batt_hand.vOffset = 332 * scale;
    batt_hand.hRegistrationPoint = 138 * scale;
    batt_hand.vRegistrationPoint = 108 * scale;
    virt_hand.width = 221 * scale;
    virt_hand.height = 206 * scale;
    virt_hand.hOffset = 1001 * scale;
    virt_hand.vOffset = 332 * scale;
    virt_hand.hRegistrationPoint = 138 * scale;
    virt_hand.vRegistrationPoint = 108 * scale;
    wireless_hand.width = 192 * scale;
    wireless_hand.height = 234 * scale;
    wireless_hand.hOffset = 1165 * scale;
    wireless_hand.vOffset = 1240 * scale;
    wireless_hand.hRegistrationPoint = 98 * scale;
    wireless_hand.vRegistrationPoint = 120 * scale;
    core0gaugehand.width = 192 * scale;
    core0gaugehand.height = 234 * scale;
    core0gaugehand.hOffset = 275 * scale;
    core0gaugehand.vOffset = 937 * scale;
    core0gaugehand.hRegistrationPoint = 98 * scale;
    core0gaugehand.vRegistrationPoint = 120 * scale;
    core1gaugehand.width = 192 * scale;
    core1gaugehand.height = 234 * scale;
    core1gaugehand.hOffset = 540 * scale;
    core1gaugehand.vOffset = 937 * scale;
    core1gaugehand.hRegistrationPoint = 98 * scale;
    core1gaugehand.vRegistrationPoint = 120 * scale;
    core2gaugehand.width = 192 * scale;
    core2gaugehand.height = 234 * scale;
    core2gaugehand.hOffset = 800 * scale;
    core2gaugehand.vOffset = 937 * scale;
    core2gaugehand.hRegistrationPoint = 98 * scale;
    core2gaugehand.vRegistrationPoint = 120 * scale;
    core3gaugehand.width = 192 * scale;
    core3gaugehand.height = 234 * scale;
    core3gaugehand.hOffset = 1071 * scale;
    core3gaugehand.vOffset = 937 * scale;
    core3gaugehand.hRegistrationPoint = 98 * scale;
    core3gaugehand.vRegistrationPoint = 120 * scale;
    cpuText.hOffset = 374 * scale;
    cpuText.vOffset = 470 * scale;
    cpuText.width = 80 * scale;
    cpuText.height = 48 * scale;
    cpuText.size = Math.round(35 * scale);
    core0Text.hOffset = 275 * scale;
    core0Text.vOffset = 1014 * scale;
    core0Text.width = 80 * scale;
    core0Text.height = 48 * scale;
    core0Text.size = Math.round(30 * scale);
    core1Text.hOffset = 545 * scale;
    core1Text.vOffset = 1014 * scale;
    core1Text.width = 80 * scale;
    core1Text.height = 48 * scale;
    core1Text.size = Math.round(30 * scale);
    core2Text.hOffset = 805 * scale;
    core2Text.vOffset = 1014 * scale;
    core2Text.width = 80 * scale;
    core2Text.height = 48 * scale;
    core2Text.size = Math.round(30 * scale);
    core3Text.hOffset = 1075 * scale;
    core3Text.vOffset = 1014 * scale;
    core3Text.width = 80 * scale;
    core3Text.height = 58 * scale;
    core3Text.size = Math.round(30 * scale);
    sizeText.hOffset = 680 * scale;
    sizeText.vOffset = 662 * scale;
    sizeText.width = 150 * scale;
    sizeText.height = 48 * scale;
    sizeText.size = Math.round(50 * scale);
    memText.hOffset = 677 * scale;
    memText.vOffset = 296 * scale;
    memText.width = 80 * scale;
    memText.height = 48 * scale;
    memText.size = Math.round(35 * scale);
    battText.hOffset = 1000 * scale;
    battText.vOffset = 470 * scale;
    battText.width = 80 * scale;
    battText.height = 48 * scale;
    battText.size = Math.round(35 * scale);
    virtText.hOffset = 1000 * scale;
    virtText.vOffset = 470 * scale;
    virtText.width = 80 * scale;
    virtText.height = 48 * scale;
    virtText.size = Math.round(35 * scale);
    wirelessText.hOffset = 1165 * scale;
    wirelessText.vOffset = 1317 * scale;
    wirelessText.width = 70 * scale;
    wirelessText.height = 40 * scale;
    wirelessText.size = Math.round(30 * scale);
    drip.hOffset = 130 * scale;
    drip.vOffset = 1351 * scale;
    drip.width = 24 * scale;
    drip.height = 45 * scale;
    cpuTap.hOffset = 115 * scale;
    cpuTap.vOffset = 444 * scale;
    cpuTap.width = 211 * scale;
    cpuTap.height = 174 * scale;
    stanchion.hOffset = 830 * scale;
    stanchion.vOffset = scale; // was 1 * scale
    stanchion.width = 360 * scale;
    stanchion.height = 558 * scale;
    connectingpipes.hOffset = 150 * scale;
    connectingpipes.vOffset = 600 * scale;
    connectingpipes.width = 100 * scale;
    connectingpipes.height = 507 * scale;
    pipeSet.hOffset = 195 * scale;
    pipeSet.vOffset = 1 * scale; // was 1 * scale
    pipeSet.width = 1134 * scale;
    pipeSet.height = 1366 * scale;
    cog.hOffset = 1095 * scale;
    cog.vOffset = 815 * scale;
    cog.width = 182 * scale;
    cog.height = 182 * scale;
    cog.hRegistrationPoint = 91 * scale;
    cog.vRegistrationPoint = 91 * scale;
    cog2.hOffset = 757 * scale;
    cog2.vOffset = 793 * scale;
    cog2.width = 182 * scale;
    cog2.height = 182 * scale;
    cog2.hRegistrationPoint = 91 * scale;
    cog2.vRegistrationPoint = 91 * scale;
    ampsTap.hOffset = 1043 * scale;
    ampsTap.vOffset = 444 * scale;
    ampsTap.width = 215 * scale;
    ampsTap.height = 174 * scale;
    crankup.hOffset = 1170 * scale;
    crankup.vOffset = 205 * scale;
    crankup.width = 200 * scale;
    crankup.height = 175 * scale;
    crank.hOffset = 1190 * scale;
    crank.vOffset = 265 * scale;
    crank.width = 200 * scale;
    crank.height = 175 * scale;
    crankdown.hOffset = 1170 * scale;
    crankdown.vOffset = 305 * scale;
    crankdown.width = 200 * scale;
    crankdown.height = 175 * scale;
    maintap.hOffset = 101 * scale;
    maintap.vOffset = 1173 * scale;
    maintap.width = 189 * scale;
    maintap.height = 196 * scale;
    wifiTap.hOffset = 1234 * scale;
    wifiTap.vOffset = 1078 * scale;
    wifiTap.width = 140 * scale;
    wifiTap.height = 149 * scale;
    redTap2.hOffset = 681 * scale;
    redTap2.vOffset = 1287 * scale;
    redTap2.width = 85 * scale;
    redTap2.height = 86 * scale;
    redTap2.hRegistrationPoint = 43 * scale;
    redTap2.vRegistrationPoint = 43 * scale;
    redTap1.hOffset = 378 * scale;
    redTap1.vOffset = 1287 * scale;
    redTap1.width = 85 * scale;
    redTap1.height = 86 * scale;
    redTap1.hRegistrationPoint = 43 * scale;
    redTap1.vRegistrationPoint = 43 * scale;
    redTap3.hOffset = 1001 * scale;
    redTap3.vOffset = 1287 * scale;
    redTap3.width = 85 * scale;
    redTap3.height = 86 * scale;
    redTap3.hRegistrationPoint = 43 * scale;
    redTap3.vRegistrationPoint = 43 * scale;
    driveConsole.hOffset = 125 * scale;
    driveConsole.vOffset = 582 * scale;
    driveConsole.width = 1093 * scale;
    driveConsole.height = 804 * scale;
    consoleslider.hOffset = 270 * scale;
    consoleslider.vOffset = 760 * scale;
    consoleslider.width = 283 * scale;
    consoleslider.height = 74 * scale;
    consoleknob.hOffset = 325 * scale;
    consoleknob.vOffset = 770 * scale;
    consoleknob.width = 34 * scale;
    consoleknob.height = 47 * scale;
    if (preferences.driveconsolePref.value === "open") {
        consoleknob.hOffset = (325 + 140) * scaleit;
        driveConsole.visible = false;
    } else {
        consoleknob.hOffset = (325) * scaleit;
        driveConsole.visible = true;
    }
    driveslider.hOffset = 800 * scale;
    driveslider.vOffset = 760 * scale;
    driveslider.width = 283 * scale;
    driveslider.height = 74 * scale;
    driveknob.hOffset = 860 * scale;
    driveknob.vOffset = 770 * scale;
    driveknob.width = 34 * scale;
    driveknob.height = 47 * scale;
    if (preferences.showUnmountedPref.value === "disable") {
        driveknob.hOffset = (855 + 140) * scaleit;
    } else {
        driveknob.hOffset = (855) * scaleit;
    }
    // set the mute toggle position
    if (preferences.soundPref.value === "mute") {
        togglemute.hOffset = (1201 * 0.99) * scale;
    } else {
        togglemute.hOffset = 1206 * scale;
    }
    togglemute.vOffset = 734 * scale;
    togglemute.width = 101 * scale;
    togglemute.height = 59 * scale;
    toggleconfig.hOffset = 1206 * scale;
    toggleconfig.vOffset = 809 * scale;
    toggleconfig.width = 101 * scale;
    toggleconfig.height = 59 * scale;
    toggleabout.hOffset = 1206 * scale;
    toggleabout.vOffset = 884 * scale;
    toggleabout.width = 101 * scale;
    toggleabout.height = 59 * scale;
    togglehelp.hOffset = 1206 * scale;
    togglehelp.vOffset = 959 * scale;
    togglehelp.width = 101 * scale;
    togglehelp.height = 59 * scale;
    //toggletooltip.hOffset = 1206 * scale;
    // set the tooltip toggle position
    if (preferences.tooltipswitchPref.value === "disable") {
        toggletooltip.hOffset = (1201 * 0.99) * scale;
    } else {
        toggletooltip.hOffset = 1206 * scale;
    }
    toggletooltip.vOffset = 1034 * scale;
    toggletooltip.width = 101 * scale;
    toggletooltip.height = 59 * scale;
    // set the smooth animation toggle position
    if (preferences.smoothPref.value === "disabled") {
        togglesmooth.hOffset = (350 * 0.99) * scale;
    } else {
        togglesmooth.hOffset = 350 * scale;
    }
    togglesmooth.vOffset = 500 * scale;
    togglesmooth.width = 260 * scale;
    togglesmooth.height = 53 * scale;
    toggle1.hOffset = 1206 * scale;
    toggle1.vOffset = 659 * scale;
    toggle1.width = 101 * scale;
    toggle1.height = 59 * scale;
    toggle2.hOffset = 1206 * scale;
    toggle2.vOffset = 659 * scale;
    toggle2.width = 101 * scale;
    toggle2.height = 59 * scale;
    toggle3.hOffset = 1206 * scale;
    toggle3.vOffset = 659 * scale;
    toggle3.width = 101 * scale;
    toggle3.height = 59 * scale;
    toggle4.hOffset = 1206 * scale;
    toggle4.vOffset = 659 * scale;
    toggle4.width = 101 * scale;
    toggle4.height = 59 * scale;
    toggle5.hOffset = 1206 * scale;
    toggle5.vOffset = 659 * scale;
    toggle5.width = 101 * scale;
    toggle5.height = 59 * scale;
    toggle6.hOffset = 1206 * scale;
    toggle6.vOffset = 659 * scale;
    toggle6.width = 101 * scale;
    toggle6.height = 59 * scale;
    memgauge.hOffset = 497 * scale;
    memgauge.vOffset = 34 * scale;
    memgauge.width = 367 * scale;
    memgauge.height = 366 * scale;
    wireless.hOffset = 1028 * scale;
    wireless.vOffset = 1109 * scale;
    wireless.width = 284 * scale;
    wireless.height = 281 * scale;
    core0gauge.hOffset = 140 * scale;
    core0gauge.vOffset = 809 * scale;
    core0gauge.width = 284 * scale;
    core0gauge.height = 281 * scale;
    core1gauge.hOffset = 405 * scale;
    core1gauge.vOffset = 809 * scale;
    core1gauge.width = 284 * scale;
    core1gauge.height = 281 * scale;
    core2gauge.hOffset = 670 * scale;
    core2gauge.vOffset = 809 * scale;
    core2gauge.width = 284 * scale;
    core2gauge.height = 281 * scale;
    core3gauge.hOffset = 935 * scale;
    core3gauge.vOffset = 809 * scale;
    core3gauge.width = 284 * scale;
    core3gauge.height = 281 * scale;
    clipboard.hOffset = 835 * scale;
    clipboard.vOffset = 739 * scale;
    clipboard.width = 358 * scale;
    clipboard.height = 650 * scale;
    helpback.hOffset = 169 * scale;
    helpback.vOffset = 1116 * scale;
    helpback.width = 1042 * scale;
    helpback.height = 836 * scale;
    helpback.size = Math.round(30 * scale);
    helpscreen.hOffset = 169 * scale;
    helpscreen.vOffset = 1116 * scale;
    helpscreen.width = 1042 * scale;
    helpscreen.height = 836 * scale;
    helpscreen.size = Math.round(30 * scale);
    toggleback.hOffset = 101 * scale;
    toggleback.vOffset = 1136 * scale;
    toggleback.width = 101 * scale;
    toggleback.height = 59 * scale;
    cpugauge.hOffset = 134 * scale;
    cpugauge.vOffset = 103 * scale;
    cpugauge.width = 488 * scale;
    cpugauge.height = 487 * scale;
    amps.hOffset = 741 * scale;
    amps.vOffset = 96 * scale;
    amps.width = 488 * scale;
    amps.height = 488 * scale;
    virtmem.hOffset = 741 * scale;
    virtmem.vOffset = 96 * scale;
    virtmem.width = 488 * scale;
    virtmem.height = 488 * scale;
    memTap.hOffset = 681 * scale;
    memTap.vOffset = 417 * scale;
    memTap.width = 86 * scale;
    memTap.height = 86 * scale;
    memTap.hRegistrationPoint = 43 * scale;
    memTap.vRegistrationPoint = 43 * scale;
    puff.hOffset = 700 * scale;
    puff.vOffset = 410 * scale;
    puff.width = 150 * scale;
    puff.height = 150 * scale;
    core2indicator.hOffset = 390 * scale;
    core2indicator.vOffset = 839 * scale;
    core2indicator.width = 35 * scale;
    core2indicator.height = 31 * scale;
    core4indicator.hOffset = 915 * scale;
    core4indicator.vOffset = 839 * scale;
    core4indicator.width = 35 * scale;
    core4indicator.height = 31 * scale;
    core8indicator.hOffset = 655 * scale;
    core8indicator.vOffset = 839 * scale;
    core8indicator.width = 35 * scale;
    core8indicator.height = 31 * scale;
    virtmemcurrindicator.hOffset = 1050 * scale;
    virtmemcurrindicator.vOffset = 439 * scale;
    virtmemcurrindicator.width = 35 * scale;
    virtmemcurrindicator.height = 31 * scale;
    virtmemexceedindicator.hOffset = 914 * scale;
    virtmemexceedindicator.vOffset = 439 * scale;
    virtmemexceedindicator.width = 35 * scale;
    virtmemexceedindicator.height = 31 * scale;
    chargingindicatorGreen.hOffset = 1050 * scale;
    chargingindicatorGreen.vOffset = 439 * scale;
    chargingindicatorGreen.width = 35 * scale;
    chargingindicatorGreen.height = 31 * scale;
    chargingindicatorAmber.hOffset = 1054 * scale;
    chargingindicatorAmber.vOffset = 439 * scale;
    chargingindicatorAmber.width = 35 * scale;
    chargingindicatorAmber.height = 31 * scale;
    batteryindicatorRed.hOffset = 914 * scale;
    batteryindicatorRed.vOffset = 439 * scale;
    batteryindicatorRed.width = 35 * scale;
    batteryindicatorRed.height = 31 * scale;
    batteryindicatorGreen.hOffset = 914 * scale;
    batteryindicatorGreen.vOffset = 439 * scale;
    batteryindicatorGreen.width = 35 * scale;
    batteryindicatorGreen.height = 31 * scale;
    
    wirelessindicatorLeft.hOffset = 1107 * scale;
    wirelessindicatorLeft.vOffset = 1295 * scale;
    wirelessindicatorLeft.width   = 19 * scale;
    wirelessindicatorLeft.height  = 17 * scale;

    wirelessindicatorRight.hOffset = 1200 * scale;
    wirelessindicatorRight.vOffset = 1295 * scale;
    wirelessindicatorRight.width   = 19 * scale;
    wirelessindicatorRight.height  = 17 * scale;

    leftBar.hOffset = 51 * scale;
    leftBar.vOffset = 573 * scale;
    leftBar.width = 73 * scale;
    leftBar.height = 576 * scale;
    rightBar.hOffset = 101 * scale;
    rightBar.vOffset = 573 * scale;
    rightBar.width = 73 * scale;
    rightBar.height = 576 * scale;
    bulb.hOffset = 1260 * scale;
    bulb.vOffset = 1095 * scale;
    bulb.width = 381 * scale;
    bulb.height = 303 * scale;
    bulbglow.hOffset = 1260 * scale;
    bulbglow.vOffset = 1095 * scale;
    bulbglow.width = 381 * scale;
    bulbglow.height = 303 * scale;
    sliderbar.hOffset = 195 * scale;
    sliderbar.vOffset = 1055 * scale;
    sliderbar.width = 680 * scale;
    sliderbar.height = 99 * scale;
    cableTrough.hOffset = 730 * scale;
    cableTrough.vOffset = 1115 * scale;
    cableTrough.width = 119 * scale;
    cableTrough.height = 101 * scale;
    // set the size slider position on startup
    sliderset.vOffset = 1008 * scale;
    sliderset.width = 480 * scale;
    sliderset.height = 237 * scale;
    sliderset.hOffset = (preferences.scalePref.value * (3.06 * scaleit)) + (261 * scaleit);
    //set the cable size and position on startup
    cable.vOffset = 1161 * scale;
    cable.height = 35 * scale;
    cable.hOffset = sliderset.hOffset + (182 * scaleit);
    cable.width = (cableTrough.hOffset - (60 * scale)) - (sliderset.hOffset);
    bellpushes.hOffset = 610 * scale;
    bellpushes.vOffset = 435 * scale;
    bellpushes.width = 282 * scale;
    bellpushes.height = 226 * scale;
    bellpushmail.hOffset = 633 * scale;
    bellpushmail.vOffset = 500 * scale;
    bellpushmail.width = 72 * scale;
    bellpushmail.height = 77 * scale;
    bellpushupdate.hOffset = 704 * scale;
    bellpushupdate.vOffset = 500 * scale;
    bellpushupdate.width = 72 * scale;
    bellpushupdate.height = 77 * scale;
    bellpushhelp.hOffset = 775 * scale;
    bellpushhelp.vOffset = 500 * scale;
    bellpushhelp.width = 72 * scale;
    bellpushhelp.height = 77 * scale;
    bellpush.hOffset = 890 * scale;
    bellpush.vOffset = 1030 * scale;
    bellpush.width = 103 * scale;
    bellpush.height = 101 * scale;
    bellpushed.hOffset = 890 * scale;
    bellpushed.vOffset = 1030 * scale;
    bellpushed.width = 103 * scale;
    bellpushed.height = 101 * scale;
    taskmanager.hOffset = 490 * scale;
    taskmanager.vOffset = 530 * scale;
    taskmanager.width = 406 * scale;
    taskmanager.height = 318 * scale;
    sliderRight.hOffset = 97 * scale;
    sliderRight.width = 62 * scale;
    sliderRight.height = 30 * scale;
    //set the position of the right hand interval slider on startup
    sliderRight.vOffset = (642 + ((100 * parseInt(preferences.timerPref.value, 10)) - 100)) * scaleit;
    sliderLeft.hOffset = 52 * scale;
    sliderLeft.width = 62 * scale;
    sliderLeft.height = 30 * scale;
    //set the position of the left hand interval slider on startup
    sliderLeft.vOffset = (642 + ((100 * (parseInt(preferences.animationPref.value, 10) / 20)) - 100)) * scaleit;
    counter.hOffset = 652 * scale;
    counter.vOffset = 542 * scale;
    counter.width = 446 * scale;
    counter.height = 221 * scale;
    //get the new number of drives and create an image for each.
    countdrives();
    if (volscnt === newvols) {
        // count the drive volumes, create new images for each drive
        //createdrives();
        dummy();
    }
    offset = 0;
    for (a in vols) {
        if (vols.hasOwnProperty(a)) {
            volscnt = Number(a);
            if (volscnt <= 5) {
                drivegauge[a].hOffset = (169 * scaleit) + offset;
                drivegauge[a].vOffset = 606 * scaleit;
                drivegauge[a].width = 175 * scaleit;
                drivegauge[a].height = 175 * scaleit;
                drivepointer[a].hOffset = (250 * scaleit) + offset;
                drivepointer[a].vOffset = 685 * scaleit;
                drivepointer[a].width = 160 * scaleit;
                drivepointer[a].height = 160 * scaleit;
                drivepointer[a].hRegistrationPoint = 80 * scaleit;
                drivepointer[a].vRegistrationPoint = 80 * scaleit;
                drivelamp[a].hOffset = (243 * scaleit) + offset;
                drivelamp[a].vOffset = 710 * scaleit;
                drivelamp[a].width = 25 * scaleit;
                drivelamp[a].height = 22 * scaleit;
                offset = offset + (171 * scaleit);
            }
        }
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to display the battery or virtual memory gauge
//======================================================================================
function setvirtmemorbatt() {
    if (preferences.virtampsPref.value === "virt") {
        preferences.battswitchPref.value = "off";
        virtmem.visible = true;
        virt_hand.visible = true;
        virtText.visible = true;
        amps.visible = false;
        amps.visible = false;
        batt_hand.visible = false;
        batteryindicatorGreen.visible = false;
        batteryindicatorRed.visible = false;
        chargingindicatorGreen.visible = false;
        chargingindicatorAmber.visible = false;
        battText.visible = false;
        crankdown.visible = true;
        crankup.visible = false;
    } else {
        preferences.battswitchPref.value = "on";
        virtmem.visible = false;
        amps.visible = true;
        virt_hand.visible = false;
        virtText.visible = false;
        crankdown.visible = false;
        crankup.visible = true;
        amps.visible = true;
        batt_hand.visible = true;
        batteryindicatorGreen.visible = true;
        batteryindicatorRed.visible = true;
        chargingindicatorGreen.visible = true;
        chargingindicatorAmber.visible = true;
        battText.visible = true;
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function called during rotation of cpu and network gauges
//======================================================================================
function displayValue(obj, objText, value, invF, smooth, animationInterval) {
	var that = obj,
		thatText = objText,
		animationDuration,

		updateText = function (angle) {
			var val = invF(angle),			// 100 * (angle + 64.5) / 251,
        		valT = String(Math.round(val));
        		
        	while (valT.length < 3) {
            	valT = '0' + valT;
        	}
        	thatText.data = valT;
		},

		updateMe = function () {	// called during rotateAnimation
			var now = animator.milliseconds, fraction, angle, value, valueT;
		
			if (now >= (this.startTime + this.duration)) {
				that.rotation = this.endAngle;
				updateText(this.endAngle);
				return false;
			}
			fraction = (now - this.startTime) / this.duration;
			angle = animator.ease(this.startAngle, this.endAngle, fraction, animator.kEaseOut);
			that.rotation = angle;
			updateText(angle);
			return true;
		},
	
		rotateAnimation = function (startAngle, endAngle) {
			var rotate = new CustomAnimation(animationInterval, updateMe);
			rotate.duration = animationDuration;
			rotate.startAngle = startAngle;
			rotate.endAngle = endAngle;
			animator.start(rotate);
		};
	
	if (smooth) {
		animationDuration = animationInterval * Math.floor(1000 / animationInterval - 1);
		rotateAnimation(that.rotation, value);
	} else {
		that.rotation = value;
		updateText(value);
	}
}
//=====================
//End function
//=====================

//======================================================================================
// Function to obtain information from the Windows Management Instrumentation
//======================================================================================
function getWMIcpuValues() {
    var object = "Win32_PerfRawData_PerfOS_Processor.Name=0",
        loop;
        print("getWMIcpuValues here ");
    //wmic path Win32_PerfRawData_PerfOS_Processor get Name,PercentProcessorTime
    oldtimestamp = timestamp;
    for (loop = 0; loop < processorCount; loop += 1) {
        wmiCpuValOld[loop] = wmiCpuVal[loop];
        object = "Win32_PerfRawData_PerfOS_Processor.Name=" + loop;
        //Win32_PerfFormattedData_PerfOS_Processor
        wmiCpuVal[loop] = parseInt(wmi.Get(object).Properties_.Item("PercentProcessorTime").Value, 10);
        timestamp = parseInt(wmi.Get(object).Properties_.Item("TimeStamp_Sys100NS").Value, 10);
        // Formula - (1- ((N2 - N1) / (D2 - D1))) x 100
        if (oldtimestamp !== null) {
            cpuPerc[loop] = parseInt((1 - ((wmiCpuVal[loop] - wmiCpuValOld[loop]) / (timestamp - oldtimestamp))) * 100, 10);
            cpuPerc[loop] = cpuPerc[loop] / processorCount;
        } else {
            cpuPerc[loop] = 0;
        }
        if (cpuPerc[loop] <= 0) {
            cpuPerc[loop] = 0;
        }
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to find network maximumSpeedIndex
//======================================================================================
function maximumSpeedIndex(maxBytes) {
    var maxS = maxBytes / 125000, i;
    
    for (i = 0; i < maxSpeed.length; i += 1) {
        if (maxS <= maxSpeed[i]) { return i; }
    }
    return maxSpeed.length - 1;
}
//=====================
//End function
//=====================

//======================================================================================
// Function to set the network gauge indicators
//======================================================================================
function setAspect(indicators, leftAspect, rightAspect) {
	var left = wirelessindicatorLeft,
		right = wirelessindicatorRight,
		base = "Resources/";
	
	left.visible  = right.visible  = indicators;

	switch (leftAspect) {
	case "off":
		left.src = base + "indicatorOff.png";
		break;
	case "green":
		left.src = base + "indicatorGreen.png";
		break;
	case "amber":
		left.src = base + "indicatorAmber.png";
		break;
	case "red":	
		left.src = base + "indicatorRed.png";
		break;
	}
	
	switch (rightAspect) {
	case "off":
		right.src = base + "indicatorOff.png";
		break;
	case "green":
		right.src = base + "indicatorGreen.png";
		break;
	case "amber":
		right.src = base + "indicatorAmber.png";
		break;
	case "red":	
		right.src = base + "indicatorRed.png";
		break;
	}
}
//=====================
//End function
//=====================

//=================================================================================================================================
// Function to sample the YWE! and WMI to obtain system resource information - called by the timer
//=================================================================================================================================
function sample() {
    var cpu = system.cpu.sys + system.cpu.user,
        memy = system.memory.load,
        lhr = 0.01 * cpu * 251 - 64.5,
        shr = 0.01 * memy * 245 - 115,
        cpuT,
        memT,
        core0,
        core1,
        core2,
        core3,
        core4,
        core5,
        core6,
        core7,
        lhr0,
        lhr1,
        lhr2,
        lhr3,
        lhr4,
        lhr5,
        lhr6,
        lhr7,
        cpuT0,
        cpuT1,
        cpuT2,
        cpuT3,
        cpuT4,
        cpuT5,
        cpuT6,
        cpuT7,
        virtual,
        vhr,
        virtT,
        battery0,
        ahr,
        battT,
        wireless1,
        whr,
        wirelessT,
        d,
        a,
        usageinGig0,
        totalinGig0,
        usedinPerc0,
        dr0,
        endloop,
        traffic,
        bytes,
        value,
        speedIndex,
        curSpeed,
        
        invCPU = function(lhr) {
        	return 100 * (lhr + 64.5) / 251;
        },
        
        invNET = function(whr) {
        	return 100 * (whr + 120) / 251;
        };

    theTimer.interval = preferences.timerPref.value;

    //if (preferences.WMIenabled.value === "enabled" && (system.platform === "windows" && winVersionNo != "10" )){
    print("preferences.WMIenabled.value "+preferences.WMIenabled.value);
    if (preferences.WMIenabled.value === "enabled" ){
        if (wmi !== null && (preferences.core0and1switchPref.value === "on" || preferences.core2and3switchPref.value === "on")) {
            if (processorCount > 1) {
                getWMIcpuValues();
            }
            if (processorCount >= 2) {
                core0 = cpuPerc[0];
                lhr0 = 0.01 * cpuPerc[0] * 251 - 64.5;
                core1 = cpuPerc[1];
                lhr1 = 0.01 * cpuPerc[1] * 251 - 64.5;
            }
            if (processorCount >= 4) {
                core2 = cpuPerc[2];
                lhr2 = 0.01 * cpuPerc[2] * 251 - 64.5;
                core3 = cpuPerc[3];
                lhr3 = 0.01 * cpuPerc[3] * 251 - 64.5;
            }
            if (processorCount === 3) {
                core2 = cpuPerc[2];
                lhr2 = 0.01 * cpuPerc[2] * 251 - 64.5;
            }
            if (processorCount === 8) {
                core4 = cpuPerc[4];
                lhr4 = 0.01 * cpuPerc[4] * 251 - 64.5;
                core5 = cpuPerc[5];
                lhr5 = 0.01 * cpuPerc[5] * 251 - 64.5;
                core6 = cpuPerc[6];
                lhr6 = 0.01 * cpuPerc[6] * 251 - 64.5;
                core7 = cpuPerc[7];
                lhr7 = 0.01 * cpuPerc[7] * 251 - 64.5;
            }
        }
    }
    

    if (preferences.cpuswitchPref.value === "on") {
		displayValue(large_hand, cpuText, lhr, invCPU, smooth === "enabled", animationInterval);
        //print(preferences.tooltipswitchPref.value);
        if (preferences.tooltipswitchPref.value === "enable") {
            cpugauge.tooltip = " When you first hovered here" + "\n" + "Total cpu usage was " + String(Math.round(cpu)) + "% ";
            cpugauge.tooltip += "\n" + " It will continue to vary whilst you read this. ";
        } else {
            cpugauge.tooltip = "";
        }
    } else {
        large_hand.rotation = -64.5;
        cpuText.data = "000";
        if (preferences.tooltipswitchPref.value === "enable") {
            cpugauge.tooltip = " CPU monitoring is off ";
        } else {
            cpugauge.tooltip = "";
        }
    }
    

    //if (preferences.WMIenabled.value === "enabled" && (system.platform === "windows" && winVersionNo != "10" ))  {
    if (preferences.WMIenabled.value === "enabled" )  {
          //secondary gauge for dual core systems, of course also displayed in quad core systems too
          if (wmi !== null && processorCount !== 1 && preferences.core0and1switchPref.value === "on") {
              if (processorCount === 2 || processorCount === 3 || processorCount === 4) {
                  cpuT0 = String(Math.round(core0));
              } else if (processorCount === 8) {
                  cpuT0 = String(Math.round(core0 + core1));
              }
              while (cpuT0.length < 3) {
                  cpuT0 = '0' + cpuT0;
              }
              core0gaugehand.rotation = lhr0 - 55;
              core0Text.data = cpuT0;
              if (preferences.tooltipswitchPref.value === "enable") {
                  core0gauge.tooltip = " When you first hovered here" + "\n" + " cpu usage for CORE 1 was " + String(Math.round(core0)) + "% ";
                  core0gauge.tooltip += "\n" + " It will continue to vary whilst you read this. ";
              } else {
                  core0gauge.tooltip = "";
              }
              if (processorCount === 2 || processorCount === 3 || processorCount === 4) {
                  cpuT1 = String(Math.round(core1));
              } else if (processorCount === 8) {
                  cpuT1 = String(Math.round(core2 + core3));
              }
              while (cpuT1.length < 3) {
                  cpuT1 = '0' + cpuT1;
              }
              core1gaugehand.rotation = lhr1 - 55;
              core1Text.data = cpuT1;
              if (preferences.tooltipswitchPref.value === "enable") {
                  core1gauge.tooltip = " When you first hovered here" + "\n" + " cpu usage for CORE 2 was " + String(Math.round(core1)) + "% ";
                  core1gauge.tooltip += "\n" + " It will continue to vary whilst you read this. ";
              } else {
                  core1gauge.tooltip = "";
              }
          } else {
              core0gaugehand.rotation = -120;
              core0Text.data = "000";
              if (preferences.tooltipswitchPref.value === "enable") {
                  core0gauge.tooltip = " Core 1 monitoring is off ";
                  core1gauge.tooltip = " Core 2 monitoring is off ";
              } else {
                  core0gauge.tooltip = "";
                  core1gauge.tooltip = "";
              }
              core1gaugehand.rotation = -120;
              core1Text.data = "000";
          }
    }

        //if (preferences.WMIenabled.value === "enabled" && (system.platform === "windows" && winVersionNo != "10" )) {
        if (preferences.WMIenabled.value === "enabled" ) {
          //secondary gauges for quad core systems
          if (wmi !== null && processorCount >= 3 && preferences.core2and3switchPref.value === "on") {
              if (processorCount === 3 || processorCount === 4) {
                  cpuT2 = String(Math.round(core2));
              } else if (processorCount === 8) {
                  cpuT2 = String(Math.round(core4 + core5));
              }
              while (cpuT2.length < 3) {
                  cpuT2 = '0' + cpuT2;
              }
              core2gaugehand.rotation = lhr2 - 55;
              core2Text.data = cpuT2;
              if (preferences.tooltipswitchPref.value === "enable") {
                  core2gauge.tooltip = " When you first hovered here" + "\n" + " cpu usage for CORE 3 was " + String(Math.round(core2)) + "% ";
                  core2gauge.tooltip += "\n" + " It will continue to vary whilst you read this. ";
              } else {
                  core2gauge.tooltip = "";
              }
              if (processorCount === 4) {
                  cpuT3 = String(Math.round(core3));
              } else if (processorCount === 8) {
                  cpuT3 = String(Math.round(core6 + core7));
              }
              while (cpuT3.length < 3) {
                  cpuT3 = '0' + cpuT3;
              }
              core3gaugehand.rotation = lhr3 - 55;
              core3Text.data = cpuT3;
              if (preferences.tooltipswitchPref.value === "enable") {
                  core3gauge.tooltip = " When you first hovered here" + "\n" + " cpu usage for CORE 4 was " + String(Math.round(core3)) + "% ";
                  core3gauge.tooltip += "\n" + " It will continue to vary whilst you read this. ";
              } else {
                  core3gauge.tooltip = "";
              }
          } else {
              core2gaugehand.rotation = -120;
              core2Text.data = "000";
              if (preferences.tooltipswitchPref.value === "enable") {
                  core2gauge.tooltip = " Core 3 monitoring is off ";
                  core3gauge.tooltip = " Core 4 monitoring is off ";
              } else {
                  core2gauge.tooltip = "";
                  core3gauge.tooltip = "";
              }
              core3gaugehand.rotation = -120;
              core3Text.data = "000";
          }
    }


    if (system.platform !== "windows") {
        core0gauge.tooltip = " This is a Macintosh - core monitoring is currently unavailable ";
        core1gauge.tooltip = core0gauge.tooltip;
        core2gauge.tooltip = core0gauge.tooltip;
        core3gauge.tooltip = core0gauge.tooltip;
    }
    if (preferences.memswitchPref.value === "on") {
        small_hand.rotation = shr;
        memT = String(Math.round(memy));
        while (memT.length < 3) {
            memT = '0' + memT;
        }
        memText.data = memT;
        if (preferences.tooltipswitchPref.value === "enable") {
            memgauge.tooltip = " memory at " + memy + "% utilisation ";
        } else {
            memgauge.tooltip = "";
        }
    } else {
        small_hand.rotation = -115;
        memText.data = "000";
        if (preferences.tooltipswitchPref.value === "enable") {
            memgauge.tooltip = " Memory monitoring is off ";
        } else {
            memgauge.tooltip = "";
        }
    }
    // code for virtual memory gauge
    if (preferences.virtampsPref.value === "virt" && preferences.virtswitchPref.value === "on") {
        virtual = 100 - ((system.memory.availVirtual / system.memory.totalVirtual) * 100);
        vhr = 0.01 * virtual * 251 - 64.5;
        virt_hand.rotation = vhr;
        virtT = String(Math.round(virtual));
        while (virtT.length < 3) {
            virtT = '0' + virtT;
        }
        virtText.data = virtT;
        if (preferences.tooltipswitchPref.value === "enable") {
            virtmem.tooltip = " Virtual Memory at " + String(Math.round(virtual)) + "% usage ";
        } else {
            virtmem.tooltip = "";
        }
        // if virtual memory is above 90% now then turn on a lamp else turn it off
        if (virtual >= Number(preferences.virtmemthresholdPref.value)) {
            virtmemcurrindicator.src = "Resources/indicatorRed.png";
            virtmemexceedflg = 1;
        } else {
            virtmemcurrindicator.src = "Resources/indicatorGreen.png";
        }
        // if virtual memory ever rises above 90% then turn on a lamp and keep it lit (peak)xz
        if (virtmemexceedflg === 1) {
            virtmemexceedindicator.src = "Resources/indicatorRed.png";
            if (preferences.tooltipswitchPref.value === "enable") {
                virtmem.tooltip = " Virtual Memory has exceeded 90% usage - increase pagefile size ! ";
            } else {
                virtmem.tooltip = "";
            }
        }
    } else {
        virt_hand.rotation = -65;
        virtText.data = "000";
        if (preferences.tooltipswitchPref.value === "enable") {
            virtmem.tooltip = " Virtual Memory monitoring is off ";
        } else {
            virtmem.tooltip = "";
        }
    }
    if (preferences.virtampsPref.value === "amps" && preferences.battswitchPref.value === "on") {
        if (system.batteryCount !== 0) {
            battery0 = system.battery[0] ? system.battery[0].currentCapacity : 0;
            ahr = 0.01 * battery0 * 251 - 64.5;
            batt_hand.rotation = ahr;
            battT = String(Math.round(battery0));
            while (battT.length < 3) {
                battT = '0' + battT;
            }
            battText.data = battT;
            if (preferences.tooltipswitchPref.value === "enable") {
                amps.tooltip = " Battery at " + battery0 + "% capacity ";
            } else {
                amps.tooltip = "";
            }
            if (system.battery[0].powerSourceState === "Battery Power") {
                sparkflasherOn.ticking = false;
                if (preferences.tooltipswitchPref.value === "enable") {
                    chargingindicatorAmber.tooltip = "This indicates that the battery is currently discharging";
                    amps.tooltip += "and discharging..., " + "\n" + "Time until empty is " + system.battery[0].timeToEmpty + " mins (estimated).";
                } else {
                    amps.tooltip = "";
                }
            } else {
                if (preferences.tooltipswitchPref.value === "enable") {
                    amps.tooltip += "and on charge..., ";
                } else {
                    amps.tooltip = "";
                }
                if (system.battery[0].timeToFullCharge >= 0 || system.battery[0].timeToFullCharge < 100 ) {
                    if (preferences.tooltipswitchPref.value === "enable") {
                        sparkflasherOn.ticking = true;
                        amps.tooltip += "\n" + " Time until fully charged is " + system.battery[0].timeToFullCharge + " mins (estimated).";
                    } else {
                        amps.tooltip = "";
                    }
                }
                if (system.battery[0].timeToFullCharge == 0 ) {
                    sparkflasherOn.ticking = false;
                    if (preferences.tooltipswitchPref.value === "enable") {
                        amps.tooltip = " Battery is fully charged.";
                    } else {
                        amps.tooltip = "";
                    }
                }
            }
            if (system.battery[0].powerSourceState === "AC Power") {
                chargingindicatorGreen.visible = true;
                chargingindicatorAmber.visible = false;
            }
            //print(preferences.ampsThresholdPref.value);
            if (battT <= parseInt(preferences.ampsThresholdPref.value, 10)) {
                batteryindicatorRed.tooltip = "This indicates that the battery is close to being discharged";
                batteryindicatorGreen.visible = false;
                batteryindicatorRed.visible = true;
                ampsflasher.ticking = true;
            } else {
                batteryindicatorGreen.visible = true;
                batteryindicatorRed.visible = false;
                ampsflasher.ticking = false;
            }
        } else { // end if ( system.batteryCount !== 0 ) else {
            //          if (system.battery[0].powerSourceState === "AC Power") {                // **** hw ****     system.battery[0] is invalid if system.batteryCount === 0
            amps.tooltip = "Powered by mains AC, battery monitoring is OFF ";
            //          }                                                                       // **** hw ****     system.battery[0] is invalid if system.batteryCount === 0
        } // end if ( preferences.battswitchPref.value === "on" )
    } else { //( preferences.battswitchPref.value === "off" )
        batt_hand.rotation = -64.5;
        battText.data = "000";
        if (preferences.tooltipswitchPref.value === "enable") {
            amps.tooltip = " Battery monitoring is off ";
        } else {
            amps.tooltip = "";
        }
    }
   
    //if (preferences.WMIenabled.value === "enabled" && (system.platform === "windows" && winVersionNo != "10" ))  {
    if (preferences.WMIenabled.value === "enabled")  {
          if ((preferences.networkswitch.value === "ofloopy") && (preferences.wirelessswitch.value === "off")) {
              traffic = NETSTAT.traffic(devName);
              bytes = traffic.ibps + traffic.obps;
              //value,
              //speedIndex,
              //curSpeed;
              
              if (bytes > maxBytes) {
                  maxBytes = bytes;
                  preferences.maxSpeedPref.value = curSpeed = String(maxSpeed[maximumSpeedIndex(maxBytes)]);
                  print("---- speeds ----");
                  print("maxBytes: " + maxBytes.toFixed(0));
                  print("Maximum Speed: " + preferences.maxSpeedPref.value);
                  print("Minimum Speed: " + maxSpeed[preferences.minSpeedPref.value]);
                  
                  setAspect(true, "off", "red");
                  
                  if (preferences.tooltipswitchPref.value === "enable") {
                      wireless.tooltip = devTypeOf[devName] + " (" + devName + ")  100% = " + curSpeed + " Mb/s" +
                          "\n\nThe Network Device Selection Menu is on the hand.\nSelecting with the alt-key updates the menu.";
                      bulbglow.tooltip = wireless.tooltip;
                  } else {
                      wireless.tooltip = "";
                      bulbglow.tooltip = "";
                  }
              } else {
                  timerCount = (timerCount + 1) % timerCountModulo;
                  if (timerCount === 0) {
                      speedIndex = maximumSpeedIndex(maxBytes);
                      if ((speedIndex > minSpeedPref) && (bytes < 125000 * maxSpeed[speedIndex - 1])) {
                          maxBytes = 125000 * maxSpeed[speedIndex - 1];
                          preferences.maxSpeedPref.value = curSpeed = String(maxSpeed[speedIndex - 1]);
                          print("---- speeds ----");
                          print("maxBytes: " + maxBytes.toFixed(0));
                          print("Maximum Speed: " + preferences.maxSpeedPref.value);
                          print("Minimum Speed: " + maxSpeed[preferences.minSpeedPref.value]);
                      
                          setAspect(true, "off", "amber");
                      
                          if (preferences.tooltipswitchPref.value === "enable") {
                              wireless.tooltip = devTypeOf[devName] + " (" + devName + ")  100% = " + curSpeed + " Mb/s" +
                                  "\n\nThe Network Device Selection Menu is on the hand.\nSelecting with the alt-key updates the menu.";
                              bulbglow.tooltip = wireless.tooltip;
                          } else {
                              wireless.tooltip = "";
                              bulbglow.tooltip = "";
                          }
                      } else {
                          setAspect(true, "green", "off");
                          dummy();
                      }
                  }
              }
      
              value = 100 * bytes / maxBytes;
              whr = 0.01 * value * 251 - 120;
              displayValue(wireless_hand, wirelessText, whr, invNET, networkSmooth === "enabled", animationInterval);
          }
    }
    /*
    print("wireless : " + preferences.wirelessswitch.value);
    print("network : " + preferences.networkswitch.value);
    print("available : " + systemAirport.available);
    print("powered : " + systemAirport.powered);
    */

    if ((preferences.wirelessswitch.value === "on")  ) {
        if (SNOWLEOPARD) {
            systemAirport = getSystemAirport();
        } else {
            systemAirport = system.airport;
        }

        if (systemAirport.available && systemAirport.powered) {
            if (SNOWLEOPARD) {
                wireless1 = percent(systemAirport.signal);
            } else { //windows or earlier Macs
                wireless1 = parseInt(systemAirport.signal, 10);
            }
            //print("wireless1 : " + wireless1);

            whr = 0.01 * wireless1 * 251 - 120;
            wireless_hand.rotation = whr;
            wirelessT = String(Math.round(wireless1));
            while (wirelessT.length < 3) {
                wirelessT = '0' + wirelessT;
            }
            wirelessText.data = wirelessT;
            if (preferences.tooltipswitchPref.value === "enable") {
                wireless.tooltip = "   Wireless signal " + "\n" + "   " + ("Network: ") + systemAirport.network + "\n" + "   " + ("Noise level: ") + systemAirport.noise + "db \n" + "   " + ("Signal level : ") + wireless1 + "%";
                bulbglow.tooltip = wireless.tooltip;
            } else {
                wireless.tooltip = "";
                bulbglow.tooltip = "";
            }
            bulbglow.opacity = wireless1 * 2.55;
        } else {
            wireless_hand.rotation = -120;
            wirelessText.data = "000";
            if (preferences.tooltipswitchPref.value === "enable") {
                wireless.tooltip = " Wireless is unpowered or unavailable ";
            } else {
                wireless.tooltip = "";
            }
            bulbglow.opacity = 0;
        }
    } else if (preferences.networkswitch.value === "off") {
        wireless_hand.rotation = -120;
        wirelessText.data = "000";
        if (preferences.tooltipswitchPref.value === "enable") {
            wireless.tooltip = " Wireless monitoring is off ";
        } else {
            wireless.tooltip = "";
        }
        bulbglow.opacity = 0;
    }
    
    if (driveCounter !== 0) {
        return;
    }
    
    driveCounter = (driveCounter + 1) % 60; // update the drives once a minute.
    d = 0;
    endloop = volscnt;
    if (volscnt > 5) { endloop = 5; }
    for (a = 0; a <= endloop; a += 1) {
    //for (a in vols) {
        if (vols.hasOwnProperty(a)) {
            if (d <= 5) {
                drivelamp[a].visible = false;
                drivegauge[a].visible = false;
                drivepointer[a].visible = "false";
                drivepointer[a].rotation = 0;
                drivelamp[a].src = "Resources/drivelamp.png";
                //print    ("toggle_count "+toggle_count);
                if (toggle_count - 1 >= d) {
                    //
                    if (vols[a].freeBytes === 0 && vols[a].totalBytes === 0) {
                        if (preferences.showUnmountedPref.value === "enable") {
                            drivegauge[d].visible = true;
                            drivepointer[d].visible = "true";
                            drivelamp[d].visible = true;
                            //print (vols[a].totalBytes);
                            if (preferences.tooltipswitchPref.value === "enable") {
                                drivegauge[d].tooltip = "Drive " + filesystem.getDisplayName(vols[a].path) + " exists but not yet mounted";
                            } else {
                                drivegauge[d].tooltip = "";
                            }
                            d = d + 1;
                        } else {
                            //d = d + 0;
                            //drivegauge[d].tooltip = "d "+ d;
                            dummy();
                        }
                    } else {
                        drivegauge[d].visible = true; //assume there will always be one drive at least
                        drivepointer[d].visible = "true";
                        drivelamp[d].visible = true;
                        if (system.platform === "windows") {
                            usageinGig0 = (vols[a].freeBytes / Math.pow(2, 30)).toFixed(2) + " GiB free";
                            totalinGig0 = (vols[a].totalBytes / Math.pow(2, 30)).toFixed(2) + " GiB total";
                        } else {
                            usageinGig0 = (vols[a].freeBytes / 1e9).toFixed(2) + " GB free";
                            totalinGig0 = (vols[a].totalBytes / 1e9).toFixed(2) + " GB total";
                        }
                        usedinPerc0 = parseInt(100 - ((Math.floor((vols[a].freeBytes / vols[a].totalBytes) * 1000)) / 10), 10);
                        if (preferences.tooltipswitchPref.value === "enable") {
                            drivegauge[d].tooltip = "Drive " + filesystem.getDisplayName(vols[a].path) + "\n" + usedinPerc0 + "% used " + "\n" + usageinGig0 + "\n" + totalinGig0;
                        } else {
                            drivegauge[d].tooltip = "";
                        }
                        dr0 = 0.01 * usedinPerc0 * 260 + 7;
                        drivepointer[d].rotation = dr0;
                        if (usedinPerc0 > parseInt(preferences.drivethreshholdPref.value, 10)) {
                            drivelamp[d].src = "Resources/drivelamp.png";
                        } else {
                            drivelamp[d].src = "Resources/drivelampgreen.png";
                        }
                        d = d + 1;
                    }
                }
            }
        }
    }
    //max_toggle_count = Number(d);
    //print("d "+d);
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the cpu gauge on/off
//===========================================
function cpuswitch() {
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;
    if (preferences.cpuswitchPref.value === "on") {
        preferences.cpuswitchPref.value = "off";
    } else {
        preferences.cpuswitchPref.value = "on";
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the memory gauge on/off
//===========================================
function memswitch() {
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;
    if (preferences.memswitchPref.value === "on") {
        preferences.memswitchPref.value = "off";
    } else {
        preferences.memswitchPref.value = "on";
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the battery gauge on/off
//===========================================
function battswitch() {
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    if (preferences.battswitchPref.value === "on") {
        preferences.battswitchPref.value = "off";
        batteryindicatorGreen.visible = false;
        batteryindicatorRed.visible = false;
        chargingindicatorGreen.visible = false;
        chargingindicatorAmber.visible = false;
        // if this is a desktop system, ie. no batteries, then do not show the amps gauge
        if (system.batteryCount === 0) {
            batteryindicatorGreen.visible = false;
            batteryindicatorRed.visible = false;
            chargingindicatorGreen.visible = false;
            chargingindicatorAmber.visible = false;
            batt_hand.visible = false;
            battText.visible = false;
            amps.visible = false;
            stanchion.visible = false;
            //ampsTap.visible = false;
        }
    } else {
        preferences.battswitchPref.value = "on";
        // if this is a desktop system, ie. no batteries, then do not show the amps gauge
        if (system.batteryCount === 0) {
            batteryindicatorGreen.visible = true;
            batteryindicatorRed.visible = true;
            chargingindicatorGreen.visible = true;
            chargingindicatorAmber.visible = true;
            batt_hand.visible = true;
            battText.visible = true;
            amps.visible = true;
            stanchion.visible = true;
            //ampsTap.visible = false;
        }
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the battery gauge on/off
//===========================================
function virtswitch() {
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;
    if (preferences.virtswitchPref.value === "on") {
        preferences.virtswitchPref.value = "off";
    } else {
        preferences.virtswitchPref.value = "on";
        // if this is a desktop system, ie. no batteries, then do not show the amps gauge
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the wireless gauge on/off
//===========================================
function wirelessswitch() {
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    if (preferences.wirelessswitch.value === "on") {
        preferences.wirelessswitch.value = "off";
    } else {
        preferences.wirelessswitch.value = "on";
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the various disc gauges on/off
//===========================================
function presstoggle() {
    if (preferences.soundPref.value === "enable") {
        play(clunk, false);
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    toggle1.visible = false;
    toggle2.visible = false;
    toggle3.visible = false;
    toggle4.visible = false;
    toggle5.visible = false;
    toggle6.visible = false;
    toggle_count = Number(toggle_count) + 1;
    if (toggle_count > max_toggle_count) {
        toggle_count = 1;
    }
    if (toggle_count > 6) {
        toggle_count = 1;
    }
    if (toggle_count === 1) {
        toggle1.visible = true;
    }
    if (toggle_count === 2) {
        toggle2.visible = true;
    }
    if (toggle_count === 3) {
        toggle3.visible = true;
    }
    if (toggle_count === 4) {
        toggle4.visible = true;
    }
    if (toggle_count === 5) {
        toggle5.visible = true;
    }
    if (toggle_count === 6) {
        toggle6.visible = true;
    }
    preferences.driveCountPref.value = toggle_count;
    driveCounter = 0;
    sample();
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the sound to mute
//===========================================
function tooltipswitch() {
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    play(clunk, false);
    if (preferences.tooltipswitchPref.value === "disable") {
        preferences.tooltipswitchPref.value = "enable";
        toggletooltip.hOffset = toggletooltip.hOffset + 5;
    } else {
        preferences.tooltipswitchPref.value = "disable";
        toggletooltip.hOffset = toggletooltip.hOffset - 5;
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to switch the sound to mute
//===========================================
function muteswitch() {
    play(clunk, false);
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    if (preferences.soundPref.value === "mute") {
        preferences.soundPref.value = "enable";
        togglemute.hOffset = togglemute.hOffset + 5;
    } else {
        preferences.soundPref.value = "mute";
        togglemute.hOffset = togglemute.hOffset - 5;
    }
}
//=====================
//End function
//=====================
//=====================================================
// Function to switch the animate function on/off to the cpu gauge
//=====================================================
function animateswitch() {
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    if (preferences.soundPref.value === "enable") {
        play(clunk, false);
    }
    if (preferences.smoothPref.value === "enabled") {
        preferences.smoothPref.value = "disabled";
        togglesmooth.hOffset = togglesmooth.hOffset - 5;
    } else {
        preferences.smoothPref.value = "enabled";
        togglesmooth.hOffset = togglesmooth.hOffset + 5;
    }
    smooth = preferences.smoothPref.value;
    animationInterval = Number(preferences.animationPref.value);
    animationDuration = animationInterval * Math.floor(1000 / animationInterval - 1);
}
//=====================
//End function
//=====================
//=====================================================
// Function to show the help function
//=====================================================
function helppressed() {
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

    if (preferences.soundPref.value === "enable") {
        play(clunk, false);
    }
    if (helpscreen.visible === true) {
        helpscreen.visible = false;
        toggleback.visible = false;
        helpback.visible = false;
        bellpushes.src = "Resources/nogaugeplate.png";
        bellpushupdate.visible = false;
        bellpushhelp.visible = false;
        bellpushmail.visible = false;
    } else {
        helpscreen.visible = true;
        toggleback.visible = true;
        helpback.visible = true;
        bellpushes.src = "Resources/gaugeplate.png";
        bellpushupdate.visible = true;
        bellpushhelp.visible = true;
        bellpushmail.visible = true;
    }
}
//=====================
//End function
//=====================


//===========================================
// Function to slide the volume slider
//===========================================
function sliderSetOnMouseWheel() {
    var delta = system.event.scrollDelta;

    print("scroll wheel " + delta);
    if (delta !== 0) {
        if ( preferences.mouseWheelPref.value == "right" ) {
          sliderset.hOffset += delta * scaleit;
        } else {
          sliderset.hOffset -= delta * scaleit;
        }
        moveSliderSet();
    }
    //log("here");
    //only required to set the volume on NT 6 systems
    //if (system.platform === "windows" && winver === "NT6") { setVol(); }
}
//=====================
//End function
//=====================



//===========================================
// Function to slide the volume slider
//===========================================
function sliderSetOnMouseMove() {
  if(clicked)
  {
    sliderset.hOffset = system.event.hOffset - (102 * scaleit);
    moveSliderSet();
  }
}
//=====================
//End function
//=====================


//===========================================
// Function to slide the size slider
//===========================================
function moveSliderSet() {
    var rightmost,
        leftmost;
    //print("hmmmm");
    // print("scaleit "+scaleit);
    rightmost = sliderbar.hOffset + sliderbar.width - (304 * scaleit); //leftmost limit
    leftmost = sliderbar.hOffset + (70 * scaleit); // rightmost limit
/*
 print("sliderbar.hOffset "+sliderbar.hOffset);
 print("sliderbar.width "+sliderbar.width);
 print("sliderset.hOffset "+sliderset.hOffset);
 print("rightmost "+rightmost);
*/
    if (sliderset.hOffset >= rightmost) { //568
        sliderset.hOffset = rightmost;
    }
    if (sliderset.hOffset <= leftmost) { //262
        sliderset.hOffset = leftmost;
        //print("fixed sliderset.hOffset "+sliderset.hOffset);
    }
    // sizeText.hOffset = sliderset.hOffset+(112*scaleit);
    cable.hOffset = sliderset.hOffset + (182 * scaleit);
    cable.width = (cableTrough.hOffset - (60 * scaleit)) - (sliderset.hOffset);
    //print("cableTrough.hOffset "+cableTrough.hOffset);
    //print("sliderset.hOffset "+sliderset.hOffset);
    //print("cable.width "+cable.width);
    //print("leftmost "+leftmost);
    perc = (sliderset.hOffset - (261 * scaleit)) / (3.06 * scaleit);
    if (perc < 10) {
        perc = 10;
    }
    sizeText.data = parseInt(perc, 10) + "% ";
    if (preferences.soundPref.value === "enable") {
        play(zzzz, false);
    }
    //print (perc);
    //306 pixels difference each percent being 3.06pixels
}
//=====================
//End function
//=====================

//===========================================
// Function to determine what happens when the mouse is pressed on the size slider
//===========================================
function sizeSliderMouseDown() {
    //      log("Running function sizeSliderMouseDown");
    clicked = true;
    //      log("Leaving function sizeSliderMouseDown " +clicked);
}
//=====================
//End function
//=====================

//===========================================
// Function to determine what happens when the mouse is lifted from the size slider
//===========================================
function sizeSliderMouseUp() {
    if (clicked === true) {
        clicked = false;
        sliderset.onMouseMove = null;
    }
    //log("Running function sizeSliderMouseUp clicked is now "+ clicked);
}
//=====================
//End function
//=====================

//===========================================
// Function to slide the time interval slider
//===========================================
function IntervalSliderDrag() {
    var uppermost,
        bottommost,
        ff;
    sliderRight.vOffset = system.event.vOffset;
    uppermost = rightBar.vOffset + (70 * scaleit); //leftmost limit
    bottommost = (rightBar.height) + (470 * scaleit); // rightmost limit
    if (sliderRight.vOffset <= uppermost) { //568
        sliderRight.vOffset = uppermost;
    }
    if (sliderRight.vOffset >= bottommost) { //262
        sliderRight.vOffset = bottommost;
    }
    ff = parseInt(sliderRight.vOffset / ((bottommost - uppermost) / 4), 10) - 5;
    theTimer.interval = ff;
    preferences.timerPref.value = theTimer.interval;
    if (preferences.tooltipswitchPref.value === "enable") {
        sliderRight.tooltip = "sampling interval set to " + ff + " secs";
    } else {
        sliderRight.tooltip = "";
    }
    sizeText.data = parseInt(ff, 10) + "secs ";
    if (preferences.soundPref.value === "enable") {
        play(zzzz, false);
    }
}
//=====================
//End function
//=====================

//===========================================
// Function to determine what happens when the mouse is pressed on the time slider
//===========================================
function IntervalSliderMouseDown() {
    //      log("Running function sizeSliderMouseDown");
    clicked = true;
    //      log("Leaving function sizeSliderMouseDown " +clicked);
}
//=====================
//End function
//=====================

//===========================================
// Function to determine what happens when the mouse is lifted from the time slider
//===========================================
function IntervalSliderMouseUp() {
    if (clicked === true) {
        clicked = false;
        sliderRight.onMouseMove = null;
    }
    //log("Running function sizeSliderMouseUp clicked is now "+ clicked);
}
//=====================
//End function
//=====================

//===========================================
// Function to slide the animation slider
//===========================================
function AnimationSliderDrag() {
    var uppermost,
        bottommost,
        ff;
    sliderLeft.vOffset = system.event.vOffset;
    uppermost = leftBar.vOffset + (70 * scaleit); //leftmost limit
    bottommost = (leftBar.height) + (470 * scaleit); // leftmost limit
    if (sliderLeft.vOffset <= uppermost) { //568
        sliderLeft.vOffset = uppermost;
    }
    if (sliderLeft.vOffset >= bottommost) { //262
        sliderLeft.vOffset = bottommost;
    }
    ff = parseInt(sliderLeft.vOffset / ((bottommost - uppermost) / 4), 10) - 5;
    //print(ff*20);
    preferences.animationPref.value = (ff * 20);
    sizeText.data = parseInt(ff * 20, 10) + "ms ";
    //20 - 100
    //preferences.smoothPref = sliderLeft.vOffset+(112*scaleit); ;
    if (preferences.soundPref.value === "enable") {
        play(zzzz, false);
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to determine what happens when the mouse is clicked on the animation slider
//======================================================================================
function AnimationSliderMouseDown() {
    //      log("Running function sizeSliderMouseDown");
    clicked = true;
    //      log("Leaving function sizeSliderMouseDown " +clicked);
}
//=====================
//End function
//=====================

//======================================================================================
// Function to determine what happens when the mouse is lifted from the animation slider
//======================================================================================
function AnimationSliderMouseUp() {
    if (clicked === true) {
        clicked = false;
        sliderLeft.onMouseMove = null;
    }
    //log("Running function sizeSliderMouseUp clicked is now "+ clicked);
}
//=====================
//End function
//=====================

//===========================================
// Function to handle a mouse double click event
//===========================================
function doubleClick() {
    log("double click ");
}
//=====================
//End function
//=====================

//===========================================
// Function to handle a mouse click event
//===========================================
function singleClick() {
    log("single click ");
}
//=====================
//End function
//=====================

//======================================================================================
// Function to delete drives
//======================================================================================
function deletedrives() {
    var items;
    for (items in volscnt) {
        if (volscnt.hasOwnProperty(items)) {
            delete drivegauge[items];
            delete drivelamp[items];
            delete drivepointer[items];
        }
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to set the maxium number of drive toggles
//======================================================================================
function resetTimer() {
    clickflg = 0;
    //log ("clickflg "+clickflg);
}
//=====================
//End function
//=====================

//======================================================================================
// Function to hide/display the front console
//======================================================================================
function console() {
    if (preferences.driveconsolePref.value === "open") {
        preferences.driveconsolePref.value = "shut";
        driveConsole.visible = true;
        consoleknob.hOffset = (325) * scaleit;
        if (preferences.tooltipswitchPref.value === "enable") {
            consoleknob.tooltip = "open the console cover";
        }
    } else {
        preferences.driveconsolePref.value = "open";
        driveConsole.visible = false;
        consoleknob.hOffset = (325 + 140) * scaleit;
        if (preferences.tooltipswitchPref.value === "enable") {
            consoleknob.tooltip = "shut the console cover";
        }
    }
    if (preferences.soundPref.value === "enable") {
        play(clunk, false);
    }
    cog.rotation = cog.rotation + cogrotation;
    cog2.rotation = cog2.rotation + cogrotation / 3;

}
//=====================
//End function
//=====================

//======================================================================================
// Function to hide/display the front console
//======================================================================================
function switchvirtmemorbatt() {
    if (preferences.soundPref.value === "enable") {
        play(crank, false);
    }
    if (preferences.virtampsPref.value === "amps") {
        //preferences.battswitchPref.value="off";
        preferences.virtampsPref.value = "virt";
        //print (preferences.battswitchPref.value);
        virtmem.visible = true;
        virt_hand.visible = true;
        virtText.visible = true;
        amps.visible = false;
        amps.visible = false;
        batt_hand.visible = false;
        batteryindicatorGreen.visible = false;
        batteryindicatorRed.visible = false;
        chargingindicatorGreen.visible = false;
        chargingindicatorAmber.visible = false;
        battText.visible = false;
        crankdown.visible = true;
        crankup.visible = false;
    } else {
        //preferences.battswitchPref.value="on";
        preferences.virtampsPref.value = "amps";
        virtmem.visible = false;
        amps.visible = true;
        virt_hand.visible = false;
        virtText.visible = false;
        crankdown.visible = false;
        crankup.visible = true;
        amps.visible = true;
        batt_hand.visible = true;
/*
 batteryindicatorGreen.visible = true;
 batteryindicatorRed.visible = true;
 chargingindicatorGreen.visible = true;
 chargingindicatorAmber.visible = true;
*/
        battText.visible = true;
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to hide/display the front console
//======================================================================================
function ampsflash() {
    if (preferences.virtampsPref.value === "amps" && preferences.battswitchPref.value === "on") {
        if (batteryindicatorRed.visible === true) {
            batteryindicatorRed.visible = false;
            if (preferences.soundPref.value === "enable") {
                play(relay, false);
            }
        } else {
            batteryindicatorRed.visible = true;
            if (preferences.soundPref.value === "enable") {
                play(relay, false);
            }
        }
    }
}
//=====================
//End function
//=====================



//======================================================================================
// Function to show the spark
//======================================================================================
function sparkflash() {
    if (preferences.virtampsPref.value === "amps" && preferences.battswitchPref.value === "on") {
                var scale = Number(preferences.scalePref.value) / 100;
                flash_window.hoffset = mainWindow.hoffset + (205 * scale);
                flash_window.voffset = mainWindow.voffset - (340 * scale);
                flash_window.level= 3;

                if (preferences.sparkPref.value === "enable") {
                   log("firing spark flash");
                   flash.visible = true;
                   if (preferences.soundPref.value === "enable") { play(sparks, false) };
                   sparkflasherOff.ticking = true;
                }
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function to effect network menu selection action
//======================================================================================

function deviceMenuAction() {
    if (preferences.devicePref.value !== preferences.devicePref.optionValue[this.i]) {
        preferences.devicePref.value = preferences.devicePref.optionValue[this.i];
        widget.onPreferencesChanged();
    }
}
//=====================
//End function
//=====================


//======================================================================================
// Function to find network devices(adaptors)
//======================================================================================
function getDevices(update) {
    var option = [], optionValue = [], defaultIndex = -1,
        device = NETSTAT.devices(), i, devName;

    print("========== devices ==========");
    for (i = 0; i < device.length; i += 1) {
        option[i] = device[i].type + " (" + device[i].name + ")";
        optionValue[i] = device[i].name;
        if (device[i].type === "Ethernet") {
            defaultIndex = i;
        }
        devTypeOf[device[i].name] = device[i].type;
        print("device[" + i + "]: " + option[i]);
    }
    
    // set the network device menu in the prefs
    preferences.devicePref.option = option;
    preferences.devicePref.optionValue = optionValue;

    if (defaultIndex !== -1) {
        preferences.devicePref.defaultValue = optionValue[defaultIndex];
    } else if (optionValue.length !== 0) {
        preferences.devicePref.defaultValue = optionValue[0];
    } else {
        preferences.devicePref.defaultValue = "";
    }
        
    if (update) {
        devName = preferences.devicePref.value;
        deviceMenu.reset(option, devTypeOf[devName] + " (" + devName + ")");
    } else {
        deviceMenu = new Menu(wireless_hand, option, option[defaultIndex], deviceMenuAction);
        preferences.devicePref.value = preferences.devicePref.defaultValue;
    }
}
//=====================
//End function
//=====================

//======================================================================================
// Function called when preferences are changed
//======================================================================================
function setNetworkPrefs(update) {
    var traffic,
        value;

    devName = preferences.devicePref.value;
    deviceMenu.setTick(devTypeOf[devName] + " (" + devName + ")");
    
    print("==== device ====");
    print("devName: " + devName);
    print("devType: " + devTypeOf[devName]);

    maxBytes = 125000 * preferences.maxSpeedPref.value;
    minSpeedPref = Number(preferences.minSpeedPref.value);
    traffic = NETSTAT.traffic(devName);
    value = 0;
    
    print("---- speeds ----");
    print("maxBytes: " + maxBytes.toFixed(0));
    print("Maximum Speed: " + preferences.maxSpeedPref.value);
    print("Minimum Speed: " + maxSpeed[preferences.minSpeedPref.value]);

    if ((preferences.tooltipswitchPref.value === "enable") && (preferences.networkswitch.value === "on")) {
        wireless.tooltip = devTypeOf[devName] + " (" + devName + ")  100% = " + preferences.maxSpeedPref.value + " Mb/s" +
            "\n\nThe Network Device Selection Menu is on the hand.\nSelecting with the alt-key updates the menu.";
        bulbglow.tooltip = wireless.tooltip;
    } else {
        wireless.tooltip = "";
        bulbglow.tooltip = "";
    }

    wireless_hand.rotation = 0.01 * value * 251 - 120;
}
//=====================
//End function
//=====================

//======================================================================================
// Function called when preferences are changed
//======================================================================================
function setPrefs(update) {
    testlicence();
    if (preferences.soundPref.value === "enable") {
        puffit();
    }
    scaleTheWidget(Number(preferences.scalePref.value) / 100);
    checktooltips();
    smooth = preferences.smoothPref.value;
    networkSmooth = preferences.networkSmoothPref.value;
    animationInterval = Number(preferences.animationPref.value);
    animationDuration = animationInterval * Math.floor(1000 / animationInterval - 1);
    sizeText.data = "";
    driveCounter = 0;
    if (preferences.driveconsolePref.value === "open") {
        driveConsole.visible = false;
    } else {
        driveConsole.visible = true;
    }
    setNetworkPrefs(update);
    sample();
    countdrives();
    displayToggleCount();
}
//=====================
//End function
//=====================
