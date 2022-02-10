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

The MeadCo ScriptX.Services Client Library brings an emulation of MeadCo's ScriptX Add-on for Internet Explorer on (x86) Windows to any browser on any device by
working with [MeadCo ScriptX.Services](https://www.meadroid.com/Features/ScriptXServices) where-ever the service may be:

* in the cloud at [scriptxservices.meadroid.com](https://scriptxservices.meadroid.com)
* an on premise Microsoft Windows (x64) Server
* a Microsoft Windows x64 PC 

In combination with the [MeadCoScriptXJS library](https://github.com/MeadCo/MeadCoScriptXJS) the emulation provides 
significant levels of compatibility with in-browser script written for ScriptX.Add-on and allows the same code to run with either ScriptX.Add-on for Internet Explorer or ScriptX Services depending on the client device/browser. 

It may also be used 'stand-alone' although the code is not very modern due to the requirement to support older versions of Internet Explorer.

The library is used by our extensive set of [samples](https://scriptxprintsamples.meadroid.com). 

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
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.10.1/dist/meadco-scriptxservices.min.js"></script>
```

Or, for print only to cloud/on premise services,

```javascript
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.10.1/dist/meadco-scriptxservicesprint.min.js"></script>
```

### Nuget Gallery

[MeadCo ScriptX.Print Services Library](https://www.nuget.org/packages/MeadScriptXPrintHtml/)

## Quick start - ScriptX.Services for Microsoft Windows PC

1. [Download and install ScriptX.Services for Microsoft Windows (x64) PC](https://www.meadroid.com/Downloads/ScriptXServices/Download)
2. Link to the required libraries with service connection details
3. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
4. Initilise print parameters

The same code will work when the Add-on is present, but the add-on will be used in preference.

A promise polyfill is required if the browser does not support promises (for example Internet Explorer). 
We recommend (and test with) [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)


```javascript
<!-- ScriptX Services client emulation libraries - depend on jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- Promise polyfill for IE -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- .Addon emulation, connect to server with publishing license id. -->
<!-- Use an evaluation license id for the value of data-meadco-license -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="http://127.0.0.1:41991" 
        data-meadco-license="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></script>

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

Remove all references to ScriptX.Addon (i.e. the &lt;object /&gt; elements as ScriptX.Addon can only print to locally installed printers).

A promise polyfill is required if the browser does not support promises (for example Internet Explorer). 
We recommend (and test with) [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)

```javascript
<!-- ScriptX Services client emulation libraries - depend on jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- Promise polyfiull for IE -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- .Addon emulation, connect to cloud server with registered use id. -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="https://scriptxservices.meadroid.com" 
        data-meadco-subscription="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></script>

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
<!-- ScriptX Services client emulation libraries - depend on jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- Promise polyfiull for IE -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>

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

Copyright (c) 2017-2021, Mead & Co Limited.





