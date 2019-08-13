
QUnit.test("Direct print string", function (assert) {

    var done = assert.async(1);

    var api = MeadCo.ScriptX.Print;

    api.connectLite(serverUrl, licenseGuid);

    api.deviceSettings = {
        printerName: "My printer",
        isDefault: true,
        paperSize: "A4"
    };
    api.printerName = "My printer";

    bPrinted = api.printDirect(api.ContentType.STRING, "OK", function (errorText) {
        assert.notOk(errorText, "No error message supplied to fnDone()");
        done();
    });
    assert.ok(bPrinted, "Correct print call result");

});
