QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.PDF, "MeadCo.ScriptX.Print.PDF namespace exists");
    var api = MeadCo.ScriptX.Print.PDF;

    assert.equal(api.version, "1.5.2.0", "Correct version");

    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.MM, 1, "MeasurementUnits enum is OK");
    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.XX, undefined, "MeasuremmentUnits ContentType enum is OK");

 });

QUnit.test("Connecting to service", function (assert) {

    var done = assert.async(4);

    var api = MeadCo.ScriptX.Print.PDF;

    var url = serverUrl;

    api.connectAsync(url, "{}", function (data) {
        assert.ok(false, "Should not have connected to: " + url + " with bad license");
        done();
    }, function (errorText) {
        assert.ok(true, "Failed to connect to: " + url + " with bad license GUID, error: " + errorText);
        done();
    });

    api.connectAsync(url, null, function (data) {
        assert.ok(false, "Should not have connected to: " + url + " with bad license");
        done();
    }, function (errorText) {
        assert.ok(true, "Failed to connect to: " + url + " with null license GUID, error: " + errorText);
        done();
    });

    api.connectAsync(url, "", function (data) {
        assert.ok(false, "Should not have connected to: " + url + " with bad license");
        done();
    }, function (errorText) {
        assert.ok(true, "Failed to connect to: " + url + " with empty string license GUID, error: " + errorText);
        done();
    });

    assert.strictEqual(MeadCo.ScriptX.Print.printerName, "", "Default printer name has not yet been set");

    api.connectAsync(url, licenseGuid, function (data) {
        assert.equal(MeadCo.ScriptX.Print.printerName, "Test printer", "Default printer name has been set");
        done();
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });
});

QUnit.test("Printing content", function (assert) {

    var done = assert.async(1);

    var api = MeadCo.ScriptX.Print.PDF;

    api.connectAsync(serverUrl, licenseGuid, function (data) {

        assert.equal(MeadCo.ScriptX.Print.printerName, "Test printer", "Default printer name has been set");
        done();

        var done2 = assert.async(4);

        // immediate completion
        api.print(function (errorText) {
            assert.equal(errorText, null, "Correct done call on immediate completion");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

        // error in job from server
        api.print("http://www.meadroid.com", function (errorText) {
            assert.equal(errorText, "Server error", "Correct done call (mocked abandoned)");
            assert.equal($("#qunit-fixture").text(), "The print failed with the error: Mocked abandon", "Correct error dialog raised");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

        // requires monitor to run a few loops
        api.print("<!Doctype html><html><body>Hello world</body></html>", function (errorText) {
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