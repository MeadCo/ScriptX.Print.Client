﻿/**
 * Static class for namespace creation and core utility functions for ScriptX.Services client libraries.
 * 
 * This must be included before any other files from this package.
 * 
 * The implementation is for use in a browser only, not general runtime javascript environments.
 * 
 * This code is necessarily 'old-fashioned' as it may find itself running in old versions of IE.
 *  
 * @namespace MeadCo
 */

; (function (name, definition) {
    var theModule = definition();

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

    if (oldscope !== null) {
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

})('MeadCo', function () {

    // protected API
    var outerScope = this;
    var version = "1.16.2.2"; // matches the highest version number of sub-classes.
    var bLog = ((typeof (MeadCo) !== "undefined" && typeof (MeadCo.logEnable) !== "undefined")) ? MeadCo.logEnable : false;
    var bUseFetch = ((typeof (MeadCo) !== "undefined" && typeof (MeadCo.useFetch) !== "undefined")) ? MeadCo.useFetch : typeof outerScope.jQuery == "undefined";

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
    outerScope.extendMeadCoNamespace = function (name, definition) {
        var theModule = definition()

        log("MeadCo root extending namespace: " + name);
        // walk/build the namespace part by part and assign the module to the leaf
        var namespaces = name.split(".");
        var scope = (outerScope.scope || this.jQuery || this.ender || this.$ || this);
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
    };

    /*
     * Extract the error text from jQuery AJAX response
     * 
     * @param {string} logText The lead-in text for a console.log entry
     * @param {object} jqXhr jQuery ajax header
     * @param {string} textStatus textStatus result determined by jQuery
     * @param {string} errorThrown The server exception dewtermined by jQuery
     * @returns {string} The error text to display
     */
    function parseError(logText, jqXhr, textStatus, errorThrown) {
        error("**warning: AJAX call failure in " + logText + ": [" +
            textStatus +
            "], [" +
            errorThrown +
            "], [" +
            jqXhr.responseText +
            "], [" +
            jqXhr.statusText +
            "]");

        if (errorThrown === "" || errorThrown === "Internal Server Error") {
            if (textStatus !== "error") {
                errorThrown = jqXhr.responseText || textStatus;
            }
            else {
                if (typeof jqXhr.responseJSON === "object" && typeof jqXhr.responseJSON.Message === "string") {
                    errorThrown = jqXhr.responseJSON.Message;
                }
                else {
                    if (typeof jqXhr.responseText === "string") {
                        errorThrown = jqXhr.responseText;
                    }
                    else
                        errorThrown = "Server or network error";
                }
            }
        }
        else {
            if (typeof jqXhr.responseJSON !== "object" && typeof jqXhr.responseText === "string" && jqXhr.responseText.length > 0) {
                errorThrown = jqXhr.responseText;
            }
        }

        error(" error parsed to --> [" + errorThrown + "]");
        return errorThrown;
    }

    log("MeadCo root namespace " + version + " loaded.");

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
         * Get/set state of forcing use of fetch even if jQuery(.ajax) is available. Default is off
         * @property {boolean} logEnabled
         * @memberof MeadCo         * 
         */
        get fetchEnabled() { return bUseFetch; },
        set fetchEnabled(bEnable) {
            bUseFetch = bEnable;
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
            var parent = outerScope.scope.MeadCo;

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
        set scope(s) { outerScope.scope = s; },

        /**
         * Get the url to a ScriptX.Services api. If an api is already present, it is replaced.
         * 
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
                serverUrl = serverUrl.substring(0, p) + "/api/" + apiLocation;
            }
            return serverUrl;
        },

        /**
         * Get the url to a ScriptX.Services service endpoint. 
         * 
         * @function makeServiceEndPoint
         * @memberof MeadCo
         * @param {string} serverUrl url to the server
         * @param {string} endPoint the service endpoint, e.g. v1/preview
         * @returns {string} url to the endpoint
         */
        makeServiceEndPoint: function (serverUrl, endPoint) {
            // check if given partial ...
            var p = serverUrl.indexOf("/api");
            if (p === -1) {
                if (serverUrl.lastIndexOf("/") !== (serverUrl.length - 1)) {
                    serverUrl += "/";
                }
                serverUrl += endPoint;
            }
            else {
                // given another api, chop and replace with requested api
                serverUrl = serverUrl.substring(0, p) + "/" + endPoint;
            }
            return serverUrl;
        },


        /**
         * Extract the error text from jQuery AJAX response
         * 
         * @function parseAjaxError
         * @memberof MeadCo
         * 
         * @param {string} logText The lead-in text for a console.log entry
         * @param {object} jqXhr jQuery ajax header
         * @param {string} textStatus textStatus result determined by jQuery
         * @param {string} errorThrown The server exception dewtermined by jQuery
         * @returns {string} The error text to display
         */
        parseAjaxError: function (logText, jqXhr, textStatus, errorThrown) {
            return parseError(logText, jqXhr, textStatus, errorThrown);
        },

        /**
         * Extract the error text from browser fetch response
         * 
         * @function parseFetchError
         * @memberof MeadCo
         * 
         * @param {object} errorThrown error caught from fetch 
         * @returns {string} The error text to display
         */
        parseFetchError: function (logText, errorThrown) {
            const msg = typeof errorThrown === "string" ? errorThrown : errorThrown.message;
            error("**warning: FETCH call failure in " + logText + ": " + msg);
            return msg;
        }
    };

});


