QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.PDF, "MeadCo.ScriptX.Print.PDF namespace exists");
    var api = MeadCo.ScriptX.Print.PDF;

    assert.equal(api.version, "1.6.0.0", "Correct version");

    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.MM, 2, "MeasurementUnits enum is OK");
    assert.equal(MeadCo.ScriptX.Print.MeasurementUnits.XX, undefined, "MeasuremmentUnits enum is OK");

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

        var done2 = assert.async(8);

        // immediate completion
        api.print("", function (errorText) {
            assert.equal(errorText, "Request to print no content", "Correct done call on immediate completion");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData1", "On progress1 function receives data: " + status);
        },
            "ProgressData1");

        // ok job at server 
        // error in job from server
        api.print("http://flipflip.com/?f=pdf0", function (errorText) {
            assert.strictEqual(errorText, null, "Immediate print correct done call (no error)");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData2", "On progress2 function receives data: " + status);
        },
            "ProgressData2");


        // error in job from server
        api.print("http://flipflip.com/?f=pdf1", function (errorText) {
            assert.equal(errorText, "Server error", "Correct done call (mocked abandoned)");
            assert.equal($("#qunit-fixture").text(), "The print failed with the error: Mocked abandon", "Correct error dialog raised");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData3", "On progress3 function receives data: " + status);
        },
            "ProgressData3");

        api.print("http://flipflip.com/?f=pdf2", function (errorText) {
            assert.strictEqual(null, errorText, "Longer job correct done call (no error)");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData4", "On progress4 function receives data: " + status);
        },
            "ProgressData4");

        api.print("http://flipflip.com/?f=pdfA", function (errorText) {
            assert.strictEqual(errorText, "Server error", "Correct itemError in status handling");
            assert.equal($("#qunit-fixture").text(), "The print failed with the error: Bad type from jobToken: pdfA:job", "Correct error reported via dialog");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData5", "On progress4 function receives data: " + status);
        },
            "ProgressData5");

        api.print("\\\\beaches\\delight", function (errorText) {
            assert.strictEqual(errorText, "Server error", "Correct itemError with UNC doc");
            assert.equal($("#qunit-fixture").text(), "Unsupported print content type: Unc", "Correct unc error reported via dialog");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData6", "On progress4 function receives data: " + status);
        },
            "ProgressData6");

        api.print("delight.pdf", function (errorText) {
            assert.strictEqual(errorText, "Server error", "Correct itemError with bad uri doc");
            assert.equal($("#qunit-fixture").text(), "This operation is not supported for a relative URI.", "Correct error reported via dialog");
            done2();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData7", "On progress4 function receives data: " + status);
        },
            "ProgressData7");

        MeadCo.ScriptX.Print.waitForSpoolingComplete(30000, function (bComplete) {
            assert.ok(bComplete, "WaitForSpoolingComplete ok - all jobs done.");
            done2();
        });

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});
