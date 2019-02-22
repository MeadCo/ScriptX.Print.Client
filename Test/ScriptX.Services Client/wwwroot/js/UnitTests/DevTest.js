QUnit.test("factory.printPDF - do printing with *no* UI and batch print testing", function (assert) {

    var api = window.factory.printing;
    var api2 = MeadCo.ScriptX.Print.HTML;

    var done = assert.async(7);

    var url = serverUrl;

    var docUrl0 = "http://flipflip.com/?f=pdf0"; // immediate complete
    var docUrl2 = "http://flipflip.com/?f=pdf2"; // a few loops till complete

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        api.PrintPDF({ url: docUrl0 }, true, true, -1, -1, (bStarted) => {
            assert.ok(bStarted, "Prompted print did start");
            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
            done();

            api.WaitForSpoolingComplete(2000, (bAllComplete) => {
                assert.ok(bAllComplete, "All jobs are complete");
                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                done();

                api.BatchPrintPDF(docUrl0, (bStarted) => {
                    assert.ok(bStarted, "BatchPrintPDF did start");
                    assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                    done();

                    api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                        assert.ok(bAllComplete, "All jobs are complete");
                        assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                        done();

                        api.BatchPrintPDFEx(docUrl2, (status, sInformation, data) => {
                            assert.equal(data, "t2", "BatchPrintPDFEx On progress function receives data: " + status + " => " + sInformation);
                        }, "t2", (bStarted) => {
                            assert.ok(bStarted, "Prompted BatchPrintPDFEx did start");
                            assert.strictEqual(api.GetJobsCount(api.printer), 1, "There is a job for the printer");
                            done();

                            api.WaitForSpoolingComplete(5000, (bAllComplete) => {
                                assert.ok(bAllComplete, "All jobs are complete");
                                assert.strictEqual(api.GetJobsCount(api.printer), 0, "There are no jobs for the printer");
                                done();
                            })
                        });
                    });
                });
            });
        });
    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
        done();
    });

});

