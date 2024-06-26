﻿QUnit.config.reorder = false;

QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.UI, "MeadCo.ScriptX.Print.UI namespace exists");
    var api = MeadCo.ScriptX.Print.UI;

    assert.equal(api.version, Versions.MeadCoScriptXPrintUI, "Correct version");

    assert.ok(window.factory, "window.factory object exists");
    assert.ok(factory, "factory object exists");

    factory.printing.PageSetup();

});


