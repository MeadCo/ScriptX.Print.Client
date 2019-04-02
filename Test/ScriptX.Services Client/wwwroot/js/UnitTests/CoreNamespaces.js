QUnit.test("Testing meadco-core.js", function (assert) {
    assert.ok(MeadCo, "MeadCo namespace exists");
    assert.equal(MeadCo.version, "1.5.4.0", "Correct version");

    assert.ok(MeadCo.ScriptX, "MeadCo.ScriptX exists");

    assert.equal(MeadCo.ScriptX.LibVersion, "1.5.0", "MeadCo.ScriptX.LibVersion OK");

    assert.equal(MeadCo.ScriptX.Print.version, "1.5.4.0", "MeadCo.ScriptX.Print.version ok");
 
});

