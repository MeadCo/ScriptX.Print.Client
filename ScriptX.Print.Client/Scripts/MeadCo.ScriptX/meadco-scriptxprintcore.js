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
// With fixes and changes :
//  

// Module/Plugin core
// Note: the wrapper code you see around the module is what enables
// us to support multiple module formats and specifications by 
// mapping the arguments defined to what a specific format expects
// to be present. Our actual module functionality is defined lower 
// down, where a named module and exports are demonstrated. 

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
        (this.jQuery || this.ender || this.$ || this)[name] = theModule;
    }
})('MeadCo', function () {

    // protected API
    var module = this;

    module.log = function (str) {
        console.log("MeadCo :: " + str);
    }

    // extend the namespace
    module.extend = function(name,definition, scope) {
        var theModule = definition,
            hasDefine = typeof define === 'function' && define.amd,
            hasExports = typeof module !== 'undefined' && module.exports;

        if (hasDefine) { // AMD Module
            define(theModule);
        } else if (hasExports) { // Node.js Module
            module.exports = theModule;
        } else {
            // walk/build the namespace part by part and assign the module to the leaf
            var namespaces = name.split(".");
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

    // public API.
    return {
        log: module.log
    };

});

; (function (name, definition) {
    extend(name, definition(), (this.jQuery || this.ender || this.$ || this));
})('MeadCo.ScriptX.Print', function () {

    // protected API
    var module = this;
    var server = ""; // url to the server, server is CORS restricted 

    module.ContentType = {
            Url : 1,
            Html : 2,
            InnerHtml : 4
    };

    module.ResponseType = {
        QueuedToDevice: 1,
        QueuedToFile: 2,
        SoftError: 3,
        Ok: 4
    };

    module.printHtmlAtServer = function(contentType,content,htmlPrintSettings) {
        log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
        var requestData = {
            ContentType: contentType,
            Content: content,
            HtmlPrintSettings: htmlPrintSettings,
            DeviceSettings: module.deviceSettings
        }
    }

    module.deviceSettings = 
    {
        printerName: ""
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
            server = serverUrl;
        }
    };

});

