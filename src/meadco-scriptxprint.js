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

    var version = "0.0.5.2";
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

    var enumResponseType = {
        QUEUEDTODEVICE: 1,
        QUEUEDTOFILE: 2,
        SOFTERROR: 3,
        OK: 4
    };

    function printHtmlAtServer(contentType, content, htmlPrintSettings) {
        MeadCo.log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
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
                alert("Print failed.\n\n" + errorThrown);
            },

            queuedToFile: function(data) {
                MeadCo.log("default handler on queued to file response");
                waitForJobComplete(data.jobIdentifier,
                    -1,
                    function(data) {
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

    function connectToServer(serverUrl, licenseGuid) {
        MeadCo.log("Print server requested: " + serverUrl + " with license: " + licenseGuid);
        server = serverUrl;
        licenseGuid = licenseGuid;
        // note that this will silently fail if no advanced printing license
        // TODO: Warning, this is synchronous
        getDeviceSettings({ name: "default" });
    }

    function printAtServer(requestData, responseInterface) {

        if (server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : no server connection");
        }

        if (this.jQuery) {
            MeadCo.log(".ajax() post to: " + server);
            this.jQuery.ajax(server,
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
                    MeadCo.log("Success response: " + data.responseType);
                    switch (data.responseType) {
                    case enumResponseType.QUEUEDTOFILE:
                        responseInterface.queuedToFile(data);
                        break;

                    case enumResponseType.QUEUEDTODEVICE:
                        responseInterface.queuedToDevice(data);
                        break;

                    case enumResponseType.SOFTERROR:
                        responseInterface.softError(data);
                        break;

                    case enumResponseType.OK:
                        responseInterface.ok(data);
                        break;
                    }
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    if (errorThrown === "") {
                        errorThrown = "possible unlicensed request";
                    }
                    responseInterface.fail(jqXhr, textStatus, errorThrown);
                });
        } else {
            throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");
        }
    }

    function waitForJobComplete(jobId, timeOut,functionComplete) {
        MeadCo.log("WaitForJobComplete: " + jobId);
        var counter = 0;
        var intervalId = window.setInterval(function() {
            MeadCo.log("Going to request status with .ajax");
                $.ajax(server + "/status/" + jobId,
                {
                    dataType: "json",
                    jsonp: false,
                    method: "GET",
                    cache: false,
                    headers: {
                        "Authorization": "Basic " + btoa(licenseGuid + ":")
                    }
                }).done(function (data) {
                        MeadCo.log("jobStatus: " + data.responseType);
                        switch ( data.responseType ) {
                            case enumResponseType.OK:
                                MeadCo.log("clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                functionComplete(data);
                                break;

                            case enumResponseType.QUEUEDTOFILE:
                                // keep going
                                if (++counter > 20) {
                                    window.clearInterval(intervalId);
                                    alert("Sorry, it appears the print has failed for an unknown reason");
                                }
                                break;

                            default:
                                MeadCo.log("unknown status in waitForJobComplete so clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                break;
                        }
                })
                .fail(function() {
                    MeadCo.log("error in waitForJobComplete so clear interval: " + intervalId);
                    window.clearInterval(intervalId);
                });
            },
            1000);

        MeadCo.log("intervalId: " + intervalId);
    }

    function getDeviceSettings(oRequest) {
        MeadCo.log("Request get device info: " + oRequest.name);
        if (this.jQuery) {
            var serviceUrl = server + "/deviceinfo/" + encodeURIComponent(oRequest.name) + "?units=0";
            MeadCo.log(".ajax() get: " + serviceUrl);
            this.jQuery.ajax(serviceUrl,
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
                    if (data.isDefault && printerName.length === 0) {
                        printerName = data.printerName;
                    }
                    if (typeof oRequest.done === "function") {
                        oRequest.done(data);
                    }
                })
                .fail(function (jqXhr, textStatus, errorThrown) {
                    if (errorThrown === "") {
                        errorThrown = "possible unlicensed request";
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
    if (!this.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    //////////////////////////////////////////////////
    // public API
    return {
        ContentType: enumContentType,

        ResponseType: enumResponseType,

        get printerName() {
             return printerName;
        },

        set printerName(deviceRequest) {
            if (typeof deviceRequest === "string") {
                getDeviceSettings({
                    name: deviceRequest,
                    done: function(data) {
                        printerName = data.PrinterName;
                    },
                    fail: function (eTxt) { alert(eTxt);  }
                });
            } else {
                getDeviceSettings(deviceRequest);
            }
        },

        get version() {
            return version;
        },

        get deviceSettings() {
            return printerName !== "" ? deviceSettings[printerName] : {};
        },

        connect: function (serverUrl, licenseGuid) {
            connectToServer(serverUrl, licenseGuid);
        },

        printHtml: printHtmlAtServer
    };

});
