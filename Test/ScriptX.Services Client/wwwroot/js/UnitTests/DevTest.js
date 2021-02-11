QUnit.test("Dev Tests", function (assert) {

    let api = window.factory.printing;
    let api2 = MeadCo.ScriptX.Print.HTML;

    let done = assert.async(8);

    let url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // mock UI accepted.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(true); }
        };

        assert.ok(api.Print(true, window.self, (bStarted) => {
            assert.ok(bStarted, "Prompted print self did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            assert.ok(api.Print(true, "testFrame", (bStarted) => {
                assert.ok(bStarted, "Prompted print frame did start");
                assert.strictEqual(api.GetJobsCount(api.printer), 2, "There is a printframe job for the printer");
                done();

                api.WaitForSpoolingComplete(3000, (bAllComplete) => {
                    assert.ok(bAllComplete, "All jobs are complete");
                    assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                    done();

                    assert.ok(api.PrintHTML("http://www.meadroid.com", true, (bStarted) => {
                        assert.ok(bStarted, "Prompted PrintHTML did start");
                        assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                        done();

                        api.WaitForSpoolingComplete(10000, (bAllComplete) => {
                            assert.ok(bAllComplete, "All jobs are complete");
                            assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                            done();

                            assert.ok(api.PrintHTMLEx("html://<p>hello world</p>", true, (status, sInformation, data) => {
                                assert.equal(data, "t2", "PrintHTMLEx On progress function receives data: " + status + " => " + sInformation);
                            }, "t2", (bStarted) => {
                                assert.ok(bStarted, "Prompted PrintHTMLEx did start");
                                assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                                done();

                                api.WaitForSpoolingComplete(10000, (bAllComplete) => {
                                    assert.ok(bAllComplete, "All jobs are complete");
                                    assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                    done();
                                });

                            }), "Print api returned true");
                        });

                    }), "Print api returned true");

                });
            }), "Print api returned true");
        }), "Print api returned true");

    });

});