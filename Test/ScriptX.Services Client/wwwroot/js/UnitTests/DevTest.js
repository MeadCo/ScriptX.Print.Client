QUnit.test("factory.printing - do printing with *no* UI", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(3);

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // with no UI, implictly taken that user accepted the prompt
        MeadCo.ScriptX.Print.UI = null;

        assert.ok(api.Print(true, "testFrame", (bStarted) => {
            assert.ok(bStarted, "Prompted print frame did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a printframe job for the printer");
            done();

            api.WaitForSpoolingComplete(3000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();
                });
        }), "Print api returned true");

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});

