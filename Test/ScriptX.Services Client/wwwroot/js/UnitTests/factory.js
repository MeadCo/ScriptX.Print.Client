QUnit.config.reorder = false;

QUnit.test("Namespace basics", function (assert) {

    assert.ok(window.factory, "factory namespace exists");
    var api = window.factory;
    var expectedVersion = "1.5.5.1";
    var emulatedVersion = "8.2.0.0";

    var a = new Object();
    var b = new Object();
    var c = new Object();
    var d = new Object();

    api.GetComponentVersion("scriptx.factory.services", a, b, c, d);
    var v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, expectedVersion , "Correct library version");

    api.GetComponentVersion("ScriptX.Factory", a, b, c, d);
    v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, emulatedVersion, "Correct ScriptX emulation version via ScriptX.Factory");
    assert.equal(api.ScriptXVersion, emulatedVersion, "Correct ScriptX emulation version via API");
    assert.equal(api.ComponentVersionString("scriptx.factory.services"), expectedVersion, "Correct .services library version via ComponentVersionString");

});

QUnit.test("Url handling", function (assert) {

    var api = window.factory;

    assert.strictEqual(api.baseURL("Test.html"), serverUrl + "/Tests/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("./Test.html"), serverUrl + "/Tests/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("../Test.html"), serverUrl + "/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("../../Test.html"), serverUrl + "/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("../Thing/Test.html"), serverUrl + "/Thing/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("https://www.meadroid.com/Thing/Test.html"),"https://www.meadroid.com/Thing/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("//Test/x.html"),"http://test/x.html", "Correct simple baseUrl");

});

QUnit.test("OnDocumentComplete", function (assert) {

    var api = window.factory;

    api.OnDocumentComplete(window, function () {
        assert.ok(true, "OnDocumentComplete called immediately on window.");
    });

    api.OnDocumentComplete(testFrame, function () {
        assert.ok(true, "OnDocumentComplete called immediately on frame.");
    });

    var done = assert.async(2);

    var url = api.baseURL("Frame2");

    var tf = document.getElementById("testFrame");

    tf.src = url;

    api.OnDocumentComplete(testFrame, function () {
        assert.ok(true, "OnDocumentComplete: " + tf.src + "  called after frame loaded.");
        assert.strictEqual(tf.contentWindow.document.readyState, "complete", "Frame state is correct");
        assert.strictEqual(tf.contentWindow.location.href, url, "Frame url is correct, url is: " + tf.contentWindow.document.URL);

        done();

        url2 = "https://www.meadroid.com";
        tf.src = url2;

        api.OnDocumentComplete(testFrame, function () {
            assert.ok(true, "OnDocumentComplete: " + tf.src + "  called after frame loaded.");

            // NOTE: Cannot do this because of cross frame restrictions
            //assert.strictEqual(tf.contentWindow.document.readyState, "complete", "Frame state is correct");
            //assert.strictEqual(tf.contentWindow.location.href, url, "Frame url is correct, url is: " + tf.contentWindow.document.URL);
            done();

            // put it back for the later tests ..
            tf.src = url;
        });
    });

});

QUnit.test("factory.printing properties", function (assert) {

    var api = window.factory.printing;

    MeadCo.ScriptX.Print.HTML.connectLite("clearServer", " ");

    assert.strictEqual(api.header, "", "Default header is blank");

    api.header = "My header";
    assert.strictEqual(api.header, "My header", "Header read write ok");
    api.header = null;

    api.footer = "My footer";
    assert.strictEqual(api.footer, "My footer", "Footer read write ok");

    api.headerFooterFont = "A font";
    assert.strictEqual(api.headerFooterFont, "A font", "Header footer font ok");

    assert.strictEqual(api.orientation, "portrait", "Default orientation is correct");

    assert.ok(api.portrait, "Default is portrait");

    api.orientation = "gibberish";
    assert.strictEqual(api.orientation, "portrait", "Orientation is correct after setting garbage");

    api.orientation = "landscape";
    assert.strictEqual(api.orientation, "landscape", "Orientation is correct after setting landscape");
    assert.notOk(api.portrait, "Correctly not portrait");

    api.portrait = true;
    assert.strictEqual(api.orientation, "portrait", "Orientation is correct after set portrait");
    assert.ok(api.portrait, "is Portrait");

    api.orientation = "LAndsCape";
    assert.strictEqual(api.orientation, "landscape", "Orientation is correct after setting LAndsCape");
    assert.notOk(api.portrait, "Correctly not portrait");
    api.portrait = true;

    assert.strictEqual(api.leftMargin, "", "Default left margin ok");
    assert.strictEqual(api.rightMargin, "", "Default right margin ok");
    assert.strictEqual(api.topMargin, "", "Default top margin ok");
    assert.strictEqual(api.bottomMargin, "", "Default bottom margin ok");

    api.leftMargin = api.rightMargin = api.topMargin = api.bottomMargin = "5";

    assert.strictEqual(api.leftMargin, "5", "R/w left margin ok");
    assert.strictEqual(api.rightMargin, "5", "R/w right margin ok");
    assert.strictEqual(api.topMargin, "5", "R/w top margin ok");
    assert.strictEqual(api.bottomMargin, "5", "R/w bottom margin ok");
    api.leftMargin = api.rightMargin = api.topMargin = api.bottomMargin = "";

    assert.strictEqual(api.templateURL, "MeadCo://default", "templateURL is correct");

});


QUnit.test("factory.printing dialogs", function (assert) {

    // Assume we have overridden the error functions to put the message into qunit-fixture
    //

    var api = window.factory.printing;

    api.PageSetup();
    assert.equal($("#qunit-fixture").text(), "Page setup dialog", "Correct pageSetup dlg message");

    $("#qunit-fixture").text("");

    api.PrintSetup();
    assert.equal($("#qunit-fixture").text(), "Print settings dialog", "Correct settings dlg message");

});


QUnit.test("factory.printing device settings", function (assert) {

    var api = window.factory.printing;

    assert.strictEqual(api.units, 1, "Default margin units correct");
    assert.strictEqual(api.GetMarginMeasure(), 1, "Default margin measure units correct");

    assert.strictEqual(api.printer, "", "Correct null startup printer");

    api.printer = "My printer";
    assert.strictEqual(api.printer, "", "Set bad printer ignored correctly");

    var m = "";
    try {
        api.currentPrinter = "My printer";
    } catch (e) {
        m = e.message;
    }

    assert.strictEqual(api.printer, "", "Set bad currentPrinter ignored correctly");
    assert.strictEqual(m, "Not Found", "Set bad currentPrinter, correct exception");

    try {
        api.CurrentPrinter = "My printer";
    } catch (e) {
        m = e.message;
    }

    assert.strictEqual(api.printer, "", "Set bad CurrentPrinter ignored correctly");
    assert.strictEqual(m, "Not Found", "Set bad CurrentPrinter, correct exception");

    var done = assert.async(1);

    var api2 = MeadCo.ScriptX.Print.HTML;

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.equal(api.printer, "Test printer", "Default printer name has been set from server");
        assert.equal(api.header, "Default header from server", "header values collected from server");
        done();

        try {
            api.CurrentPrinter = "My printer";
        } catch (e) {
            m = e.message;
        }

        assert.strictEqual(api.printer, "Test printer", "Set bad connected CurrentPrinter to active server ignored correctly");
        assert.strictEqual(m, "Not Found", "Set bad connected CurrentPrinter, correct exception");

        assert.strictEqual(api.EnumPrinters(0), "A3 Printer", "EnumPrinters(0) correct");
        assert.strictEqual(api.EnumPrinters(1), "Test printer", "EnumPrinters(1) correct");
        assert.strictEqual(api.EnumPrinters(2), "", "EnumPrinters(2) correct");

        assert.strictEqual(api.printerControl("Test printer").Forms.length, 3, "Corrrect forms array");

        // assert.strictEqual(api.printerControl("Unknown printer").Forms.length, 0, "Corrrect forms array for unknown printer");

        assert.throws(() => { var x = api.printerControl("Unknown printer").Forms.length; },
            function (err) {
                return err.message === "Cannot read property 'forms' of undefined";
            },
            "Raised error on printerControl(badName) is correct");
        
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});

QUnit.test("factory.printing - do printing with mock UI", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(13);

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // mock UI cancel print UI.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(false); }
        };

        assert.notOk(api.Print(true, null, (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled print did not start");
            done();
        }), "Print api returned false");

        assert.notOk(api.Print(true, "aframe", (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled print frame did not start");
            done();
        }), "Print api returned false");

        assert.notOk(api.PrintHTML("http://www.meadroid.com",true, (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled PrintHTML did not start");
            done();
        }), "Print api returned false");

        assert.notOk(api.PrintHTMLEx("http://www.meadroid.com", true, (data) => { }, "t1", (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled PrintHTMLEx did not start");
            done();
        }), "Print api returned false");

        // mock UI accepted.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(true); }
        };

        assert.ok(api.Print(true, null, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();

                assert.throws(() => {
                    api.Print(true, "aframe");
                },
                function (err) {
                    return err.message === "Unable to get frame content - frame does not exist";
                },
                "Raised error on prompted print on nonexisting frame is correct");

                assert.ok(api.Print(true, "testFrame", (bStarted) => {
                    assert.ok(bStarted, "Prompted print frame did start");
                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a printframe job for the printer");
                    done();

                    api.WaitForSpoolingComplete(3000, (bAllComplete) => {
                        assert.ok(bAllComplete, "All jobs are complete");
                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                        done();

                        assert.ok(api.PrintHTML("http://www.meadroid.com", true, (bStarted) => {
                            assert.ok(bStarted, "Prompted PrintHTML did start");
                            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                            done();

                            api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                assert.ok(bAllComplete, "All jobs are complete");
                                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                done();

                                assert.ok(api.PrintHTMLEx("html://<p>hello world</p>", true, (status, sInformation, data) => {
                                    assert.equal(data, "t2", "PrintHTMLEx On progress function receives data: " + status + " => " + sInformation);
                                    }, "t2", (bStarted) => {
                                    assert.ok(bStarted, "Prompted PrintHTMLEx did start");
                                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                                    done();

                                    api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                        assert.ok(bAllComplete, "All jobs are complete");
                                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                        done();
                                    });

                                }), "Print api returned true");
                            });

                        }), "Print api returned true");
                    });
                }), "Print api returned true");

            });
        }), "Print api returned true");



    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});


