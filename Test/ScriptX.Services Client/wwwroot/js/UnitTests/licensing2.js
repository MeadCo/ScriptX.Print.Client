MeadCo.logEnabled = true;

QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.Licensing, "MeadCo.ScriptX.Print.Licensing namespace exists");
    var api = MeadCo.ScriptX.Print.Licensing;

    assert.equal(api.version, "1.14.0.2", "Correct version");

});

QUnit.test("Attribute applied license", function (assert) {

    assert.equal(MeadCo.ScriptX.Print.Licensing.result, 0, "License has been applied successfully");

});