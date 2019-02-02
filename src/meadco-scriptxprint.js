/**
 * MeadCo.ScriptX.Print
 * 
 * A static class wrapping calls to the server API. 
 * 
 * Includes processing of calls to the print api that return "printing to file" including collecting the 
 * file output. 
 * 
 * Provides attribute based connection to the server.
 * 
 * @namespace MeadCoScriptXPrint
 * @author Pete Cole <pcole@meadroid.com>
 * @license MIT license
 */

; (function (name, definition) {
    extendMeadCoNamespace(name, definition);
})('MeadCo.ScriptX.Print', function () {
    // module version and the api we are coded for
    var version = "1.5.1.4";
    var apiLocation = "v1/printHtml";

    var printerName = "";
    var deviceSettings = {};
    var module = this;

    var activePrintQueue = []; // current job queue

    var server = ""; // url to the server, server is CORS restricted
    var licenseGuid = "";
    var bConnected = false;

    var bDoneAuto = false;

    var availablePrinters = [];

    var enumContentType = {
        URL: 1, // the url will be downloaded and printed
        HTML: 2, // the passed string is assumed to be a complete html document .. <html>..</html>
        INNERTHTML: 4 // the passed string is a complete html document but missing the html tags
    };

    var enumResponseStatus = {
        QUEUEDTODEVICE: 1,
        QUEUEDTOFILE: 2,
        SOFTERROR: 3,
        OK: 4
    };

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

    function queueJob(data) {
        activePrintQueue.push(data);
        MeadCo.log("ScriptX.Print queueJob, jobCount: " + activePrintQueue.length);
    }

    function jobCount() {
        MeadCo.log("ScriptX.Print jobCount: " + activePrintQueue.length);
        return activePrintQueue.length;
    }

    function findJob(id) {
        var i;
        for (i = 0; i < activePrintQueue.length; i++) {
            if (activePrintQueue[i].jobIdentifier === id) {
                return activePrintQueue[i];
            }
        }
        return null;
    }

    function updateJob(data) {
        var i;
        for (i = 0; i < activePrintQueue.length; i++) {
            if (activePrintQueue[i].jobIdentifier === data.jobIdentifier) {
                var fnCallBack = data.fnNotify;
                if (typeof fnCallBack !== "function")
                    data.fnNotify = activePrintQueue[i].fnNotify;

                if (typeof data.fnNotify === "function" && (data.status === enumResponseStatus.QUEUEDTOFILE || data.status !== activePrintQueue[i].status)) {
                    data.fnNotify(data);
                }

                activePrintQueue[i] = data;
                return;
            }
        }
        console.warn("Unable to find job: " + data.jobIdentifier + " to update it");

    }

    function removeJob(id) {
        var i;
        for (i = 0; i < activePrintQueue.length; i++) {
            if (activePrintQueue[i].jobIdentifier === id) {
                activePrintQueue.splice(i, 1);
                MeadCo.log("ScriptX.Print remove job, jobCount: " + activePrintQueue.length);
                return;
            }
        }
        console.warn("Unable to find job: " + id + " to remove it");
    }

    function progress(requestData, status, information) {
        if (typeof requestData.OnProgress === "function") {
            requestData.OnProgress(status, information, requestData.UserData);
        }
    }

    function parseError(logText, jqXhr, textStatus, errorThrown) {
        MeadCo.log("**warning: AJAX call failure in " + logText + ": [" +
            textStatus +
            "], [" +
            errorThrown +
            "], [" +
            jqXhr.responseText +
            "]");

        if (errorThrown === "") {
            if (typeof jqXhr.responseText !== "undefined" ) {
                errorThrown = jqXhr.responseText;
            }
        }
        else {
            if (typeof errorThrown !== "undefined") {
                errorThrown = errorThrown.toString();
            }
            else {
                errorThrown = "";
            }
        }

        //if (typeof jqXhr.responseText !== "undefined") {
        //    errorThrown = jqXhr.responseText;
        //}

        if (errorThrown === "") {
            if (textStatus !== "error") {
                errorThrown = textStatus;
            }
            else {
                errorThrown = "Unknown server or network error";
            }
        }

        return errorThrown;
    }

    // call api on server to print the content
    //
    // contentType - 
    // content - string
    // htmlPrintSettings - html settings to use, the function will use device settings for the current print
    // fnDone(errorXhr) - function called when printing complete (and output returned), arg is null on no error.
    // fnNotify(data) - callback when job associated with this print is updated (data is server result)
    // fnCallback(status,sInformation,data) - callback when job status is updated 
    // data - date to give to fnCallback
    //

    /*
     * Post a request to the server api/v1/print to print some html and monitor the print job 
     * to completion. If the server prints to file then the file is opened for the user (in a new window)
     * 
     * @function printHtmlAtServer
     * @memberof MeadCoScriptXPrint

     * @param {enumContentType} contentType enum type of content given (html snippet, url)
     * @param {string} content the content - a url, html snippet or complete html
     * @param {object} htmlPrintSettings the settings to use - device annd html such as headers and footers
     * @param {function({object})} fnDone function to call when printing complete (and output returned), arg is null on no error.
     * @param {function({object})} fnNotify function to call when job associated with this print is updated (data is server result)
     * @param {function(status,sInformation,data)} fnCallback function to call when job status is updated
     * @param {any} data object to give pass to fnCallback
     * @return {boolean} - true if a print was started (otherwise an error will be thrown)
     */
    function printHtmlAtServer(contentType, content, htmlPrintSettings, fnDone, fnNotify, fnCallback, data) {
        MeadCo.log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType + ", printerName: " + printerName);
        if (contentType === enumContentType.URL) {
            MeadCo.log(".. request print url: " + content);
        }
        var devInfo;

        if (printerName === "") {
            devInfo = {};
        } else {
            devInfo = deviceSettings[printerName];
        }

        var requestData = {
            ContentType: contentType,
            Content: content,
            Settings: htmlPrintSettings,
            Device: devInfo,
            OnProgress: fnCallback,
            UserData: data
        };

        return printAtServer(requestData,
        {
            fail: function (jqXhr, textStatus, errorThrown) {
                progress(requestData, enumPrintStatus.ERROR, errorThrown);
                MeadCoScriptXPrint.reportServerError(errorThrown);
                if (typeof fnDone === "function") {
                    fnDone(jqXhr);
                }
            },

            queuedToFile: function (data) {
                MeadCo.log("default handler on queued to file response");
                progress(requestData, enumPrintStatus.QUEUED);

                if (typeof fnNotify === "function") {
                    data.fnNotify = fnNotify;
                    updateJob(data);
                }

                monitorJob(requestData, data.jobIdentifier,
                    -1,
                    function (data) {
                        if (data != null) {
                            MeadCo.log("Will download printed file");
                            progress(requestData, enumPrintStatus.COMPLETED);
                            window.open(server + "/download/" + data.jobIdentifier, "_self");
                        }

                        if (typeof fnDone === "function") {
                            fnDone(data != null ? "Server error" : null);
                        }
                    });
            },

            queuedToDevice: function (data) {
                progress(requestData, enumPrintStatus.QUEUED);
                MeadCo.log("print was queued to device");

                if (typeof fnNotify === "function") {
                    data.fnNotify = fnNotify;
                    updateJob(data);
                }

                monitorJob(requestData, data.jobIdentifier,
                    -1,
                    function (data) {
                        if (data != null) {
                            progress(requestData, enumPrintStatus.COMPLETED);
                        }

                        if (typeof fnDone === "function") {
                            fnDone(data != null ? "Server error" : null);
                        }
                    });
            },

            softError: function (data) {
                progress(requestData, enumPrintStatus.ERROR);
                MeadCo.log("print has soft error");
            },

            ok: function (data) {
                progress(requestData, enumPrintStatus.COMPLETED);
                MeadCo.log("printed ok, no further information");
                if (typeof fnNotify === "function") {
                    data.fnNotify = fnNotify;
                    updateJob(data);
                }
                if (typeof fnDone === "function") {
                    fnDone(null);
                }
            }
        });
    };

    function setServer(serverUrl, clientLicenseGuid) {
        if (serverUrl.length > 0) {
            MeadCo.log("Print server requested: " + serverUrl + " => " + MeadCo.makeApiEndPoint(serverUrl, apiLocation) + " with license: " + clientLicenseGuid);
            server = MeadCo.makeApiEndPoint(serverUrl, apiLocation);
            licenseGuid = clientLicenseGuid;
        }
    }

    function connectToServer(serverUrl, clientLicenseGuid) {
        setServer(serverUrl, clientLicenseGuid);
        // note that this will silently fail if no advanced printing license
        getDeviceSettings({ name: "default", async: false });
    }

    function connectToServerAsync(serverUrl, clientLicenseGuid, resolve, reject) {
        setServer(serverUrl, clientLicenseGuid);
        // note that this will silently fail if no advanced printing license
        getDeviceSettings({
            name: "default",
            done: resolve,
            async: true,
            fail: reject
        });
    }

    // testServerConnection
    //
    // Can we ask something and get a respponse, without using a license - checks the server is there.
    //
    function testServerConnection(serverUrl, resolve, reject) {
        if (serverUrl.length > 0) {
            // use the license API
            var licenseApi = "v1/licensing";
            MeadCo.log("Test server requested: " + serverUrl + " => " + MeadCo.makeApiEndPoint(serverUrl, licenseApi));
            serverUrl = MeadCo.makeApiEndPoint(serverUrl, licenseApi);
            if (module.jQuery) {
                var serviceUrl = serverUrl + "/ping";
                MeadCo.log(".ajax() get: " + serviceUrl);
                module.jQuery.ajax(serviceUrl,
                    {
                        method: "GET",
                        dataType: "json",
                        cache: false,
                        async: true,
                    }).done(function (data) {
                        resolve(data);
                    })
                    .fail(function (jqXhr, textStatus, errorThrown) {
                        errorThrown = parseError("MeadCo.ScriptX.Print.testServerConnection:",jqXhr, textStatus, errorThrown);
                        if (typeof reject === "function")
                            reject(errorThrown);
                    });
            }
        }
    }

    function printAtServer(requestData, responseInterface) {

        if (server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : print server URL is not set or is invalid");
        }

        var fakeJob = {
            jobIdentifier: Date.now(),
            printerName: requestData.Device.printerName,
            jobName: "Job starting"
        };


        if (module.jQuery) {
            MeadCo.log(".ajax() post to: " + server);
            // MeadCo.log(JSON.stringify(requestData));

            queueJob(fakeJob); // essentially a lock on the queue to stop it looking empty while we await the result
            module.jQuery.ajax(server + "/print",
                {
                    data: JSON.stringify(requestData),
                    dataType: "json",
                    contentType: "application/json",
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                })
                .done(function (data) {
                    MeadCo.log("Success response: " + data.status);
                    data.printerName = requestData.Device.printerName;
                    data.jobName = requestData.Settings.jobTitle;
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
                            responseInterface.softError(data);
                            break;

                        case enumResponseStatus.OK:
                            responseInterface.ok(data);
                            break;
                    }
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    MeadCo.log("Fail response from server: [" +
                        textStatus +
                        "], [" +
                        errorThrown +
                        "], [" +
                        jqXhr.responseText +
                        "]");
                    removeJob(fakeJob.jobIdentifier);
                    if (typeof jqXhr.responseText !== "undefined") {
                        errorThrown = jqXhr.responseText;
                    }

                    if (errorThrown === "") {
                        errorThrown = "Unknown server or network error";
                    }

                    if (typeof responseInterface.fail === "function") {
                        responseInterface.fail(jqXhr, textStatus, errorThrown);
                    }
                });
            return true;
        } else {
            throw new Error("MeadCoScriptXPrint : no known ajax helper available");
        }
    }

    /*
     * Call an API on the server with GET
     * 
     * @function getFromServer
     * @memberof MeadCoScriptXPrint
     * @param {string} sApi the api to call on the connected server
     * @param {bool} async true for asynchronous call, false for synchronous 
     * @param {function} onSuccess function to call on success
     * @param {function(errorText)} onFail function to call on failure
     */
    function getFromServer(sApi, async, onSuccess, onFail) {
        if (module.jQuery) {
            var serviceUrl = server + sApi;
            MeadCo.log(".ajax() get: " + serviceUrl);
            module.jQuery.ajax(serviceUrl,
                {
                    method: "GET",
                    dataType: "json",
                    cache: false,
                    async: async,
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                }).done(function (data) {
                    bConnected = true;
                    onSuccess(data);
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    MeadCo.log("**warning: failure in MeadCoScriptXPrint.getFromServer: [" +
                        textStatus +
                        "], [" +
                        errorThrown +
                        "], [" +
                        jqXhr.responseText +
                        "]");

                    if (typeof jqXhr.responseText !== "undefined") {
                        errorThrown = jqXhr.responseText;
                    }

                    if (errorThrown === "") {
                        errorThrown = "Unknown server or network error";
                    }
                    if (typeof onFail === "function")
                        onFail(errorThrown);
                });
        }
    }

    function monitorJob(requestData, jobId, timeOut, functionComplete) {
        MeadCo.log("monitorJob: " + jobId);
        var counter = 0;
        var interval = 1000;
        var bWaiting = false;
        var intervalId = window.setInterval(function () {
            if (!bWaiting) {
                MeadCo.log("Going to request status with .ajax");
                bWaiting = true;
                $.ajax(server + "/status/" + jobId,
                    {
                        dataType: "json",
                        method: "GET",
                        cache: false,
                        headers: {
                            "Authorization": "Basic " + btoa(licenseGuid + ":")
                        }
                    }).done(function (data) {
                        MeadCo.log("jobStatus: " + data.status);
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
                                progress(requestData, data.status, data.message);
                                updateJob(data);
                                // keep going
                                if (timeOut > 0 && (++counter * interval) > timeOut) {
                                    window.clearInterval(intervalId);
                                    MeadCoScriptXPrint.reportServerError("unknown failure while printing.");
                                }
                                bWaiting = false;
                                break;

                            case enumPrintStatus.ERROR:
                            case enumPrintStatus.ABANDONED:
                                MeadCo.log("error status in monitorJob so clear interval: " + intervalId);
                                progress(requestData, data.status, data.message);
                                removeJob(jobId);
                                window.clearInterval(intervalId);
                                MeadCoScriptXPrint.reportServerError("The print failed.\n\n" + data.message);
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
                    })
                    .fail(function (jqXhr, textStatus, errorThrown) {
                        MeadCo.log("**warning: failure in MeadCoScriptXPrint.monitorJob: [" +
                            textStatus +
                            "], [" +
                            errorThrown +
                            "], [" +
                            jqXhr.responseText +
                            "]");

                        if (typeof jqXhr.responseText !== "undefined") {
                            errorThrown = jqXhr.responseText;
                        }

                        if (errorThrown === "") {
                            errorThrown = "Unknown server or network error";
                        }

                        MeadCo.log("error: " + errorThrown + " in monitorJob so clear interval: " + intervalId);
                        progress(requestData, enumPrintStatus.ERROR, errorThrown);
                        removeJob(jobId);
                        window.clearInterval(intervalId);
                        functionComplete(null);
                    });
            } else {
                MeadCo.log("** info : still waiting for last status request to complete");
            }
        },
            interval);

        MeadCo.log("intervalId: " + intervalId);
    }

    function addOrUpdateDeviceSettings(data) {
        deviceSettings[data.printerName] = data;
        if (data.isDefault && printerName.length === 0) {
            printerName = data.printerName;
        }
    }

    function getDeviceSettings(oRequest) {
        oRequest.name = oRequest.name.replace(/\\/g, "||");
        MeadCo.log("Request get device info: " + oRequest.name);

        if (module.jQuery) {
            var serviceUrl = server + "/deviceinfo/" + encodeURIComponent(oRequest.name) + "/0";
            MeadCo.log(".ajax() get: " + serviceUrl);
            module.jQuery.ajax(serviceUrl,
                {
                    dataType: "json",
                    method: "GET",
                    cache: false,
                    async: oRequest.async, // => async if we have a callback
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                })
                .done(function (data) {
                    bConnected = true;
                    addOrUpdateDeviceSettings(data);
                    if (typeof oRequest.done === "function") {
                        oRequest.done(data);
                    }
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    // TODO: Review
                    // if (errorThrown !== "") {
                    //    bConnected = true; // we connected but the server doesnt like us
                    //}

                    errorThrown = parseError("MeadCo.ScriptX.Print.getDeviceSettings:", jqXhr, textStatus, errorThrown);
                    MeadCo.log("failed to getdevice: " + errorThrown);

                    if (typeof oRequest.fail === "function") {
                        oRequest.fail(errorThrown);
                    }
                });
        } else {
            if (typeof oRequest.fail === "function") {
                oRequest.fail("MeadCoScriptXPrint : no known ajax helper available");
            }
            else
                throw new Error("MeadCoScriptXPrint : no known ajax helper available");
        }

    }

    function getDeviceSettingsFor(sPrinterName) {
        if (typeof sPrinterName === "string" && sPrinterName != "") {
            if (typeof deviceSettings[sPrinterName] === "undefined") {
                getDeviceSettings({
                    name: sPrinterName,
                    async: false,
                    fail: function (eTxt) { MeadCo.ScriptX.Print.reportServerError(eTxt); }
                });
            }

            return deviceSettings[sPrinterName];
        }

        return {};
    }

    // look for auto-processing attributes that define the server to connect to and the
    // license/subscription to be used. 
    //
    // This implementation is called by the public api useAttributes (call by factory and secmgr implementations)
    function processAttributes() {
        MeadCo.log("MeadCo.ScriptX.Print ... looking for auto connect, already found?: " + bDoneAuto);
        if (this.jQuery && !bDoneAuto) {
            // protected API
            var printHtml = MeadCoScriptXPrint.HTML;
            var printApi = MeadCoScriptXPrint;
            var licenseApi = MeadCoScriptXPrint.Licensing;

            // general connection
            //
            // data-meadco-server is the root url, api/v1/printhtml, api/v1/licensing will be added by the library
            // as required.
            //
            // meadco-subscription present => cloud/on premise service
            // meadco-license present => for Windows PC service
            $("[data-meadco-subscription]").each(function () {
                if (typeof printApi === "undefined" || typeof printHtml === "undefined") {
                    console.warn("Unable to auto-connect subscription - print or printHtml API not present (yet?)");
                } else {
                    if (!bDoneAuto) {
                        var $this = $(this);
                        var data = $this.data();
                        MeadCo.log("Auto connect susbcription to: " +
                            data.meadcoServer + ", or " + data.meadcoPrinthtmlserver +
                            ", with subscription: " +
                            data.meadcoSubscription +
                            ", sync: " +
                            data.meadcoSyncinit);
                        var syncInit = ("" + data.meadcoSyncinit)
                            .toLowerCase() !==
                            "false"; // defaults to true if not specified

                        var server = data.meadcoServer;
                        if (typeof server === "undefined") {
                            server = data.meadcoPrinthtmlserver;
                        }

                        if (typeof server === "undefined") {
                            console.error("No server specified");
                        } else {
                            // in case there will be a request for the subnscription info ..
                            if (typeof licenseApi !== "undefined")
                                licenseApi.connect(server, data.meadcoSubscription);

                            if (!syncInit) {
                                MeadCo.log("Async connectlite...");
                                printApi.connectLite(server, data.meadcoSubscription);
                            } else {
                                console
                                    .warn("Synchronous connection is deprecated, please use data-meadco-syncinit='false'");
                                printHtml.connect(server, data.meadcoSubscription);
                            }
                            bDoneAuto = true;
                        }
                    }
                }
                return false;
            });

            $("[data-meadco-license]").each(function () {
                if (typeof printApi === "undefined" || typeof printHtml === "undefined" || typeof licenseApi === "undefined") {
                    console.warn("Unable to auto-connect client license - print or printHtml or license API not present (yet?)");
                } else {
                    if (!bDoneAuto) {
                        var $this = $(this);
                        var data = $this.data();
                        MeadCo.log("Auto connect client license to: " +
                            data.meadcoServer +
                            ", with license: " +
                            data.meadcoLicense +
                            ", path: " +
                            data.meadcoLicensePath +
                            ", revision: " +
                            data.meadcoLicenseRevision +
                            ", sync: " +
                            data.meadcoSyncinit);
                        var syncInit = ("" + data.meadcoSyncinit)
                            .toLowerCase() !==
                            "false"; // defaults to true if not specified
                        var server = data.meadcoServer;

                        if (!syncInit) {
                            MeadCo.log("Async connectlite...");
                            licenseApi.connectLite(server, data.meadcoLicense,
                                    data.meadcoLicenseRevision,
                                    data.meadcoLicensePath);
                            printApi.connectLite(server, data.meadcoLicense);
                        } else {
                            console
                                .warn("Synchronous connection is deprecated, please use data-meadco-syncinit='false'");
                            licenseApi.connect(server, data.meadcoLicense);
                            if (typeof data.meadcoLicensePath !== "undefined" &&
                                typeof data
                                .meadcoLicenseRevision !==
                                "undefined") { // if these are not defined then you must use meadco-secmgr.js
                                licenseApi.apply(data.meadcoLicense,
                                    data.meadcoLicenseRevision,
                                    data.meadcoLicensePath);
                            }
                            printHtml.connect(server, data.meadcoLicense);
                        }
                        bDoneAuto = true;
                    }
                }
                return false;
            });

        }
    }

    if (!module.jQuery) {
        MeadCo.log("**** warning :: no jQuery *******");
    }

    MeadCo.log("MeadCo.ScriptX.Print " + version + " loaded.");

    //////////////////////////////////////////////////
    // public API
    return {
        /**
         * Enum for type of content being posted to printHtml API
         * @readonly
         * @memberof MeadCoScriptXPrint
         * @enum { number }
         */
        ContentType: enumContentType,

        /** 
         * Enum for status code returned from the print API
         * @readonly
         * @memberof MeadCoScriptXPrint
         * @enum { number }
         */
        ResponseStatus: enumResponseStatus,

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
                    // not already cached, go fetch (synchronously)
                    if (typeof deviceSettings[deviceRequest] === "undefined") {
                        getDeviceSettings({
                            name: deviceRequest,
                            done: function (data) {
                                printerName = data.printerName;
                            },
                            async: false,
                            fail: function (eTxt) { MeadCo.ScriptX.Print.reportServerError(eTxt); }
                        });
                    } else {
                        printerName = deviceRequest;
                    }
                } else {
                    getDeviceSettings(deviceRequest);
                }
            }
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
         * Get/set the cached device settings (papersize etc) for the currently active printer
         * @memberof MeadCoScriptXPrint
         * @property {object} deviceSettings (see API /api/vi/printhtml/deviceInfo/ )
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
         * @returns {object} object with properties 
         */
        deviceSettingsFor: function (sPrinterName) {
            return getDeviceSettingsFor(sPrinterName);
        },

        /**
         * search for processing attibutes for connection and subscription/license and process
         * them. 
         * 
         * @function useAttributes
         * @memberof MeadCoScriptXPrint
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
         * Specify the server to use and the subscription/license id. 
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
            if (arguments.length === 2 && serverUrl.length > 0 && licenseGuid.length > 0)
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
         * @param {function} resolve function to call on success
         * @param {function({errorText})} reject function to call on failure
         */
        connectTestAsync: function (serverUrl, resolve, reject) {
            testServerConnection(serverUrl, resolve, reject);
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
         * true if the library has succesfully connected to a server.
         * 
         * @memberof MeadCoScriptXPrint
         * @property {bool} isConnected true if the library has succesfully connected to a server.
         * @readonly
         */
        get isConnected() {
            return bConnected;
        },

        /**
         * @property {array} availablePrinterNames an array of strings of the available printers
         * @memberof MeadCoScriptXPrint
         * @readonly
         */
        get availablePrinterNames() {
            return availablePrinters;
        },

        /**
         * Call an API on the server with GET
         * 
         * @function getFromServer
         * @memberof MeadCoScriptXPrint
         * @param {string} sApi the api to call on the connected server
         * @param {bool} async true for asynchronous call, false for synchronous 
         * @param {function} onSuccess function to call on success
         * @param {function(errorText)} onFail function to call on failure
         */
        getFromServer: getFromServer,

        /**
         * Post a request to the server api/v1/print to print some html and monitor the print job 
         * to completion. If the server prints to file then the file is opened for the user (in a new window)
         * 
         * @function printHtmlAtServer
         * @memberof MeadCoScriptXPrint

         * @param {enumContentType} contentType enum type of content given (html snippet, url)
         * @param {string} content the content - a url, html snippet or complete html
         * @param {object} htmlPrintSettings the settings to use - device annd html such as headers and footers
         * @param {function({object})} fnDone function to call when printing complete (and output returned), arg is null on no error.
         * @param {function({object})} fnNotify function to call when job associated with this print is updated (data is server result)
         * @param {function(status,sInformation,data)} fnCallback function to call when job status is updated
         * @param {any} data object to give pass to fnCallback
         * @return {boolean} - true if a print was started (otherwise an error will be thrown)
         */
        printHtml: printHtmlAtServer,

        /**
         * overridable function for reporting an error. 'derived' classes call this
         * function to report errors.
         * 
         * @memberof MeadCoScriptXPrint
         * @function reportServerError 
         * @param {string} errorThrown the error text to display
         * 
         * ```js
         * // overload cloud print library report error
         * MeadCo.ScriptX.Print.reportServerError = function (errorTxt) {
         *    app.Messages.PrintErrorBox(errorTxt);
         * }
         * ```
         */
        reportServerError: function (errorThrown) {
            alert("There was an error in the printing service\n\n" + errorThrown);
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
         * The list of jobs currently active at the server for this client
         * 
         * @memberof MeadCoScriptXPrint
         * @property {object[]} queue array of jobs 
         * @readonly
         */
        get queue() {
            return activePrintQueue;
        },

        /**
         * The number of jobs there are actgive at the server for this client
         * (same as MeadCo.ScriptX.Print.queue.length)
         * 
         * @memberof MeadCoScriptXPrint
         * @property {int} activeJobs the number of jobs
         * @readonly
         */
        get activeJobs() {
            return jobCount();
        },

        /**
         * make sure that spooling status is locked active while asynchronous UI that may start
         * printing is displayed
         * 
         * @memberof MeadCoScriptXPrint
         * @function ensureSpoolingStatus
         * @returns {object} a fake job to lock the spooling status on
         * 
         * ```js
         * var lock = MeadCo.ScriptX.Print.ensureSpoolingStatus
         * ShowAsyncUI(function() {
         *  MeadCo.ScriptX.Print.freeSpoolStatus(lock);
         * });
         * ```
         */
        ensureSpoolingStatus: function () {
            var lock = { jobIdentifier: Date.now() };
            queueJob(lock);
            return lock;
        },

        /**
         * @memberof MeadCoScriptXPrint
         * @function freeSpoolStatus
         * @param {object} lock the lock object returned by ensureSpoolingStatus(
         */
        freeSpoolStatus: function (lock) {
            removeJob(lock.jobIdentifier);
        },

        /**
         * Get if print is still 'spooling'.still queued at the server
         * 
         * @memberof MeadCoScriptXPrint
         * @property {bool} isSpooling
         * @readonly
         */
        get isSpooling() {
            return jobCount() > 0;
        },

        /**
         * Start (asynchronous) monitor to observe until no more job spooling/waiting at the server
         * then call the given callback function
         * 
         * @param {int} iTimeout wait until complete or timeout (in ms) -1 => infinite
         * @param {function({bool})} fnComplete callback function, arg is true if all jobs complete
         */
        waitForSpoolingComplete: function (iTimeout, fnComplete) {
            MeadCo.log("Started WaitForSpoolingComplete(" + iTimeout + ")");
            if (typeof fnComplete !== "function") {
                throw "WaitForSpoolingComplete requires a completion callback";
            }

            var timerId;
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
        }
    };

});
