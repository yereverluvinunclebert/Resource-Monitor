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

/*properties
    bndw, devices, getTime, ibps, interfaces, length, match, name, obps, push, 
    replace, split, traffic, type
*/

var NETSTAT = (function() {
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
            interfaces = function() { // Name Mtu Network Address Ipkts Ierrs Opkts Oerrs Coll
                var iFace = [],
                    item,
                    i,
                    data = runCommand("netstat -i").replace(/ {22}/g, "					xxxx ").replace(/ {2,}/g, " ").split("\n");

                for (i = 1; i < data.length; i += 1) {
                    item = data[i].split(" ");
                    if (item[4] !== "0") { // Ipkts
                        iFace[item[0]] = item[3]; // iFace[Name] = Address
                    }
                }
                return iFace;
            },
            devices = function() {
                var device = [],
                    found1,
                    found2,
                    i,
                    regExp1 = /Type\: ([^\n])+\n\s*Hardware\: [^\n]+\n\s*BSD Device Name\: ([^\n]+)\n/g,
                    regExp2 = /Type\: ([^\n]+)\n\s*Hardware\: [^\n]+\n\s*BSD Device Name\: ([^\n]+)\n/,
                    data = runCommand("system_profiler SPNetworkDataType"),
                    iFace = interfaces();

                found1 = data.match(regExp1);
                if (found1 !== null) {
                    for (i = 0; i < found1.length; i += 1) {
                        found2 = found1[i].match(regExp2);
                        if (iFace[found2[2]]) {
                            device.push({
                                name: found2[2],
                                type: found2[1]
                            });
                        }
                    }
                }
                return device;
            },
            traffic = function(name) { // Name Mtu Network Address Ipkts Ierrs Ibytes Opkts Oerrs Obytes Coll
                var item,
                    data;

                if (name !== oldName) {
                    newTimeStamp = 0;
                    oldName = name;
                }

                oldTimeStamp = newTimeStamp;
                iBytesOld = iBytes;
                oBytesOld = oBytes;

                data = runCommand("netstat -b -I " + name).replace(/ {22}/g, "				 xxxx ").replace(/ {2,}/g, " ").split("\n", 2);
                item = data[1].split(" ");
                iBytes = parseInt(item[6], 10);
                oBytes = parseInt(item[9], 10);
                bandWidth = 1e6;

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
    }());

//////////////////////////////////////////////////////////////////////////////////////////

// Test program follows

/*properties
 	hasOwnProperty, toFixed, interval, onTimerFired, ticking
*/

/*
print("===== interfaces =====");
var iFace = NETSTAT.interfaces(), j;
for (j in iFace) {
	if (iFace.hasOwnProperty(j)) {
		print("iFace[" + j + "] = " + iFace[j]);
	}
}

print("===== devices =====");
var device = NETSTAT.devices(), i;
for (i = 0; i < device.length; i += 1) {
	print("device[" + i + "].name = " + device[i].name);
	print("device[" + i + "].type = " + device[i].type);
}

print("===== traffic =====");
var t = new Timer(), count = 0, i = 0;
t.interval = 0.1;
t.onTimerFired = function () {
	var traffic = NETSTAT.traffic(device[i].name);

    print(device[i].name + "(" + device[i].type + "):: ibps: " + traffic.ibps.toFixed(0) + " obps: " + traffic.obps.toFixed(0) + " bndw: " + traffic.bndw.toFixed(0));
	count += 1;
	if (count > 200) {
		t.ticking = false;
	}
};
t.ticking = true;
*/
