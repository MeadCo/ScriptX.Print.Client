/**
 * MeadCo.ScriptX.Print
 * 
 * A static class wrapping calls to the server API. 
 * 
 * Requires: meadco-core.js
 * 
 * Includes processing of calls to the print api that return "printing to file" including collecting the file output. 
 * 
 * Provides attribute based connection to the server.
 * 
 * Synchronous AJAX calls are deprecated in all browsers but may be useful to "quick start" use of older code. It is recommended that code is moved
 * to using asynchronous calls as soon as practical. The MeadCoScriptXJS library can assist with this as it delivers promise rather than callback based code.
 * 
 * AJAX calls can be made via jQuery or browser native fetch(). If jQuery is available it will be used by preference - if used jQuery v1.19 or later is required.
 * 
 * jQuery is required for synchronous AJAX calls.
 * 
 * To use fetch, even if jQuery is available then set MeadCo.fetchEnabled to false. 
 * 
 * This can be done using an attribute: data-meadco-usefetch="true" or declare var MeadCo = { useFetch: true } before including this library
 * This is useful if a very old version of jQuery is required for UI.
 *
 * @namespace MeadCoScriptXPrint
 */

; (function (name, definition) {
    extendMeadCoNamespace(name, definition);
})('MeadCo.ScriptX.Print', function () {
    // module version and the api we are coded for
    const version = "1.15.1.18";
    const htmlApiLocation = "v1/printHtml";
    const pdfApiLocation = "v1/printPdf";
    const directApiLocation = "v1/printDirect";
    const licenseApiLocation = "v1/licensing";
    const printerApiLocation = "v1/printer";

    // default printer 
    let printerName = "";

    // using this printername causes ScriptX.Services to select 
    // a printer that prints to a PDF file.
    const magicPrintPreviewPrinter = "ScriptX.Services//PrintPreview.1"

    const jobNameWaitingForSend = "[hold.clientside]";
    const jobNameSentWaitingResponse = "[wait.response]";
    const jobNameHoldEnsureSpoolingStatus = "[hold.ensureSpoolStatus]";

    /**
     * Enum to describe the units used on measurements. Please be aware that (sadly) these enum values do *not* match  
     * the values by the MeadCo ScriptX COM Servers. Please use MeadCo.ScriptX.MeasurementUnits (declared in MeadCoScriptJS) for compatibility
     *
     * @memberof MeadCoScriptXPrint
     * @typedef {number} MeasurementUnits
     * @enum {MeasurementUnits}
     * @readonly
     * @property {number} DEFAULT 0 use the default at the print server
     * @property {number} INCHES 1 
     * @property {number} MM 2 millimeters
     */
    const enumMeasurementUnits = {
        DEFAULT: 0,
        INCHES: 1,
        MM: 2
    };

    /**
     * Describe the size of a page by its width and height.
     * 
     * @typedef PageSize
     * @memberof MeadCoScriptXPrint
     * @property {number} width width of paper in requested units
     * @property {number} height height of paper in requested units
     * */
    var PageSize;  // for doc generator

    /**
     * Describe the margins within which to print.
     * 
     * @typedef Margins
     * @memberof MeadCoScriptXPrint
     * @property {number} left left margin in requested units
     * @property {number} top top margin in requested units
     * @property {number} right right margin in requested units
     * @property {number} bottom bottom margin in requested units
     * */
    var Margins;  // for doc generator

    /**
     * Information about and the settings to use with an output printing device
     * See also: https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXServices/WebServiceAPIReference/PrintHtml/deviceinfoGET
     * 
     * @typedef DeviceSettingsObject
     * @memberof MeadCoScriptXPrint
     * @property {string} printerName The name of the printer
     * @property {string} printToFileName The name of a the file to send print output to (for Windows PC and )
     * @property {string} paperSizeName The descriptive name of the papersize, e.g. "A4"
     * @property {string} paperSourceName The descriptive name of the paper source, e.g. "Upper tray"
     * @property {CollateOptions} collate The collation to use when printing
     * @property {number} copies The number of copies to print
     * @property {DuplexOptions} duplex The dulex printing option
     * @property {MeasurementUnits} units Measurement units for papersize and margins
     * @property {PageSize} paperPageSize The size of the paper (in requested units)
     * @property {Margins} unprintableMargins The margin that cannot be printed in (in requested units)
     * @property {number} status Status code for the status of the device. Note this is not reliable, it is the cached return from the first server enquiry only.
     * @property {string} port Printer connection port name/description
     * @property {number} attributes Printer attributes
     * @property {string} serverName Name of the server to which the printer is connected
     * @property {string} shareName Name of the share 
     * @property {string} location description of the location of the printer
     * @property {boolean} isLocal true if the printer is local to the server
     * @property {boolean} isNetwork true if the server is on the network
     * @property {boolean} isShared true if the printer is shared 
     * @property {boolean} isDefault true if this is the default printer on the service
     * @property {Array.<string>} bins Array of the names of the available paper sources
     * @property {Array.<string>} forms Array of the names of the avbailable paper sizes
     * */
    var DeviceSettingsObject; // for doc generator

    /**
     * Provide authorisation details to access protected content. 
     * 
     * @typedef AccessControl
     * @memberof MeadCoScriptXPrint
     * @property {string} cookie The authorisation cookie in the form name=value|name2=value2
     * */
    var AccessControl = {
        cookie: ""
    };

    /**
     * Description of a code version. Semver is used 
     * 
     * @typedef VersionObject
     * @memberof MeadCoScriptXPrint
     * @property {int} major The major version  
     * @property {int} minor The minor version 
     * @property {int} build The patch/hotfix version
     * @property {int} revision Internal revisions of a build/patch/hotfix
     * @property {int} majorRevision ignore
     * @property {int} minorRevision ignore 
     * */
    var VersionObject; // for doc generator

    let deviceSettings = {};
    const module = this;

    let activePrintQueue = []; // current job queue

    // singleton wrapper to the server
    //
    // servicesServer.url
    // servicesServer.test
    // servicesServer.call
    //
    const servicesServer = {

        serviceUrl: "",
        pendingUrl: "",
        failedUrl: "",
        verifiedUrl: "",
        orchestratorPort: 0,
        orchestratorKey: "",
        portsToTry: 10,
        verifying: false,
        trustVerifiedConnection: true, // if true then once a connection has been found, trust that it will be valid for the page lifetime

        undoTrust: function () {
            if (!this.trustVerifiedConnection && this.serviceUrl !== "") {
                this.verifiedUrl = this.serviceUrl;
                this.pendingUrl = this.serviceUrl;
                this.serviceUrl = "";
            }
        },

        get url() {

            if (this.verifiedUrl !== "") {
                return this.verifiedUrl;
            }

            if (this.serviceUrl === "" && this.pendingUrl !== "") {
                MeadCo.warn("[GET] servicesServer.url is not ready, performing synchronous search. Recommend code re-org to resolve the server earlier and asynchronously.")
                var that = this;
                this.verifyUrl(this.pendingUrl, false, function () {
                    return that.serviceUrl;
                }, function () {
                    return "";
                });
            }

            return this.serviceUrl;

        },

        // essentially synchronous set url, we set the pending value so the code 
        // executes synchronously here and there may then be an asynchronous sorting
        // out when an api call is made (see implementation of call : function())
        set url(value) {
            MeadCo.log("servicesServer::setUrl: " + value);
            if (this.IsChangingServer(value)) {
                MeadCo.log("note set as pending");
                this.serviceUrl = "";
                this.pendingUrl = value;
            }
        },

        setUrlAsync: function (value, resolve, reject) {
            MeadCo.log("servicesServer::urlAsync: " + value);
            this.verifyUrl(value, true, resolve, reject);
        },

        verifyUrl: function (value, bAsync, resolve, reject) {

            if (this.verifying && bAsync) {
                MeadCo.warn("Verify called and verify in progress ....");
                var that = this;
                var thatValue = value;
                window.setTimeout(function () { that.verifyUrl(thatValue, bAsync, resolve, reject); }, 1000);
                return;
            }

            if (this.IsChangingServer(value) && !this.IsFailedConnection(value)) {

                var that = this;
                var thatValue = value;

                MeadCo.log("servicesServer::verifyurl: " + value + ", async: " + bAsync);

                // if an orchestrator has been defined then ask it for the current users port
                if (typeof this.orchestratorPort !== "number") {
                    this.orchestratorPort = parseInt("" + this.orchestratorPort);
                }

                if (this.orchestratorPort > 0) {
                    MeadCo.log("Using request to Orchestrator on port: " + this.orchestratorPort);
                    that.verifying = true;

                    // by definition Orchestrator is local.
                    var apiEndPoint;
                    if (typeof this.orchestratorKey === "string" && this.orchestratorKey.length > 0) {
                        apiEndPoint = "/api/v2?key=" + this.orchestratorKey;
                    }
                    else {
                        apiEndPoint = "/api/v1";
                    }

                    MeadCo.log("servicesServer::querying orchestrator: " + "http://127.0.0.1:" + this.orchestratorPort + apiEndPoint);

                    if (module.jQuery && !MeadCo.fetchEnabled) {
                        module.jQuery.ajax("http://127.0.0.1:" + this.orchestratorPort + apiEndPoint,
                            {
                                method: "GET",
                                dataType: "json",
                                cache: false,
                                async: bAsync
                            }).done(function (data) {

                                MeadCo.log("orchestrator returned ScriptX.Services port: " + data.HttpPort)

                                var urlHelper = new URL(thatValue);
                                urlHelper.port = data.HttpPort;
                                thatValue = urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname

                                that.test(thatValue, 0, bAsync, function (urlFound) {
                                    that.serviceUrl = urlFound;
                                    that.pendingUrl = "";
                                    that.verifying = false;
                                    resolve(urlFound, true);
                                }, function (errorThrown) {
                                    that.serviceUrl = "";
                                    that.pendingUrl = "";
                                    that.failedUrl = thatValue;
                                    that.verifying = false;
                                    if (typeof reject === "function") {
                                        reject(errorThrown);
                                    }
                                });

                            })
                            .fail(function (jqXhr, textStatus, errorThrown) {
                                that.verifying = false;
                                that.serviceUrl = "";
                                that.pendingUrl = "";
                                that.failedUrl = thatValue;

                                const msg = MeadCo.parseAjaxError("Failed to connect with Orchestrator: ", jqXhr, textStatus, errorThrown);
                                MeadCo.warn(msg);

                                if (typeof reject === "function") {
                                    reject("Failed to connect with Orchestrator: " + msg);
                                }
                            });
                    }
                    else {
                        fetch("http://127.0.0.1:" + this.orchestratorPort + apiEndPoint)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`HTTP Error: ${response.status}`)
                                }
                                return response.json();
                            })
                            .then(data => {
                                MeadCo.log("orchestrator returned ScriptX.Services port: " + data.HttpPort)

                                var urlHelper = new URL(thatValue);
                                urlHelper.port = data.HttpPort;
                                thatValue = urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname

                                that.test(thatValue, 0, bAsync, function (urlFound) {
                                    that.serviceUrl = urlFound;
                                    that.pendingUrl = "";
                                    that.verifying = false;
                                    resolve(urlFound, true);
                                }, function (errorThrown) {
                                    that.serviceUrl = "";
                                    that.pendingUrl = "";
                                    that.failedUrl = thatValue;
                                    that.verifying = false;
                                    if (typeof reject === "function") {
                                        reject(errorThrown);
                                    }
                                });
                            })
                            .catch(error => {
                                that.verifying = false;
                                that.serviceUrl = "";
                                that.pendingUrl = "";
                                that.failedUrl = thatValue;

                                const errorThrown = MeadCo.parseFetchError("MeadCo.ScriptX.Print:verifyUrl - " + value, error);

                                if (typeof reject === "function") {
                                    reject("Failed to connect with Orchestrator: " + errorThrown);
                                }
                            });
                    }
                }
                else {
                    that.verifying = true;
                    that.test(thatValue, that.portsToTry, bAsync, function (urlFound) {
                        that.serviceUrl = urlFound;
                        that.pendingUrl = "";
                        that.verifying = false;
                        resolve(urlFound, false);
                    }, function (errorThrown) {
                        that.serviceUrl = "";
                        that.pendingUrl = "";
                        that.verifying = false;
                        that.failedUrl = thatValue;
                        if (typeof reject === "function") {
                            var urlHelper = new URL(thatValue);
                            reject("ScriptX.Services could not be found at " + urlHelper.protocol + "//" + urlHelper.host + ". Is it installed and running?");
                        }
                    });
                }
            }
            else {
                if (this.IsFailedConnection(value)) {
                    if (typeof reject === "function") {
                        reject("ScriptX.Services connection to: " + value + " has already failed and will not be re-tried.")
                    }
                    else {
                        MeadCo.warn("ScriptX.Services connection to: " + value + " has already failed and will not be re-tried.")
                    }
                }
                else
                    resolve(this.serviceUrl, this.orchestratorPort > 0);
            }
        },

        // test
        //
        // Can we ask something and get a response, without using a license - checks the server is there.
        //
        // Will perform port hunt (increment the port number) when attempting to connect to
        // ScriptX.Services for Windows PC
        //
        test: function (serverUrl, nHuntAllowed, bAsync, resolve, reject) {
            if (serverUrl.length > 0) {
                const that = this;
                let urlHelper = new URL(serverUrl);

                MeadCo.log("Test server requested: " + serverUrl + ", port: " + urlHelper.port);

                // use the license API
                const serviceUrl = MeadCo.makeApiEndPoint(urlHelper.href, licenseApiLocation + "/ping");

                if (module.jQuery && !MeadCo.fetchEnabled) {
                    MeadCo.log(".ajax() get: " + serviceUrl);
                    module.jQuery.ajax(serviceUrl,
                        {
                            method: "GET",
                            dataType: "json",
                            cache: false,
                            async: bAsync
                        }).done(function (data) {
                            const resolvedUrl = urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname;
                            MeadCo.log("Test server succeed, resolve(" + resolvedUrl + ")")
                            resolve(resolvedUrl);
                        })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                            // only do hunting with 4WPC and that must be on 127.0.0.1 or localhost
                            MeadCo.log("Test server failed: [" + errorThrown + "], " + nHuntAllowed + ", on: " + urlHelper.hostname);
                            if (nHuntAllowed > 0 && (urlHelper.hostname === "localhost" || urlHelper.hostname == "127.0.0.1")) {
                                urlHelper.port++;
                                module.setTimeout(that.test(urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname, --nHuntAllowed, bAsync, resolve, reject), 1);
                            }
                            else {
                                errorThrown = MeadCo.parseAjaxError("MeadCo.ScriptX.Print.servicesServer.test:", jqXhr, textStatus, errorThrown);
                                if (typeof reject === "function") {
                                    MeadCo.log("rejecting with: " + errorThrown);
                                    reject(errorThrown);
                                }
                                else {
                                    MeadCo.warn("failed with no reject function");
                                }
                            }
                        });
                }
                else {
                    MeadCo.log("fetch get: " + serviceUrl);
                    if (bAsync) {
                        fetch(serviceUrl)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`HTTP Error: ${response.status}`)
                                }
                                return response.json();
                            })
                            .then(data => {
                                const resolvedUrl = urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname;
                                MeadCo.log("Test server succeed, resolve(" + resolvedUrl + ")")
                                resolve(resolvedUrl);
                            })
                            .catch((error) => {
                                // only do hunting with 4WPC and that must be on 127.0.0.1 or localhost
                                MeadCo.log("Test server failed: [" + error + "], " + nHuntAllowed + ", on: " + urlHelper.hostname);
                                if (nHuntAllowed > 0 && (urlHelper.hostname === "localhost" || urlHelper.hostname == "127.0.0.1")) {
                                    urlHelper.port++;
                                    module.setTimeout(that.test(urlHelper.protocol + "//" + urlHelper.host + urlHelper.pathname, --nHuntAllowed, bAsync, resolve, reject), 1);
                                }
                                else {
                                    errorThrown = MeadCo.parseFetchError("MeadCo.ScriptX.Print.servicesServer.test:", error);
                                    if (typeof reject === "function") {
                                        MeadCo.log("rejecting with: " + errorThrown);
                                        reject(errorThrown);
                                    }
                                    else {
                                        MeadCo.warn("failed with no reject function");
                                    }
                                }

                            });
                    }
                    else {
                        MeadCo.error("Synchronous Ajax calls requires jQuery");
                        if (typeof reject === "function") {
                            reject("Synchronous Ajax calls requires jQuery");
                        }
                    }
                }

            }
        },

        // send a method request to an end point
        //
        call: function (sApi, method, oApiData, bLicensed, bAsync, resolve, reject) {

            const that = this;

            if (this.serviceUrl === "" && this.pendingUrl !== "") {

                this.verifyUrl(this.pendingUrl, bAsync, function () {
                    if (that.url !== "") {
                        that.call(sApi, method, oApiData, bLicensed, bAsync, resolve, reject);
                    }
                    else {
                        if (typeof reject === "function") {
                            reject("Server url verification failed to set url");
                        }
                    }
                }, reject);
            }
            else {
                if (this.serviceUrl !== "") {
                    const serviceUrl = MeadCo.makeApiEndPoint(this.serviceUrl, sApi);
                    MeadCo.log("servicesServer.call() " + method + ": " + serviceUrl);
                    let oPayload = {
                        method: method,
                        cache: false,
                        async: bAsync,
                        jsonp: false,
                        dataType: "json",
                        contentType: "application/json"
                    };

                    if (bLicensed) {
                        oPayload.headers = {
                            "Authorization": "Basic " + btoa(licenseGuid + ":")
                        }
                    }

                    if (!this.IsEmptyPayload(oApiData)) {
                        MeadCo.log("payload defined.");
                        oPayload.data = JSON.stringify(oApiData);
                    }

                    if (module.jQuery && !MeadCo.fetchEnabled) {
                        module.jQuery.ajax(serviceUrl, oPayload)
                            .done(function (data) {
                                if (typeof resolve === "function") {
                                    resolve(data);
                                }
                                return data;
                            })
                            .fail(function (jqXhr, textStatus, errorThrown) {
                                errorThrown = MeadCo.parseAjaxError("MeadCo.ScriptX.Print:" + sApi + method, jqXhr, textStatus, errorThrown);
                                if (typeof reject === "function")
                                    reject(errorThrown);
                                else {
                                    throw new Error(errorThrown);
                                }
                            })
                            .always(function (dataOrjqXHR, textStatus, jqXHRorErrorThrown) {
                                that.undoTrust();
                            });
                    }
                    else {
                        if (bAsync) {
                            if (bLicensed) {
                                oPayload.headers = {
                                    "Authorization": "Basic " + btoa(licenseGuid + ":"),
                                    "Content-type": "application/json"
                                }
                            }
                            else {
                                oPayload.headers = {
                                    "Content-type": "application/json"
                                }
                            }

                            const netcall = fetch(serviceUrl, {
                                method: oPayload.method,
                                headers: oPayload.headers,
                                body: oPayload.data,
                                referrerPolicy: "origin-when-cross-origin",
                                mode: "cors",
                                credentials: "omit",
                                cache: "no-store",
                                redirect: "error",
                                keepalive: false
                            })
                                .then((response) => {
                                    that.undoTrust();
                                    if (!response.ok) {
                                        // throw new Error(`HTTP Error: ${response.status}`)
                                        if ( response.status == 500 || response.status == 404 ) {
                                            const err = response.text()
                                                .then(errorTxt => {
                                                    const errorThrown = MeadCo.parseFetchError("MeadCo.ScriptX.Print:" + sApi + method, errorTxt);
                                                    if (typeof reject === "function")
                                                        reject(errorThrown);
                                                    else {
                                                        throw new Error(errorThrown);
                                                    }
                                                });
                                        }
                                        else {
                                            if (typeof reject === "function")
                                                reject(response.statusText);
                                            else {
                                                throw new Error(response.statusText);
                                            }
                                        }
                                        return;
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    if (data && typeof resolve === "function") {
                                        resolve(data);
                                    }
                                })
                                .catch((error) => {
                                    const errorThrown = MeadCo.parseFetchError("MeadCo.ScriptX.Print:" + sApi + method, error);
                                    if (typeof reject === "function")
                                        reject(errorThrown);
                                    else {
                                        throw new Error(errorThrown);
                                    }
                                });
                        }
                        else {
                            if (typeof reject === "function") {
                                reject("Synchronous Ajax calls requires jQuery");
                            }
                            else
                                throw new Error("Synchronous Ajax calls requires jQuery");
                        }
                    }
                }
                else {
                    if (typeof reject === "function") {
                        reject("MeadCo.ScriptX.Print : server connection is not defined.");
                    }
                    else
                        throw new Error("MeadCo.ScriptX.Print : server connection is not defined.");
                }
            }

            return true;
        },

        // determine if the server is changing - domain or port has changed when not using orchestrator
        IsChangingServer: function (aServerUrl) {
            if (this.serviceUrl !== "") {

                try {
                    var currentUrl = new URL(this.serviceUrl);
                    var newUrl = new URL(aServerUrl);

                    return currentUrl.hostname != newUrl.hostname || (currentUrl.port != newUrl.port && this.orchestratorPort == 0);
                } catch (e) {
                    MeadCo.error("Failed to construct URL(): " + e.message + ", from: " + this.serviceUrl + ", or: " + aServerUrl);
                    MeadCo.error("Many errors will ensue");
                    return false; // will stop attempts to use something bad.
                }
            }

            return true;
        },

        IsEmptyPayload(oPayload) {
            return oPayload === null || (Object.keys(oPayload).length === 0 && oPayload.constructor === Object);
        },

        // bad news to retest ports on a host that has already been tried, in a page lifetime, it isnt going to get any better.
        IsFailedConnection: function (aServerUrl) {
            if (this.failedUrl.length > 0) {
                try {
                    var failedUrl = new URL(this.failedUrl);
                    var newUrl = new URL(aServerUrl);

                    if (failedUrl.hostname === newUrl.hostname) {
                        MeadCo.warn("Attempt to use: " + aServerUrl + " is noted as a failed connection and will not be retried");
                        return true;
                    }

                    return false;
                } catch (e) {
                    MeadCo.error("Testing IsFailed unable to construct URL(): " + e.message + ", from: " + this.failedUrl + ", or: " + aServerUrl);
                    return true; // will stop attempts to use something bad.
                }
            }

            return false;
        }
    };

    var licenseGuid = "";
    var bConnected = false; // true when default device settings have been obtained from a .services server

    var bDoneAuto = false;

    var availablePrinters = [];

    var cachedServiceDescription = null; // cached description of service server connected to 

    /**
     * Enum for type of content being posted to printHtml API
     *
     * @memberof MeadCoScriptXPrint    
     * @typedef {number} ContentType
     * @enum {ContentType}
     * @readonly
     * @property {number} URL 1 the url will be downloaded and printed
     * @property {number} HTML 2 the passed string is assumed to be a complete html document .. <html>..</html>
     * @property {number} INNERHTML 4 the passed string is a complete html document but missing the html tags
     * @property {number} STRING 8 the passed string is assumed to contain no html but may contain other language such as ZPL (for direct printing)
     */
    var enumContentType = {
        URL: 1, // the url will be downloaded and printed (for html and direct printing)
        HTML: 2, // the passed string is assumed to be a complete html document .. <html>..</html>
        INNERHTML: 4, // the passed string is a complete html document but missing the html tags
        STRING: 8 // the passed string is assumed to contain no html but may contain other language such as ZPL (for direct printing)
    };

    var enumResponseStatus = {
        UNKNOWN: 0,
        QUEUEDTODEVICE: 1,
        QUEUEDTOFILE: 2,
        SOFTERROR: 3,
        OK: 4
    };

    /**
     * Enum for required behaviour when an error occurs. 
     *
     * @memberof MeadCoScriptXPrint    
     * @typedef {number} ErrorAction
     * @enum {ErrorAction}
     * @readonly
     * @property {number} REPORT 1 Call MeadCo.ScriptX.Print.reportServerError(errMsg)
     * @property {number} THROW 2 throw an error : throw errMsg
     */
    var enumErrorAction = {
        REPORT: 1,
        THROW: 2
    };
    var errorAction = enumErrorAction.REPORT;

    /**
     * Enum for the class of service connected to.
     * 
     * @memberof MeadCoScriptXPrint
     * @typedef { number } ServiceClasses
     * @enum { ServiceClasses }
     * @readonly 
     * @property { number } CLOUD 1 MeadCo Cloud Service 
     * @property { number } ONPREMISE 2 ScriptX.Services for On Premise Devices
     * @property { number } WINDOWSPC 3 ScriptX.Services for Windows PC
     * */
    var enumServiceClass = {
        CLOUD: 1,
        ONPREMISE: 2,
        WINDOWSPC: 3
    };

    /**
     * Information about the service that is connected to - version detail and facilities available
     * See also: https://www.meadroid.com/Developers/KnowledgeBank/TechnicalReference/ScriptXServices/WebServiceAPIReference/ServiceDescription/GET
     * 
     * @typedef ServiceDescriptionObject
     * @memberof MeadCoScriptXPrint
     * @property {ServiceClasses} serviceClass the class of the service; cloud, onpremise, pc
     * @property {string} currentAPIVersion the latest version implemented (eg 'v1' or 'v2' etc)
     * @property {VersionObject} serviceVersion implementation version of the service
     * @property {VersionObject} serverVersion The version of ScriptX Server used by the service
     * @property {VersionObject} serviceUpgrade The latest version of the service that is available and later than ServiceVersion/me 
     * @property {Array.<string>} availablePrinters Array of the names of the available printers
     * @property {boolean} printHTML Printing of HTML is supported
     * @property {boolean} printPDF Printing of PDF documents is supported
     * @property {boolean} printDIRECT Direct printing to a print device is supported
     * */
    var ServiceDescriptionObject; // for Doc Generator

    /**
     * Enum for status code returned to print progress callbacks
     *
     * @memberof MeadCoScriptXPrint    
     * @typedef {number} PrintStatus
     * @enum {PrintStatus}
     * @readonly
     * @property {number} NOTSTARTED 0
     * @property {number} QUEUED 1
     * @property {number} STARTING 2
     * @property {number} DOWNLOADING 3
     * @property {number} DOWNLOADED 4
     * @property {number} PRINTING 5
     * @property {number} COMPLETED 6
     * @property {number} PAUSED 7
     * @property {number} PRINTPDF 8
     * @property {number} ERROR -1
     * @property {number} ABANDONED -2
     */
    var enumPrintStatus = {
        NOTSTARTED: 0,

        // queue call back opcodes ...
        QUEUED: 1,
        STARTING: 2,
        DOWNLOADING: 3,
        DOWNLOADED: 4,
        PRINTING: 5,
        COMPLETED: 6,
        PAUSED: 7,
        PRINTPDF: 8,

        ERROR: -1,
        ABANDONED: -2
    };

    /**
     * Enum to describe the collation option when printing 
     *
     * @memberof MeadCoScriptXPrint   
     * @typedef {number} CollateOptions
     * @enum {CollateOptions}
     * @readonly
     * @property {number} DEFAULT 0 use the default at the print server
     * @property {number} TRUE 1 collate pages when printing
     * @property {number} FALSE 2 do not collate pages
     */
    var enumCollateOptions = {
        DEFAULT: 0,
        TRUE: 1,
        FALSE: 2
    };

    /**
     * Enum to describe the duplex print option to use when printing 
     *
     * @memberof MeadCoScriptXPrint
     * @typedef {number} DuplexOptions
     * @enum {DuplexOptions}
     * @readonly
     * @property {number} DEFAULT 0 use the default at the print server
     * @property {number} SIMPLEX 1 
     * @property {number} VERTICAL 2 
     * @property {number} HORIZONTAL 3
     */
    var enumDuplexOptions = {
        DEFAULT: 0,
        SIMPLEX: 1,
        VERTICAL: 2,
        HORIZONTAL: 3
    };

    function queueJob(data) {
        activePrintQueue.push(data);
        MeadCo.log("ScriptX.Print queueJob: " + data.jobIdentifier + ", name: " + data.jobName + ", jobCount: " + activePrintQueue.length);
    }

    function jobCount() {
        MeadCo.log("ScriptX.Print jobCount: " + activePrintQueue.length);
        return activePrintQueue.length;
    }

    function findJob(id) {
        return activePrintQueue.find(e => e.jobIdentifier === id);
    }

    function updateJob(data) {
        let j = findJob(data.jobIdentifier);
        if (j) {
            Object.keys(data).forEach(function (key) {
                j[key] = data[key];
            });
            return;
        }

        MeadCo.warn("Unable to find job: " + data.jobIdentifier + " to update it");
    }

    function removeJob(id) {

        activePrintQueue = activePrintQueue.filter(e => e.jobIdentifier !== id);
        MeadCo.log(`ScriptX.Print removed job: ${id}, jobCount: ${activePrintQueue.length}`);
        // no jobs being processed, allow next immediate start
        if (activePrintQueue.length == 0) previousPrintCallWasAt = 0;

    }

    function progress(requestData, status, information) {
        if (typeof requestData.OnProgress === "function") {
            requestData.OnProgress(status, information, requestData.UserData);
        }
    }

    // funcPrintHtmlAtServer
    //
    // Create a closure on all the data for a print job which can be used with timeout.
    //
    var nextJobFileName = "";
    function funcPrintHtmlAtServer(contentType, content, htmlPrintSettings, trackingData, fnDone, fnProgress, fnOnQueuedFileAvailable) {
        MeadCo.log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
        if (contentType === enumContentType.URL) {
            MeadCo.log(".. request print url: " + content);
        }

        // must deepclone objects not values by reference.
        var devInfo;
        if (printerName === "") {
            devInfo = {};
        } else {
            if (printerName === magicPrintPreviewPrinter) {
                devInfo = JSON.parse(JSON.stringify({
                    printerName: printerName
                }));
            }
            else
                devInfo = JSON.parse(JSON.stringify(deviceSettings[printerName]));
        }

        var requestData = {
            ContentType: contentType,
            Content: content,
            Settings: JSON.parse(JSON.stringify(htmlPrintSettings)),
            Device: devInfo,
            ProtectedContentAccess: AccessControl,
            OnProgress: fnProgress,
            UserData: trackingData
        };

        var fakeJob = {
            jobIdentifier: Date.now(),
            printerName: requestData.Device.printerName,
            jobName: jobNameWaitingForSend
        };
        queueJob(fakeJob); // essentially a lock on the queue to stop it looking empty until this job is processed

        var requiredOutputName = nextJobFileName;
        nextJobFileName = "";

        var fnOnFileAvailable = fnOnQueuedFileAvailable;

        return function () {
            removeJob(fakeJob.jobIdentifier);
            return printAtServer(htmlApiLocation, requestData,
                {
                    fail: function (err) {
                        progress(requestData, enumPrintStatus.ERROR, err);
                        MeadCo.ScriptX.Print.reportError(err);
                        if (typeof fnDone === "function") {
                            fnDone("Server error");
                        }
                    },

                    queuedToFile: function (data) {
                        MeadCo.log("print is being queued to a file");
                        progress(requestData, enumPrintStatus.QUEUED);
                        monitorJob(htmlApiLocation, requestData, data.jobIdentifier,
                            -1,
                            function (data) {
                                if (data !== null) {
                                    MeadCo.log("download printed file is available");
                                    progress(requestData, enumPrintStatus.COMPLETED);

                                    var api = MeadCo.makeApiEndPoint(servicesServer.url, htmlApiLocation + "/download/" + data.jobIdentifier);
                                    if (requiredOutputName.length > 0) {
                                        api += "/" + requiredOutputName;
                                    }
                                    fnOnFileAvailable(api, data.jobIdentifier);
                                }

                                if (typeof fnDone === "function") {
                                    fnDone(data === null ? "Server error" : null);
                                }
                            });
                    },

                    queuedToDevice: function (data) {
                        MeadCo.log("print was queued to device");
                        progress(requestData, enumPrintStatus.QUEUED);
                        monitorJob(htmlApiLocation, requestData, data.jobIdentifier,
                            -1,
                            function (data) {
                                if (data !== null) {
                                    progress(requestData, enumPrintStatus.COMPLETED);
                                }

                                if (typeof fnDone === "function") {
                                    fnDone(data === null ? "Server error" : null);
                                }
                            });
                    },

                    softError: function (data) {
                        progress(requestData, enumPrintStatus.ERROR, data.message);
                        MeadCo.ScriptX.Print.reportError(data.message);
                        MeadCo.log("print has soft error");
                        removeJob(data.jobIdentifier);
                        if (typeof fnDone === "function") {
                            MeadCo.log("Call fnDone");
                            fnDone(data.message);
                        }
                    },

                    ok: function (data) {
                        progress(requestData, enumPrintStatus.COMPLETED);
                        MeadCo.log("printed ok, no further information");
                        removeJob(data.jobIdentifier);
                        if (typeof fnDone === "function") {
                            fnDone(null);
                        }
                    }
                })
        };
    }


    /**
     * Post a request to the server api/v1/print to print some html and monitor the print job 
     * to completion. If the server prints to file then the file is returned as a download.
     * 
     * There is no guarantee of the order of outgoing calls, no guarantee they will ber processed in 
     * order at the server if they go from the client very quickly. ScriptX.Addon printHtml() was 
     * deterministic in its order - jobs were printed in the order of the calls. In order to 
     * achieve this without a push pull queue rapid calls are spaced a part via settimeout()
     * 
     * @function printHtmlAtServer
     * @memberof MeadCoScriptXPrint

     * @param {ContentType} contentType enum type of content given (html snippet, url)
     * @param {string} content the content - a url, html snippet or complete html
     * @param {object} htmlPrintSettings the settings to use - page and html such as headers and footers
     * @param {function({string})} fnDone function to call when printing complete (and output returned), arg is null on no error, else error message
     * @param {function(status,sInformation,data)} fnProgress function to call when job status is updated
     * @param {any} trackingData object to give pass to fnProgress
     * @return {boolean} - true if a print was started (otherwise an error will be thrown)
     * @private
     */
    var timeoutToJobStart = 0;
    var previousPrintCallWasAt = 0;
    var timeoutSpacingMSecs = 750;
    var jobGapResetTimeout = 10000;
    function printHtmlAtServer(contentType, content, htmlPrintSettings, fnDone, fnProgress, trackingData) {

        if (!content || (typeof content === "string" && content.length === 0)) {
            MeadCo.ScriptX.Print.reportError("Request to print no content - access denied?");
            if (typeof fnDone === "function") {
                fnDone("Request to print no content");
            }
            return false;
        }

        // if previous call was over (default) 10 seconds ago, reset
        var t = Date.now();
        if ((t - previousPrintCallWasAt) > jobGapResetTimeout) {
            timeoutToJobStart = 0;
        }
        previousPrintCallWasAt = t;
        setTimeout(funcPrintHtmlAtServer(contentType, content, htmlPrintSettings, trackingData, fnDone, fnProgress, function (sApi) {
            window.open(sApi, "_self");
        }), timeoutToJobStart);
        timeoutToJobStart += timeoutSpacingMSecs;
        return true;
    }

    // funcPrintPdfAtServer
    //
    // Create a closure on all the data for a print job which can be used with timeout.
    //
    function funcPrintPdfAtServer(document, pdfPrintSettings, fnDone, fnProgress, data) {

        MeadCo.log("started MeadCo.ScriptX.Print.print.printPdfAtServer() document: " + document + ", printerName: " + printerName);

        let devInfo;
        // deep clones of objects
        if (printerName === "") {
            devInfo = {};
        } else {
            devInfo = JSON.parse(JSON.stringify(deviceSettings[printerName]));
        }

        const requestData = {
            Document: document,
            Description: pdfPrintSettings.jobDescription,
            Settings: JSON.parse(JSON.stringify(pdfPrintSettings)),
            Device: devInfo,
            ProtectedContentAccess: AccessControl,
            OnProgress: fnProgress,
            UserData: data
        };

        // used/required by printAtServer ...
        requestData.Settings.jobTitle = pdfPrintSettings.jobDescription;

        const fakeJob = {
            jobIdentifier: Date.now(),
            printerName: requestData.Device.printerName,
            jobName: jobNameWaitingForSend
        };
        queueJob(fakeJob); // essentially a lock on the queue to stop it looking empty until this job is processed

        var requiredOutputName = nextJobFileName;
        nextJobFileName = "";

        return function () {
            removeJob(fakeJob.jobIdentifier);
            return printAtServer(pdfApiLocation, requestData,
                {
                    fail: function (err) {
                        progress(requestData, enumPrintStatus.ERROR, err);
                        MeadCo.ScriptX.Print.reportError(err);
                        if (typeof fnDone === "function") {
                            fnDone("Server error");
                        }
                    },

                    queuedToFile: function (data) {
                        MeadCo.log("default handler on queued to file response");
                        progress(requestData, enumPrintStatus.QUEUED);
                        monitorJob(pdfApiLocation, requestData, data.jobIdentifier,
                            -1,
                            function (data) {
                                if (data !== null) {
                                    MeadCo.log("Will download printed file");
                                    progress(requestData, enumPrintStatus.COMPLETED);
                                    let api = MeadCo.makeApiEndPoint(servicesServer.url, pdfApiLocation + "/download/" + data.jobIdentifier);
                                    if (requiredOutputName.length > 0) {
                                        api += "/" + requiredOutputName;
                                    }
                                    window.open(api, "_self");
                                }

                                if (typeof fnDone === "function") {
                                    fnDone(data === null ? "Server error" : null);
                                }
                            });
                    },

                    queuedToDevice: function (data) {
                        MeadCo.log("print was queued to device");
                        progress(requestData, enumPrintStatus.QUEUED);
                        monitorJob(pdfApiLocation, requestData, data.jobIdentifier,
                            -1,
                            function (data) {
                                if (data !== null) {
                                    progress(requestData, enumPrintStatus.COMPLETED);
                                }

                                if (typeof fnDone === "function") {
                                    fnDone(data === null ? "Server error" : null);
                                }
                            });
                    },

                    softError: function (data) {
                        progress(requestData, enumPrintStatus.ERROR, data.message);
                        MeadCo.ScriptX.Print.reportError(data.message);
                        MeadCo.log("printpdf call has soft error, remove job: " + data.jobIdentifier);
                        removeJob(data.jobIdentifier);
                        if (typeof fnDone === "function") {
                            MeadCo.log("Call fnDone");
                            fnDone("Server error");
                        }
                    },

                    ok: function (data) {
                        progress(requestData, enumPrintStatus.COMPLETED);
                        MeadCo.log("printed ok, no further information");
                        removeJob(data.jobIdentifier);
                        if (typeof fnDone === "function") {
                            fnDone(null);
                        }
                    }
                });
        };
    }

    /**
     * Post a request to the server api/v1/print to print a pdf document and monitor the print job 
     * to completion. If the server prints to file then the file is returned as a download
     * 
     * @function printPdfAtServer
     * @memberof MeadCoScriptXPrint
     * @param {string} document full url to the pdf document to be printed
     * @param {object} pdfPrintSettings the settings to use such as rotation, scaling. device settings (printer to use, copies etc) are taken from this static
     * @param {function({string})} fnDone function to call when printing complete (and output returned), arg is null on no error, else error message.
     * @param {function(status,sInformation,data)} fnProgress function to call when job status is updated
     * @param {any} data object to give pass to fnProgress
     * @return {boolean} - true if a print was started (otherwise an error will be thrown)
     * @private
     */
    function printPdfAtServer(document, pdfPrintSettings, fnDone, fnProgress, data) {

        if (!document || (typeof document === "string" && document.length === 0)) {
            MeadCo.ScriptX.Print.reportError("The document to print must be given.");
            if (typeof fnDone === "function") {
                fnDone("Request to print no content");
            }
            return false;
        }

        // if previous call was over (default) 10 seconds ago, reset
        const t = Date.now();
        if ((t - previousPrintCallWasAt) > jobGapResetTimeout) {
            timeoutToJobStart = 0;
        }
        previousPrintCallWasAt = t;
        setTimeout(funcPrintPdfAtServer(document, pdfPrintSettings, fnDone, fnProgress, data), timeoutToJobStart);
        timeoutToJobStart += timeoutSpacingMSecs;
        return true;
    }

    /**
      * Post a request to the server api/v1/printDirect to print a string directly to the current printer. The print is synchronous at the server
      * and is completed (sent to the printer) when the api returns.
      * 
      * @function printDirectAtServer
      * @memberof MeadCoScriptXPrint
 
      * @param {ContentType} contentType enum type of content given (string or url)
      * @param {string} content the content - a url, or string containing e.g. zpl.
      * @param {function({string})} fnDone function to call when printing complete, arg is null on no error, else error message
      * @return {boolean} - true if a print was started (otherwise an error will be thrown)
      * @private
      */
    function printDirectAtServer(contentType, content, fnDone) {
        MeadCo.log("started MeadCo.ScriptX.Print.print.printDirectAtServer() Type: " + contentType + ", printerName: " + printerName);
        if (contentType === enumContentType.URL) {
            MeadCo.log(".. request print url: " + content);
        }
        else {
            if (contentType !== enumContentType.STRING) {
                MeadCo.ScriptX.Print.reportError("Bad content type for direct printing");
                if (typeof fnDone === "function") {
                    fnDone("Bad content type for direct printing");
                }
                return false;
            }
        }

        if (!content || (typeof content === "string" && content.length === 0)) {
            MeadCo.ScriptX.Print.reportError("Request to print no content - access denied?");
            if (typeof fnDone === "function") {
                fnDone("Request to print no content");
            }
            return false;
        }

        if (printerName === "") {
            MeadCo.ScriptX.Print.reportError("Request to print but no current printer defined.");
            if (typeof fnDone === "function") {
                fnDone("Request to print but no current printer defined.");
            }
            return false;
        }

        const requestData = {
            ContentType: contentType,
            Content: content,
            PrinterName: printerName,
            Settings: {
                jobTitle: "Direct print" // not required by the server .. used by printAtServer()
            },
            Device: deviceSettings[printerName] // not required by the server .. used by printAtServer()
        };

        return printAtServer(directApiLocation, requestData,
            {
                fail: function (err) {
                    MeadCo.ScriptX.Print.reportError(err);
                    if (typeof fnDone === "function") {
                        fnDone("Server error");
                    }
                },

                softError: function (data) {
                    MeadCo.ScriptX.Print.reportError(data.message);
                    MeadCo.log("print has soft error");
                    removeJob(data.jobIdentifier);
                    if (typeof fnDone === "function") {
                        MeadCo.log("Call fnDone");
                        fnDone(data.message);
                    }
                },

                ok: function (data) {
                    MeadCo.log("printed ok, no further information");
                    removeJob(data.jobIdentifier); // for direct, by definition there is no queued response
                    if (typeof fnDone === "function") {
                        fnDone(null);
                    }
                }
            });
    }

    // set the ScriptX.Services server to use and the client license/subscription id
    //
    // Both arguments are optional, leaving the current values in place.
    //
    // All connection etc calls route to here, so here is the place to determine the port
    // number to use.
    //
    function setServer(serverUrl, clientLicenseGuid, resolve, reject) {
        if (typeof serverUrl === "string" && serverUrl.length > 0) {
            MeadCo.log("Print server requested: " + serverUrl + " with license: " + clientLicenseGuid);

            licenseGuid = typeof clientLicenseGuid === "string" && clientLicenseGuid.length > 0 ? clientLicenseGuid : licenseGuid;
            printerName = "";
            deviceSettings = {};
            activePrintQueue = []; // warning, will kill any current monitoring
            bConnected = false;
            availablePrinters = [];

            if (typeof resolve == "function") {
                servicesServer.setUrlAsync(serverUrl, resolve, reject);
            }
            else {
                servicesServer.url = serverUrl;
            }
        }
        else {
            MeadCo.log("Print server retained in setServer: " + servicesServer.url + " may update with license: {" + clientLicenseGuid + "} (if provided)");
            licenseGuid = typeof clientLicenseGuid === "string" && clientLicenseGuid.length > 0 ? clientLicenseGuid : licenseGuid;
        }
    }

    function connectToServer(serverUrl, clientLicenseGuid) {
        setServer(serverUrl, clientLicenseGuid);
        // note that this will silently fail if no advanced printing license
        getDeviceSettings({ name: "systemdefault", async: false });

        // also (async) cache server description
        getFromServer("", true,
            function (data) {
                cachedServiceDescription = data;
            });
    }

    function connectToServerAsync(serverUrl, clientLicenseGuid, resolve, reject) {
        setServer(serverUrl, clientLicenseGuid, function (foundUrl) {
            // note that this will silently fail if no advanced printing license
            getDeviceSettings({
                name: "systemdefault",
                done: resolve,
                async: true,
                fail: reject
            });

            // also (async) cache server description
            getFromServer("", true,
                function (data) {
                    cachedServiceDescription = data;
                });
        }, reject);
    }

    /**
     * Post a request to print
     * 
     * @param {string} sApi The server api endpoint (e.g. api/printhtml). The method '/print' will be added. 
     * @param {object} requestData The data to be posted
     * @param {functionList} responseInterface Callbacks to process responses
     * @returns {bool} true if request sent
     */
    function printAtServer(sApi, requestData, responseInterface) {

        const fakeJob = {
            jobIdentifier: Date.now(),
            printerName: requestData.Device.printerName,
            jobName: jobNameSentWaitingResponse
        };

        MeadCo.log("printAtServer using: " + sApi);

        queueJob(fakeJob); // essentially a lock on the queue to stop it looking empty while we await the result

        return callService(sApi + "/print", "POST", requestData, true, true, (data) => {
            MeadCo.log("Success response: " + data.status);
            data.printerName = requestData.Device.printerName;
            data.jobName = typeof requestData.Settings.jobTitle === "string" && requestData.Settings.jobTitle.length > 0 ? requestData.Settings.jobTitle : "server job";
            queueJob(data);
            removeJob(fakeJob.jobIdentifier);
            switch (data.status) {
                case enumResponseStatus.QUEUEDTOFILE:
                    responseInterface.queuedToFile(data);
                    break;

                case enumResponseStatus.QUEUEDTODEVICE:
                    responseInterface.queuedToDevice(data);
                    break;

                case enumResponseStatus.SOFTERROR:
                case enumResponseStatus.UNKNOWN:
                    responseInterface.softError(data);
                    break;

                case enumResponseStatus.OK:
                    responseInterface.ok(data);
                    break;
            }
        },
            (errMsg) => {
                removeJob(fakeJob.jobIdentifier);
                if (typeof responseInterface.fail === "function") {
                    responseInterface.fail(errMsg);
                }
            }
        );
    }

    /**
     * Call an API on the server with GET
     * 
     * @function getFromServer
     * @memberof MeadCoScriptXPrint
     * @param {string} sApi the api to call on the connected server
     * @param {bool} async true for asynchronous call, false for synchronous 
     * @param {function} onSuccess function to call on success
     * @param {function(errorText)} onFail function to call on failure
     * @private
     */
    function getFromServer(sApi, async, onSuccess, onFail) {
        return callService(sApi, "GET", null, true, async, onSuccess, onFail);
    }

    function callService(sApi, httpMethod, oApiData, bLicensed, bAsync, resolve, reject) {
        return servicesServer.call(sApi, httpMethod, oApiData, bLicensed, bAsync, resolve, reject);
    }

    function processMonitorResponse(requestData, data, intervalId, jobId, timeOut, functionComplete) {
        MeadCo.log("processMonitorResponse::jobStatus: " + data.status);
        switch (data.status) {
            case enumPrintStatus.COMPLETED:
                MeadCo.log("clear interval: " + intervalId);
                window.clearInterval(intervalId);
                removeJob(jobId);
                functionComplete(data);
                break;

            case enumPrintStatus.NOTSTARTED:
            case enumPrintStatus.DOWNLOADED:
            case enumPrintStatus.DOWNLOADING:
            case enumPrintStatus.PRINTING:
            case enumPrintStatus.QUEUED:
            case enumPrintStatus.STARTING:
            case enumPrintStatus.PAUSED:
            case enumPrintStatus.PRINTPDF:
                progress(requestData, data.status, data.message);
                updateJob(data);
                // keep going
                if (timeOut > 0 && (++counter * interval) > timeOut) {
                    window.clearInterval(intervalId);
                    MeadCo.ScriptX.Print.reportError("unknown failure while printing.");
                }
                break;

            case enumPrintStatus.ERROR:
            case enumPrintStatus.ABANDONED:
                MeadCo.log("error status in monitorJob so clear interval: " + intervalId);
                progress(requestData, data.status, data.message);
                removeJob(jobId);
                window.clearInterval(intervalId);
                MeadCo.ScriptX.Print.reportError("The print failed with the error: " + data.message);
                functionComplete(null);
                break;

            default:
                progress(requestData, data.status, data.message);
                MeadCo.log("unknown status in monitorJob so clear interval: " + intervalId);
                removeJob(jobId);
                window.clearInterval(intervalId);
                functionComplete(null);
                break;
        }

    }

    /**
     * Monitor a job that has been known to start  on the server. Get job status from the server and record in the job queue 
     * and process status appropriately. Progress callbacks will occur.
     * 
     * @function monitorJob
     * @memberof MeadCoScriptXPrint
     * @param {string} serverAndApi The server api endpoint (e.g. api/printhtml). The method '/status/' will be added.
     * @param {string} requestData The original data sent with the print request
     * @param {string} jobId The id return from the server for the job (to be monitored)
     * @param {number} timeOut Time give the job to complete or assume has got stuck, -1 means no timeout.
     * @param {function({object})} functionComplete function to call when job is complete. Argument is null on error, the data returned from the status call on success,.
     * @private
     */
    function monitorJob(sApi, requestData, jobId, timeOut, functionComplete) {
        MeadCo.log("monitorJob: " + jobId);
        const interval = 1000;
        let bWaiting = false;
        let intervalId = window.setInterval(function () {
            if (!bWaiting) {
                bWaiting = true; // ensure if the interval fires again before the last call response has been dealt with, wait till next interval until it has been dealt with
                getFromServer(sApi + "/status/" + jobId, true, (data) => {
                    processMonitorResponse(requestData, data, intervalId, jobId, timeOut, functionComplete);
                    bWaiting = false;
                },
                    (errorThrown) => {
                        MeadCo.log("error: " + errorThrown + " in monitorJob so clear interval: " + intervalId);
                        progress(requestData, enumPrintStatus.ERROR, errorThrown);
                        removeJob(jobId);
                        window.clearInterval(intervalId);
                        functionComplete(null);
                        bWaiting = false;
                    });
            } else {
                MeadCo.log("** info : still waiting for last status request to complete");
            }
        }, interval);

        MeadCo.log("intervalId: " + intervalId);
    }

    function addOrUpdateDeviceSettings(data) {
        if (typeof data.printerName === "string") {
            if (data.isDefault) {
                for (var i = 0; i < deviceSettings.length; i++) {
                    deviceSettings[i].isDefault = false;
                }
            }

            deviceSettings[data.printerName] = data;
            if (data.isDefault && printerName.length === 0) {
                printerName = data.printerName;
            }
        }
    }

    function getDeviceSettings(oRequest) {
        oRequest.name = oRequest.name.replace(/\\/g, "||");
        MeadCo.log("Request get device info: " + oRequest.name);

        getFromServer(htmlApiLocation + "/deviceinfo/" + encodeURIComponent(oRequest.name) + "/0", oRequest.async,
            function (data) {
                bConnected = true;
                addOrUpdateDeviceSettings(data);
                if (typeof oRequest.done === "function") {
                    oRequest.done(data);
                }
            },
            function (errTxt) {
                if (oRequest.name === "systemdefault") {
                    MeadCo.warn("request for systemdefault printer failed - please update to ScriptX.Services 2.11.1");
                    oRequest.name = "default";
                    getDeviceSettings(oRequest);
                }
                else {
                    MeadCo.log("failed to getdevice: " + errTxt);

                    if (typeof oRequest.fail === "function") {
                        oRequest.fail(errTxt);
                    }
                }
            }
        );

    }

    function getDeviceSettingsFor(sPrinterName) {
        if (typeof sPrinterName === "string" && sPrinterName !== "") {
            if (typeof deviceSettings[sPrinterName] === "undefined") {
                getDeviceSettings({
                    name: sPrinterName,
                    async: false,
                    done: function (printerData) {
                        if (sPrinterName.toLowerCase() === "systemdefault") {
                            sPrinterName = printerData.printerName;
                        }
                    },
                    fail: function (eTxt) { MeadCo.ScriptX.Print.reportError(eTxt); }
                });
            }

            return deviceSettings[sPrinterName];
        }

        return {};
    }

    function getDeviceSettingsForAsync(sPrinterName, resolve, reject) {
        if (typeof sPrinterName === "string" && sPrinterName !== "") {
            if (typeof deviceSettings[sPrinterName] === "undefined") {
                getDeviceSettings({
                    name: sPrinterName,
                    async: true,
                    done: function (printerData) {
                        if (sPrinterName.toLowerCase() === "systemdefault") {
                            sPrinterName = printerData.printerName;
                        }
                        resolve(deviceSettings[sPrinterName])
                    },
                    fail: function (eTxt) { reject(eTxt); }
                });
            }
            else
                resolve(deviceSettings[sPrinterName]);
        }
        else
            reject("a printer name is required");
    }

    function managePrinterConnection(sMethod, sShareName) {
        console.warn("Synchronous calls to add/remove printer connections are not recommeneded as this will lock the browser UI. Consider using the asynchronous versions when working with in ScriptX.Services");
        var sd = MeadCo.ScriptX.Print.serviceDescription();
        if (sd.serviceClass == enumServiceClass.WINDOWSPC && sd.serviceVersion.major >= 2 && sd.serviceVersion.minor >= 19) {
            callService(printerApiLocation + "/Connection/" + encodeURIComponent(sShareName), sMethod, null, true, false);
        }
        else {
            MeadCo.error("ScriptX.Services for Windows PC 2.19 or later is required for add/remove PrinterConnection()");
        }
    }

    function managePrinterConnectionAsync(sMethod, sShareName, onSuccess, onFail) {
        MeadCo.ScriptX.Print.serviceDescriptionAsync(
            function (sd) {
                if (sd.serviceClass == enumServiceClass.WINDOWSPC && sd.serviceVersion.major >= 2 && sd.serviceVersion.minor >= 19) {
                    callService(printerApiLocation + "/Connection/" + encodeURIComponent(sShareName), sMethod, null, true, true, onSuccess, onFail);
                }
                else {
                    MeadCo.error("ScriptX.Services for Windows PC 2.19 or later is required for add/remove PrinterConnection()");
                    onFail("add/remove PrinterConnection is not supported");
                }
            },
            onFail
        );
    }

    // look for auto-processing attributes that define the server to connect to and the
    // license/subscription to be used. 
    //
    // This implementation is called by the public api useAttributes (called by factory and secmgr implementations)
    //
    function processAttributes() {
        MeadCo.log("MeadCo.ScriptX.Print ... looking for auto connect, already found?: " + bDoneAuto);

        if (!bDoneAuto) {
            // protected API
            var printHtml = MeadCo.ScriptX.Print.HTML;
            var printApi = MeadCo.ScriptX.Print;
            var licenseApi = MeadCo.ScriptX.Print.Licensing;

            const cloudOrOnPremise = document.querySelector('[data-meadco-subscription]');
            if (cloudOrOnPremise) {
                const data = cloudOrOnPremise.dataset;
                MeadCo.log("Auto connect susbcription to: " +
                    data.meadcoServer + ", or " + data.meadcoPrinthtmlserver +
                    ", with subscription: " +
                    data.meadcoSubscription +
                    ", sync: " +
                    data.meadcoSyncinit +
                    ", usefetch: " +
                    data.meadcoUsefetch
                );
                const syncInit = ("" + data.meadcoSyncinit)
                    .toLowerCase() !==
                    "false"; // defaults to true if not specified

                if (!syncInit) {
                    const sFetchDefined = ("" + data.meadcoUsefetch);
                    if (sFetchDefined.length > 0)
                        MeadCo.fetchEnabled = sFetchDefined.toLowerCase() === "true";
                }
                else
                    MeadCo.fetchEnabled = false;

                const server = data.meadcoServer;
                if (typeof server === "undefined") {
                    server = data.meadcoPrinthtmlserver;
                }

                if (typeof server === "undefined") {
                    MeadCo.error("No server specified");
                } else {
                    // in case there will be a request for the subnscription info ..
                    if (typeof licenseApi !== "undefined")
                        licenseApi.connect(server, data.meadcoSubscription);

                    if (!syncInit) {
                        MeadCo.log("Async connectlite...");
                        printApi.connectLite(server, data.meadcoSubscription);
                    } else {
                        MeadCo
                            .warn("Synchronous connection is deprecated.jQuery is required for synchronous behaviour.To update to asynchronous behaviour please use data - meadco - syncinit='false'. Note that this may require additional code changes. Please see: https://www.meadroid.com/Developers/KnowledgeBank/HowToGuides/ScriptXServices/ThenToNow/Stage6");
                        printHtml.connect(server, data.meadcoSubscription);
                    }
                    bDoneAuto = true;
                }
            }
            else {
                const wPC = document.querySelector('[data-meadco-license]');

                if (wPC) {
                    if (typeof printApi === "undefined" || typeof printHtml === "undefined" || typeof licenseApi === "undefined") {
                        MeadCo.log("Not auto-connecting client license as print or printHtml or license API not present. Should be present on next attempt.");
                    } else {
                        const data = wPC.dataset;
                        MeadCo.log("Auto connect client license to: " +
                            data.meadcoServer +
                            ", with license: " +
                            data.meadcoLicense +
                            ", path: " +
                            data.meadcoLicensePath +
                            ", revision: " +
                            data.meadcoLicenseRevision +
                            ", sync: " +
                            data.meadcoSyncinit +
                            ", useFetch: " +
                            data.meadcoUsefetch +
                            ", orchestrator: " +
                            data.meadcoOrchestrator +
                            ", orchestratorKey: " +
                            data.meadcoOrchestratorKey +
                            ", trustVerifiedConnection: " +
                            data.meadcoTrustVerifiedConnection);

                        const syncInit = ("" + data.meadcoSyncinit)
                            .toLowerCase() !==
                            "false"; // defaults to true if not specified
                        const reportError = ("" + data.meadcoReporterror)
                            .toLowerCase() !==
                            "false"; // defaults to true if not specified
                        const applyLicense = ("" + data.meadcoApplyLicense)
                            .toLowerCase() ==
                            "true"; // only applies to async, defaults to false if not specified; if MeadCo ScriptXJS is in use, it will do the apply. Set true if it is not being used.

                        const server = data.meadcoServer;

                        servicesServer.orchestratorPort = data.meadcoOrchestrator;
                        servicesServer.orchestratorKey = data.meadcoOrchestratorKey;
                        servicesServer.trustVerifiedConnection = ("" + data.meadcoTrustVerifiedConnection)
                            .toLowerCase() !==
                            "false"; // defaults to true if not specified


                        if (!syncInit) {
                            MeadCo.log("Async connectlite...");
                            const sFetchDefined = ("" + data.meadcoUsefetch);
                            if (sFetchDefined.length > 0)
                                MeadCo.fetchEnabled = sFetchDefined.toLowerCase() === "true";

                            licenseApi.connectLite(server, data.meadcoLicense,
                                data.meadcoLicenseRevision,
                                data.meadcoLicensePath);
                            printApi.connectLite(server, data.meadcoLicense);

                            if (applyLicense) {
                                licenseApi.applyAsync(data.meadcoLicense, data.meadcoLicenseRevision, data.meadcoLicensePath,
                                    () => {
                                        MeadCo.log("NOTE: license has been applied successfully from async processing of attribute with values");
                                    },
                                    (e) => {
                                        MeadCo.error(`Failed to apply the license: ${e}, error is: ${licenseApi.errorMessage}`);
                                        if (reportError) {
                                            MeadCo.ScriptX.Print.reportError(licenseApi.errorMessage);
                                        }
                                    }
                                );
                            }
                        } else {
                            MeadCo
                                .warn("Synchronous connection is deprecated. jQuery is required for synchronous behaviour. To update to asynchronous behaviour please use data-meadco-syncinit='false'. Note that this may require additional code changes. Please see: https://www.meadroid.com/Developers/KnowledgeBank/HowToGuides/ScriptXServices/ThenToNow/Stage6");
                            MeadCo.fetchEnabled = false;
                            licenseApi.connect(server, data.meadcoLicense);
                            if (typeof data.meadcoLicensePath !== "undefined" &&
                                typeof data
                                    .meadcoLicenseRevision !==
                                "undefined") { // if these are not defined then you must use meadco-secmgr.js
                                licenseApi.apply(data.meadcoLicense,
                                    data.meadcoLicenseRevision,
                                    data.meadcoLicensePath);

                                if (licenseApi.result != 0 && reportError) {
                                    MeadCo.ScriptX.Print.reportError(licenseApi.errorMessage);
                                }
                            }
                            printHtml.connect(server, data.meadcoLicense);
                        }
                        bDoneAuto = true;
                    }
                }
            }
        }
    }

    MeadCo.log("MeadCo.ScriptX.Print " + version + " loaded.");

    //////////////////////////////////////////////////
    // public API
    return {
        /*
         * Enum for type of content being posted to printHtml API
         * @readonly
         * @memberof MeadCoScriptXPrint
         * @enum { ContentType }
         * 
         * URL: 1 a get request will be issued to the url and the returned content will be printed
         * HTML: 2 the passed string is assumed to be a complete html document .. <html>..</html>
         * INNERTHTML: 4 the passed string is a complete html document but missing the html tags
         */
        ContentType: enumContentType,

        /* 
         * Enum for status code returned to print progress callbacks
         * @readonly
         * @memberof MeadCoScriptXPrint
         * @enum PrintStatus { number }
         */
        PrintStatus: enumPrintStatus,

        ErrorAction: enumErrorAction,

        CollateOptions: enumCollateOptions,
        DuplexOptions: enumDuplexOptions,
        MeasurementUnits: enumMeasurementUnits,
        ServiceClasses: enumServiceClass,

        /**
         * Get/set the action to take when an error occurs
         * 
         * @memberof MeadCoScriptXPrint
         * @property {ErrorAction} onErrorAction - the action
         */
        get onErrorAction() {
            return errorAction;
        },

        set onErrorAction(action) {
            errorAction = action;
        },

        /**
         * Get/set the PORT number of the ScriptX.Services Orchestrator ('reverse proxy') to use. By definition orchestrator only listens
         * on the local-loopback address.
         * 
         * This is only useful in uses cases of multiple users are simultaneously logged in to an instance of Windows.
         * In these cases, the port number used by ScriptX.Services for Windows PC will be unqiue for each user.
         * 
         * The port number for the orchestrator is the same for each user as the orchestrator server is only active while the
         * user is active. 
         */
        get orchestrator() {
            return servicesServer.orchestratorPort;
        },

        set orchestrator(nPort) {
            servicesServer.orchestratorPort = "" + nPort;
        },

        /**
         * Get/set the key to use with Orchestrator Service for ScriptX.Services for Windows PC to recover the port registered for use with the same key.
         * Typically, this will be the user name but can be any value.
         * */
        get orchestratorKey() {
            return servicesServer.orchestratorKey;
        },

        set orchestratorKey(sKey) {
            servicesServer.orchestratorKey = sKey;
        },

        /**
         * Get/set the cookie to be used to authorise access to protected content
         * 
         * @memberof MeadCoScriptXPrint
         * @property {string} authorisationCookie - the cookie in the form name=value
         */
        get authorisationCookie() {
            return AccessControl.cookie;
        },

        set authorisationCookie(cookie) {
            AccessControl.cookie = cookie;
        },

        /** 
         *  Get/set the currently active printer
         *  @memberof MeadCoScriptXPrint
         *  @property {string} printerName - The name of the current printer in use.
         */
        get printerName() {
            return printerName;
        },

        set printerName(deviceRequest) {
            if (!(deviceRequest === printerName || deviceRequest.name === printerName)) {
                if (typeof deviceRequest === "string") {

                    if (typeof deviceSettings[deviceRequest] === "undefined") {
                        // not already cached, get (synchronously) if synchronous is available
                        // if synchronous is not available then getDeviceSettingsAsync() must be called 
                        // We have no choice but to fail this call. 
                        if (module.jQuery && !MeadCo.fetchEnabled) {
                            getDeviceSettings({
                                name: deviceRequest,
                                done: function (data) {
                                    printerName = data.printerName;
                                },
                                async: false,
                                fail: function (eTxt) {
                                    MeadCo.ScriptX.Print.reportError(eTxt);
                                }
                            });
                        }
                        else {
                            MeadCo.error("Asynchronous processing of set printerName required, synchronous calls to obtain device details will fail until this completes.")
                            getDeviceSettingsForAsync(deviceRequest,
                                (data) => { printerName = data.printerName; },
                                (eTxt) => { MeadCo.ScriptX.Print.reportError(eTxt); }
                            );

                            // awful, solely to not break backwards compatibility
                            if (servicesServer.serviceUrl === "")
                                MeadCo.ScriptX.Print.reportError("MeadCo.ScriptX.Print : server connection is not defined.");
                            else
                                MeadCo.ScriptX.Print.reportError("Not Found");
                        }
                    }
                    else {
                        printerName = deviceRequest;
                    }

                } else {
                    getDeviceSettings(deviceRequest);
                }
            }
        },

        setSystemDefaultPrinterAsync: function (sName, resolve, reject) {
            if (typeof deviceSettings["systemdefault"] !== "undefined" && deviceSettings["systemdefault"] == sName) {
                MeadCo.log("setSystemDefaultPrinterAsync() does NOT need to do anything");
                resolve();
                return;
            }

            sName = "system::" + sName;
            sName = sName.replace(/\\/g, "||");
            MeadCo.log("Request systemDefaultPrinterAsync: " + sName);
            callService(htmlApiLocation + "/CurrentPrinter/" + encodeURIComponent(sName), "PUT", null, true, true, resolve, reject);
        },

        /**
         * Get the version of this module as a string major.minor.hotfix.build
         * @property {string} version
         * @memberof MeadCoScriptXPrint
         */
        get version() {
            return version;
        },

        /**
         * Get the full url of the ScriptX.Services server connected to 
         * 
         * @property {string} serviceUrl
         * @memberof MeadCoScriptXPrint         
         */
        get serviceUrl() {
            return servicesServer.url;
        },

        /**
         * Get the version of the service connected to.
         * 
         * @function serviceVersion
         * @memberof MeadCoScriptXPrint
         * @returns {VersionObject} the version
         */
        serviceVersion: function () {
            return this.serviceDescription().serviceVersion;
        },

        /**
         * Get the version of the service connected to.
         * 
         * @function serviceVersionAsync
         * @memberof MeadCoScriptXPrint
         * @param {function({VersionObject})} resolve function to call on success
         * @param {function({errorText})} reject function to call on failure
         */
        serviceVersionAsync: function (resolve, reject) {
            this.serviceDescriptionAsync(function (sd) { resolve(sd.serviceVersion); }, reject);
        },

        /**
         * Get/set the cached device settings (papersize etc) for the currently active printer
         * @memberof MeadCoScriptXPrint
         * @property {DeviceSettingsObject} deviceSettings (see API /api/vi/printhtml/deviceInfo/ )
         */
        get deviceSettings() {
            return printerName !== "" ? deviceSettings[printerName] : {};
        },

        set deviceSettings(settings) {
            addOrUpdateDeviceSettings(settings);
        },

        /**
         * Get the device settings (papersize etc) for the named printer. This call is synchronous 
         * and not recommended. 
         * 
         * @function deviceSettingsFor
         * @memberof MeadCoScriptXPrint
         * @param {string} sPrinterName the name of the printer device to return the settings for 
         * @returns {DeviceSettingsObject} object with properties
         */
        deviceSettingsFor: function (sPrinterName) {
            return getDeviceSettingsFor(sPrinterName);
        },

        /**
         * Get the device settings (papersize etc) for the named printer. If not already downloaded
         * this function is asynchronous. 
         * 
         * @function deviceSettingsForAsync
         * @memberof MeadCoScriptXPrint
         * @param {string} sPrinterName the name of the printer device to return the settings for 
         * @param {function({DeviceSettingsObject})} resolve function to call on success
         * @param {function({errorText})} reject function to call on failure
         */
        deviceSettingsForAsync: function (sPrinterName, resolve, reject) {
            getDeviceSettingsForAsync(sPrinterName, resolve, reject);
        },

        /**
         * search for processing attibutes for connection and subscription/license and process them. The attibutes can be on any element. This function is called automatically by factory emulation and licensing emulation scripts so does not usually 
         * need to be called by document script.
         * 
         * Please note synchronous AJAX calls are deprecated in all browsers but may be useful to "quick start" use of older code. It is recommended that code is moved
         * to using asynchronous calls as soon as practical. The MeadCoScriptXJS library can assist with this as it delivers promise rather than callback based code.
         * 
         * @function useAttributes
         * @memberof MeadCoScriptXPrint
         * @example
         * 
         * <!-- an example connection to an On Premise server for ScriptX.Services -->
         * <script src="lib/meadco-scriptxservicesprintUI.min.js" 
         *      data-meadco-server="https://app.corpservices/" 
         *      data-meadco-subscription="" data-meadco-syncinit="false">
         * </script>;
         * 
         * <!-- an example connection to ScriptX.Services for Windows PC -->
         * <script src="lib/meadco-scriptxservicesUI.min.js"
         *      data-meadco-server="http://127.0.0.1:41191" 
         *      data-meadco-license="{6BC6808B-D645-40B6-AE80-E9D0825797EF}" 
         *      data-meadco-syncinit="false" 
         *      data-meadco-license-path="warehouse"
         *      data-meadco-license-revision="3">
         * </script>
         * 
         * data-meadco-server value is the root url, api/v1/printhtml, api/v1/licensing will be added by the library
         * data-meadco-syncinit default is true for synchronous calls to the server, value 'false' to use asynchronous calls to the server
         * 
         * data-meadco-subscription present => cloud/on premise service, value is the subscription GUID
         * data-meadco-license present => for Windows PC service, value is the license GUID
         *
         * If data-meadco-license is present then the following additional attributes can be used:
         * 
         * data-meadco-license-revision, value is the revision number of the license
         * data-meadco-license-path, value is the path to the license file (sxlic.mlf). A value of "warehouse" will cause the license to be downloaded from MeadCo's License Warehouse
         * data-meadco-reporterror, default is "true", value "false" suppresses error messages during the initial connection to the service (only)
         * 
         */
        useAttributes: function () {
            processAttributes();
        },

        /**
         * Specify the server to use and the subscription/license id. 
         * 
         * Attempt to connect to the defined ScriptX.Services server and obtain
         * the device settings for the default printer. This call is synchronous 
         * and therefore not recommended. Use connectAsync()
         * 
         * @function connect
         * @memberof MeadCoScriptXPrint
         * @param {string} serverUrl the 'root' url to the server (the api path will be added by the library)
         * @param {string} licenseGuid the license/subscription identifier
         */
        connect: function (serverUrl, licenseGuid) {
            connectToServer(serverUrl, licenseGuid);
        },

        /**
         * Specify the server and the subscription/license id to use on AJAX calls. No call is made in this function
         *
         * @function connectLite
         * @memberof MeadCoScriptXPrint
         * @param {string} serverUrl the 'root' url to the server (the api path will be added by the library)
         * @param {string} licenseGuid the license/subscription identifier
         */
        connectLite: function (serverUrl, licenseGuid) {
            // factory polyfill initialisation will result in a call with empty string
            // values for both arguments via printHtml.connectAsync() as it doesnt 
            // know the values so we assume a connectLite has already been called
            // and dont overwrite with empty values.
            setServer(serverUrl, licenseGuid);
        },

        /**
         * Specify the server to use and the subscription/license id.
         *
         * Attempt to connect to the defined ScriptX.Services server and obtain
         * the device settings for the default printer. 
         *
         * @function connectAsync
         * @memberof MeadCoScriptXPrint
         * @param {string} serverUrl the 'root' url to the server (the api path will be added by the library)
         * @param {string} licenseGuid the license/subscription identifier
         * @param {function({dataObject})} resolve function to call on success, dataObject contains the device settings for the default device.
         * @param {function} reject function to call on failure
         */
        connectAsync: function (serverUrl, licenseGuid, resolve, reject) {
            connectToServerAsync(serverUrl, licenseGuid, resolve, reject);
        },

        /**
         * Test if there is a MeadCo PrintHtml API server at the url
         * 
         * @function connectTestAsync
         * @memberof MeadCoScriptXPrint
         * @param {string} serverUrl the 'root' url to the server (the api path will be added by the library)
         * @param {function({foundServerUrl})} resolve function to call on success
         * @param {function({errorText})} reject function to call on failure
         */
        connectTestAsync: function (serverUrl, resolve, reject) {
            servicesServer.verifyUrl(serverUrl, true, resolve, reject);
        },

        /**
         * Obtain the description of the service provided by the server
         *
         * @function serviceDescription
         * @memberof MeadCoScriptXPrint
         * @returns {ServiceDescriptionObject} serviceDescription
         */
        serviceDescription: function () {

            if (!cachedServiceDescription) {
                getFromServer("", false,
                    function (data) { cachedServiceDescription = data; },
                    function (e) {
                        MeadCo.ScriptX.Print.reportError(e.message);
                    });
            }
            return cachedServiceDescription;
        },

        /**
         * Obtain the description of the service provided by the server
         *
         * @function serviceDescriptionAsync
         * @memberof MeadCoScriptXPrint
         * @param {function(ServiceDescriptionObject)} resolve function to call on success
         * @param {function(errorText)} reject function to call on failure
         */
        serviceDescriptionAsync: function (resolve, reject) {

            if (!cachedServiceDescription) {
                getFromServer("", true,
                    function (data) {
                        cachedServiceDescription = data;
                        resolve(data);
                    }, reject);
            }
            else {
                resolve(cachedServiceDescription);
            }
        },

        /**
         * Cache the given device info and available printers in this static class instance
         * 
         * Used by libraries that call api/v1/printHtml/htmlPrintDefaults
         * 
         * @function connectDeviceAndPrinters
         * @memberof MeadCoScriptXPrint
         * @param {object} deviceInfo the device name and settings (papersize etc)
         * @param {array} arPrinters the names of the available printers
         */
        connectDeviceAndPrinters: function (deviceInfo, arPrinters) {
            bConnected = true;
            addOrUpdateDeviceSettings(deviceInfo);
            availablePrinters = arPrinters;
        },

        /**
         * true if the library has succesfully connected to a server and the default device settings obtained.
         * 
         * @memberof MeadCoScriptXPrint
         * @property {bool} isConnected true if the library has succesfully connected to a server.
         * @readonly
         */
        get isConnected() {
            return bConnected;
        },

        /**
         * Get the list of printers availablefrom the server.
         * 
         * @property {string[]} availablePrinterNames an array of strings of the names of the available printers
         * @memberof MeadCoScriptXPrint
         * @readonly
         */
        get availablePrinterNames() {
            return availablePrinters;
        },

        /**
         * Add a printer for the user. The printer driver must already be available. 
         * 
         * @function addPrinterConnection
         * @memberof MeadCoScriptXPrint
         * @param {any} sShareName - 
         */
        addPrinterConnection: function (sShareName) {
            managePrinterConnection("PUT", sShareName);
        },

        /**
         * Add a printer for the user. The printer driver must already be available. 
         * 
         * @function removePrinterConnection
         * @memberof MeadCoScriptXPrint
         * @param {any} sShareName - 
         */
        removePrinterConnection: function (sShareName) {
            managePrinterConnection("DELETE", sShareName);
        },

        /**
         * Add a printer for the user. The printer driver must already be available. 
         * 
         * @function addPrinterConnectionAsync
         * @memberof MeadCoScriptXPrint
         * @param {any} sShareName - 
         * @param {any} onSuccess
         * @param {any} onFail
         */
        addPrinterConnectionAsync: function (sShareName, onSuccess, onFail) {
            managePrinterConnectionAsync("PUT", sShareName, onSuccess, onFail);
        },

        /**
         * Add a printer for the user. The printer driver must already be available. 
         * 
         * @function removePrinterConnectionAsync
         * @memberof MeadCoScriptXPrint
         * @param {any} sShareName - 
         * @param {any} onSuccess
         * @param {any} onFail
         */
        removePrinterConnectionAsync: function (sShareName, onSuccess, onFail) {
            managePrinterConnectionAsync("DELETE", sShareName, onSuccess, onFail);
        },

        /**
         * Call a /printHtml API on the server with GET
         * 
         * @function getFromServer
         * @memberof MeadCoScriptXPrint
         * @param {string} sPrintHtmlApi the api to call on the connected server
         * @param {bool} async true for asynchronous call, false for synchronous 
         * @param {function} onSuccess function to call on success
         * @param {function(errorText)} onFail function to call on failure
         */
        getFromServer: function (sPrintHtmlApi, async, onSuccess, onFail) {
            getFromServer(htmlApiLocation + sPrintHtmlApi, async, onSuccess, onFail);
        },

        /**
         * Post a request to the server to print some html and monitor the print job 
         * to completion. If the server prints to file then the file is opened for the user (in a new window)
         * 
         * @function printHtml
         * @memberof MeadCoScriptXPrint

         * @param {ContentType} contentType enum type of content given (html snippet, url)
         * @param {string} content the content - a url, html snippet or complete html
         * @param {object} htmlPrintSettings the html settings to use such as headers and footers, device settings (printer to use, copies etc) are taken from this static 
         * @param {function({string})} fnDone function to call when printing complete (and output returned), arg is null on no error, else error message.
         * @param {function(status,sInformation,data)} fnProgress function to call when job status is updated
         * @param {any} data object to give pass to fnProgress
         * @return {boolean} - true if a print was started (otherwise an error will be thrown)
         */
        printHtml: printHtmlAtServer,

        /**
         * Post a request to the server to generate a preview. When ready the url from which the preview can be downloaded
         * is passed to the fnReady function.
         * 
         * @function requestHtmlPreview
         * @memberof MeadCoScriptXPrint
         * 
         * @param {ContentType} contentType enum type of content given (html snippet, url)
         * @param {string} content the content - a url, html snippet or complete html
         * @param {object} htmlPrintSettings the html settings to use such as headers and footers, device settings (printer to use, copies etc) are taken from this static
         * @param {function({string})} fnDone function to call when processing is complete arg is null on no error, else error message.
         * @param {function({string})} fnReady function to call when the preview is available to download
         */
        requestHtmlPreview: function (contentType, content, htmlPrintSettings, fnDone, fnReady) {
            var userPrinterName = printerName;
            printerName = magicPrintPreviewPrinter;

            funcPrintHtmlAtServer(contentType, content, htmlPrintSettings, {}, fnDone, function () { }, fnReady)();
            printerName = userPrinterName;
        },

        /**
         * Post a request to the server to print some html and monitor the print job 
         * to completion. If the server prints to file then the file is opened for the user (in a new window)
         * 
         * @function printPdf
         * @memberof MeadCoScriptXPrint

         * @param {string} document full url to the pdf document to be printed
         * @param {object} pdfPrintSettings the settings to use such as rotation, scaling. device settings (printer to use, copies etc) are taken from this static
         * @param {function({string})} fnDone function to call when printing complete (and output returned), arg is null on no error, else error message.
         * @param {function(status,sInformation,data)} fnProgress function to call when job status is updated
         * @param {any} data object to give pass to fnProgress
         * @return {boolean} - true if a print was started (otherwise an error will be thrown)
         */
        printPdf: printPdfAtServer,

        /**
         * Post a request to the server to print a string directly to the current printer. The print is synchronous at the server
         * and is completed (sent to the printer) when the api returns.
         *
         * @function printDirect
         * @memberof MeadCoScriptXPrint
         *
         * @param {ContentType} contentType enum type of content given (string or url)
         * @param {string} content the content - a url, or string containing e.g. zpl.
         * @param {function({string})} fnDone function to call when printing complete, arg is null on no error, else error message
         * @return {boolean} - true if a print was started (otherwise an error will be thrown)         *
         */
        printDirect: printDirectAtServer,

        /**
         * Extract the error text from jQuery AJAX response
         * 
         * @function parseAjaxError
         * @memberof MeadCoScriptXPrint
         * 
         * @param {string} logText The lead-in text for a console.log entry
         * @param {object} jqXhr jQuery ajax header
         * @param {string} textStatus textStatus result determined by jQuery
         * @param {string} errorThrown The server exception dewtermined by jQuery
         * @returns {string} The error text to display
         */
        parseAjaxError: function (logText, jqXhr, textStatus, errorThrown) {
            return MeadCo.parseAjaxError(logText, jqXhr, textStatus, errorThrown);
        },

        /**
         * Extract the error text from browser fetch response
         * 
         * @function parseFetchError
         * @memberof MeadCoScriptXPrint
         * 
         * @param {object} errorThrown error caught from fetch 
         * @returns {string} The error text to display
         */
        parseFetchError: function (logText, errorThrown) {
            return MeadCo.parseFetchError(logText, errorThrown);
        },

        /**
         * 'derived' classes call this function to report errors, will either throw or report depending on 
         * value of onErrorAction.
         * 
         * @memberof MeadCoScriptXPrint
         * @function reportError 
         * @param {string} errorTxt the error text to display
         * 
         */
        reportError: function (errorTxt) {
            MeadCo.error("ReportError: " + errorTxt);
            switch (errorAction) {
                case enumErrorAction.REPORT:
                    MeadCo.ScriptX.Print.reportServerError(errorTxt);
                    break;

                case enumErrorAction.THROW:
                    throw new Error(errorTxt);
            }
        },

        /**
         * overridable function for reporting an error. 'derived' classes call this
         * function to report errors.
         * 
         * @memberof MeadCoScriptXPrint
         * @function reportServerError 
         * @param {string} errorTxt the error text to display
         * 
         * ```js
         * // overload cloud print library report error
         * MeadCo.ScriptX.Print.reportServerError = function (errorTxt) {
         *    app.Messages.PrintErrorBox(errorTxt);
         * }
         * ```
         */
        reportServerError: function (errorTxt) {
            alert("There was an error in the printing service\n\n" + errorTxt);
        },

        /**
         * overridable function for reporting an implementation isnt available. 'derived' classes call this
         * function to report functions that are not yet implemented.
         * 
         * @memberof MeadCoScriptXPrint
         * @function reportFeatureNotImplemented
         * @param {string} featureDescription descriptn of the feature that isnt available
         * 
         * ```js
         * // overload cloud print library report error
         * MeadCo.ScriptX.Print.reportFeatureNotImplemented = function (featureDescription) {
         *   app.Messages.PrintErrorBox(featureDescription + " is not available yet with the ScriptX.Services.\n\nThis feature will be implemented soon.");
         * }
         * ```
         */
        reportFeatureNotImplemented: function (featureDescription) {
            MeadCo.log("Call to not implemented: " + featureDescription);
            alert(featureDescription + "\n\nis not available.");
        },

        /**
         * The list of jobs currently active at this client or server (client 'jobs' are those waiting to be 
         * delivered to the server and 'locks' while asychronous UI is in progress).
         * 
         * @memberof MeadCoScriptXPrint
         * @property {object[]} queue array of jobs 
         * @readonly
         */
        get queue() {
            return activePrintQueue;
        },

        /**
         * The number of jobs there are active *at the server* for this client
         * 
         * @memberof MeadCoScriptXPrint
         * @property {int} activeJobs the number of jobs
         * @readonly
         */
        get activeJobs() {
            return this.queue.filter(j => j.jobName !== jobNameWaitingForSend && j.jobName !== jobNameSentWaitingResponse && j.jobName !== jobNameHoldEnsureSpoolingStatus).length;
        },

        /**
         * The number of client only jobs (locks and those waiting for delivery to the server) active at this client
         * 
         * @memberof MeadCoScriptXPrint
         * @property {int} clientSideJobs the number of jobs
         * @readonly
         */
        get clientSideJobs() {
            return this.queue.filter(j => j.jobName == jobNameWaitingForSend || j.jobName == jobNameSentWaitingResponse || j.jobName == jobNameHoldEnsureSpoolingStatus).length;
        },

        /**
         * Check if there are no jobs waiting for delivery to the server (faster than clientSideJobs==0)
         * 
         * @memberof MeadCoScriptXPrint
         * @property {bool} noJobsWaitingDelivery true if no jobs waiting
         * @readonly
         */
        get noJobsWaitingDelivery() {
            return this.queue.every(j => j.jobName !== jobNameWaitingForSend && j.jobName !== jobNameSentWaitingResponse && j.jobName !== jobNameHoldEnsureSpoolingStatus);
        },

        /**
         * Make sure that spooling status is locked active while asynchronous UI that may start
         * printing is displayed by placing a lock on the queue.
         * 
         * @memberof MeadCoScriptXPrint
         * @function ensureSpoolingStatus
         * @returns {object} a fake job to lock the spooling status on
         * 
         * @example
         * var lock = MeadCo.ScriptX.Print.ensureSpoolingStatus
         * ShowAsyncUI(function() {
         *  MeadCo.ScriptX.Print.freeSpoolStatus(lock);
         * });
         */
        ensureSpoolingStatus: function () {
            var lock = { jobIdentifier: Date.now(), printerName: "ensureJobsPrinter", jobName: jobNameHoldEnsureSpoolingStatus };
            queueJob(lock);
            return lock;
        },

        /**
         * Remove a lock on the queue that was created by a call to ensureSpoolingStatus().
         * 
         * @memberof MeadCoScriptXPrint
         * @function freeSpoolStatus
         * @param {object} lock the lock object returned by ensureSpoolingStatus()
         */
        freeSpoolStatus: function (lock) {
            removeJob(lock.jobIdentifier);
        },

        /**
         * Get if print is still 'spooling', in other words still queued at the server
         * 
         * @memberof MeadCoScriptXPrint
         * @property {bool} isSpooling
         * @readonly
         */
        get isSpooling() {
            return jobCount() > 0;
        },

        /**
         * Start (asynchronous) monitor to observe until no more jobs spooling/waiting at the server
         * then call the given callback function
         * 
         * @memberof MeadCoScriptXPrint
         * @function waitForSpoolingComplete
         * @param {int} iTimeout wait until complete or timeout (in ms) -1 => infinite
         * @param {function({bool})} fnComplete callback function, arg is true if all jobs complete
         */
        waitForSpoolingComplete: function (iTimeout, fnComplete) {
            MeadCo.log("Started WaitForSpoolingComplete(" + iTimeout + ")");
            if (typeof fnComplete !== "function") {
                throw "WaitForSpoolingComplete requires a completion callback";
            }

            var startTime = Date.now();
            var interval = 250;

            var intervalId = window.setInterval(function () {
                if (jobCount() === 0) {
                    MeadCo.log("WaitForSpoolingComplete - complete");
                    window.clearInterval(intervalId);
                    fnComplete(true);
                } else {
                    if (iTimeout >= 0 && Date.now() - startTime > iTimeout) {
                        MeadCo.log("WaitForSpoolingComplete - timeout");
                        window.clearInterval(intervalId);
                        fnComplete(jobCount() === 0);
                    }
                }
            }, interval);
        },

        /**
         * Start (asynchronous) monitor to observe until all submitted jobs have been
         * delivered to the server, there will probably be jobs still waiting to process/spool
         * at the server. It is not safe to close the browser window until this function 
         * indicates completion
         * 
         * @memberof MeadCoScriptXPrint
         * @function waitForDeliveryComplete
         * @param {int} iTimeout wait until complete or timeout (in ms) -1 => infinite
         * @param {function({bool})} fnComplete callback function, arg is true if all jobs delivered

         */
        waitForDeliveryComplete: function (iTimeout, fnComplete) {
            MeadCo.log("Started waitForDeliveryComplete(" + iTimeout + ")");
            if (typeof fnComplete !== "function") {
                throw "waitForDeliveryComplete requires a completion callback";
            }

            const startTime = Date.now();
            const interval = 250;
            const that = this;

            const intervalId = window.setInterval(() => {
                if (that.noJobsWaitingDelivery) {
                    MeadCo.log("waitForDeliveryComplete - complete");
                    window.clearInterval(intervalId);
                    fnComplete(true);
                } else {
                    if (iTimeout >= 0 && Date.now() - startTime > iTimeout) {
                        MeadCo.log("waitForDeliveryComplete - timeout");
                        window.clearInterval(intervalId);
                        fnComplete(false);
                    }
                }
            }, interval);

        },

        /**
          * Waits for all pending operations originated with Print, PrintHTML and BatchPrintPDF to be delivered to the server. This is useful
          * to determine when it is safe to call window.close() and not loose jobs and is a significantly shorter period than waitForSpoolingComplete()
          * 
          * @function waitForDeliveryCompleteAsync
          * @memberof MeadCoScriptXPrint
          * @returns {Promise} Promise object represents boolean with value true if all jobs have been delivered.
          * @example 
          * MeadCo.ScriptX.PrintPage(false);
          * await MeadCo.ScriptX.Print.waitForDeliveryCompleteAsync();
          * self.close();
          */
        waitForDeliveryCompleteAsync: function () {
            const that = this;
            return new Promise(function (resolve, reject) {
                that.waitForDeliveryComplete(-1, resolve);
            });
        },

        /**
         * Get/set the timeout between jobs when there is a series of print calls and maintaining the output order is required.
         * The default is 750ms. On slow systems/slow connections this may need to be increased.
         * 
         * @memberof MeadCoScriptXPrint
         * @property {number} queueTimeoutSpacing
         */
        get queueTimeoutSpacing() {
            return timeoutSpacingMSecs;
        },

        set queueTimeoutSpacing(msec) {
            timeoutSpacingMSecs = msec;
        },

        /**
         * Get/set the time since last print call after which the job spacing timeout is reset
         * 
         * @memberof MeadCoScriptXPrint
         * @property {number} queueGapResetTime
         */
        get queueGapResetTime() {
            return jobGapResetTimeout;
        },

        set queueGapResetTime(msec) {
            jobGapResetTimeout = msec;
        },

        /**
         * Get/set the name to use on the next job
         * 
         * @memberof MeadCoScriptXPrint
         * @property {string} jobFileName
         */
        get jobFileName() {
            return nextJobFileName;
        },

        set jobFileName(sname) {
            nextJobFileName = sname;
        },

        requestService: function (sApi, method, oApiData, bLicensed, bAsync, resolve, reject) {
            return callService(sApi, method, oApiData, bLicensed, bAsync, resolve, reject);
        },

        getService: function (sApi, oApiData, bLicensed) {
            return callService(sApi, "GET", oApiData, bLicensed, false);
        },

        postService: function (sApi, oApiData, bLicensed) {
            return callService(sApi, "POST", oApiData, bLicensed, false);
        },

        getServiceAsync: function (sApi, oApiData, bLicensed, resolve, reject) {
            return callService(sApi, "GET", oApiData, bLicensed, true, resolve, reject);
        },

        postServiceAsync: function (sApi, oApiData, bLicensed, resolve, reject) {
            return callService(sApi, "POST", oApiData, bLicensed, true, resolve, reject);
        }

    };

});
