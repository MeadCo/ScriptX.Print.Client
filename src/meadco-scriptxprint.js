/*!
 * MeadCo.ScriptX.Print (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

; (function (name, definition) {
    extendMeadCoNamespace(name, definition);
})('MeadCo.ScriptX.Print', function () {

    var version = "0.0.5.8";
    var printerName = "";
    var deviceSettings = {};
    var module = this;


    var server = ""; // url to the server, server is CORS restricted 
    var licenseGuid = "";

    var enumContentType = {
        URL: 1,
        HTML: 2,
        INNERTHTML: 4
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

    function printHtmlAtServer(contentType, content, htmlPrintSettings) {
        MeadCo.log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType + ", printerName: " + printerName);
        var devInfo;

        if (printerName === "") {
            devInfo = {};
        } else {
            devInfo = deviceSettings[printerName];
        }

        var requestData = {
            ContentType: contentType,
            Content: content,
            HtmlPrintSettings: htmlPrintSettings,
            DeviceSettings: devInfo
        }

        printAtServer(requestData,
        {
            fail: function(jqXhr, textStatus, errorThrown) {
                alert("MeadCo.ScriptX.Print : Your print request has failed:\n\n" + errorThrown + "\n");
            },

            queuedToFile: function(data) {
                MeadCo.log("default handler on queued to file response");
                waitForJobComplete(data.jobIdentifier,
                    -1,
                    function (data) {
                        MeadCo.log("Will download printed file");
                        window.open(server + "/DownloadPrint/" + data.jobIdentifier,"_self");
                    });
            },

            queuedToDevice: function(data) {
                MeadCo.log("print was queued to device");
            },

            softError: function(data) {
                MeadCo.log("print has soft error");
            },

            ok: function(data) {
                MeadCo.log("printed ok, no further information");
            }
        });
    };

    function setServer(serverUrl, clientLicenseGuid)
    {
        MeadCo.log("Print server requested: " + serverUrl + " with license: " + clientLicenseGuid);
        server = serverUrl;
        licenseGuid = clientLicenseGuid;
    }

    function connectToServer(serverUrl, clientLicenseGuid) {
        setServer(serverUrl, clientLicenseGuid);
        // note that this will silently fail if no advanced printing license
        // TODO: Warning, this is synchronous
        getDeviceSettings({ name: "default" });
    }

    function printAtServer(requestData, responseInterface) {

        if (server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : print server URL is not set or is invalid");
        }

        if (module.jQuery) {
            MeadCo.log(".ajax() post to: " + server);
            module.jQuery.ajax(server,
                {
                    data: requestData,
                    dataType: "json",
                    jsonp: false,
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                })
                .done(function (data) {
                    MeadCo.log("Success response: " + data.status);
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
                    if (errorThrown === "") {
                        errorThrown = "Unknown server or network error";
                    }
                    if (typeof responseInterface.fail === "function") {
                        responseInterface.fail(jqXhr, textStatus, errorThrown);
                    } 
                });
        } else {
            throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");
        }
    }

    function getFromServer(sApi,onSuccess,onFail) {
        if (module.jQuery) {
            var serviceUrl = server + sApi;
            MeadCo.log(".ajax() get: " + serviceUrl);
            module.jQuery.ajax(serviceUrl,
                {
                    method: "GET",
                    dataType: "json",
                    jsonp: false,
                    cache: false,
                    async: false, // TODO: deprecated 
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                }).done(function(data) {
                    onSuccess(data);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    MeadCo.log("**warning: failure in MeadCo.ScriptX.Print.getFromServer: " + errorThrown);
                    if (typeof onFail == "function")
                        onFail(errorThrown);
                });
        }
    }

    function waitForJobComplete(jobId, timeOut,functionComplete) {
        MeadCo.log("WaitForJobComplete: " + jobId);
        var counter = 0;
        var interval = 500;
        var bWaiting = false;
        var intervalId = window.setInterval(function() {
                if (!bWaiting) {
                    MeadCo.log("Going to request status with .ajax");
                    bWaiting = true;
                    $.ajax(server + "/status/" + jobId,
                        {
                            dataType: "json",
                            jsonp: false,
                            method: "GET",
                            cache: false,
                            headers: {
                                "Authorization": "Basic " + btoa(licenseGuid + ":")
                            }
                        }).done(function(data) {
                            MeadCo.log("jobStatus: " + data.status);
                            switch (data.status) {
                            case enumPrintStatus.COMPLETED:
                                MeadCo.log("clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                functionComplete(data);
                                break;

                            case enumPrintStatus.NOTSTARTED:
                            case enumPrintStatus.DOWNLOADED:
                            case enumPrintStatus.DOWNLOADING:
                            case enumPrintStatus.PRINTING:
                            case enumPrintStatus.QUEUED:
                            case enumPrintStatus.STARTING:
                            case enumPrintStatus.PAUSED:

                                // keep going
                                if (timeOut > 0 && (++counter * interval) > timeOut) {
                                    window.clearInterval(intervalId);
                                    alert("Sorry, it appears the print has failed for an unknown reason.");
                                }
                                bWaiting = false;
                                break;

                           case enumPrintStatus.ERROR:
                           case enumPrintStatus.ABANDONED:
                                MeadCo.log("error status in waitForJobComplete so clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                alert("The print failed.\n\n" + data.message);
                                break;

                            default:
                                MeadCo.log("unknown status in waitForJobComplete so clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                break;
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            MeadCo.log("error: " + errorThrown + " in waitForJobComplete so clear interval: " + intervalId);
                            window.clearInterval(intervalId);
                        });
                } else {
                    MeadCo.log("** info : still waiting for last status request to complete");
                }
            },
            interval);

        MeadCo.log("intervalId: " + intervalId);
    }

    function getDeviceSettings(oRequest) {
        MeadCo.log("Request get device info: " + oRequest.name);
        if (module.jQuery) {
            var serviceUrl = server + "/deviceinfo/" + encodeURIComponent(oRequest.name) + "?units=0";
            MeadCo.log(".ajax() get: " + serviceUrl);
            module.jQuery.ajax(serviceUrl,
                {
                    dataType: "json",
                    jsonp: false,
                    method: "GET",
                    async: false, // TODO: deprecated 
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                })
                .done(function (data) {
                    deviceSettings[data.printerName] = data;
                    if ( data.isDefault && printerName.length === 0) {
                        printerName = data.printerName;
                    }
                    if (typeof oRequest.done === "function") {
                        oRequest.done(data);
                    }
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    if (errorThrown === "") {
                        errorThrown = "Unknown server or network error";
                    } else {
                        errorThrown = errorThrown.toString();
                    }

                    MeadCo.log("failed to getdevice: " + errorThrown);
                    if (typeof oRequest.fail === "function") {
                        oRequest.fail(errorThrown);
                    }
                });
        } else {
            throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");
        }

    }


    MeadCo.log("MeadCo.ScriptX.Print loaded: " + version);
    if (!module.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    //////////////////////////////////////////////////
    // public API
    return {
        ContentType: enumContentType,

        ResponseType: enumResponseStatus,

        get printerName() {
             return printerName;
        },

        set printerName(deviceRequest) {
            if (typeof deviceRequest === "string") {
                getDeviceSettings({
                    name: deviceRequest,
                    done: function(data) {
                        printerName = data.printerName;
                    },
                    fail: function (eTxt) { alert("MeadCo.ScriptX.Print : " + eTxt);  }
                });
            } else {
                getDeviceSettings(deviceRequest);
            }
        },

        get version() {
            return version;
        },

        set deviceSettings(settings) {
            deviceSettings[settings.printerName] = settings;
        },

        get deviceSettings() {
            return printerName !== "" ? deviceSettings[printerName] : {};
        },

        connect: function (serverUrl, licenseGuid) {
            connectToServer(serverUrl, licenseGuid);
        },

        connectLite : function(serverUrl, licenseGuid) {
            setServer(serverUrl, licenseGuid);
        },

        getFromServer: getFromServer,

        printHtml: printHtmlAtServer
    };

});
