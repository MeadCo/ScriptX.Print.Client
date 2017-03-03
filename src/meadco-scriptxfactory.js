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
        console.log("ScriptX factory anti-polyfill believes it may not be requred.");
        if ( this[name] != undefined ) {
            console.log("this[" + name + "] is defined");
        }
        if (document.getElementById(name) != null) {
            console.log("document.getElementById(" + name + ") is defined");
        }
        if (this[name].object != undefined) {
            console.log("this[" + name + "].object is defined -- not required!!!");
            return;
        } else {
            console.log("this[" + name + "].object is *not* defined");
        }
    }

    var theModule = definition();

    // Assign to the global object (window)
    (this)[name] = theModule;

})('factory', function () {

    // protected API
    var module = this;
    var version = "0.0.5.1";
    var emulatedVersion = "8.0.0.2";

    module.log = function (str) {
        console.log("factory anti-polyfill :: " + str);
    }

    // extend the namespace
    module.extendNamespace = function(name, definition) {
        var theModule = definition();

        module.log("MeadCo factory extending namespace2: " + name);
        // walk/build the namespace part by part and assign the module to the leaf
        var namespaces = name.split(".");
        var scope = this;
        for (var i = 0; i < namespaces.length; i++) {
            var packageName = namespaces[i];
            if (i === namespaces.length - 1) {
                if (typeof scope[packageName] === "undefined") {
                    module.log("installing implementation at: " + packageName);
                    scope[packageName] = theModule;
                } else {
                    module.log("Warning - not overwriting package: " + packageName);
                }
            } else if (typeof scope[packageName] === "undefined") {
                module.log("initialising new: " + packageName);
                scope[packageName] = {};
            } else {
                module.log("using existing package: " + packageName);
            }
            scope = scope[packageName];
        }

    }


    log("'factory' loaded.");

    // public API.
    return {
        log: module.log,

        GetComponentVersion: function(sComponent, a, b, c, d) {
            log("factory.object.getcomponentversion: " + sComponent);
            var v = emulatedVersion.split(".");
            a[0] = v[0];
            b[0] = v[1];
            c[0] = v[2];
            d[0] = v[3];
        },

        get ScriptXVersion() { return emulatedVersion },
        get SecurityManagerVersion() { return emulatedVersion },

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
    var notafactory = MeadCo.ScriptX.Print.HTML;
    var settings = MeadCo.ScriptX.Print.HTML.settings;

    log("factory.Printing 2 loaded.");

    if (this.jQuery) {
        log("Looking for auto connect");
        $("[data-meadco-server]").each(function () {
            var $this = $(this);
            log("Auto connect to: " + $this.data("meadco-server") + "with license: " + $this.data("meadco-license"));
            notafactory.connect($this.data("meadco-server"), $this.data("meadco-license"));
            return false;
        });
    }

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
            switch (sOrientation.toLowerCase()) {
                case "landscape":
                    settings.page.orientation = PageOrientation.LANDSCAPE;
                    break;

                case "portrait":
                    settings.page.orientation = PageOrientation.PORTRAIT;
                    break;
            }
        },

        get orientation() {
            return settings.page.orientation === PageOrientation.PORTRAIT ? "portrait" : "landscape";
        },

        set portrait(bPortrait) {
            settings.page.orientation = bPortrait ? PageOrientation.PORTRAIT : PageOrientation.LANDSCAPE;
        },

        get portrait() {
            return settings.page.orientation === PageOrientation.PORTRAIT;
        },

        set leftMargin(n) {
            settings.page.margins.left = n;
        },

        get leftMargin() {
            return settings.page.margins.left;
        },

        set topMargin(n) {
            settings.page.margins.top = n;
        },

        get topMargin() {
            return settings.page.margins.top;
        },

        set bottomMargin(n) {
            settings.page.margins.bottom = n;
        },

        get bottomMargin() {
            return settings.page.margins.bottom;
        },

        set rightMargin(n) {
            settings.page.margins.right = n;
        },

        get rightMargin() {
            return settings.page.margins.right;
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
                return notafactory.printFrame(sFrame, bPrompt);
            }

            return notafactory.printDocument(bPrompt);
        },

        // advanced (aka licensed properties - the server will reject
        // use if no license available)
        set units(enumUnits) {
            // TODO: Check licensed (or will obviously fail on the server)
            settings.page.units = enumUnits;
        },

        get units() {
            return settings.page.units;
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