QUnit.test("factory.printing - do printing with *no* UI", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(9);

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // with no UI, implictly taken that user accepted the prompt
        MeadCo.ScriptX.Print.UI = null;

        assert.ok(api.Print(true, null, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();

                assert.throws(() => {
                    api.Print(true, "aframe");
                },
                    function (err) {
                        return err.message === "Unable to get frame content - frame does not exist";
                    },
                    "Raised error on prompted print on nonexisting frame is correct");

                assert.ok(api.Print(true, "testFrame", (bStarted) => {
                    assert.ok(bStarted, "Prompted print frame did start");
                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a printframe job for the printer");
                    done();

                    api.WaitForSpoolingComplete(3000, (bAllComplete) => {
                        assert.ok(bAllComplete, "All jobs are complete");
                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                        done();

                        assert.ok(api.PrintHTML("http://www.meadroid.com", true, (bStarted) => {
                            assert.ok(bStarted, "Prompted PrintHTML did start");
                            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                            done();

                            api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                assert.ok(bAllComplete, "All jobs are complete");
                                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                done();

                                assert.ok(api.PrintHTMLEx("html://<p>hello world</p>", true, (status, sInformation, data) => {
                                    assert.equal(data, "t2", "PrintHTMLEx On progress function receives data: " + status + " => " + sInformation);
                                }, "t2", (bStarted) => {
                                    assert.ok(bStarted, "Prompted PrintHTMLEx did start");
                                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                                    done();

                                    api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                        assert.ok(bAllComplete, "All jobs are complete");
                                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                        done();
                                    });

                                }), "Print api returned true");
                            });

                        }), "Print api returned true");
                    });
                }), "Print api returned true");

            });
        }), "Print api returned true");

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});


