/**
 * Static class for namespace creation and core utility functions for ScriptX.Services client libraries
 * 
 * This must be included before any other files from this package.
 * 
 * @namespace MeadCo
 */

// Extensible UMD Plugins 
// Ref: https://addyosmani.com/writing-modular-js/
//
// With fixes and changes : works with sparse namespaces
// and root implements the namespace build code as inheritable
// function 'extend()'
//  
// Note that true inheritance is not implemented, essentially
// this creates singleton objects that are conveniently named
// within the browser. 


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

        // hack ...
        //
        // MeadCo.ScriptX and MeadCo.Licensing may already be defined
        // when we run -- they would happily extend this implementation
        // and we should extend theirs. This is a horible way to do it.
        //
        var oldscope = null;
        if (typeof scope[name] !== 'undefined') {
            // console.log(name + " already exists");
            oldscope = scope[name];
        }

        scope[name] = theModule;

        if (oldscope != null) {
            var newscope = scope[name];

            // console.log("preserving old scope ... ");
            for (var prop in oldscope) {
                if (oldscope.hasOwnProperty(prop)) {
                    // console.log("will preserve: " + prop);
                    newscope[prop] = oldscope[prop];
                }
            }
        }

        // this is moderately poor .. assuming this code is executing
        // as the root of the name space, which it is and assumes
        // it implements inheritable extendNamespace(), which it does.
        // For all that, it means that the root gets to decide where this
        // is (i.e. in a common namespace or the global object)
        theModule.scope = scope;
    }
})('MeadCo', function () {

    // protected API
    var module = this;
    var version = "1.5.2.1";
    var bLog = false;

    var log = function (str) {
        if (bLog) {
            console.log("MeadCo :: " + str);
        }
    };

    var warn = function (str) {
        console.warn("MeadCo :: " + str);
    };

    var error = function (str) {
        console.error("MeadCo :: " + str);
    };

    // extend the namespace
    module.extendMeadCoNamespace = function (name, definition) {
        var theModule = definition(),
            hasDefine = typeof define === 'function' && define.amd,
            hasExports = typeof module !== 'undefined' && module.exports;

        if (hasDefine) { // AMD Module
            define(theModule);
        } else if (hasExports) { // Node.js Module
            module.exports = theModule;
        } else {
            log("MeadCo root extending namespace: " + name);
            // walk/build the namespace part by part and assign the module to the leaf
            var namespaces = name.split(".");
            var scope = (module.scope || this.jQuery || this.ender || this.$ || this);
            for (var i = 0; i < namespaces.length; i++) {
                var packageName = namespaces[i];
                if (i === namespaces.length - 1) {
                    if (typeof scope[packageName] === "undefined") {
                        log("installing implementation at: " + packageName);
                        scope[packageName] = theModule;
                    } else {
                        log("Warning - extending package: " + packageName);
                        var oldscope = scope[packageName];
                        scope[packageName] = theModule;

                        var newscope = scope[packageName];

                        log("preserving old scope ... ");
                        for (var prop in oldscope) {
                            if (oldscope.hasOwnProperty(prop)) {
                                log("will preserve: " + prop);
                                newscope[prop] = oldscope[prop];
                            }
                        }
                    }
                } else if (typeof scope[packageName] === "undefined") {
                    log("initialising new: " + packageName);
                    scope[packageName] = {};
                } else {
                    log("using existing package: " + packageName);
                }
                scope = scope[packageName];
            }
        }
    }

    log("MeadCo root namespace loaded.");

    // public API.
    return {
        /**
         * Sends the content to the console (if informational logging is enabled)
         * @function log
         * @memberof MeadCo
         * @param {string} text to send to console
         */
        log: log,

        /**
         * Marks the content as a warning and sends to the console 
         * @function warn
         * @memberof MeadCo
         * @param {string} text to send to console
         */
        warn: warn,

        /**
         * Marks the content as an error and sends to the console 
         * @function error
         * @memberof MeadCo 
         * @param {string} text to send to console
         */
        error: error,

        /**
         * Get the version of this module as a string major.minor.hotfix.build
         * @property {string} version
         * @memberof MeadCo
         */
        get version() { return version; },

        /**
         * Get/set state of logging to console of informational messages. Default is off
         * @property {boolean} logEnabled
         * @memberof MeadCo
         */
        get logEnabled() { return bLog; },
        set logEnabled(bEnable) {
            bLog = bEnable;
        },

        /**
         * Create a namespace
         * @function createNS
         * @memberof MeadCo
         * @param {string} namespace path of the namespace
         * @returns {object} static object for the namespace
         * @example
         * var ui = MeadCo.createNS("MeadCo.ScriptX.Print.UI");
         * ui.Show = function() { alert("hello"); }
         */
        createNS: function (namespace) {
            var nsparts = namespace.split(".");
            var parent = module.scope.MeadCo;

            // we want to be able to include or exclude the root namespace so we strip
            // it if it's in the namespace
            if (nsparts[0] === "MeadCo") {
                nsparts = nsparts.slice(1);
            }

            // loop through the parts and create a nested namespace if necessary
            for (var i = 0; i < nsparts.length; i++) {
                var partname = nsparts[i];
                // check if the current parent already has the namespace declared
                // if it isn't, then create it
                if (typeof parent[partname] === "undefined") {
                    parent[partname] = {};
                }
                // get a reference to the deepest element in the hierarchy so far
                parent = parent[partname];
            }
            // the parent is now constructed with empty namespaces and can be used.
            // we return the outermost namespace
            return parent;
        },

        /**
         * @private
         * @param {object} s the scope in which to create namesapces
         */
        set scope(s) { module.scope = s; },

        /**
         * Get the url to a ScriptX.Services api endpoint
         * @function makeApiEndPoint
         * @memberof MeadCo
         * @param {string} serverUrl url to the server
         * @param {string} apiLocation the api, e.g. v1/printhtml
         * @returns {string} url to the api
         */
        makeApiEndPoint: function (serverUrl, apiLocation) {
            // check if given partial ...
            var p = serverUrl.indexOf("/api");
            if (p === -1) {
                if (serverUrl.lastIndexOf("/") !== (serverUrl.length - 1)) {
                    serverUrl += "/";
                }
                serverUrl += "api/" + apiLocation;
            }
            else {
                // given another api, chop and replace with requested api
                serverUrl = serverUrl.substr(0, p) + "/api/" + apiLocation;
            }
            return serverUrl;
        }
    };

});


