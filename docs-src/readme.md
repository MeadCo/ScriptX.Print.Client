### Current Version : 1.15.1

The MeadCo ScriptX.Services project revolutionizes the control of printing for browser-based content across all browsers and devices, 
eliminating the need for a binary add-on.

The MeadCo ScriptX.Services Client Library provides a dual-purpose solution: a structured library for interfacing with 
the [ScriptX.Services API](https://support.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXServices), and an emulation of MeadCo’s ScriptX.Add-on for Internet Explorer on Windows.

In a binary-free environment, the ScriptX.Services Client Library serves as the JavaScript libraries that bridge the gap between client
devices and the server system. This system provides printing services, regardless of the server’s location:

* in the cloud at [scriptxservices.meadroid.com](https://scriptxservices.meadroid.com)
* an on premise Microsoft Windows (x64) Server
* a Microsoft Windows x64 PC 

The primary objective of these libraries is to aid those with a substantial amount of client JavaScript code targeting the use of the 
ScriptX Add-On for Internet Explorer. These libraries facilitate a smooth transition to using ScriptX.Services, with a large portion 
of the original code remaining intact.

When used in conjunction with the [MeadCoScriptXJS library](https://github.com/MeadCo/MeadCoScriptXJS) an emulation of the ScriptX Add-on API
is provided. This delivers significant levels of compatibility with in-browser scripts written for the Add-on, allowing the same code to run 
with either the Add-on for Internet Explorer or ScriptX Services, depending on the client device.

The library is also exemplary for use in modern settings, with support for “async” as many APIs return promises. In these cases, users have numerous choices regarding how deep into the library structure they find useful.

#### A Note on Browsers and Devices

The libraries are developed for ‘evergreen’ browsers. As of v1.15, Internet Explorer is no longer actively tested or supported.

However, MeadCo ScriptX.Add-on continues to be available and supports Internet Explorer. JavaScript code in this scenario will be utilizing the ‘window.factory’ object.

By using a compatibility layer written in JavaScript, the same code can be brought to more modern browsers. This is, of course, provided that the HTML that renders successfully in the older browser also renders correctly in modern browsers.

The ScriptX.Services Client libraries are self-sufficient and do not depend on anything other than themselves. We understand that our 
clients are diverse and may have dependencies on many libraries. We aim not to work against those choices but to work in harmony with them.

## Architectural Overview

### Background

ScriptX.Addon (a COM/ActiveX object) appears to script code in the browser (Internet Explorer) as the object &quot;window.factory&quot; (assuming that the de-facto standard id of &quot;factory&quot; has been used on the ScriptX &lt;object /&gt; element). From this object, the object &quot;printing&quot; is available, leading to code such as this:

```javascript
factory.printing.header = "";
factory.printing.footer = "";
factory.printing.Print(false);
```

The extensive API of properties and methods is documented [here](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).

#### MeadCoScriptXJS Library

In addition to the ScriptX.Addon API a [javascript library](https://github.com/MeadCo/MeadCoScriptXJS) was developed to extend the API with convenience functions. Started in 2013, this library took the 
approach of &quot;namespaces&quot; / static classes, which were popular(-ish) then as a means of ensuring no clashes of names etc. A significant amount of code has 
been written that relies upon this library. By definition there is only ever one instance of ScriptX.Addon on a page and therefore a static singleton javascript 'class' instance
is perfectly adequate.

It is also known and acknowleged that much code utilising ScriptX.Addon predates React, Angular, Vue etc. etc. and exists in a world of relatively un-complex page operations; a "print button" and some code to 
set print parameters and then print (though the back-end code generating HTML to be printed was likely complex and comprehensive).

This library implemented the following static objects/classes:

* MeadCo
* MeadCo.ScriptX
* MeadCo.ScriptX.Utils
* MeadCo.ScriptX.Printing
* MeadCo.Licensing
* MeadCo.Licensing.LicMgr

The &quot;trick&quot; here was that MeadCo.ScriptX.Utils was pointed to &quot;factory&quot;, MeadCo.ScriptX.Printing was pointed to &quot;factory.printing&quot; and MeadCo.Licensing.LicMgr pointed to &quot;secmgr&quot;.

MeadCo.ScriptX.Printing therefore exposed the entire [printing API](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn/printing).

MeadCo.ScriptX is an object providing for verified initialisation and a number of functions that wrapped common operations into a simpler API. So, for example (using jQuery):

````javascript
<script type="text/javascript">
   $(window).on('load', function () {
     if ( MeadCo.ScriptX.Init() (
     {
        $("#info").text("ScriptX version: " + MeadCo.ScriptX.GetComponentVersion("scriptx.factory"));
        MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
        MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
        MeadCo.ScriptX.Printing.orientation = "landscape";
        $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
     }      
   });
</script>
````

The final &quot;trick&quot; is that if MeadCo.ScriptX.Printing is pointed to an implementation of the .Addon API in javascript and that implementation uses the ScriptX.Services API to perform printing then code using the MeadCoScriptXJS library will work 
with .Addon and .Services with no changes in simple cases and few changes in more complex cases.

### Support for .Addon Emulation in ScriptX.Services

The MeadCo ScriptX.Service Client Library implements a heirarchy of static 'classes' (or singleton object instances!) at the bottom of which is an implementation of
the .Addon API (factory, factory.printing et al) in javascript. The implementation
is necessarily imperfect. In particular the support for synchronous coding with the ubiquitous WaitFortSpoolingComplete() API is impossible to emulate 
fully in javascript (the only possible way to attempt an eumulation causes blocking in the browser via 
synchronous AJAX which is deeply unsatisfactory and so is not implemented). 

Such imperfections are **smoothed** by use of the MeadCoScriptXJS library which provides a layer to hide the differences betweeen .Addon and .Services and so enable a single code base. For example there
is an implementation of the WaitFortSpoolingComplete() API which returns a Promise. This in turn enables the use of ````await MeadCo.ScriptX.WaitForSpoolingComplete();```` - obviously this must be within 
an async block so some re-coding is required.

Note that the [MeadCoScriptXJS](https://github.com/MeadCo/MeadCoScriptXJS) library does **not have to be used**. In its absense, meadco-scriptxfactory.js and its dependencies on the hierarchy implement a reasonable and usable emulation of &quot;factory.printing&quot; though functionality such as WaitForSpoolingComplete is not a compatible emulation.

#### User Interface

The library does not implement any UI - Printer or Print Settings dialogs. This enables decoupling from any UI dependencies that may be problematic - for example, to Bootstrap, or to not Bootstrap?

However, a few APIs do 'require' a UI, for example, prompted printing.

A simple extension mechanism is implemented into which implementation of UI may be patched.

All that is required is to implement the named functions.

| function | Purpose |
|--- | --- |
| MeadCo.ScriptX.Print.UI.PageSetup(function (bAccepted) {} ) | |
| MeadCo.ScriptX.Print.UI.PrinterSettings(function (bAccepted) {} ) | |

This is discussed in more detail in the [Dialogs with ScriptX.Services](https://www.meadroid.com/Developers/KnowledgeBank/Articles/Dialogs) article.
Exemplar implemenations of UI are provided: [Bootstrap3/4 with jQuery](../src/jQuery-MeadCo.ScriptX.Print.UI.js) (implemented assuming Bootstrap and jQuery) and [Bootstrap 5 no jQuery](../src/Bootstrap5-MeadCo.ScriptX.Print.UI.js)

See also:
 * [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) project for a higher level abstraction which provides a number of convenient functions for the use of ScriptX in any of its forms, Add-on or Services.
 * [ScriptX Add-on for Internet Explorer API reference](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).
 * [ScriptX.Services on Cloud](https://scriptxservices.meadroid.com/)
 * [ScriptX Services Samples - Cloud, On Premise, for Windows PC](https://scriptxprintsamples.meadroid.com/) the samples make use of MeadCoScriptXJS and ScriptX.Services.Client to deliver samples that work in any scenario with the same code.
