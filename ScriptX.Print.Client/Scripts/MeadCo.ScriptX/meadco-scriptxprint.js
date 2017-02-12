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

    module.printHtmlAtServer = function (contentType, content, htmlPrintSettings) {
        log("started MeadCo.ScriptX.Print.print.printHtmlAtServer() Type: " + contentType);
        var requestData = {
            ContentType: contentType,
            Content: content,
            HtmlPrintSettings: htmlPrintSettings,
            DeviceSettings: module.deviceSettings
        }

        printAtServer(requestData,
        {
            fail: function (jqXhr, textStatus, errorThrown) {
                alert("Print failed.\n\n" + errorThrown);
            },

            queuedToFile: function (data) {
                alert("Print requested, please wait for the download to complete ... ");
                window.setTimeout("alert('Requesting output now'); window.open('" + module.server + "/PrintedDoc?job=" + data + "');", 4000);
            },

            queuedToDevice: function (data) {

            },

            softError: function (data) {

            },

            ok: function (data) {

            }
        });
    }

    module.deviceSettings =
    {
        printerName: ""
    }

    /////////////////////////////////////////////////////
    // private 
    function printAtServer(requestData, promiseInterface) {

        if (module.server.length <= 0) {
            throw new Error("MeadCo.ScriptX.Print : no server connection");
        }

        if (this.jQuery) {
            this.jQuery.post(module.server, requestData).done(function (data) {
                switch (data.responseType) {
                    case module.ResponseType.QUEUEDTOFILE:
                        promiseInterface.queuedToFile(data.message);
                        break;

                    case module.ResponseType.QUEUEDTODEVICE:
                        promiseInterface.queuedToDevice(data.message);
                        break;

                    case module.ResponseType.SOFTERROR:
                        promiseInterface.softError(data.message);
                        break;

                    case module.ResponseType.OK:
                        promiseInterface.ok(data.message);
                        break;
                }
            }).fail(function (jqXhr, textStatus, errorThrown) {
                promiseInterface.fail(jqXhr, textStatus, errorThrown);
            });
        }

        throw new Error("MeadCo.ScriptX.Print : no known ajax helper available");

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

        Connect: function (serverUrl, licenseGuid) {
            module.server = serverUrl;
        }
    };

});
