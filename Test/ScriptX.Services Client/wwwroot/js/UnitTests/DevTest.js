QUnit.test("Connecting", function (assert) {

    var done = assert.async(1)

    var api = MeadCo.ScriptX.Print;

    var url = serverUrl;

    //api.connectAsync(url, "{}", function (data) {
    //    assert.ok(false, "Should not have connected to: " + url + " with bad license");
    //    done();
    //}, function (errorText) {
    //    assert.ok(true, "Failed to connect to: " + url + " with bad license GUID, error: " + errorText);
    //    done();
    //});

    //api.connectAsync(url, null, function (data) {
    //    assert.ok(false, "Should not have connected to: " + url + " with bad license");
    //    done();
    //}, function (errorText) {
    //    assert.ok(true, "Failed to connect to: " + url + " with null license GUID, error: " + errorText);
    //    done();
    //});

    api.connectAsync(url, "", function (data) {
        assert.ok(false, "Should not have connected to: " + url + " with bad license");
        done();
    }, function (errorText) {
        assert.ok(true, "Failed to connect to: " + url + " with empty string license GUID, error: " + errorText);
        done();
    });

    //api.connectAsync(url, licenseGuid, function (data) {
    //    assert.equal(data.printerName, "Test printer", "Connected async with correct device info");
    //    assert.ok(api.isConnected, "isConnected");
    //    done();
    //}, function (errorText) {
    //    assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
    //    done();
    //});
});
