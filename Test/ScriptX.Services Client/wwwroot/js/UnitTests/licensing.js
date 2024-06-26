﻿MeadCo.logEnabled = true;

QUnit.test("Namespace basics", function (assert) {

    assert.ok(MeadCo.ScriptX.Print.Licensing, "MeadCo.ScriptX.Print.Licensing namespace exists");
    var api = MeadCo.ScriptX.Print.Licensing;

    assert.equal(api.version, Versions.MeadCoScriptXPrintLicensing, "Correct version");

});

QUnit.test("Apply license", function (assert) {

    var api = MeadCo.ScriptX.Print.Licensing;

    var done = assert.async(5);

    api.connect(serverUrl);

    if (MeadCo.useFetch) {
        MeadCo.ScriptX.Print.serviceVersionAsync((v) => { console.log("Service version: ", v); }, (e) => { console.error("Get servuice version failed: ", e); });
    }
    else {
        var v = MeadCo.ScriptX.Print.serviceVersion();
        console.log("Service version: ", v);
    }

    api.applyAsync(badLicenseGuid, 0, "warehouse",
        function (license) {
            assert.notOk(true, "Should not succed with bad license GUID");
            done();
        },
        function (errorTxt) {
            assert.equal(errorTxt,"Bad Request", "Bad license GUID fails with correct response");
            done();
        });

    api.applyAsync(licenseGuid, 0, "warehouse",
        function (license) {
            assert.equal(license.guid, licenseGuid, "Apply succeeded with valid GUID");
            assert.equal(license.company,"MeadCo", "Apply succeeded with valid Company");
            done();
        },
        function (errorTxt) {
            assert.notEqual(errorTxt, "Bad Request", "Good license GUID should not have failed");
            done();
        });

    api.applyAsync(licenseGuid, 0, "",
        function (license) {
            assert.equal(license.guid, licenseGuid, "Apply with no path succeeded with valid GUID");
            assert.equal(license.company, "MeadCo", "Apply with no path succeeded with valid Company");
            done();
        },
        function (errorTxt) {
            assert.notEqual(errorTxt, "Bad Request", "Good license GUID should not have failed");
            done();
        });

    api.applyAsync(licenseGuid, 0, "Bad-Warehouse",
        function (license) {
            assert.notOk(true, "Should not succed with bad warehouse");
            done();
        },
        function (errorTxt) {
            assert.equal(errorTxt, "\"Unknown warehouse\"", "Bad path fails with correct response");
            done();
        });

    api.connect(serverUrl, licenseGuid);

    api.GetLicenseAsync(function (license) {
        assert.equal(license.guid, licenseGuid, "GetLicenseAsync succeeded with valid GUID");
        assert.equal(license.company, "MeadCo", "GetLicenseAsync succeeded with valid Company");
        done();
    },
    function (errorTxt) {
        assert.notOk(true, "GetLicenseAsync failed: " + errorTxt);
        done();
    });

});