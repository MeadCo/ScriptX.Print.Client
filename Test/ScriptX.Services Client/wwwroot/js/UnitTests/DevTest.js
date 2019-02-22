QUnit.test("Printing single piece of pdf content", function (assert) {

    var done = assert.async(4);

    var api = MeadCo.ScriptX.Print;

    api.connectLite(serverUrl, licenseGuid);

    api.deviceSettings = {
        printerName: "My printer",
        isDefault: true,
        paperSize: "A4"
    };

    // immediate completion
    api.printPdf("http://flipflip.com/?f=pdf0", {}, function (errorText) {
        assert.equal(errorText, null, "Correct done call in immediate completion");
        done();
    }, function (status, sInformation, data) {
        assert.equal(data, "ProgressData0", "On progress0 function receives data: " + status);
    },
        "ProgressData0");

    // error in job from server
    api.printPdf("http://flipflip.com/?f=pdf1", {}, function (errorText) {
        assert.equal(errorText, "Server error", "Correct done call (mocked abandoned)");
        assert.equal($("#qunit-fixture").text(), "The print failed with the error: Mocked abandon", "Correct error dialog raised");
        done();
    }, function (status, sInformation, data) {
        assert.equal(data, "ProgressData1", "On progress1 function receives data: " + status);
    },
        "ProgressData1");

    // requires monitor to run a few loops
    api.printPdf("http://flipflip.com/?f=pdf2", {}, function (errorText) {
        assert.equal(errorText, null, "Correct done call on long running job");
        done();
    }, function (status, sInformation, data) {
        assert.equal(data, "ProgressData2", "On progress2 function receives data: " + status);
    },
        "ProgressData2");

    api.waitForSpoolingComplete(10000, function (bComplete) {
        assert.ok(bComplete, "WaitForSpoolingComplete ok - all jobs done.");
        done();
    });
});