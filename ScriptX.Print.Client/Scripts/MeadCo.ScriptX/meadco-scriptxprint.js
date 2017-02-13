/*!
 * MeadCo.ScriptX.Print (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

; (function (name, definition) {
    extendNamespace(name, definition);
})('MeadCo.ScriptX.Print', function () {

    var module = this;

    ////////////////////////////////////////////////////
    // protected API
    module.server = ""; // url to the server, server is CORS restricted 

    module.ContentType = {
        URL: 1,
        HTML: 2,
        INNERTHTML: 4
    };

    module.ResponseType = {
        QUEUEDTODEVICE: 1,
        QUEUEDTOFILE: 2,
        SOFTERROR: 3,
        OK: 4
    };

    module.printHtmlAtServer = function(contentType, content, htmlPrintSettings) {
        log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
        var requestData = {
            ContentType: contentType,
            Content: content,
            HtmlPrintSettings: htmlPrintSettings,
            DeviceSettings: module.deviceSettings
        }

        printAtServer(requestData,
        {
            fail: function(jqXhr, textStatus, errorThrown) {
                alert("Print failed.\n\n" + errorThrown);
            },

            queuedToFile: function(data) {
                console.log("default handler on queued to file response");
                waitForJobComplete(data.JobIdentifier,
                    -1,
                    function(data) {
                        window.open(module.server + "/DownloadPrint/" + data.JobIdentifier,"_self");
                    });
            },

            queuedToDevice: function(data) {
                log("print was queued to device");
            },

            softError: function(data) {
                log("print has soft error");
            },

            ok: function(data) {
                log("printed ok, no further information");
            }
        });
    };

    module.deviceSettings =
    {
        printerName: "",
        paperSize: "",
        paperSource: ""
    };

    module.connectToServer = function(serverUrl,licenseGuid) {
        module.server = serverUrl;
    }


    /////////////////////////////////////////////////////
    // private 
    function printAtServer(requestData, promiseInterface) {

        if (module.server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : no server connection");
        }

        if (this.jQuery) {
            log("post to: " + module.server);
            this.jQuery.post(module.server, requestData).done(function (data) {
                log("Success response: " + data.ResponseType);
                switch (data.ResponseType) {
                case module.ResponseType.QUEUEDTOFILE:
                    promiseInterface.queuedToFile(data);
                    break;

                case module.ResponseType.QUEUEDTODEVICE:
                    promiseInterface.queuedToDevice(data);
                    break;

                case module.ResponseType.SOFTERROR:
                    promiseInterface.softError(data);
                    break;

                case module.ResponseType.OK:
                    promiseInterface.ok(data);
                    break;
                }
            }).fail(function(jqXhr, textStatus, errorThrown) {
                promiseInterface.fail(jqXhr, textStatus, errorThrown);
            });
        } else {
            throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");
        }
    }

    function waitForJobComplete(jobId, timeOut,functionComplete) {
        log("WaitForJobComplete: " + jobId);
        var intervalId = window.setInterval(function() {
            log("Going to request status");
                $.getJSON(module.server + "/status/" + jobId,
                    null,
                    function (data) {
                        log("jobStatus: " + data.ResponseType);
                        switch ( data.ResponseType ) {
                            case module.ResponseType.OK:
                                log("clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                functionComplete(data);
                                break;

                            case module.ResponseType.QUEUEDTOFILE:
                                // keep going
                                break;

                            default:
                                log("unknow status in waitForJobComplete so clear interval: " + intervalId);
                                window.clearInterval(intervalId);
                                break;
                        }
                    });
            },
            1000);

        console.log("intervalId: " + intervalId);
    }

    log("MeadCo.ScriptX.Print loaded.");
    if (!this.jQuery) {
        log("**** warning :: no jQuery");
    }

    //////////////////////////////////////////////////
    // public API
    return {
        ContentType: module.ContentType,

        ResponseType: module.ResponseType,

        connect: function (serverUrl, licenseGuid) {
            module.connectToServer(serverUrl, licenseGuid);
        }
    };

});
