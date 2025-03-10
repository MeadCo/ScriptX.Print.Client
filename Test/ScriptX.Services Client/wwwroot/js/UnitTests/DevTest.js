MeadCo.logEnabled = true;

QUnit.test("Factory basics", function (assert) {

    assert.ok(window.factory, "factory namespace exists");
    var api = window.factory;
    var expectedVersion = "1.16.1.5";
    var emulatedVersion = "8.3.0.0";
    var servicesVersion = "11.12.13.14";

    var a = new Object();
    var b = new Object();
    var c = new Object();
    var d = new Object();

    api.GetComponentVersion("scriptx.factory.services", a, b, c, d);
    var v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, expectedVersion, "Correct library version");

    api.GetComponentVersion("ScriptX.Factory", a, b, c, d);
    v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, emulatedVersion, "Correct ScriptX emulation version via ScriptX.Factory");
    assert.equal(api.ScriptXVersion, emulatedVersion, "Correct ScriptX emulation version via API");
    assert.equal(api.ComponentVersionString("scriptx.factory.services"), expectedVersion, "Correct .services library version via ComponentVersionString");

    MeadCo.ScriptX.Print.connectLite(serverUrl, " ");
    assert.equal(api.ComponentVersionString("scriptx.services"), servicesVersion, "Correct .services server version via ComponentVersionString");

});
