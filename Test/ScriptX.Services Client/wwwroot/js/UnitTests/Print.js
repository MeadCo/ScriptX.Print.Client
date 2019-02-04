QUnit.config.reorder = false;

MeadCo.ScriptX.Print.reportServerError = function (txt) {
    $("#qunit-fixture").text(txt);
};

var badServerUrl = "http://localhost:12";

var serverUrl = window.location.protocol + "//" + window.location.host;
//var serverUrl = "https://scriptxservices.meadroid.com";
//var serverUrl = "http://127.0.0.1:41191/";

var licenseGuid = "{666140C4-DFC8-435E-9243-E8A54042F918}";

var badLicenseGuid = "123";

QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print, "MeadCo.ScriptX.Print namespace exists");
    var api = MeadCo.ScriptX.Print;

    assert.equal(api.version, "1.5.1.5", "Correct version");

    assert.equal(api.ContentType.URL, 1, "ContentType enum is OK");
    assert.equal(api.ContentType.XX, undefined, "Unknown ContentType enum is OK");

    assert.equal(api.ResponseStatus.QUEUEDTODEVICE, 1, "ResponseStatus enum is OK");
    assert.equal(api.ResponseStatus.XX, undefined, "Unknown ResponseStatus enum is OK");

    assert.equal(api.printerName, "", "Printer is empty string");
    assert.notEqual(api.deviceSettings, null, "Default device settings are not null");
    assert.deepEqual(api.deviceSettings, {}, "Default device settings are empty object");

    assert.equal(api.deviceSettingsFor("My printer"), undefined, "Device settings for bad printer name shows error dialog and returns undefined");
    assert.equal($("#qunit-fixture").text(), "Not Found", "Correct error message");

});

QUnit.test("Device settings basics", function (assert) {

    var api = MeadCo.ScriptX.Print;

    api.deviceSettings = {
        printerName: "My printer",
        isDefault: true,
        paperSize: "A4"
    };

    assert.notDeepEqual(api.deviceSettings, {}, "Set default device settings are not empty object");
    assert.equal(api.printerName, "My printer", "Default printer name has been set");
    assert.equal(api.deviceSettings.paperSize, "A4", "Default printer papersize is A4");

    api.deviceSettings = {
        printerName: "A3 printer",
        paperSize: "A3"
    };

    assert.equal(api.deviceSettingsFor("A3 printer").paperSize, "A3", "Device settings for another printer is A3");
    assert.equal(api.deviceSettings.paperSize, "A4", "Default printer papersize is A4");

    api.printerName = "A3 printer";
    assert.equal(api.deviceSettings.paperSize, "A3", "Change default printer and papersize is now A3");
    assert.equal(api.printerName, "A3 printer", "Correct default printer name");

    api.printerName = "Garbage";
    assert.equal($("#qunit-fixture").text(), "Not Found", "Correct error message on setting garbage printer");
    assert.equal(api.printerName, "A3 printer", "Default printer name stays correct.");

});

QUnit.test("Testing connection", function (assert) {

    // assert.expect(2);
    var done = assert.async(2);

    var api = MeadCo.ScriptX.Print;

    var url = serverUrl;

    api.connectTestAsync("http://localhost:1234/", function () {
        assert.ok(false, "Should not have connected to: " + url);
        done();
    }, function (errorText) {
        assert.equal(errorText, "Unknown server or network error", "connectTestAsync failed with correct error");
        done();
    });

    api.connectTestAsync(url, function (data) {
        assert.ok(true, "Test without license connected to: " + url);
        assert.notOk(data.AdvancedPrinting, "Advanced printing not enabled");
        assert.notOk(data.BasicPrinting, "BasicPrinting Printing not enabled");
        assert.notOk(data.EnhancedFormatting, "EnhancedFormatting Printing not enabled");
        assert.notOk(data.PrintPdf, "PrintPdf Printing not enabled");
        assert.notOk(data.PrintRaw, "RAW Printing not enabled");
        done();
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });
});

QUnit.test("Connecting", function (assert) {

    var done = assert.async(4);

    var api = MeadCo.ScriptX.Print;

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

    api.connectAsync(url, licenseGuid, function (data) {
        assert.equal(data.printerName, "Test printer", "Connected async with correct device info");
        assert.ok(api.isConnected, "isConnected");
        done();
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });
});

