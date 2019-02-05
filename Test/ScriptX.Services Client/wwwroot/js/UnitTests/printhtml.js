QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.HTML, "MeadCo.ScriptX.Print.HTML namespace exists");
    var api = MeadCo.ScriptX.Print.HTML;

    assert.equal(api.version, "1.5.1.2", "Correct version");

    assert.equal(api.PageMarginUnits.MM, 2, "PageMarginUnits enum is OK");
    assert.equal(api.PageMarginUnits.XX, undefined, "PageMarginUnits ContentType enum is OK");

    assert.strictEqual(api.settings.viewScale,0,"Settings object readable");
    
    api.settings.viewScale = 100;
    assert.strictEqual(api.settings.viewScale,100,"Settings object writeble");

    var locale = (navigator.languages && navigator.languages.length)
        ? navigator.languages[0]
        : navigator.language;   

    assert.notStrictEqual(locale,undefined,"There is a browser locale: " + locale);
    assert.notStrictEqual(api.settings.locale,undefined,"There is a locale: " + api.settings.locale);

});

QUnit.test("Connecting to service", function (assert) {

    var done = assert.async(4);

    var api = MeadCo.ScriptX.Print.HTML;

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
        assert.equal(api.settings.header, "Default header from server", "header values collected from server");
        assert.notStrictEqual(api.settings.locale, undefined, "There is a locale: " + api.settings.locale);
        done();
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });
});

QUnit.test("Grabbing content", function (assert) {

    var api = MeadCo.ScriptX.Print.HTML;

    var d = api.documentContentToPrint;
    var f = api.frameContentToPrint("testFrame");
    var f2 = api.frameContentToPrint("testFrame-2");

    assert.notStrictEqual(f.indexOf("A massively simple frame"), -1, "Frame content gathered by frame id");
    assert.notStrictEqual(f2.indexOf("A massively simple frame"), -1, "Frame content gathered by frame name");

});