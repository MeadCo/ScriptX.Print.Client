MeadCo.ScriptX.Print.reportServerError = function (txt) {
    $("#qunit-fixture").text(txt);
};

QUnit.test("Testing meadco-scriptxprint.js A", function (assert) {

    assert.ok(MeadCo.ScriptX.Print, "MeadCo.ScriptX.Print namespace exists");
    var api = MeadCo.ScriptX.Print;

    assert.equal(api.version, "1.5.1.4", "Correct version");

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

QUnit.test("Testing meadco-scriptxprint.js B", function (assert) {

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

QUnit.test("Testing meadco-scriptxprint.js C", function (assert) {

    var done = assert.async();

    var api = MeadCo.ScriptX.Print;

    var url = window.location.host;

    api.connectTestAsync("http://localhost:1234/", function () {
        assert.ok(false, "Should not have connected to: " + url);
        done();
    }, function (errorText) {
        assert.equal(errorText, "Unknown server or network error", "connectTestAsync failed with correct error");
        done();
    });

});
