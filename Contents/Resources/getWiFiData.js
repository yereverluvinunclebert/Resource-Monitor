/*
	getWiFiData - gets airport/wireless data on the Macintosh
	Copyright © 2010-2013 Harry Whitfield

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.

	getWiFiData - version 1.0.7
	22 March, 2013
	Copyright © 2010-2013 Harry Whitfield
	mailto:g6auc@arrl.net
*/

/*properties
    available, channel, indexOf, info, join, length, locked, macAddress, match, 
    network, noise, platform, powered, push, replace, security, signal, split
*/

// Is this a Macintosh with an Intel cpu?
var intelMac = (function isIntelMac() {
	if (system.platform === "macintosh") {
		return (runCommand('system_profiler SPHardwareDataType').indexOf('Intel') >= 0);
	}
	return false;
}());

//print('intelMac: ' + intelMac);

var SNOWLEOPARD = (function isSnowLeopard() {
	var result = "", snowLeopard = 0x1060;	// Mac OS X 10.6 = 0x1060 = 4192
   	if (system.platform === "macintosh") {
		result = appleScript('get system attribute "sysv"\n', 2);
    	if (result.indexOf("AppleScript Error") >= 0) {
			return false;
    	}
		return Number(result) >= snowLeopard;
    }
    return false;
}());

//print('SNOWLEOPARD: ' + SNOWLEOPARD);

function percent(dBm) {		// convert a dBm value to a percentags value
	var res =  2.5 * dBm + 200;
	if (res >= 100) {
		res = 99.9;
	}
	if (res < 0) {
		res = 0;
	}
	return res;
}

function formatMacAddress(s) {
	var xx, i;
	if (s) {
		xx = s.split(":");
		for (i = 0; i < xx.length; i += 1) {
			if (xx[i].length === 1) {
				xx[i] = "0" + xx[i];
			}
		}
		return xx.join(":");
	}
	return "";
}

function getSystemAirportAsync(tag) {
	return runCommandInBg("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I", tag);
}

function getSystemAirport(data) {
	function getItem(data, s) {
		var lookFor, pattern, result;
		lookFor = " " + s + ": " + "([\\S]*)$";
		pattern = new RegExp(lookFor, "m");
		result = data.match(pattern);
		if (result !== null) {
			return result[1];
		}
		return undefined;
	}

	if (data === undefined) {
		data = runCommand("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I");
	}
	
	var res = {};
	if (data.indexOf("AirPort: Off") < 0) {
		res.available  = true;
		res.powered    = true;
		res.network    = getItem(data, "SSID");
		res.macAddress = formatMacAddress(getItem(data, "BSSID"));
		res.signal     = Number(getItem(data, "agrCtlRSSI"));
		res.noise      = Number(getItem(data, "agrCtlNoise"));
		res.channel    = Number(getItem(data, "channel"));
		res.info       = res.network +  " on channel " + res.channel + " with strength " + res.signal + "dBm";
	} else {
		res.available  = false;
		res.powered    = false;
		res.network    = "";
		res.macAddress = "";
		res.signal     = 0;
		res.noise      = 0;
		res.channel    = 0;
		res.info       = "No AirPort available";
	}
	return res;
}

function getAirportNetworksXMLAsync(tag) {
	return runCommandInBg("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -s -x", tag);
}