QUnit.test("Device values and available printers", function (assert) {

    var api = MeadCo.ScriptX.Print;

    assert.equal(api.availablePrinterNames.length, 0, "Correct available (empty) printer names array");
    api.connectDeviceAndPrinters(
        [
            {
                printerName: "A3 printer",
                paperSize: "A3",
                isDefaut: true

            },
            {
                printerName: "A4 printer",
                paperSize: "A4"
            }
        ],
        ["A3 printer", "A4 printer"]);

    assert.notDeepEqual(api.deviceSettings, {}, "Set default device settings are not empty object");
    assert.equal(api.printerName, "A3 printer", "Default printer name has been set");
    assert.equal(api.deviceSettings.paperSize, "A3", "Default printer papersize is A3");
    assert.equal(api.availablePrinterNames.length, 2, "Correct available printer names array");
});

QUnit.test("call server api with GET", function (assert) {

    var done = assert.async(8);

    var api = MeadCo.ScriptX.Print;

    api.connectLite(badServerUrl, badLicenseGuid);

    api.getFromServer("/twaddle/?units=0", false,
        function (data) {
            assert.ok(false, "Call to bad server should not succeed");
            done();
        }, function (errorText) {
            assert.ok(true, "Call to bad server failed, error was: " + errorText);
            done();
        });

    api.connectLite(serverUrl, badLicenseGuid);

    api.getFromServer("/twaddle/?units=0", false,
        function (data) {
            assert.ok(false, "Call to bad api should not succeed");
            done();
        }, function (errorText) {
            assert.ok(true, "Call to bad api failed, error was: " + errorText);
            done();
        });

    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(false, "Call to api with bad license should not succeed");
            done();
        }, function (errorText) {
            assert.ok(true, "Call to api with bad license failed, error was: " + errorText);
            done();
        });

    api.connectLite(serverUrl, licenseGuid);
    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(true, "Call to api with good license succeeded");
            done();
        }, function (errorText) {
            assert.ok(false, "Call to api with good license failed, error was: " + errorText);
            done();
        });

    api.connectLite(serverUrl, null);
    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(true, "Call to api succeeded - null license ignored");
            done();
        }, function (errorText) {
            assert.ok(false, "Call to api with good license failed, error was: " + errorText);
            done();
        });

    api.connectLite(serverUrl, "");
    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(true, "Call to api succeeded - empty license ignored");
            done();
        }, function (errorText) {
            assert.ok(false, "Call to api with good license failed, error was: " + errorText);
            done();
        });

    api.connectLite(null, licenseGuid);
    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(true, "Call to api succeeded - null server ignored");
            done();
        }, function (errorText) {
            assert.ok(false, "Call to api with good license failed, error was: " + errorText);
            done();
        });

    api.connectLite("", licenseGuid);
    api.getFromServer("/htmlPrintDefaults/?units=0", false,
        function (data) {
            assert.ok(true, "Call to api succeeded - empty server ignored");
            done();
        }, function (errorText) {
            assert.ok(false, "Call to api with good license failed, error was: " + errorText);
            done();
        });
});

QUnit.test("queue management", function (assert) {

    var api = MeadCo.ScriptX.Print;

    assert.notEqual(api.queue, null, "Queue is not null");
    assert.equal(api.queue.length, 0, "Qeue is empty");
    assert.equal(api.activeJobs, 0, "There are no active jobs");
    assert.notOk(api.isSpooling, "Not spooling");

    var lock = api.ensureSpoolingStatus();

    assert.notEqual(api.activeJobs, 0, "with ensureSpoolingStatus() there are now active jobs");
    assert.ok(api.isSpooling, "Is spooling");

    api.freeSpoolStatus(lock);
    assert.equal(api.activeJobs, 0, "After freeSpoolStatus there are no active jobs again");
    assert.notOk(api.isSpooling, "Not spooling again ");

    var done = assert.async();

    api.waitForSpoolingComplete(-1, function (bComplete) {
        assert.ok(bComplete, "WaitForSpoolingComplete ok.");
        done();
    });

});

QUnit.test("WaitForSpoolingComplete time out", function (assert) {

    var done = assert.async();
    var api = MeadCo.ScriptX.Print;
    var lock = api.ensureSpoolingStatus();

    api.waitForSpoolingComplete(2000, function (bComplete) {
        assert.notOk(bComplete, "WaitForSpoolingComplete ok - still spooling after timeout.");
        api.freeSpoolStatus(lock);
        done();
    });
});

QUnit.test("Printing", function (assert) {

});
