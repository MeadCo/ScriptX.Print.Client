/*! 
 * MeadCo.ScriptX.Print.Licensing (support for modern browsers and IE 11) JS client library
 * Copyright 2017-2018 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * This module is only required when working with ScriptX.Services for Windows PC.
 * 
 * Released under the MIT license
 */

; (function (name, definition) {
    extendMeadCoNamespace(name, definition);
})('MeadCo.ScriptX.Print.Licensing', function () {
    var version = "1.4.0.0";

    var server = ""; // url to the server, server is CORS restricted
    var licenseGuid = "";
    var licenseRevision = 0;
    var licensePath = ""; // "" => subscription (cloud) not client for Workstation, => value for client license
    var lastError = 0;

    var module = this;
    var license = {};

    var bConnected = false;

    if (!module.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    function setServer(serverUrl) {
        MeadCo.log("License server requested: " + serverUrl);
        server = serverUrl;
    }

    function connectToServer(serverUrl) {
        setServer(serverUrl);
    }


    //////////////////////////////////////////////////
    // public API
    return {
        get version() {
            return version;
        },

        connect: function (serverUrl) {
            connectToServer(serverUrl);
        },

        Apply: function(licenseGuid, revision, path) {
            
        },

        ApplyAsync: function(licenseGuid, revision, path, resolve, reject) {
            
        },

        get result() {
            return lastError === "" ? 0 : 5; // => ok or not found
        },

        get validLicense() {
            return typeof license.guid !== "undefined";
        },

        get License() {
            var l = typeof license.guid !== "undefined" ? license : getSubscriptionFromServer();
            return l;
        },

        GetLicenseAsync: function (resolve, reject) {
            getSubscriptionFromServer(resolve, reject);
        },


    };

});
