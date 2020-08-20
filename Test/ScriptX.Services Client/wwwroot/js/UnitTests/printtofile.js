// Test core fuctionality (i.e. printToFileName gets passed correctly in root api) and factory emulation
var printToFile1 = "c:\\print\\out.prn";

QUnit.test("HTML API function", function (assert) {

    var done = assert.async(2);

    var api = MeadCo.ScriptX.Print;

    var url = serverUrl;

    api.connectAsync(url, licenseGuid, function (data) {
        assert.equal(data.printerName, "Test printer", "Connected async with correct device info");
        assert.ok(api.isConnected, "isConnected");
        done();

        assert.equal(api.printerName, "Test printer", "Correct default printername");
        assert.equal(api.deviceSettings.printerName, "Test printer", "Correct device settings printername");
        assert.strictEqual(api.deviceSettings.printToFileName, undefined, "PrintToFileName starts correct");

        api.deviceSettings.printToFileName = printToFile1;

        // immediate completion
        api.printHtml(api.ContentType.STRING, "Hello world", {}, function (errorText) {
            assert.equal(errorText, "PrintToFileName: " + printToFile1, "Correct print to file data was sent to api");
            done();
        }, function (status, sInformation, data) {
            assert.equal(data, "ProgressData", "On progress function receives data: " + status);
        },
            "ProgressData");

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});

QUnit.test("factory function", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(3);

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // with no UI, implictly taken that user accepted the prompt
        MeadCo.ScriptX.Print.UI = null;

        api.printToFileName = printToFile1;

        assert.ok(api.Print(true, null, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            console.log("starting wait ..");

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                assert.equal($("#qunit-fixture").text(), "PrintToFileName: " + printToFile1,"Correct soft error - the filename was communicated");
                done();
            });

        }), "Print api returned true");
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done(); done(); done(); 
    });

});
