<br/>
<a id="MeadCo"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo : object</h2>Static class for namespace creation and core utility functions for ScriptX.Services client librariesThis must be included before any other files from this package.


* [MeadCo](#MeadCo) : object
    * [.version](#MeadCo.version)
    * [.log(text)](#MeadCo.log)
    * [.warn(text)](#MeadCo.warn)
    * [.error(text)](#MeadCo.error)
    * [.createNS(namespace)](#MeadCo.createNS) ⇒ object
    * [.makeApiEndPoint(serverUrl, apiLocation)](#MeadCo.makeApiEndPoint) ⇒ string

<br/>
<a id="MeadCo.version"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.version</h3>Get the version of this module as a string major.minor.hotfix.build

**Properties**

| Name | Type |
| --- | --- |
| version | string | 

<br/>
<a id="MeadCo.log"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.log(text)</h3>Sends the content to the console


| Param | Type | Description |
| --- | --- | --- |
| text | string | to send to console |

<br/>
<a id="MeadCo.warn"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.warn(text)</h3>Marks the content as a warning and sends to the console


| Param | Type | Description |
| --- | --- | --- |
| text | string | to send to console |

<br/>
<a id="MeadCo.error"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.error(text)</h3>Marks the content as an error and sends to the console


| Param | Type | Description |
| --- | --- | --- |
| text | string | to send to console |

<br/>
<a id="MeadCo.createNS"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.createNS(namespace) ⇒ object</h3>Create a namespace


| Param | Type | Description |
| --- | --- | --- |
| namespace | string | path of the namespace |

**Returns**: object - static object for the namespace  
**Example**  
```js
var ui = MeadCo.createNS("MeadCo.ScriptX.Print.UI");ui.Show = function() { alert("hello"); }
```
<br/>
<a id="MeadCo.makeApiEndPoint"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCo.makeApiEndPoint(serverUrl, apiLocation) ⇒ string</h3>Get the url to a ScriptX.Services api endpoint


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | url to the server |
| apiLocation | string | the api, e.g. v1/printhtml |

**Returns**: string - url to the api  
<br/>
<a id="factory"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    factory : object</h2>MeadCo ScriptX 'window.factory' shim (support for modern browsers and IE 11) JS client library. The ScriptX.Add-on Add-on for Internet Explorer is included on a html document with an <object id='factory' /> element with a de-facto standard id of 'factory'.The object is referenced with the property window.factory which exposes properties and methods.The object has two further properties: object (in turn has object.js) printing (in turn has printerControl, enhancedFormatting)This javascript provides partial emulation of window.factory, window.factory.object and window.factory.object.jsFull emulation (and almost complete implementation) is provided for window.factory.printing, window.factory.printing.printerControl, window.factory.printing.enhancedFormatting. The most notable absent implementation is an implementation of print preview.ScriptX Add-on for Internet Explorer intercepts the browser UI for printing. For obvious reasons this is not possible with script, however ::PLEASE NOTE: This library replaces window.print()Full documentation on the properties/methods is provided by the technical reference documentation for the ScriptX Add-on for Internet Explorer: https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn. That documentation is not reproduced here.If the startup script determines that the ScriptX Add.on for IE is already active then it will quietly give priority to the object. In other words, the Add-on has precedence on Internet Explorer.This enables the same experience (almost) to be delivered to any browser on any device with the same html/javascript code.It is strongly recommended that the MeadCoScriptJS library (https://github.com/MeadCo/MeadCoScriptXJS) is used in conjunction with this library as it provides code (Promises) to assistwith working with the significant difference between the synchronous nature of the functions of ScriptX.Add-on (which hide the underlying asynchrony) and the asynchronous nature of javascript AJAX processing.Some APIs lead to system provided dialogs (e.g. printer and paper setup) - support for implementing the dialogs in javascript as simple plug-ins is provided, along with an example implementation using bootstrap/jQuery (see jQuery-MeadCo.ScriptX.Print.UI.js)

**Example**  
```js
MeadCo.ScriptX.Print.UI = {   PageSetup: function(fnDialgCompleteCallBack) { ... dialog code ...},   PrinterSettings: function(fnDialgCompleteCallBack) { ... dialog code ...}}Requires:     MeadCo.Core     MeadCo.ScriptX.Print     MeadCo.ScriptX.Print.HTML     MeadCo.ScriptX.Print.Licensing when using ScritpX.Services for Windows PC     MeadCo.ScriptX.Print.HTML.connect[Async]() or MeadCo.ScriptX.Print.connect[Async]() *MUST* be called before using the apis in this library.See https://scriptxprintsamples.meadroid.com for a lot of samples on using this code.
```
<br/>
<a id="MeadCoScriptXPrint"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint : object</h2>MeadCo.ScriptX.PrintA static class wrapping calls to the server API. Requires: meadco-core.jsIncludes processing of calls to the print api that return "printing to file" including collecting the file output. Provides attribute based connection to the server.Synchronous AJAX calls are deprecated in all browsers but may be useful to "quick start" use of older code. It is recommended that code is movedto using asynchronous calls as soon as practical. The MeadCoScriptXJS library can assist with this as it delivers promise rather than callback based code.


* [MeadCoScriptXPrint](#MeadCoScriptXPrint) : object
    * [.onErrorAction](#MeadCoScriptXPrint.onErrorAction)
    * [.printerName](#MeadCoScriptXPrint.printerName)
    * [.version](#MeadCoScriptXPrint.version)
    * [.deviceSettings](#MeadCoScriptXPrint.deviceSettings)
    * [.isConnected](#MeadCoScriptXPrint.isConnected)
    * [.availablePrinterNames](#MeadCoScriptXPrint.availablePrinterNames)
    * [.queue](#MeadCoScriptXPrint.queue)
    * [.activeJobs](#MeadCoScriptXPrint.activeJobs)
    * [.isSpooling](#MeadCoScriptXPrint.isSpooling)
    * [.ContentType](#MeadCoScriptXPrint.ContentType) : enum
    * [.ErrorAction](#MeadCoScriptXPrint.ErrorAction) : enum
    * [.PrintStatus](#MeadCoScriptXPrint.PrintStatus) : enum
    * [.CollateOptions](#MeadCoScriptXPrint.CollateOptions) : enum
    * [.DuplexOptions](#MeadCoScriptXPrint.DuplexOptions) : enum
    * [.deviceSettingsFor(sPrinterName)](#MeadCoScriptXPrint.deviceSettingsFor) ⇒ DeviceSettingsObject
    * [.useAttributes()](#MeadCoScriptXPrint.useAttributes)
    * [.connect(serverUrl, licenseGuid)](#MeadCoScriptXPrint.connect)
    * [.connectLite(serverUrl, licenseGuid)](#MeadCoScriptXPrint.connectLite)
    * [.connectAsync(serverUrl, licenseGuid, resolve, reject)](#MeadCoScriptXPrint.connectAsync)
    * [.connectTestAsync(serverUrl, resolve, reject)](#MeadCoScriptXPrint.connectTestAsync)
    * [.connectDeviceAndPrinters(deviceInfo, arPrinters)](#MeadCoScriptXPrint.connectDeviceAndPrinters)
    * [.getFromServer(sApi, async, onSuccess, onFail)](#MeadCoScriptXPrint.getFromServer)
    * [.printHtmlAtServer(contentType, content, htmlPrintSettings, fnDone, fnProgress, data)](#MeadCoScriptXPrint.printHtmlAtServer) ⇒ boolean
    * [.reportError(errorTxt)](#MeadCoScriptXPrint.reportError)
    * [.reportServerError(errorTxt)](#MeadCoScriptXPrint.reportServerError)
    * [.reportFeatureNotImplemented(featureDescription)](#MeadCoScriptXPrint.reportFeatureNotImplemented)
    * [.ensureSpoolingStatus()](#MeadCoScriptXPrint.ensureSpoolingStatus) ⇒ object
    * [.freeSpoolStatus(lock)](#MeadCoScriptXPrint.freeSpoolStatus)
    * [.waitForSpoolingComplete(iTimeout, fnComplete)](#MeadCoScriptXPrint.waitForSpoolingComplete)
    * [.PageSize](#MeadCoScriptXPrint.PageSize)
    * [.Margins](#MeadCoScriptXPrint.Margins)
    * [.DeviceSettingsObject](#MeadCoScriptXPrint.DeviceSettingsObject)

<br/>
<a id="MeadCoScriptXPrint.onErrorAction"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.onErrorAction</h3>Get/set the action to take when an error occurs

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| onErrorAction | ErrorAction | the action |

<br/>
<a id="MeadCoScriptXPrint.printerName"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.printerName</h3>Get/set the currently active printer

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| printerName | string | The name of the current printer in use. |

<br/>
<a id="MeadCoScriptXPrint.version"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.version</h3>Get the version of this module as a string major.minor.hotfix.build

**Properties**

| Name | Type |
| --- | --- |
| version | string | 

<br/>
<a id="MeadCoScriptXPrint.deviceSettings"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.deviceSettings</h3>Get/set the cached device settings (papersize etc) for the currently active printer

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| deviceSettings | DeviceSettingsObject | (see API /api/vi/printhtml/deviceInfo/ ) |

<br/>
<a id="MeadCoScriptXPrint.isConnected"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.isConnected</h3>true if the library has succesfully connected to a server.

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isConnected | bool | true if the library has succesfully connected to a server. |

<br/>
<a id="MeadCoScriptXPrint.availablePrinterNames"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.availablePrinterNames</h3>**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| availablePrinterNames | array | an array of strings of the available printers |

<br/>
<a id="MeadCoScriptXPrint.queue"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.queue</h3>The list of jobs currently active at the server for this client

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| queue | Array.&lt;object&gt; | array of jobs |

<br/>
<a id="MeadCoScriptXPrint.activeJobs"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.activeJobs</h3>The number of jobs there are actgive at the server for this client(same as MeadCo.ScriptX.Print.queue.length)

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| activeJobs | int | the number of jobs |

<br/>
<a id="MeadCoScriptXPrint.isSpooling"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.isSpooling</h3>Get if print is still 'spooling'.still queued at the server

**Read only**: true  
**Properties**

| Name | Type |
| --- | --- |
| isSpooling | bool | 

<br/>
<a id="MeadCoScriptXPrint.ContentType"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.ContentType : enum</h3>Enum for type of content being posted to printHtml API

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| URL | number | 1 the url will be downloaded and printed |
| HTML | number | 2 the passed string is assumed to be a complete html document .. <html>..</html> |
| INNERHTML | number | 4 the passed string is a complete html document but missing the html tags |

<br/>
<a id="MeadCoScriptXPrint.ErrorAction"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.ErrorAction : enum</h3>Enum for type of content being posted to printHtml API

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| REPORT | number | 1 Call MeadCo.ScriptX.Print.reportServerError(errMsg) |
| THROW | number | 2 throw an error : throw errMsg |

<br/>
<a id="MeadCoScriptXPrint.PrintStatus"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.PrintStatus : enum</h3>Enum for status code returned to print progress callbacks

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| NOTSTARTED | number | 0 |
| QUEUED | number | 1 |
| STARTING | number | 2 |
| DOWNLOADING | number | 3 |
| DOWNLOADED | number | 4 |
| PRINTING | number | 5 |
| COMPLETED | number | 6 |
| PAUSED | number | 7 |
| PRINTPDF | number | 8 |
| ERROR | number | 1 |
| ABANDONED | number | 2 |

<br/>
<a id="MeadCoScriptXPrint.CollateOptions"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.CollateOptions : enum</h3>Enum to describe the collation option when printing

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DEFAULT | number | 0 use the default at the print server |
| TRUE | number | 1 collate pages when printing |
| FALSE | number | 2 do not collate pages |

<br/>
<a id="MeadCoScriptXPrint.DuplexOptions"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.DuplexOptions : enum</h3>Enum to describe the duplex print option to use when printing

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DEFAULT | number | 0 use the default at the print server |
| SIMPLEX | number | 1 |
| VERTICAL | number | 2 |
| HORIZONTAL | number | 3 |

<br/>
<a id="MeadCoScriptXPrint.deviceSettingsFor"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.deviceSettingsFor(sPrinterName) ⇒ DeviceSettingsObject</h3>Get the device settings (papersize etc) for the named printer. This call is synchronous and not recommended.


| Param | Type | Description |
| --- | --- | --- |
| sPrinterName | string | the name of the printer device to return the settings for |

**Returns**: DeviceSettingsObject - object with properties  
<br/>
<a id="MeadCoScriptXPrint.useAttributes"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.useAttributes()</h3>search for processing attibutes for connection and subscription/license and processthem. The attibutes can be on any elementdata-meadco-server value is the root url, api/v1/printhtml, api/v1/licensing will be added by the librarydata-meadco-syncinit default is true for synchronous calls to the server, value 'false' to use asynchronous calls to the serverdata-meadco-subscription present => cloud/on premise service, value is the subscription GUIDdata-meadco-license present => for Windows PC service, value is the license GUIDIf data-meadco-license is present then the following additional attributes can be used:data-meadco-license-revision, value is the revision number of the licensedata-meadco-license-path,, value is the path to the license file (sxlic.mlf). A value of "warehouse" will cause the license to be downloaded from MeadCo's License WarehouseSynchronous AJAX calls are deprecated in all browsers but may be useful to "quick start" use of older code. It is recommended that code is movedto using asynchronous calls as soon as practical. The MeadCoScriptXJS library can assist with this as it delivers promise rather than callback based code.

**Example**  
```js
<!-- an example connection to an On Premise server for ScriptX.Services --><script src="lib/meadco-scriptxservicesprintUI.min.js"      data-meadco-server="https://app.corpservices/"      data-meadco-subscription="" data-meadco-syncinit="false"></script>;&lt;!-- an example connection to ScriptX.Services for Windows PC -->&lt;script src="lib/meadco-scriptxservicesUI.min.js"     data-meadco-server="http://127.0.0.1:41191"      data-meadco-license="{6BC6808B-D645-40B6-AE80-E9D0825797EF}"      data-meadco-syncinit="false"      data-meadco-license-path="warehouse"     data-meadco-license-revision="3" &gt;&lt;/script&gt;
```
<br/>
<a id="MeadCoScriptXPrint.connect"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.connect(serverUrl, licenseGuid)</h3>Specify the server to use and the subscription/license id. Attempt to connect to the defined ScriptX.Services server and obtainthe device settings for the default printer. This call is synchronous and therefore not recommended. Use connectAsync()


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |

<br/>
<a id="MeadCoScriptXPrint.connectLite"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.connectLite(serverUrl, licenseGuid)</h3>Specify the server and the subscription/license id to use on AJAX calls. No call is made in this function


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |

<br/>
<a id="MeadCoScriptXPrint.connectAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.connectAsync(serverUrl, licenseGuid, resolve, reject)</h3>Specify the server to use and the subscription/license id.Attempt to connect to the defined ScriptX.Services server and obtainthe device settings for the default printer.


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |
| resolve | function | function to call on success, dataObject contains the device settings for the default device. |
| reject | function | function to call on failure |

<br/>
<a id="MeadCoScriptXPrint.connectTestAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.connectTestAsync(serverUrl, resolve, reject)</h3>Test if there is a MeadCo PrintHtml API server at the url


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| resolve | function | function to call on success |
| reject | function | function to call on failure |

<br/>
<a id="MeadCoScriptXPrint.connectDeviceAndPrinters"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.connectDeviceAndPrinters(deviceInfo, arPrinters)</h3>Cache the given device info and available printers in this static class instanceUsed by libraries that call api/v1/printHtml/htmlPrintDefaults


| Param | Type | Description |
| --- | --- | --- |
| deviceInfo | object | the device name and settings (papersize etc) |
| arPrinters | array | the names of the available printers |

<br/>
<a id="MeadCoScriptXPrint.getFromServer"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.getFromServer(sApi, async, onSuccess, onFail)</h3>Call an API on the server with GET


| Param | Type | Description |
| --- | --- | --- |
| sApi | string | the api to call on the connected server |
| async | bool | true for asynchronous call, false for synchronous |
| onSuccess | function | function to call on success |
| onFail | function | function to call on failure |

<br/>
<a id="MeadCoScriptXPrint.printHtmlAtServer"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.printHtmlAtServer(contentType, content, htmlPrintSettings, fnDone, fnProgress, data) ⇒ boolean</h3>Post a request to the server api/v1/print to print some html and monitor the print job to completion. If the server prints to file then the file is opened for the user (in a new window)


| Param | Type | Description |
| --- | --- | --- |
| contentType | ContentType | enum type of content given (html snippet, url) |
| content | string | the content - a url, html snippet or complete html |
| htmlPrintSettings | object | the settings to use - device annd html such as headers and footers |
| fnDone | function | function to call when printing complete (and output returned), arg is null on no error, else error message. |
| fnProgress | function | function to call when job status is updated |
| data | any | object to give pass to fnCallback |

**Returns**: boolean - - true if a print was started (otherwise an error will be thrown)  
<br/>
<a id="MeadCoScriptXPrint.reportError"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.reportError(errorTxt)</h3>'derived' classes call this function to report errors, will either throw or report depending on value of onErrorAction.


| Param | Type | Description |
| --- | --- | --- |
| errorTxt | string | the error text to display |

<br/>
<a id="MeadCoScriptXPrint.reportServerError"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.reportServerError(errorTxt)</h3>overridable function for reporting an error. 'derived' classes call thisfunction to report errors.


| Param | Type | Description |
| --- | --- | --- |
| errorTxt | string | the error text to display ```js // overload cloud print library report error MeadCo.ScriptX.Print.reportServerError = function (errorTxt) {    app.Messages.PrintErrorBox(errorTxt); } ``` |

<br/>
<a id="MeadCoScriptXPrint.reportFeatureNotImplemented"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.reportFeatureNotImplemented(featureDescription)</h3>overridable function for reporting an implementation isnt available. 'derived' classes call thisfunction to report functions that are not yet implemented.


| Param | Type | Description |
| --- | --- | --- |
| featureDescription | string | descriptn of the feature that isnt available ```js // overload cloud print library report error MeadCo.ScriptX.Print.reportFeatureNotImplemented = function (featureDescription) {   app.Messages.PrintErrorBox(featureDescription + " is not available yet with the ScriptX.Services.\n\nThis feature will be implemented soon."); } ``` |

<br/>
<a id="MeadCoScriptXPrint.ensureSpoolingStatus"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.ensureSpoolingStatus() ⇒ object</h3>make sure that spooling status is locked active while asynchronous UI that may startprinting is displayed

**Returns**: object - a fake job to lock the spooling status on```jsvar lock = MeadCo.ScriptX.Print.ensureSpoolingStatusShowAsyncUI(function() { MeadCo.ScriptX.Print.freeSpoolStatus(lock);});```  
<br/>
<a id="MeadCoScriptXPrint.freeSpoolStatus"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.freeSpoolStatus(lock)</h3>
| Param | Type | Description |
| --- | --- | --- |
| lock | object | the lock object returned by ensureSpoolingStatus( |

<br/>
<a id="MeadCoScriptXPrint.waitForSpoolingComplete"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.waitForSpoolingComplete(iTimeout, fnComplete)</h3>Start (asynchronous) monitor to observe until no more job spooling/waiting at the serverthen call the given callback function


| Param | Type | Description |
| --- | --- | --- |
| iTimeout | int | wait until complete or timeout (in ms) -1 => infinite |
| fnComplete | function | callback function, arg is true if all jobs complete |

<br/>
<a id="MeadCoScriptXPrint.PageSize"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.PageSize</h3>**Properties**

| Name | Type | Description |
| --- | --- | --- |
| width | number | width of paper in requested units |
| height | number | height of paper in requested units |

<br/>
<a id="MeadCoScriptXPrint.Margins"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.Margins</h3>**Properties**

| Name | Type | Description |
| --- | --- | --- |
| left | number | left margin in requested units |
| top | number | top margin in requested units |
| right | number | right margin in requested units |
| bottom | number | bottom margin in requested units |

<br/>
<a id="MeadCoScriptXPrint.DeviceSettingsObject"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrint.DeviceSettingsObject</h3>Information about and the settings to use with an output printing deviceSee also: https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXServices/WebServiceAPIReference/PrintHtml/deviceinfoGET

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| printerName | string | The name of the printer |
| paperSizeName | string | The descriptive name of the papersize, e.g. "A4" |
| paperSourceName | string | The descriptive name of the paper source, e.g. "Upper tray" |
| collate | CollateOptions | The collation to use when printing |
| copies | number | The number of copies to print |
| duplex | DuplexOptions | The dulex printing option |
| paperPageSize | PageSize | The size of the paper (in requested units) |
| unprintableMargins | Margins | The margin that cannot be printed in (in requested units) |
| status | number | Status code for the status of the device |
| port | string | Printer connection port name/description |
| attributes | number | Printer attributes |
| serverName | string | Name of the server to which the printer is connected |
| shareName | string | Name of the share |
| location | string | description of the location of the printer |
| isLocal | boolean | true if the printer is local to the server |
| isNetwork | boolean | true if the server is on the network |
| isShared | boolean | true if the printer is shared |
| isDefault | boolean | true if this is the default printer on the service |
| bins | Array.&lt;string&gt; | Array of the names of the available paper sources |
| forms | Array.&lt;string&gt; | Array of the names of the avbailable paper sizes |

<br/>
<a id="MeadCoScriptXPrintHTML"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML : object</h2>MeadCo.ScriptX.Print.HTMLA static class providing printing of HTML content.Requires: meadco-core.js, meadco-scriptxprint.jsThe purpose of these libraries is to assist those with a body of client javascript code targetting use of the ScriptX Add-On for Internet Explorer. These libraries assist with continuing with a large part of the codeintact when transitioning to using ScriptX.Services instead/as well.Includes processing of calls to the print api that return "printing to file" including collecting thefile output.


* [MeadCoScriptXPrintHTML](#MeadCoScriptXPrintHTML) : object
    * [.documentContentToPrint](#MeadCoScriptXPrintHTML.documentContentToPrint)
    * [.version](#MeadCoScriptXPrintHTML.version)
    * [.PageOrientation](#MeadCoScriptXPrintHTML.PageOrientation) : enum
    * [.PageMarginUnits](#MeadCoScriptXPrintHTML.PageMarginUnits) : enum
    * [.PrintingPass](#MeadCoScriptXPrintHTML.PrintingPass) : enum
    * [.BooleanOption](#MeadCoScriptXPrintHTML.BooleanOption) : enum
    * [.frameContentToPrint(sFrame)](#MeadCoScriptXPrintHTML.frameContentToPrint) ⇒ string
    * [.printDocument(fnCallOnDone, fnCallback, data)](#MeadCoScriptXPrintHTML.printDocument) ⇒ boolean
    * [.printFrame(sFrame, fnCallOnDone, fnCallback, data)](#MeadCoScriptXPrintHTML.printFrame) ⇒ boolean
    * [.printFromUrl(sUrl, fnCallOnDone, fnCallback, data)](#MeadCoScriptXPrintHTML.printFromUrl) ⇒ boolean
    * [.printHtml(sHtml, fnCallOnDone, fnCallback, data)](#MeadCoScriptXPrintHTML.printHtml) ⇒ boolean
    * [.connectLite(serverUrl, licenseGuid)](#MeadCoScriptXPrintHTML.connectLite)
    * [.connect(serverUrl, licenseGuid)](#MeadCoScriptXPrintHTML.connect)
    * [.connectAsync(serverUrl, licenseGuid, resolve, reject)](#MeadCoScriptXPrintHTML.connectAsync)
    * [.Margins](#MeadCoScriptXPrintHTML.Margins)
    * [.PageSettings](#MeadCoScriptXPrintHTML.PageSettings)
    * [.ExtraHeaderAndFooterSettings](#MeadCoScriptXPrintHTML.ExtraHeaderAndFooterSettings)
    * [.Settings](#MeadCoScriptXPrintHTML.Settings)

<br/>
<a id="MeadCoScriptXPrintHTML.documentContentToPrint"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.documentContentToPrint</h3>Get the complete currently displayed document as string of HTML.Form values are preserved in the source document then the document cloned.A base element is created if required.style elements are included.script and object elements are not included.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| documentContentToPrint | string | the current content in the window document as html |

<br/>
<a id="MeadCoScriptXPrintHTML.version"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.version</h3>Get the version of this module as a string major.minor.hotfix.build

**Properties**

| Name | Type |
| --- | --- |
| version | string | 

<br/>
<a id="MeadCoScriptXPrintHTML.PageOrientation"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.PageOrientation : enum</h3>Enum to describe the orientation of the paper

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DEFAULT | number | 0 use the default at the print server |
| LANDSCAPE | number | 1 |
| PORTRAIT | number | 2 |

<br/>
<a id="MeadCoScriptXPrintHTML.PageMarginUnits"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.PageMarginUnits : enum</h3>Enum to describe the units used on measurements

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DEFAULT | number | 0 use the default at the print server |
| MM | number | 1 millimeters |
| INCHES | number | 2 |

<br/>
<a id="MeadCoScriptXPrintHTML.PrintingPass"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.PrintingPass : enum</h3>Enum to describe the pages to be printed

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ALL | number | 1 print all pages |
| ODD | number | 2 print odd numbered pages only |
| EVEN | number | 3 print even numbered pages only |

<br/>
<a id="MeadCoScriptXPrintHTML.BooleanOption"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.BooleanOption : enum</h3>Enum to describe a boolean value or use the default

**Read only**: true  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DEFAULT | number | 0 use the default at the print server |
| TRUE | number | 1 |
| FALSE | number | 2 |

<br/>
<a id="MeadCoScriptXPrintHTML.frameContentToPrint"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.frameContentToPrint(sFrame) ⇒ string</h3>Get the complete currently displayed document in a frame as string of HTML.Form values are preserved in the source document then the document cloned.A base element is created if required.style elements are included.script and object elements are not included.


| Param | Type | Description |
| --- | --- | --- |
| sFrame | string | the name of the frame |

**Returns**: string - the current content in the frame window document as html  
<br/>
<a id="MeadCoScriptXPrintHTML.printDocument"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.printDocument(fnCallOnDone, fnCallback, data) ⇒ boolean</h3>Print the complete current document in the window using the settings made by property updates before this function is called.


| Param | Type | Description |
| --- | --- | --- |
| fnCallOnDone | function | function to call when printing complete (and output returned), arg is null on no error, else error message. |
| fnCallback | function | function to call when job status is updated |
| data | any | object to give pass to fnCallback |

**Returns**: boolean - - true if a print was started (otherwise an error will be thrown)  
<br/>
<a id="MeadCoScriptXPrintHTML.printFrame"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.printFrame(sFrame, fnCallOnDone, fnCallback, data) ⇒ boolean</h3>Print the complete current document in the named iframe using the settings made by property updates before this function is called.


| Param | Type | Description |
| --- | --- | --- |
| sFrame | string | the name of the iframe whose content is to be printed. |
| fnCallOnDone | function | function to call when printing complete (and output returned), arg is null on no error, else error message. |
| fnCallback | function | function to call when job status is updated |
| data | any | object to give pass to fnCallback |

**Returns**: boolean - - true if a print was started (otherwise an error will be thrown)  
<br/>
<a id="MeadCoScriptXPrintHTML.printFromUrl"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.printFromUrl(sUrl, fnCallOnDone, fnCallback, data) ⇒ boolean</h3>Print the document obtained by downloading the given url using the settings made by property updates before this function is called.


| Param | Type | Description |
| --- | --- | --- |
| sUrl | string | the fully qualified url to the document to be printed. |
| fnCallOnDone | function | function to call when printing complete (and output returned), arg is null on no error, else error message. |
| fnCallback | function | function to call when job status is updated |
| data | any | object to give pass to fnCallback |

**Returns**: boolean - - true if a print was started (otherwise an error will be thrown)  
<br/>
<a id="MeadCoScriptXPrintHTML.printHtml"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.printHtml(sHtml, fnCallOnDone, fnCallback, data) ⇒ boolean</h3>Print the fragment of html using the settings made by property updates before this function is called.


| Param | Type | Description |
| --- | --- | --- |
| sHtml | string | fragment/snippet of html to print, must be complete HTML document. |
| fnCallOnDone | function | function to call when printing complete (and output returned), arg is null on no error, else error message. |
| fnCallback | function | function to call when job status is updated |
| data | any | object to give pass to fnCallback |

**Returns**: boolean - - true if a print was started (otherwise an error will be thrown)  
<br/>
<a id="MeadCoScriptXPrintHTML.connectLite"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.connectLite(serverUrl, licenseGuid)</h3>Specify the server and the subscription/license id to use on AJAX calls. No call is made in this function


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |

<br/>
<a id="MeadCoScriptXPrintHTML.connect"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.connect(serverUrl, licenseGuid)</h3>Specify the server to use and the subscription/license id. Attempt to connect to the defined ScriptX.Services server and obtaindefault soft html and device settings for the default device as well as the listof available printers. This call is synchronous and therefore not recommended. Use connectAsync()


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |

<br/>
<a id="MeadCoScriptXPrintHTML.connectAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.connectAsync(serverUrl, licenseGuid, resolve, reject)</h3>Specify the server to use and the subscription/license id. Attempt to connect to the defined ScriptX.Services server and obtaindefault soft html and device settings for the default device as wll as the listof available printers.


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| licenseGuid | string | the license/subscription identifier |
| resolve | function | function to call on success |
| reject | function | function to call on failure |

<br/>
<a id="MeadCoScriptXPrintHTML.Margins"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.Margins</h3>**Properties**

| Name | Type | Description |
| --- | --- | --- |
| left | number | left margin in requested units |
| top | number | top margin in requested units |
| right | number | right margin in requested units |
| bottom | number | bottom margin in requested units |

<br/>
<a id="MeadCoScriptXPrintHTML.PageSettings"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.PageSettings</h3>**Properties**

| Name | Type | Description |
| --- | --- | --- |
| orientation | PageOrientation | orientation of the paper (size and source is a device setting) |
| units | PageMarginUnits | measurement units for margins |
| margins | Margins | margins to use |

<br/>
<a id="MeadCoScriptXPrintHTML.ExtraHeaderAndFooterSettings"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.ExtraHeaderAndFooterSettings</h3>**Properties**

| Name | Type |
| --- | --- |
| allPagesHeader | string | 
| allPagesFooter | string | 
| firstPageHeader | string | 
| firstPageFooter | string | 
| extraFirstPageFooter | string | 
| allHeaderHeight | number | 
| allFooterHeight | number | 
| firstHeaderHeight | number | 
| firstFooterHeight | number | 
| extraFirstFooterHeight | number | 

<br/>
<a id="MeadCoScriptXPrintHTML.Settings"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintHTML.Settings</h3>The soft settings to use when printing html content - headers, footers and margins(Device settings such as papersize, printer are described with MeadCo.ScriptX.Print.deviceSettings)

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| header | string | Page header for all pages. |
| footer | string | Page footer for all pages. |
| headerFooterFont | string | description of font to use for header/footer |
| viewScale | number | the scaling to use when printing expressed as a percentage. -1 => scale to fit |
| locale | string | language/locale - used for formatting date/time values in header/footer. defaults to client browser setting |
| timezoneOffset | number | client browser timezone offset so server will print correct time |
| shortDateFormat | string | formating string for short dates, if not provided then uses the locale default, or the server default |
| longDateFormat | string | formating string for long dates, if not provided then uses the locale default, or the server default |
| printBackgroundColorsAndImages | BooleanOption | True if background colours and images are to be printed. |
| page | PageSettings | orientation and margins to use on the paper |
| extraHeadersAndFooters | ExtraHeaderAndFooterSettings | enhanced headers and footers |
| pageRange | string | the (set of) page ranges to print, if empty, print all. |
| printingPass | PrintingPass | print all, or odd or even only? |
| jobTitle | string | description to use on the job in the print queue |
| documentUrl | string | the document url to use in headers and footers |

<br/>
<a id="MeadCoScriptXPrintLicensing"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing : object</h2>MeadCo.ScriptX.Print.LicensingA static class wrapping calls to the server API to install / manage a client license for ScriptX.Services for Windows PC. The purpose of these libraries is to assist those with a body of client javascript code targetting use of the ScriptX Add-On for Internet Explorer. These libraries assist with continuing with a large part of the codeintact when transitioning to using ScriptX.Services instead/as well.This module is only required when working with ScriptX Services for Windows PC.A license must be 'applied' to the current html document/window before calls to printing APIs that use the license can be made.This module is NOT required when working with Cloud or On Premise services as the licenseinstallation and management occurs at the server. Requires: meadco-core.js


* [MeadCoScriptXPrintLicensing](#MeadCoScriptXPrintLicensing) : object
    * [.version](#MeadCoScriptXPrintLicensing.version)
    * [.result](#MeadCoScriptXPrintLicensing.result)
    * [.validLicense](#MeadCoScriptXPrintLicensing.validLicense)
    * [.License](#MeadCoScriptXPrintLicensing.License)
    * [.connect(serverUrl, slicenseGuid)](#MeadCoScriptXPrintLicensing.connect)
    * [.connectLite(serverUrl, slicenseGuid, revision, path)](#MeadCoScriptXPrintLicensing.connectLite)
    * [.apply(licenseGuid, revision, path)](#MeadCoScriptXPrintLicensing.apply) ⇒ license
    * [.applyAsync(licenseGuid, revision, path, resolve, reject)](#MeadCoScriptXPrintLicensing.applyAsync)
    * [.GetLicenseAsync(resolve, reject)](#MeadCoScriptXPrintLicensing.GetLicenseAsync)
    * [.LicenseOptions](#MeadCoScriptXPrintLicensing.LicenseOptions)
    * [.license](#MeadCoScriptXPrintLicensing.license)

<br/>
<a id="MeadCoScriptXPrintLicensing.version"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.version</h3>Get the version of this module as a string major.minor.hotfix.build

**Properties**

| Name | Type |
| --- | --- |
| version | string | 

<br/>
<a id="MeadCoScriptXPrintLicensing.result"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.result</h3>Get the result code for the last attempt to apply a license.Basically faked for the benefit of code compatibility with the add-on

**Properties**

| Name | Type |
| --- | --- |
| result | number | 

<br/>
<a id="MeadCoScriptXPrintLicensing.validLicense"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.validLicense</h3>Get whether a license has been applied successfully

**Properties**

| Name | Type |
| --- | --- |
| validLicense | boolean | 

<br/>
<a id="MeadCoScriptXPrintLicensing.License"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.License</h3>Get the details on the connected license. If it hasnt been applied yet, then queryfor the details (but dont apply it and connectLite() MUST have been called).Warning this function is synchronous, GetLicenseAsync() should be used.

**Properties**

| Name | Type |
| --- | --- |
| License | license | 

<br/>
<a id="MeadCoScriptXPrintLicensing.connect"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.connect(serverUrl, slicenseGuid)</h3>Specify the server to use and the license Guid.


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| slicenseGuid | string | the license GUID as provided by MeadCo. Optional unless will call GetLicenseAsync() without calling apply |

<br/>
<a id="MeadCoScriptXPrintLicensing.connectLite"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.connectLite(serverUrl, slicenseGuid, revision, path)</h3>Specify the server to use and the license Guid in order to get details on the license via the License propertyor function GetLicenseAsync()


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | string | the 'root' url to the server (the api path will be added by the library) |
| slicenseGuid | string | the license GUID as provided by MeadCo. Optional unless will call GetLicenseAsync() without calling apply |
| revision | number | the revision number of the licsnse as provided by MeadCo. |
| path | string | fully qualified path to the license file (.mlf file). Use the value 'warehouse' to download from the public MeadCo License warehouse |

<br/>
<a id="MeadCoScriptXPrintLicensing.apply"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.apply(licenseGuid, revision, path) ⇒ license</h3>Apply (make usable) the MeadCo ScriptX Client license for use with this content. If the license is not already cached it will be downloaded and cached. It is strongly suggested you request that the silent option is enabled in the license (it is by default for ScriptX.Services for Windows PC licenses)The license must list the url of the content to which it is being applied.This call is synchronous and therefore not recommended. Use applyAsync()


| Param | Type | Description |
| --- | --- | --- |
| licenseGuid | string | the license GUID as provided by MeadCo. |
| revision | number | the revision number of the licsnse as provided by MeadCo. |
| path | string | fully qualified path to the license file (.mlf file). Use the value 'warehouse' to download from the public MeadCo License warehouse |

**Returns**: license - details the license that was sucessfully applied, null if none available  
<br/>
<a id="MeadCoScriptXPrintLicensing.applyAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.applyAsync(licenseGuid, revision, path, resolve, reject)</h3>Apply (make usable) the MeadCo ScriptX Client license for use with this content. If the license is not already cached it will be downloaded and cached.It is strongly suggested you request that the silent option is enabled in the license (it is by default for ScriptX.Services for Windows PC licenses)The license must list the url of the content to which it is being applied.


| Param | Type | Description |
| --- | --- | --- |
| licenseGuid | string | the license GUID as provided by MeadCo. |
| revision | number | the revision number of the licsnse as provided by MeadCo. |
| path | string | fully qualified path to the license file (.mlf file). Use the value 'warehouse' to download from the public MeadCo License warehouse |
| resolve | function | function to call on success |
| reject | function | function to call on failure with reason for failure |

<br/>
<a id="MeadCoScriptXPrintLicensing.GetLicenseAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.GetLicenseAsync(resolve, reject)</h3>Get the details on the connected license. If it hasnt been applied yet, then queryfor the details (but dont apply it and connectLite() MUST have been called).


| Param | Type | Description |
| --- | --- | --- |
| resolve | function | function to call on success |
| reject | function | function to call on failure with reason for failure |

<br/>
<a id="MeadCoScriptXPrintLicensing.LicenseOptions"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.LicenseOptions</h3>The capabilities that can be licensed.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| basicHtmlPrinting | boolean | True if Add-on compatible basic html printing is available (always true) |
| advancedPrinting | boolean | True if Add-on compatible advanced html printing features are available |
| enhancedFormatting | boolean | True if Add-on compatible enhanced formatting is available |
| printPdf | boolean | True if printing PDF files is available |
| printRaw | boolean | True if Raw printing is available |

<br/>
<a id="MeadCoScriptXPrintLicensing.license"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    MeadCoScriptXPrintLicensing.license</h3>License details

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| guid | string | The unique id of the license |
| company | string | The name of the license owner |
| companyHomePage | string | Url of company home page |
| from | Date | Date license is valid from |
| to | Date | Date license is vaid till |
| options | LicenseOptions | The options enabled by the license |
| domains | Array.string | the domains the license can be used from |

<br/>
<a id="secmgr"></a>
<h2 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    secmgr : object</h2>MeadCo ScriptX 'window.secmgr' shim (support for modern browsers and IE 11) JS client libraryThe MeadCo Security Manager Add-on for Internet Explorer is included on a html document with an &lt;object id='secmgr' /&gt; element with a de-facto standard id of 'secmgr'.The object is referenced with the property window.secmgr which exposes properties and methods.The MeadCo Security Manager Add-on for Internet Explorer provided for prompting the user to accept use of the license that enabled advanced features of ScriptX.Add-on. Frequentlythere was then no further reference to Security Manager and in such cases this shim is not required.This use case can be emulated by using appropriate attributes on an element (for example a &lt;script&gt;&lt;/script&gt;) on the page and including meadco-scriptxprint.js to process the attributes. This shim is then *not* required.Please note that when working with ScriptX.Services for Windows PC meadco-scriptxprintlicensing.js is required even with the use of attributes.This shim is required if you have code that relies upon being able to inspect the availability of a license.Full documentation on the properties/methods is provided by the technical reference documentation for the ScriptX Add-on for Internet Explorer: https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn/secmgr. That documentation is not reproduced here.If the startup script determines that the MeadCo Security Manager Add-on for IE is already active then it will quietly give priority to the object. In other words, the Add-on has precedence on Internet Explorer.This enables the same experience (almost) to be delivered to any browser on any device with the same html/javascript code.It is strongly recommended that the MeadCoScriptJS library (https://github.com/MeadCo/MeadCoScriptXJS) is used in conjunction with this library as it provides code (Promises) to assistwith working with the significant difference between the synchronous nature of the functions of ScriptX.Add-on (which hide the underlying asynchrony) and the asynchronous nature of javascript AJAX processing. Requires:  meadco-core.js meadco-scriptxprint.js meadco-scriptxprintlicensing.js


* [secmgr](#secmgr) : object
    * [.version](#secmgr.version)
    * [.GetLicenseAsync(resolve, reject)](#secmgr.GetLicenseAsync)

<br/>
<a id="secmgr.version"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    secmgr.version</h3>Get the version of this module as a string major.minor.hotfix.build

**Properties**

| Name | Type |
| --- | --- |
| version | string | 

<br/>
<a id="secmgr.GetLicenseAsync"></a>
<h3 style="margin: 10px 0px; border-width: 0 0 2px 0; padding: 5px 5px 0px 5px; border-style: solid; border-color: #ede9e9">
    secmgr.GetLicenseAsync(resolve, reject)</h3>Get the details of the license using Asynchronous calls to the server.See meadco-scriptxprintlicensing.js for more detail


| Param | Type | Description |
| --- | --- | --- |
| resolve | function | function to call on successfulk completion |
| reject | function | function to call on failure with reason for failure |

