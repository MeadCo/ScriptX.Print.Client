QUnit.config.reorder = false;

QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print, "MeadCo.ScriptX.Print namespace exists");
    var api = MeadCo.ScriptX.Print;

    assert.equal(api.version, "1.6.0.2", "Correct version");

    assert.equal(api.ServiceClasses.CLOUD, 1, "ServiceClasses enum is OK");
    assert.equal(api.ServiceClasses.XX, undefined, "Unknown ServiceClasses enum is OK");

});

QUnit.test("Testing connection", function (assert) {

    var api = MeadCo.ScriptX.Print;

    var url = serverUrl;

    api.connectLite(url," ");
    sd = api.serviceDescription();

    assert.equal(sd.serviceClass, api.ServiceClasses.WINDOWSPC, "Synchronous request - correct service class returned");
    assert.equal(sd.currentAPIVersion, "v1", "Synchronous request - correct api version");

    var done = assert.async(1);

    api.serviceDescriptionAsync(function (sd) {
        assert.equal(sd.serviceClass, api.ServiceClasses.WINDOWSPC, "Asynchronous request - correct service class returned");
        assert.equal(sd.currentAPIVersion, "v1", "Asynchronous request - correct api version");
        done();
    },
        function (errorText) {
            assert.ok(false, "async request failed with: " + errorText);
            done();
        });

});

