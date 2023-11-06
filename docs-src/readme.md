### Current Version : 1.14.2

The MeadCo ScriptX.Services project brings control of printing to browser based content in all browsers on all devices with
out needing a binary add-on.

The MeadCo ScriptX.Services Client Library delivers an emulation of MeadCo's ScriptX.Add-on for Internet Explorer on Windows to 
 [MeadCo ScriptX Services](https://www.meadroid.com/Features/ScriptXServices). In the binary free environment ScriptX.Services Client Library is the javascript libraries for interfacing between the client devices 
and the server system that provides printing services where-ever that server may be:

* in the cloud at [scriptxservices.meadroid.com](https://scriptxservices.meadroid.com)
* an on premise Microsoft Windows (x64) Server
* a Microsoft Windows x64 PC 

The purpose of these libraries is to assist those with a body of client javascript code targetting use of the ScriptX Add-On 
for Internet Explorer. These libraries assist with continuing with a large part of the code intact when transitioning to 
using ScriptX.Services instead/as well.

In combination with the [MeadCoScriptXJS library](https://github.com/MeadCo/MeadCoScriptXJS) the emulation provides 
significant levels of compatibility with in-browser script written for the Add-on so allowing the same code to run with either the Add-on for Internet Explorer or ScriptX Services depending on the client device. 
It may also be used 'stand-alone' although the code is not very modern due to the requirement to support older versions of Internet Explorer.

#### A note on browsers and devices

The libraries are developed for 'evergreen' browsers on common devices and Internet Explorer 11. These libraries are likely not compatible with
ancient versions of Internet Explorer. 

However, MeadCo ScriptX.Add-on continues to be available and supports old versions of Internet Explorer. Javascript code in this scenario will be utilising the *'window.factory'* object.

By use of a compatibility layer written in javascript that same code can be bought to more modern browsers. With the proviso of course that the HTML that renders successfully in the older browser
renders correctly in modern browsers.

The ScriptX.Services Client libraries depend on little other than themselves (and jQuery). Our clients are many and varied and will no doubt be 
taking dependencies on many libraries, we don't want to work against those choices but work with them.  

However, in the current version there is a dependency upon jQuery for:

* Implementation of AJAX calls
* Extraction of document content for printing
* Simple discovery of elements with given attributes 

These dependencies will be removed over time.

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

MeadCo.ScriptX is an object providing for verified initialisation and a number of functions that wrapped common operations into a simpler API. So, for example:

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

Such imperfections are **smoothed** by use of the MeadCoScriptXJS library which provides a layer to hide the differences betweeen .Addon and .Services and so enable a single code base.

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
An exemplar implemenation of UI is [provided](../src/jQuery-MeadCo.ScriptX.Print.UI.js) (implemented assuming Bootstrap and jQuery)

See also:
 * [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) project for a higher level abstraction which provides a number of convenient functions for the use of ScriptX in any of its forms, Add-on or Services.
 * [ScriptX Add-on for Internet Explorer API reference](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).
 * [ScriptX.Services on Cloud](https://scriptxservices.meadroid.com/)
 * [ScriptX Services Samples - Cloud, On Premise, for Windows PC](https://scriptxprintsamples.meadroid.com/) the samples make use of MeadCoScriptXJS and ScriptX.Services.Client to deliver samples that work in any scenario with the same code.
