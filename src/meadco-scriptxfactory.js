/*!
 * MeadCo ScriptX 'window.factory' shim (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

// we anti-polyfill <object id="factory" /> 
// enabling old code to run in modern browsers
//
; (function (name, definition,undefined) {

    if ( this[name] != undefined || document.getElementById(name) != null ) {
        console.log("ScriptX factory anti-polyfill believes it isnt requred.");
        if ( this[name] != undefined ) {
            console.log("this[" + name + "] is defined");
        }
        if (document.getElementById(name) != null) {
            console.log("document.getElementById(" + name + ") is defined");
        }
    }

    var theModule = definition();

    // Assign to the global object (window)
    (this)[name] = theModule;

})('factory', function () {

    // protected API
    var module = this;

    module.log = function (str) {
        console.log("factory anti-polyfill :: " + str);
    }

    // extend the namespace
    module.extendNamespace = function(name, definition) {
        var theModule = definition();

        // walk/build the namespace branch and assign the module to the leaf
        var namespaces = name.split(".");
        var scope = this;
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

    module.version = "8.0.0.1";

    log("'factory' loaded.");

    // public API.
    return {
        log: module.log,

        GetComponentVersion: function(sComponent, a, b, c, d) {
            log("factory.object.getcomponentversion: " + sComponent);
            var v = module.version.split(".");
            a[0] = v[0];
            b[0] = v[1];
            c[0] = v[2];
            d[0] = v[3];
        },

        ScriptXVersion: module.version,
        SecurityManagerVersion: module.version,

        baseURL : function(sRelative) {
            alert("ScriptX.print :: baseUrl is not implemented yet.");
        },

        relativeURL : function(sUrl) {
            alert("ScriptX.print :: relativeUrl is not implemented yet.");
        }

    };
});

; (function (name, definition) {
    extendNamespace(name, definition);
})('factory.printing', function () {

    // protected API
    var module = this;
    var settings = MeadCo.ScriptX.Print.HTML.settings;

    log("factory.Printing loaded.");

    // public API
    return {
        // basic properties
        //

        set header(str) {
            log("set factory.printing.header: " + str);
            settings.header = str;
        },

        get header() {
            return settings.header;
        },

        set footer(str) {
            settings.footer = str;
        },

        get footer() {
            return settings.footer;
        },

        set headerFooterFont(str) {
            settings.headerFooterFont = str;
        },

        get headerHooterFont() {
            return settings.headerFooterFont;
        },


        set orientation(sOrientation) {
            switch ( toLowerCase(sOrientation) ) {
                case "landscape":
                    settings.pageSettings.orientation = PageOrientation.LANDSCAPE;
                    break;

                case "portrait":
                    settings.pageSettings.orientation = PageOrientation.PORTRAIT;
                    break;
            }
        },

        get orientation() {
            return settings.pageSettings.orientation === PageOrientation.PORTRAIT ? "portrait" : "landscape";
        },

        set portrait(bPortrait) {
            settings.pageSettings.orientation = bPortrait ? PageOrientation.PORTRAIT : PageOrientation.LANDSCAPE;
        },

        get portrait() {
            return settings.pageSettings.orientation === PageOrientation.PORTRAIT;
        },

        set leftMargin(n) {
            settings.pageSettings.margins.left = n;
        },

        get leftMargin() {
            return settings.pageSettings.margins.left;
        },

        set topMargin(n) {
            settings.pageSettings.margins.top = n;
        },

        get topMargin() {
            return settings.pageSettings.margins.top;
        },

        set bottomMargin(n) {
            settings.pageSettings.margins.bottom = n;
        },

        get bottomMargin() {
            return settings.pageSettings.margins.bottom;
        },

        set rightMargin(n) {
            settings.pageSettings.margins.right = n;
        },

        get rightMargin() {
            return settings.pageSettings.margins.right;
        },
        
        // templateURL is a no-op at this time. In the future may
        // enable alternative server behaviour.
        set templateURL(sUrl) {           
        },

        get templateURL() {
            return "MeadCo://default";
        },

        // basic functions
        //

        // No longer relevant, has returned true since IE 6 and was 
        // a proxy for testing if the browser was IE5.5 or later!
        IsTemplateSupported : function() {
            return true;
        },

        PageSetup : function() {
            alert("ScriptX.Print :: Page setup dialog is not implemented yet.");
        },

        Preview : function(sOrOFrame) {
            alert("ScriptX.Print :: Preview is not implemented yet.");
        },

        Print : function(bPrompt, sOrOFrame) { // needs and wants update to ES2015
            if (typeof (bPrompt) === 'undefined') bPrompt = true;
            if (typeof (sOrOFrame) === 'undefined') sOrOFrame = null;

            if (sOrOFrame != null) {
                var sFrame = typeof (sOrOFrame) === 'string' ? sOrOFrame : sOrOFrame.id;
                return printFrame(sFrame, bPrompt);
            }

            return printDocument(bPrompt);
        },

        // advanced (aka licensed properties - the server will reject
        // use if no license available)
        set units(enumUnits) {
            // TODO: Check licensed (or will obviously fail on the server)
            settings.pageSettings.units = enumUnits;
        },

        get units() {
            return settings.pageSettings.units;
        }

        // advanced functions

    };

});

; (function (name, definition) {
    extendNamespace(name, definition);
})('factory.object', function () {

    // protected API
    var module = this;

    log("factory.object loaded.");

    // public API
    return this.factory;
});