function getAirportNetworksXML(data) {
	function getDicts(data) {
		var lookFor = /\n\t<dict\>[\s\S]*?\n\t<\/dict\>/g;
		return data.match(lookFor);
	}

	function esc(str) {
		return str.replace(/([\W])/g, '\\$1');
	}

	function getItem(data, key, dataType) {
		var start, finish, lookFor, pattern, result;
	
		// <key>SSID_STR</key>
		// <string>BTHomeHub-7AB2</string>
	
		start  = esc('<key>' + key + '</key>') + '\\s*?' + esc('<' + dataType + '>');
		finish = esc('</' + dataType + '>');
		lookFor = start + '([.\\s\\S]*?)' + finish;
		pattern = new RegExp(lookFor);
		result = data.match(pattern);
		if (result !== null) {
			return result[1];
		}
		return undefined;
	}

	function checkItem(data, key) {
		var lookFor, pattern, result;
	
		// <key>WEP</key>
	
		lookFor  = esc('<key>' + key + '</key>');
		pattern = new RegExp(lookFor);
		result = data.match(pattern);
		return (result !== null);
	}

	var i, networks = [], dicts;
	if (data === undefined) {
		data = runCommand("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -s -x");
	}
	dicts = getDicts(data);

	if (dicts !== null) {
		for (i = 0; i < dicts.length; i += 1) {
			networks[i] = {};
			networks[i].network    = getItem(dicts[i], "SSID_STR", "string");
			networks[i].macAddress = formatMacAddress(getItem(dicts[i], "BSSID", "string"));
			networks[i].signal     = Number(getItem(dicts[i], "RSSI",     "integer"));
			networks[i].noise      = Number(getItem(dicts[i], "NOISE",    "integer"));
			networks[i].channel    = Number(getItem(dicts[i], "CHANNEL",  "integer"));
			networks[i].locked     = checkItem(dicts[i], "WEP") || checkItem(dicts[i], "WPA_IE") || checkItem(dicts[i], "WPS_BEACON_IE");
		}
	}
	return networks;
}

function getAirportNetworksAsync(tag) {
	return runCommandInBg("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -s", tag);
}

function getAirportNetworks(data) {
	function trim(s) {
		return s.replace(/^\s+|\s+$/g, '');
	}

	function getDicts(data) {
		var dicts = [], lines = data.split("\n"), i, line;
			
		for (i = 0; i < lines.length; i += 1) {
			line = trim(lines[i]).replace(/ {2,}/g, " ");
			if ((line !== "") && (line.indexOf("SSID") < 0) && (line.indexOf("IBSS") < 0)) {
				dicts.push(line);
			}
		}
		return dicts;
	}

	var i, networks = [], dicts, secIndex, item;
	if (data === undefined) {
		data = runCommand("/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -s");
	}
	dicts = getDicts(data);
	secIndex = SNOWLEOPARD ? 6 : 4;

	for (i = 0; i < dicts.length; i += 1) {
		item = dicts[i].split(" ");
			
		networks[i] = {};
		networks[i].network    = item[0];
		networks[i].macAddress = item[1];
		networks[i].signal     = Number(item[2]);
		networks[i].noise      = undefined;
		networks[i].channel    = parseInt(item[3], 10);
		networks[i].locked     = item[secIndex] !== "NONE";
		networks[i].security   = item[secIndex + 1] !== undefined ? item[secIndex] + " " + item[secIndex + 1] : item[secIndex];
	}
	return networks;
}

/*
//Test Program
print("--- own airport ---");
var systemAirport = system.airport;
if (SNOWLEOPARD) {
	systemAirport = getSystemAirport();
}
print("powered: " + systemAirport.powered);
if (systemAirport.powered) {
	print("network:    " + systemAirport.network);
	print("macAddress: " + systemAirport.macAddress);
	print("signal:     " + systemAirport.signal);
	print("noise:      " + systemAirport.noise);
	print("channel:    " + systemAirport.channel);
	print("info:       " + systemAirport.info);
}

var networks = getAirportNetworks();
for (var i = 0; i < networks.length; i += 1) {
	print("--- network[" + i + "] ---");
	print("network:    " + networks[i].network);
	print("macAddress: " + networks[i].macAddress);
	print("signal:     " + networks[i].signal);
	print("noise:      " + networks[i].noise);
	print("channel:    " + networks[i].channel);
	print("locked:     " + networks[i].locked);
	print("security:   " + networks[i].security);
}
*/