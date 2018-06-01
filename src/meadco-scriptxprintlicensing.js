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
    var moduleversion = "1.4.0.1";
    var apiLocation = "v1/licensing";

    var server = ""; // url to the server, server is CORS restricted
    var licenseGuid = "";
    var licenseRevision = 0;
    var licensePath = ""; // "" => subscription (cloud) not client for Workstation, => value for client license
    var lastError = "";

    var module = this;
    var license = {};

    var bConnected = false;

    if (!module.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    function setServer(serverUrl) {
        MeadCo.log("License server requested: " + MeadCo.makeApiEndPoint(serverUrl, apiLocation));
        server = MeadCo.makeApiEndPoint(serverUrl, apiLocation);
    }

    function connectToServer(serverUrl) {
        setServer(serverUrl);
    }

    function getSubscriptionFromServer(resolve, reject) {
        if (server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Licensing : License server API URL is not set or is invalid");
        }

        if (license.length > 0) {
            if (typeof resolve === "function") {
                resolve(license);
            }
            return license;
        }

        if (module.jQuery) {
            MeadCo.log(".ajax() get: " + server);
            module.jQuery.ajax(server,
                {
                    method: "GET",
                    dataType: "json",
                    jsonp: false,
                    cache: false,
                    async: typeof resolve === "function",
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                }).done(function (data) {
                    lastError = "";
                    $.extend(license, data);
                    if (typeof resolve === "function") {
                        resolve(license);
                        return;
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    MeadCo.log("**warning: failure in MeadCo.ScriptX.Licensing.getSubscriptionFromServer: " + errorThrown);
                    lastError = errorThrown;
                    if (typeof reject == "function") {
                        reject(errorThrown);
                        return;
                    }
                });
            return license;
        }
    }

    function applyLicense(licenseGuid, revision, path, resolve, reject) {
        MeadCo.log("Apply license: " + licenseGuid + ",revision: " + revision + ", path: " + path);

        if (server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Licensing : License server API URL is not set or is invalid");
        }

        var requestData = {
            Guid: licenseGuid,
            Url: path,
            Revision: revision
        }

        if (module.jQuery) {
            MeadCo.log(".ajax() post: " + server);
            module.jQuery.ajax(server,
                {
                    method: "POST",
                    data: requestData,
                    dataType: "json",
                    jsonp: false,
                    cache: false,
                    async: typeof resolve === "function"
                }).done(function (data) {
                    lastError = "";
                    $.extend(license, data);
                    if (typeof resolve === "function") {
                        resolve(license);
                        return;
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    MeadCo.log("**warning: failure in MeadCo.ScriptX.Print.Licensing.applyLicense: " + errorThrown);
                    lastError = errorThrown;
                    if (typeof reject == "function") {
                        reject(errorThrown);
                        return;
                    }
                });
        }

        if (typeof resolve !== "function") {
            MeadCo.log("returning applied (sync) license: " + license.company);
            return license;
        }

        return 0;
    }

    MeadCo.log("MeadCo.ScriptX.Print.Licensing " + moduleversion + " loaded.");


    //////////////////////////////////////////////////
    // public API
    return {
        get version() {
            return moduleversion;
        },

        connect: function (serverUrl) {
            connectToServer(serverUrl);
        },

        connectLite: function (serverUrl, slicenseGuid, sRevision, sPath) {
            connectToServer(serverUrl);
            licenseGuid = slicenseGuid;
            licenseRevision = sRevision;
            licensePath = sPath;
        },

        Apply: function(licenseGuid, revision, path) {
            return applyLicense(licenseGuid, revision, path);
        },

        ApplyAsync: function(licenseGuid, revision, path, resolve, reject) {
            applyLicense(licenseGuid, revision, path, resolve, reject);
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

        // helpers for wrapper MeadCoJS - we apply the license here when working
        // with ScriptX.Services for Windows PC
        PolyfillInit: function () {
            return typeof license.guid !== "undefined";
        },

        PolyfillInitAsync: function (resolve, reject) {
            debugger;
            if (typeof license.guid !== "undefined") {
                resolve(license);
            }
            else
                applyLicense(licenseGuid, licenseRevision, licensePath, resolve, reject);
        }
    };

});
