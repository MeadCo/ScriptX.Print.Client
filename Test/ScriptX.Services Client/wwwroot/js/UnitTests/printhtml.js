QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.HTML, "MeadCo.ScriptX.Print.HTML namespace exists");
    var api = MeadCo.ScriptX.Print.HTML;

    assert.equal(api.version, "1.12.0.0", "Correct version");

    // Don't change this or there will be compatibility issues with the server 
    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.MM, 2, "MeasurementUnits enum is OK");
    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.XX, undefined, "MeasuremmentUnits ContentType enum is OK");

    assert.strictEqual(api.settings.viewScale,0,"Settings object readable");
    
    api.settings.viewScale = 100;
    assert.strictEqual(api.settings.viewScale,100,"Settings object writeble");

    var locale = (navigator.languages && navigator.languages.length)
        ? navigator.languages[0]
        : navigator.language;   

    assert.notStrictEqual(locale,undefined,"There is a browser locale: " + locale);
    assert.notStrictEqual(api.settings.locale, undefined, "There is a locale: " + api.settings.locale);


    assert.equal(MeadCo.ScriptX.Print.ContentType.INNERHTML, 4, "MeadCo.ScriptX.Print.ContentType.INNERHTML enum is available");

});

QUnit.test("Connecting to service", function (assert) {

    var done = assert.async(4);

    var api = MeadCo.ScriptX.Print.HTML;

    var url = serverUrl;

    api.connectAsync(url, "{}", function (data) {
        assert.ok(false, "Should not have connected to: " + url + " with bad license");
        done();
        done();
        done();
        done();
    }, function (errorText) {
        assert.ok(true, "Failed to connect to: " + url + " with bad license GUID, error: " + errorText);
        done();

        api.connectAsync(url, null, function (data) {
            assert.ok(false, "Should not have connected to: " + url + " with bad license");
            done();
            done();
            done();
        }, function (errorText) {
            assert.ok(true, "Failed to connect to: " + url + " with null license GUID, error: " + errorText);
            done();

            api.connectAsync(url, "", function (data) {
                assert.ok(false, "Should not have connected to: " + url + " with bad license");
                done();
                done();
            }, function (errorText) {
                assert.ok(true, "Failed to connect to: " + url + " with empty string license GUID, error: " + errorText);
                done();

                assert.strictEqual(MeadCo.ScriptX.Print.printerName, "", "Default printer name has not yet been set");

                api.connectAsync(url, licenseGuid, function (data) {
                    assert.equal(MeadCo.ScriptX.Print.printerName, "Test printer", "Default printer name has been set");
                    assert.equal(api.settings.header, "Default header from server", "header values collected from server");
                    assert.notStrictEqual(api.settings.locale, undefined, "There is a locale: " + api.settings.locale);
                    done();
                }, function (errorText) {
                    assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
                    done();
                });
            });

        });

    });

});

QUnit.test("Grabbing content", function (assert) {

    var api = MeadCo.ScriptX.Print.HTML;

    var d = api.documentContentToPrint;
    var f = api.frameContentToPrint("testFrame");
    var f2 = api.frameContentToPrint("testFrame-2");

    assert.notStrictEqual(d.indexOf("<h1>-PrintHtml.js</h1>"), -1, "document heading gathered");
    assert.notStrictEqual(f.indexOf("A massively simple frame"), -1, "Frame content gathered by frame id");
    assert.notStrictEqual(f2.indexOf("A massively simple frame"), -1, "Frame content gathered by frame name");

});

QUnit.test("Printing content", function (assert) {

    var done = assert.async(1);

    var api = MeadCo.ScriptX.Print.HTML;

    api.connectAsync(serverUrl, licenseGuid, function (data) {

        assert.equal(MeadCo.ScriptX.Print.printerName, "Test printer", "Default printer name has been set");
        assert.equal(api.settings.header, "Default header from server", "header values collected from server");
        assert.notStrictEqual(api.settings.locale, undefined, "There is a locale: " + api.settings.locale);
        done();

        var done2 = assert.async(4);

        // immediate completion
        api.printDocument(function (errorText) {
            assert.equal(errorText, null, "Correct done call on immediate completion");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

        // error in job from server
        api.printFromUrl("http://www.meadroid.com", function (errorText) {
            assert.equal(errorText, "Server error", "Correct done call (mocked abandoned)");
            assert.equal($("#qunit-fixture").text(), "The print failed with the error: Mocked abandon", "Correct error dialog raised");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

        // requires monitor to run a few loops
        api.printHtml("<!Doctype html><html><body>Hello world</body></html>", function (errorText) {
            assert.equal(errorText, null, "Correct done call on long running job");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

        MeadCo.ScriptX.Print.waitForSpoolingComplete(10000, function (bComplete) {
            assert.ok(bComplete, "WaitForSpoolingComplete ok - all jobs done.");
            done2();
        });

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});
