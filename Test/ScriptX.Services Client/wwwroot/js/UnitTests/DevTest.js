QUnit.test("Printing with no arguments", function (assert) {

    var done = assert.async(2);
    var api = MeadCo.ScriptX.Print;

    api.connectLite(serverUrl, licenseGuid);
    assert.notOk(api.printHtml(), "No arguments correctly returns false");
    done();

    api.printHtml(0, null, null, function (txt) {
        assert.equal($("#qunit-fixture").text(), "Request to print no content - access denied?", "No arguments no callback raises correct error dialog");
        assert.ok(txt, "Error message supplied to fnDone()");
        assert.strictEqual(txt, "Request to print no content","Correct error message supplied to fnDone()");
        done();
    });

    //api.printHtml(0, null, null, function (errorText) {
    //    assert.equal($("#qunit-fixture").text(), "Bad Request", "No arguments but with callback raises correct error dialog");
    //    assert.equal(errorText, "Bad Request", "Correct error text");
    //    done();
    //}, function (status, sInformation, data) {
    //    assert.equal(data, "ProgressData", "On progress function receives data");
    //    assert.equal(sInformation, "Bad Request", "progress callback gets correct error");
    //    assert.equal(status, api.PrintStatus.ERROR, "Correct progress status (ERROR)");
    //    done();
    //},
    //    "ProgressData");
});


