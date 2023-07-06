/*
COPYRIGHT (c) 2006 YAHOO!INC.

The following BSD License applies solely to the programming code
included in this file. 

(1)	Redistributions of source code must retain the above copyright
notice, this list of conditions, and the following disclaimer.
(2)	Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
(3) 	Neither the name of Yahoo!nor the names of its contributors may
be used to endorse or promote products derived from the Yahoo!Widgets
without specific prior written permission of Yahoo!.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*members appendChild, createDocument, createElement, dockOpen, 
    setAttribute, setDockItem
*/

function buildVitality(count) {
	var doc, v, background, txt;
	if (!widget.dockOpen) { return; }

	// create an XML document
	doc = XMLDOM.createDocument();
	v = doc.createElement("dock-item");
	v.setAttribute("version", "1.0");
	doc.appendChild(v);
	
	background = doc.createElement("image");
	background.setAttribute("src", "Resources/dock.png");
	background.setAttribute("hOffset", 0);
	background.setAttribute("vOffset", 0);
	v.appendChild(background);
		
	txt = doc.createElement("text");
	txt.setAttribute("hOffset", "37");
	txt.setAttribute("vOffset", "50");
	txt.setAttribute("hAlign", "center");
	txt.setAttribute("style", "font-family: Arial;font-size: 12px; font-weight: normal; color: black;");
	txt.setAttribute("data", count);
	v.appendChild(txt);
	
	widget.setDockItem(doc, "fade");					
}
