## MeadCo ScriptX.Services Client Library

<p align="center">
	<a href="https://github.com/MeadCo/ScriptX.Print.Client/releases/latest" target="_blank">
        <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/MeadCo/ScriptX.Print.Client">
    </a>
	<a href="https://www.npmjs.com/package/scriptxprint-html" target="_blank">
		<img alt="npm" src="https://img.shields.io/npm/v/scriptxprint-html">
	</a>
	<a href="https://www.nuget.org/packages/MeadScriptXPrintHtml" target="_blank">
        <img alt="Nuget" src="https://img.shields.io/nuget/v/MeadScriptXPrintHtml">
    </a>
	<br>
	<a href="https://github.com/MeadCo/ScriptX.Print.Client/blob/master/LICENSE" target="_blank">
		<img alt="MIT License" src="https://img.shields.io/github/license/MeadCo/ScriptX.Print.Client">
	</a>
</p>

The MeadCo ScriptX.Services Client Library offers an emulation of the MeadCo’s ScriptX Add-on 
for Internet Explorer on Windows, extending its functionality to any browser on any device. 
This is achieved by integrating with [MeadCo ScriptX.Services](https://www.meadroid.com/scriptx-services/), which can be located:

* in the cloud at [scriptxservices.meadroid.com](https://scriptxservices.meadroid.com)
* an on premise Microsoft Windows (x64) Server
* a Microsoft Windows 10 or later x64 PC 

When used in conjunction with the MeadCoScriptXJS library, this emulation ensures a high degree 
of compatibility with in-browser scripts originally written for the ScriptX.Add-on. 
This allows the same code to be executed with either the ScriptX.Add-on for Internet Explorer or ScriptX Services, depending on the client device/browser.

This library enables applications that previously relied on the ScriptX.Addon for Internet Explorer to be updated to function with evergreen browsers, without necessitating a significant re-write. While much of the existing code will continue to operate unmodified, some code may require updates. A comprehensive discussion outlines the few potential challenges.

Our extensive set of [samples](https://scriptxprintsamples.meadroid.com) demonstrates the use of the library.

The primary motivation for developing this library was to facilitate a seamless transition for ‘old but valuable code’ to function in evergreen browsers. When used in combination with the MeadCoScriptXJS library, it also provides a quick start to modern coding practices with client-side queue management.

#### From version 1.15 onwards, there is no dependency on jQuery.

## Packages 

### NPM Use

```
npm install scriptxprint-html --save
```

### Example CDN Use
<p>
    <br/>
	<a href="https://www.jsdelivr.com/package/npm/scriptxprint-html" target="_blank">
		<img alt="jsDelivr hits (npm)" src="https://img.shields.io/jsdelivr/npm/hm/scriptxprint-html">
	</a>
</p>

For the complete library supporting Cloud, On Premise and Windows PC services:

```javascript
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.15/dist/meadco-scriptxservices.min.js"></script>
```

Or, for print only to cloud/on premise services,

```javascript
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.15/dist/meadco-scriptxservicesprint.min.js"></script>
```

### Nuget Gallery

[MeadCo ScriptX.Print Services Library](https://www.nuget.org/packages/MeadScriptXPrintHtml/)

## Quick start with ScriptX.Services for Microsoft Windows PC

1. [Download and install ScriptX.Services for Microsoft Windows (x64) PC](https://www.meadroid.com/Downloads/ScriptXServices/Download)
2. Link to the required libraries with service connection details
3. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
4. Initialise print parameters

```javascript
<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- Use an evaluation license id for the value of data-meadco-license : the current id can be found here https://support.meadroid.com/deploy/services/ -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="http://127.0.0.1:41991" 
        data-meadco-license="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        data-meadco-license-path="warehouse"
        data-meadco-license-revision="0"
        data-meadco-syncinit="false"
        ></script>

<script type="text/javascript">
   window.addEventListener("load",async () => {
      try {
       await MeadCo.ScriptX.InitAsync();
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";

       document.getElementById("btnprint").addEventListener("click",async () => {
            MeadCo.ScriptX.PrintPage(false);

            await MeadCo.ScriptX.WaitForSpoolingComplete();

            window.location.href = "MenuStart.html";
       });
      }
      catch (e) {
        console.error("Error on load",e);
      }
   });
</script>
```

Or, if using jQuery :

```javascript
<!-- ScriptX Services client emulation libraries optionally use jQuery. It is not a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- .Addon emulation, connect to server with publishing license id. -->
<!-- Use an evaluation license id for the value of data-meadco-license : the current id can be found here https://support.meadroid.com/deploy/services/ -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="http://127.0.0.1:41991" 
        data-meadco-license="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        data-meadco-license-path="warehouse"
        data-meadco-license-revision="0"
        data-meadco-syncinit="false"
        ></script>

<script type="text/javascript">
   $(window).on('load', function () {
     MeadCo.ScriptX.InitAsync().then(function {
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";
       $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
       });
     })      
   });
</script>
```

## Quick start - ScriptX.Services on Cloud for any browser

1. [Sign up for a subscription identifier](https://scriptxservices.meadroid.com/CloudService/Signup)
2. Link to the required libraries with service connection details
3. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
4. Initilise print parameters

```javascript

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- Use an evaluation license id for the value of data-meadco-license : the current id can be found here https://support.meadroid.com/deploy/services/ -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="https://scriptxservices.meadroid.com" 
        data-meadco-subscription="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        data-meadco-syncinit="false"
        ></script>

<script type="text/javascript">
   window.addEventListener("load",async () => {
      try {
       await MeadCo.ScriptX.InitAsync();

       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";

       document.getElementById("btnprint").adEventListener("click",async () => {
            MeadCo.ScriptX.PrintPage(false);

            await MeadCo.ScriptX.WaitForSpoolingComplete();

            window.location.href = "MenuStart.html";
       });
      }
      catch (e) {
        console.error("Error on load",e);
      }
   });
</script>
```

Or, if using jQuery :

```javascript

<!-- ScriptX Services client emulation libraries optionally use jQuery. It is not a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- .Addon emulation, connect to cloud server with registered use id. -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="https://scriptxservices.meadroid.com" 
        data-meadco-subscription="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        data-meadco-syncinit="false"
        ></script>

<script type="text/javascript">
   $(window).on('load', function () {
     MeadCo.ScriptX.InitAsync().then(function {
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";
       $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
       });
     })      
   });
</script>
```

## Quick start - ScriptX.Services On Premise

1. [Download and install ScriptX.Services for On Premise Devices](https://www.meadroid.com/Downloads/ScriptXServices/Download)
2. Request and install an evaluation license
3. Link to the required libraries with service connection details
4. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
5. Initilise print parameters

Remove all references to ScriptX.Addon (i.e. the &lt;object /&gt; elements as ScriptX.Addon can only print to locally installed printers).

A promise polyfill is required if the browser does not support promises (for example Internet Explorer). 
We recommend (and test with) [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)


```javascript
<!-- ScriptX Services client emulation libraries optionally use jQuery. It is not a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- .Addon code emulation, connect to on premnie server, no subscription id is required as it is the srver that is licensed.
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="http://<yourlocalserver>/scriptxservices/" 
        data-meadco-subscription=""></script>

<script type="text/javascript">
   $(window).on('load', function () {
     MeadCo.ScriptX.InitAsync().then(function {
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";
       $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
       });
     })      
   });
</script>
```


### Resources

* [ScriptX.Services Client Library Reference](https://meadco.github.io/ScriptX.Print.Client)

* [MeadCoScriptXJS Library Reference](https://meadco.github.io/MeadCoScriptXJS)

* [Getting Started with ScriptX.Services](https://www.meadroid.com/Developers/KnowledgeBank/HowToGuides/ScriptXServices/GettingStarted)

* [ScriptX Add-on for Internet Explorer API reference](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).

* [ScriptX.Services on Cloud](https://scriptxservices.meadroid.com/)

* [ScriptX Services Samples - Cloud, On Premise, for Windows PC](https://scriptxprintsamples.meadroid.com/) the samples make use of MeadCoScriptXJS and ScriptX.Services.Client to deliver samples that work in any scenario with the same code.

### License

Released under the [MIT](http://opensource.org/licenses/MIT) license. 

Copyright (c) 2017-2024, Mead & Co Limited.





