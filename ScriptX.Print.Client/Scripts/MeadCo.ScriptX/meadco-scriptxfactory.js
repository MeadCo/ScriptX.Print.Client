/*!
 * MeadCo ScriptX 'window.factory' shim (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

// we shim <object id="factory" /> -- code can run as-is
; (function (name, definition,undefined) {

    if ( this[name] != undefined || document.getElementById("factory") == null) {
        console.log("ScriptX factory shim believes it isnt requred.");
    }

    var theModule = definition();

    // Assign to the global object (window)
    (this)[name] = theModule;

})('factory', function () {

    // protected API
    var module = this;

    module.log = function (str) {
        console.log("factory shim :: " + str);
    }

    // extend the namespace
    module.extend = function(name, definition, scope) {
        var theModule = definition;

        // walk/build the namespace branch and assign the module to the leaf
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
    extend(name, definition(), (this));
})('factory.printing', function () {

    // protected API
    var module = this;

    log("factory.Printing loaded.");

    // public API
    return {

    };

});

; (function (name, definition) {
    extend(name, definition(), (this));
})('factory.object', function () {

    // protected API
    var module = this;

    log("factory.Printing loaded.");

    // public API
    return this.factory;
});