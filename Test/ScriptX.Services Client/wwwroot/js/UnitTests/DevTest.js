MeadCo.logEnabled = true;

QUnit.test("licenses", function (assert) {

    var api = MeadCo.ScriptX.Print.Licensing;

    var done = assert.async(1);

    api.connect(serverUrl);
    var v = MeadCo.ScriptX.Print.serviceVersion();
    console.log("Service version: ", v);

    api.applyAsync(licenseGuid, 0, "Bad-Warehouse",
        function (license) {
            assert.notOk(true, "Should not succed with bad warehouse");
            done();
        },
        function (errorTxt) {
            assert.equal(errorTxt, "\"Unknown warehouse\"", "Bad path fails with correct response");
            done();
        });
});
