QUnit.test("factory.printing device settings", function (assert) {

    var api = window.factory.printing;

    MeadCo.ScriptX.Print.connectLite(serverUrl, licenseGuid);

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
                return err.message === "Cannot read properties of undefined (reading 'forms')";
            },
            "Raised error on printerControl(badName) is correct");

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});
