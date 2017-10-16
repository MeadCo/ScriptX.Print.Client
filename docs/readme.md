
# ScriptX.Service.Client
The MeadCo.ScriptX Services project brings control of printing to browser based content in all browsers on all devices with
out needing a binary add-on - something that has become persona non-grata due to the abuse of the power they have enabled 
and power that has been taken by the unscrupulous.

In the binary free environment MeadCo.ScriptX.Client.xxxxx are the javascript libraries for interfacing between the client devices 
and the server system that provides printing services where-ever that server may be:

* in the cloud
* an on-premise server
* services on the device (PC)

The library has three layers:

1. Dependency free core 'abstract' functionality
2. A common library dependent implementation layer
3. Backwards compatibility layer

In addition there are a number of useful UI libraries that encapsulate commonly required behaviour.

#### A note on browsers and devices, abstractions and dependency injection

The libraries are developed for 'evergreen' browsers on common devices. These libraries will not be compatible with
ancient versions of Internet Explorer. However, the MeadCo ScriptX add-on continues to be available and supports old versions of Internet Explorer. 
Script code in this scenario will be utilising the *'window.factory'* object. By use of a compatibility layer that same code can be bought
to more modern browsers. With the proviso of course that the HTML that renders successfully in the older browser
renders correctly in modern browsers.

We do not want the MeadC.ScriptX.Client libraries to depend on anything other than thenselves. Our clients are many and varied and will no doubt be 
taking dependencies on many libraries, we dont want to work against those choices but work with them. The core library abstracts behaviour
and then the dependency dependent layer uses simple injection to configure the core layer for the environment.

We will implement a jQuery dependent layer as it is a commonly used library. We will implement an/or assist with other dependency layers as 
demand arises.

### Core
The core layer is the only layer to interact with the service API. It exposes the functionality available from the service and such house-keep constructs as constants and enums.

It has no dependencies on other libraries and is consequently 'abstract' and unusable until configured with AJAX interaction functions and the service API endpoint 
to use as well as licensing information that may be required by the print service.

The core layer implementation (and hence version) will track the service implementation. 

### Implementation
The implementation layer will have dependecies on one or more libraries that implement functionality required by the core - for example, it is senseless to implement
yet another ajax library when this has already been written time and time again.

Another area of dependency is UI - for example, dialogs.

### Compatibility
The backwards compatibility layer will implement *window.factory* to provide compatibilty with old code. This will also provide compatibillty with the MeadCoJS library.

## References

[Dependency injection in javascript](http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript)

[RequireJs](http://requirejs.org/)

[ExpectJs](https://github.com/Automattic/expect.js)

[Lightweight di](https://nickqizhu.github.io/di.js/)

[Promises](https://developers.google.com/web/fundamentals/getting-started/primers/promises)

[Angular http:](https://docs.angularjs.org/api/ng/service/$http)
