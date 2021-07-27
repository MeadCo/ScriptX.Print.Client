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
