QUnit.test("Dev Tests", function (assert) {

    let api = window.factory.printing;
    let api2 = MeadCo.ScriptX.Print.HTML;

    let done = assert.async(3);

    let url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.ok(true, "Connected to server");
        done();

        // mock UI cancel print UI.
        MeadCo.ScriptX.Print.UI = {
            PrinterSettings: (fnDialgCompleteCallBack) => { fnDialgCompleteCallBack(false); }
        };

        let apiResult = api.PrintHTML("http://www.meadroid.com", true, (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled PrintHTML did not start");
            done();
        })

        assert.ok(apiResult, "Print api returned false");


        assert.ok(api.PrintHTML("http://www.meadroid.com", true, (bStarted) => {
            assert.notOk(bStarted, "Prompted cancelled PrintHTML did not start 2");
            done();
        }), "Print api returned false");

    });

});