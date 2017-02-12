/*!
 * MeadCo.ScriptX.Print.Core (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

// Extensible UMD Plugins 
// Ref: https://addyosmani.com/writing-modular-js/
//
// With fixes and changes : works with sparse namespaces
// and root implements the namespace build code as inheritable
// function 'extend()'
//  

// Module/Plugin core
// Note: the wrapper code you see around the module is what enables
// us to support multiple module formats and specifications by 
// mapping the arguments defined to what a specific format expects
// to be present. Our actual module functionality is defined lower 
// down. 

; (function (name, definition) {
    var theModule = definition(),
        // this is considered "safe":
        hasDefine = typeof define === 'function' && define.amd,
        // hasDefine = typeof define === 'function',
        hasExports = typeof module !== 'undefined' && module.exports;

    if (hasDefine) { // AMD Module
        define(theModule);
    } else if (hasExports) { // Node.js Module
        module.exports = theModule;
    } else { // Assign to common namespaces or simply the global object (window)
        // var scope = (this.jQuery || this.ender || this.$ || this);
        // we always go for window
        var scope = this;

        scope[name] = theModule;

        // this is moderately poor .. assuming this code is executing
        // as the root of of the names space, which it is and assumes
        // it implements inheritable extendNamespace(), which it does.
        // For all that, it means that the root gets to decide where this
        // is (i.e. in a common namespace or the global object)
        theModule.scope = scope;
    }
})('MeadCo', function () {

    // protected API
    var module = this;

    module.log = function (str) {
        console.log("MeadCo :: " + str);
    }

    // extend the namespace
    module.extendNamespace = function(name,definition) {
        var theModule = definition(),
            hasDefine = typeof define === 'function' && define.amd,
            hasExports = typeof module !== 'undefined' && module.exports;

        if (hasDefine) { // AMD Module
            define(theModule);
        } else if (hasExports) { // Node.js Module
            module.exports = theModule;
        } else {
            // walk/build the namespace part by part and assign the module to the leaf
            var namespaces = name.split(".");
            var scope = (module.scope || this.jQuery || this.ender || this.$ || this);
            for (var i = 0; i < namespaces.length; i++) {
                var packageName = namespaces[i];
                if (i === namespaces.length - 1) {
                    scope[packageName] = theModule;
                } else if (typeof scope[packageName] === "undefined") {
                    scope[packageName] = {};
                }
                scope = scope[packageName];
            }
        }
    }

    module.log("MeadCo root namespace loaded.");

    // public API.
    return {
        log: module.log,
        set scope(s) { module.scope = s;  }
    };

});

; (function (name, definition) {
    extendNamespace(name, definition);
})('MeadCo.ScriptX.Print', function () {

    var module = this;

    // protected API
    module.server = ""; // url to the server, server is CORS restricted 

    module.ContentType = {
            URL : 1,
            HTML : 2,
            INNERTHTML : 4
    };

    module.ResponseType = {
        QUEUEDTODEVICE: 1,
        QUEUEDTOFILE: 2,
        SOFTERROR: 3,
        OK: 4
    };

    module.printHtmlAtServer = function(contentType,content,htmlPrintSettings) {
        log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
        var requestData = {
            ContentType: contentType,
            Content: content,
            HtmlPrintSettings: htmlPrintSettings,
            DeviceSettings: module.deviceSettings
        }

        printAtServer(requestData,
        {
            fail: function(jqXhr, textStatus, errorThrown) {
                alert("Print failed.\n\n" + errorThrown);
            },

            queuedToFile: function(data) {
                alert("Print requested, please wait for the download to complete ... ");
                window.setTimeout("alert('Requesting output now'); window.open('" + module.server + "/PrintedDoc?job=" + data + "');", 4000);                
            },

            queuedToDevice: function(data) {
                
            },

            softError: function(data) {
            
            },

            ok : function(data) {
                
            }
        });
    }

    module.deviceSettings = 
    {
        printerName: ""
    }

    // private 
    function printAtServer(requestData,promiseInterface) {

        if (module.server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : no server connection");
        }

        if (this.jQuery) {
            this.jQuery.post(module.server, requestData).done(function (data) {
                switch ( data.responseType ) {
                    case module.ResponseType.QUEUEDTOFILE:
                        promiseInterface.queuedToFile(data.message);
                        break;

                    case module.ResponseType.QUEUEDTODEVICE:
                        promiseInterface.queuedToDevice(data.message);
                        break;

                    case module.ResponseType.SOFTERROR:
                        promiseInterface.softError(data.message);
                        break;

                    case module.ResponseType.OK:
                        promiseInterface.ok(data.message);
                        break;
                }
            }).fail(function (jqXhr, textStatus, errorThrown) {
                promiseInterface.fail(jqXhr, textStatus, errorThrown);
            });
        }

        throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");

    }

    log("MeadCo.ScriptX.Print loaded.");
    if (!this.jQuery) {
        log("**** warning :: no jQuery");
    }

    // public API
    return {
        ContentType: module.ContentType,

        ResponseType: module.ResponseType,

        Connect: function(serverUrl,licenseGuid) {
            module.server = serverUrl;
        }
    };

});

