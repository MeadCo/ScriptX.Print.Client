/*!
 * MeadCo.Core (support for modern browsers and IE 11) JS client library
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


