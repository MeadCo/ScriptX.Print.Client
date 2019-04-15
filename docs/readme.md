# ScriptX.Print.Client

## Current Version

1.5.6

The MeadCo ScriptX Services project brings control of printing to browser based content in all browsers on all devices with
out needing a binary add-on.

The MeadCo ScriptX Service Client Library brings an emulation of MeadCo's ScriptX Add-on for Internet Explorer on Windows to 
working with [MeadCo ScriptX Services](https://www.meadroid.com/Features/ScriptXServices). In the binary free environment ScriptX.Print.Client are the javascript libraries for interfacing between the client devices 
and the server system that provides printing services where-ever that server may be:

* [in the cloud](https://scriptxservices.meadroid.com)
* an on premise server
* services on a Microsoft Windows PC

The purpose of these libraries is to assist those with a body of client javascript code targetting use of the ScriptX Add-On 
for Internet Explorer. These libraries assist with continuing with a large part of the code intact when transitioning to 
using ScriptX.Services instead/as well.

In combination with the [MeadCoScriptXJS library](https://github.com/MeadCo/MeadCoScriptXJS) the emulation provides 
significant levels of compatibility with in-browser script written for the Add-on so allowing the same code to run with either the Add-on for Internet Explorer or ScriptX Services depending on the client device. 
It may also be used 'stand-alone' although the code is not very modern due to the requirement to support older versions of Internet Explorer.

#### A note on browsers and devices

The libraries are developed for 'evergreen' browsers on common devices and Internet Explorer 11. These libraries are likely not compatible with
ancient versions of Internet Explorer. 

However, the MeadCo ScriptX add-on continues to be available and supports old versions of Internet Explorer. Javascript code in this scenario will be utilising the *'window.factory'* object.

By use of a compatibility layer written in javascript that same code can be bought to more modern browsers. With the proviso of course that the HTML that renders successfully in the older browser
renders correctly in modern browsers.

Preferably the ScriptX.Print.Client libraries will not depend on anything other than themselves. Our clients are many and varied and will no doubt be 
taking dependencies on many libraries, we don't want to work against those choices but work with them. 

However, in the current version there is a dependency upon jQuery for:

* Implementation of AJAX calls
* Extraction of document content for printing
* Simple discovery of elements with given attributes 

These dependencies will be removed over time.

See also:
 * [Getting Started](start.md) for an introduction to using the libraries
 * [API Reference](api.md) for details on the APIs available
 * [MeadCoScriptXJS](https://github.com/MeadCo/MeadCoScriptXJS) project for a higher level abstraction which provides a number of conventient functions for the use of ScriptX in any of its forms, Add-on or Services.
 * [ScriptX Add-on for Internet Explorer API reference](https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXAddOn).
 * [ScriptX.Services on Cloud](https://scriptxservices.meadroid.com/)
 * [ScriptX Services Samples - Cloud, On Premise, for Windows PC](https://scriptxprintsamples.meadroid.com/) the samples make use of MeadCoScriptXJS and ScriptX.Services.Client to deliver samples that work in any scenario with the same code.

