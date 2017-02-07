"use strict";
(function (window, undefined) {
    var $httpPostFunc;
    var server;

    window.MeadCo = {
        ScriptX: {
            Print: {
                Core: {
                    configure: function($httpPost, serverUrl, licenseGuid) {
                        $httpPostFunc = $httpPost;
                        server = serverUrl;
                    },

                    ContentType : {
                        Url : 1,
                        Html : 2,
                        InnerHtml : 4
                    },

                    ResponseType: {
                        QueuedToDevice: 1,
                        QueuedToFile: 2,
                        SoftError: 3,
                        Ok: 4
                    },

                    activeSettings: {
                        printerName: "",
                        header: "",
                        footer: "",
                        headerFooterFont: "",
                        pageSettings: {
                            orientation: 2,
                            paperSize: "",
                            paperSource: "",
                            units: 2,
                            margins: {
                                left: 0,
                                top: 0,
                                bottom: 0,
                                right: 0
                            }
                        }
                    },

                    print: function(contentType, content, settings) {
                        var requestData = {
                                content: content,
                                settings: settings,
                                contenttype: contentType
                            };

                            $httpPostFunc(server, requestData).done(function (data) {
                                // lets assume anything more than 3 characters is a filename we can download
                                if (data.ResponseType === MeadCo.ScriptX.Print.Core.ResponseType.QueuedToFile ) {
                                    // the server responds after submittong the job but it will still be printing so we have
                                    // to wait. For PoC we always wait for 4 seconds, which seems to be enough on my box
                                    // production code needs to track job progress and send the client a notification when its complete
                                    alert("Print requested, please wait for the download to complete ... ");
                                    window.setTimeout("alert('Requesting output now'); window.open('" + server + "/PrintedDoc?job=" + data.Message + "');", 4000);
                                }
                            }).fail(function(jqXHR, textStatus, errorThrown) {
                                alert("Print failed.\n\n" + errorThrown);
                            });

                    }

                }
            }
        },

        createNS: function(namespace) {
            var nsparts = namespace.split(".");
            var parent = window.MeadCo;

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
                if (typeof parent[partname] === "undefined" ) {
                    parent[partname] = {};
                }
                // get a reference to the deepest element in the hierarchy so far
                parent = parent[partname];
            }
            // the parent is now constructed with empty namespaces and can be used.
            // we return the outermost namespace
            return parent;
        }
    };
}(window));