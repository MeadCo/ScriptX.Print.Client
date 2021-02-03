// Note, secmgr is a thin compatibility wrapper on meadco-scriptxprintlicensing.js
//
// This just tests that the wrapper is in place and functions as a wrapper.
//
QUnit.test("Namespace basics", function (assert) {

    assert.ok(window.secmgr, "secmgr namespace exists");

    var api = window.secmgr;

    assert.strictEqual(api.version, "1.8.1.0", "Correct version");
    assert.strictEqual(api.result, 5, "Default value of result is 5");
    assert.notOk(api.validLicense, "Default validLicense is false");

    assert.throws(
        () => { var l = api.License; },
        function (err) { 
            return err.message === "MeadCo.ScriptX.Licensing : License server API URL is not set or is invalid"; 
        },
        "With no connection, attempt to get license throws correct error.");

 });

