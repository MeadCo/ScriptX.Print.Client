QUnit.test("Testing meadco-core.js", function (assert) {
    assert.ok(MeadCo, "MeadCo namespace exists");
    assert.equal(MeadCo.version, "1.5.2.0", "Correct version");

    var serverUrl = "http://testserver.com/";
    var api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "api/v1/printHtml","Correct api endpoint");

    serverUrl = "http://testserver.com";
    api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "/api/v1/printHtml", "Correct api endpoint");

    serverUrl = "http://testserver.com/api/v1";
    api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "/printHtml", "Correct api endpoint");
});
