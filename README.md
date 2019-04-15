## MeadCo ScriptX Service Client Library

The MeadCo ScriptX Service Client Library brings an emulation of MeadCo's ScriptX Add-on for Internet Explorer on Windows to 
working with [MeadCo ScriptX Services](https://www.meadroid.com/Features/ScriptXServices) in any browser on any device and where-ever the service may be:

* [in the cloud](https://scriptxservices.meadroid.com)
* an on premise server
* web service on a Microsoft Windows PC

In combination with the [MeadCoScriptXJS library](https://github.com/MeadCo/MeadCoScriptXJS) the emulation provides 
significant levels of compatibility with in-browser script written for the Add-on so allowing the same code to run with either the Add-on for Internet Explorer or ScriptX Services depending on the client device. 
It may also be used 'stand-alone' although the code is not very modern due to the requirement to support older versions of Internet Explorer.

The library is used by our extensive set of [samples](https://scriptxprintsamples.meadroid.com). 

## Current Version

1.5.6

## Packages 

### NPM Use

```
npm install scriptxprint-html --save
```

### CDN Use

For the complete library supporting Cloud, On Premise and Windows PC services:

```javascript
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.5.6/dist/meadco-scriptxservices.min.js"></script>
```

Or, for print only to cloud/on premise services,

```javascript
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.5.6/dist/meadco-scriptxservicesprint.min.js"></script>
```

#### Distribution packages

Some minimised collections are provided:

| Name | Purpose |
|---|---|
| meadco-scriptxservicesprint.min.js | All core modules print including window.factory emulation. No UI modules are included nor support for licensing for ScriptX Services on Windows PC.  |
| meadco-scriptxservicesprintUI.min.js | As above but includes Page and Print setup UI dialogs.  |
| meadco-scriptxservices.min.js | All modules including window.factory and window.secmgr emulation to support licensing for ScriptX Services on Windows PC. No UI modules are included. |
| meadco-scriptxservicesUI.min.js | As above but includes Page and Print setup UI dialogs.  |
| meadco-scriptxserviceslicensing.min.js | window.secmgr emulation support for licensing for ScriptX Services on Windows PC. |

### Nuget Gallery

[MeadCo ScriptX.Print Services Library](https://www.nuget.org/packages/MeadScriptXPrintHtml/)

## Quick start - ScriptX.Services on Cloud for any browser

1. Link to the required libraries with service connection details
2. Initialise the library
3. Initilise print parameters

The same code will work when the Add-on is present, but the add-on will be used in preference.

A promise polyfill is required if the browser does not support promises (for example Internet Explorer). 
We recommend (and test with) [Promise Polyfill](https://github.com/taylorhakes/promise-polyfill)

```javascript
<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1.5.1/src/meadco-scriptx.min.js"></script>

<!-- ScriptX Services client emulation libraries - depend on jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.1.1/dist/jquery.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.5.4/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="https://scriptxservices.meadroid.com" 
        data-meadco-license="xxx-xxx-xxxxxxx-xxx"></script>

<!-- A promise library will be required if targetting IE. -->
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

* [API Reference](docs/readme.md)

* [ScriptX.Services Client Library getting started and API reference book](https://meadco.gitbooks.io/meadco-scriptx-print-client/).

* [ScriptX Add-on for Internet Explorer API reference](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).

* [ScriptX.Services on Cloud](https://scriptxservices.meadroid.com/)

* [ScriptX Services Samples - Cloud, On Premise, for Windows PC](https://scriptxprintsamples.meadroid.com/) the samples make use of MeadCoScriptXJS and ScriptX.Services.Client to deliver samples that work in any scenario with the same code.

### License

Released under the [MIT](http://opensource.org/licenses/MIT) license. 

Copyright (c) 2017-2019, Mead & Co Limited.





