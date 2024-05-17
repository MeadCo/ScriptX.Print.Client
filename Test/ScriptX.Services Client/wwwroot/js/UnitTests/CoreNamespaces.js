QUnit.test("Testing meadco-core.js", function (assert) {
    assert.ok(MeadCo, "MeadCo namespace exists");
    assert.equal(MeadCo.version, Versions.MeadCo, "Correct version");

    assert.ok(MeadCo.ScriptX, "MeadCo.ScriptX exists");

    assert.equal(MeadCo.ScriptX.LibVersion, Versions.MeadCoScriptX, "MeadCo.ScriptX.LibVersion OK");

    assert.equal(MeadCo.ScriptX.Print.version, Versions.MeadCoScriptXPrint, "MeadCo.ScriptX.Print.version ok");
 
});

