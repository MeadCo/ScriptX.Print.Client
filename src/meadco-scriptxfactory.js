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

    log("'factory' loaded.");

    // public API.
    return {
        log: module.log,

        GetComponentVersion: function (sComponent, a, b, c, d) {
            log("factory.object.getcomponentversion: " + sComponent);
            a[0] = 8;
            b[0] = 0;
            c[0] = 0;
            d[0] = 0;
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
        set header(str) {
            log("set factory.printing.header: " + str);
            settings.header = str;
        },

        get header() {
            return settings.header;
        }
        
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