QUnit.test("factory.printPDF - do printing with mock UI", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(4);

    var url = serverUrl;

    var docUrl0 = "http://flipflip.com/?f=pdf0"; // immediate complete
    var docUrl2 = "http://flipflip.com/?f=pdf2"; // a few loops till complete

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // mock UI cancel print UI.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(false); }
        };

        api.PrintPDF({ url: docUrl0 }, true, true, -1, -1, (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled PrintPDF did not start");
            done();
        });

        // mock UI accepted.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(true); }
        };

        api.PrintPDF({ url: docUrl0 }, true, true, -1, -1, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();

            });
        });

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});

QUnit.test("factory.printPDF - do printing with *no* UI and batch print testing", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(7);

    var url = serverUrl;

    var docUrl0 = "http://flipflip.com/?f=pdf0"; // immediate complete
    var docUrl2 = "http://flipflip.com/?f=pdf2"; // a few loops till complete

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        api.PrintPDF({ url: docUrl0 }, true, true, -1, -1, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();

                api.BatchPrintPDF(docUrl0, (bStarted) => {
                    assert.ok(bStarted, "BatchPrintPDF did start");
                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                    done();

                    api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                        assert.ok(bAllComplete, "All jobs are complete");
                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                        done();

                        api.BatchPrintPDFEx(docUrl2, (status, sInformation, data) => {
                            assert.equal(data, "t2", "BatchPrintPDFEx On progress function receives data: " + status + " => " + sInformation);
                        }, "t2", (bStarted) => {
                            assert.ok(bStarted, "Prompted BatchPrintPDFEx did start");
                            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                            done();

                            api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                assert.ok(bAllComplete, "All jobs are complete");
                                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                done();
                            })
                        });
                    });
                });
            });
        });
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
    });

});
