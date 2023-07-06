/*
 NETSTAT - gets network information
 Copyright © 2013 Dean Beedell and Harry Whitfield

 This program is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public licence as published by the
 Free Software Foundation; either version 2 of the licence, or (at your
 option) any later version.

 This program is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU
 General Public licence for more details.

 You should have received a copy of the GNU General Public licence along
 with this program; if not, write to the Free Software Foundation, Inc.,
 51 Franklin St, Fifth Floor, Boston, MA 02110-1301	USA

 NETSTAT - version 1.1
 27 March, 2013
 Copyright © 2013 Dean Beedell and Harry Whitfield
 mailto:dean.beedell@lightquick.co.uk
 mailto:g6auc@arrl.net

 Broadly based on the approach taken by Andreas Kreisl in his Net Monitor Widget.
*/

/*global wmi */

/*properties
	Get, Item, Properties_, Value, bndw, devices, 
	getTime, ibps, interfaces, interval, length, name, obps, onTimerFired, push, 
	replace, ticking, toFixed, traffic, type
*/

/*properties
	ConnectServer, createObject
*/

//var WBEM = COM.createObject("WbemScripting.SWbemLocator"); 	// Part of test program
//var wmi = WBEM.ConnectServer(".", "root/cimv2"); 				// Part of test program

var NETSTAT = (function(wmi) { // NETSTAT for Windows
        var itself = {},
            oldTimeStamp,
            newTimeStamp = 0,
            iBytesOld,
            oBytesOld,
            iBytes,
            oBytes,
            bandWidth,
            ibps,
            obps,
            bndw,
            oldName = "",
            interval,
            interfaces = function() { // for Mac compatibility - may need to be changed
                return [];
            },
            devices = function() {
                var device = [],
                    i,
                    networkAdapterConfig,
                    networkAdapter,
                    macAddress,
                    adapterName,
                    adapterType;
                for (i = 1; i <= 50; i += 1) {
                    try { // WMI does not list an adapter count so you loop through all available
                        // adapters looking for IP enabled with an assigned MAC address.

                        networkAdapterConfig = wmi.Get('Win32_NetworkAdapterConfiguration.Index=' + i).Properties_;

                        if (networkAdapterConfig.Item("IPEnabled").Value) {
                            networkAdapter = wmi.Get('Win32_NetworkAdapter.DeviceID=' + i).Properties_;
                            macAddress = networkAdapter.Item("MACAddress").Value;
                            if (macAddress) {
                                adapterName = networkAdapterConfig.Item("Description").Value.replace(/\//g, "_").replace(/\(/g, "[").replace(/\)/g, "]").replace(/#/g, "_");

                                adapterType = networkAdapter.Item("AdapterType").Value; // was Description

                                device.push({
                                    name: adapterName,
                                    type: adapterType
                                });
                            }
                        }
                    } catch (e) {}
                }

                return device;
            },
            traffic = function(name) {
                if (name !== oldName) {
                    newTimeStamp = 0;
                    oldName = name;
                }

                oldTimeStamp = newTimeStamp;
                iBytesOld = iBytes;
                oBytesOld = oBytes;
                //these are the wmi get statements that cause the generic error on Windows 10
                log ("Getting Performance data from the TCPIP Network Interfaces from WMI for " + name + "- if it stalls here then WMI is refusing to provide data (WMI wrecked) or data is missing and not being collected - Windows 10 is really quite shit.");
                iBytes = wmi.Get('Win32_PerfRawData_Tcpip_NetworkAdapter.name="' + name + '"').Properties_.Item("BytesReceivedPerSec").Value;
                oBytes = wmi.Get('Win32_PerfRawData_Tcpip_NetworkAdapter.name="' + name + '"').Properties_.Item("BytesSentPerSec").Value;
                bandWidth = wmi.Get('Win32_PerfRawData_Tcpip_NetworkAdapter.name="' + name + '"').Properties_.Item("CurrentBandwidth").Value;
                log ("WMI extract done");

                if (iBytes < 0) {
                    iBytes += 4294967296;
                }
                if (oBytes < 0) {
                    oBytes += 4294967296;
                }

                newTimeStamp = new Date().getTime() / 1000;

                if (oldTimeStamp > 0) {
                    interval = newTimeStamp - oldTimeStamp;
                    ibps = (iBytes - iBytesOld) / interval;
                    obps = (oBytes - oBytesOld) / interval;
                    bndw = bandWidth;
                } else {
                    ibps = 0;
                    obps = 0;
                    bndw = 0;
                }
                return {
                    ibps: ibps,
                    obps: obps,
                    bndw: bndw
                };
            };

        itself.interfaces = interfaces;
        itself.devices = devices;
        itself.traffic = traffic;

        return itself;
    }(wmi));

//////////////////////////////////////////////////////////////////////////////////////////

// Test program follows

/*properties
	toFixed, interval, onTimerFired, ticking
*/

/*
print("===== devices =====");
var device = NETSTAT.devices(), i;
for (i = 0; i < device.length; i += 1) {
    print("device[" + i + "].name = " + device[i].name);
    print("device[" + i + "].type = " + device[i].type);
}

print("===== traffic =====");
var t = new Timer(), count = 0, i = 0;
t.interval = 0.1;
t.onTimerFired = function() {
    var traffic = NETSTAT.traffic(device[i].name);

    print(device[i].name + "(" + device[i].type + "):: ibps: " + traffic.ibps.toFixed(0) + " obps: " + traffic.obps.toFixed(0) + " bndw: " + traffic.bndw.toFixed(0));
    count += 1;
    if (count > 200) {
        t.ticking = false;
    }
};
t.ticking = true;
*/
