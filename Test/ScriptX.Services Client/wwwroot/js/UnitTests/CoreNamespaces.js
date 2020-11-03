QUnit.test("Testing meadco-core.js", function (assert) {
    assert.ok(MeadCo, "MeadCo namespace exists");
    assert.equal(MeadCo.version, "1.7.1.0", "Correct version");

    assert.ok(MeadCo.ScriptX, "MeadCo.ScriptX exists");

    assert.equal(MeadCo.ScriptX.LibVersion, "1.8.1", "MeadCo.ScriptX.LibVersion OK");

    assert.equal(MeadCo.ScriptX.Print.version, "1.7.1.4", "MeadCo.ScriptX.Print.version ok");
 
});

