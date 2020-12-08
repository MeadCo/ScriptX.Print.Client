QUnit.test("Testing meadco-core.js", function (assert) {
    assert.ok(MeadCo, "MeadCo namespace exists");
    assert.equal(MeadCo.version, "1.7.2.0", "Correct version");

    var serverUrl = "http://testserver.com/";
    var api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "api/v1/printHtml","Correct api endpoint");

    serverUrl = "http://testserver.com";
    api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "/api/v1/printHtml", "Correct api endpoint");

    serverUrl = "http://testserver.com/api/v1";
    api = MeadCo.makeApiEndPoint(serverUrl, "v1/printHtml");

    assert.equal(api, serverUrl + "/printHtml", "Correct api endpoint");

    var ns = MeadCo.createNS("MeadCo.Test.NS1");
    assert.ok(ns, "Created namespace");

    ns.test = function () { return 6; };
    assert.equal(ns.test(),6, "function in namespace ns1 ok");

    var ns2 = MeadCo.createNS("MeadCo.Test.NS1.NS2");
    assert.ok(ns, "Created namespace ns2");
    assert.equal(ns.test(),6, "function in namespace ns1 still ok");

});

