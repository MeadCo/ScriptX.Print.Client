QUnit.test("Namespace basics", function (assert) {

    assert.ok(window.factory, "factory namespace exists");
    var api = window.factory;
    var expectedVersion = "1.5.1.2";

    var a = new Object();
    var b = new Object();
    var c = new Object();
    var d = new Object();

    api.GetComponentVersion("scriptx.factory.services", a, b, c, d);
    var v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, expectedVersion , "Correct library version");

    api.GetComponentVersion("ScriptX.Factory", a, b, c, d);
    v = a[0] + "." + b[0] + "." + c[0] + "." + d[0];

    assert.equal(v, "8.0.0.0", "Correct ScriptX emulation version via ScriptX.Factory");
    assert.equal(api.ScriptXVersion, "8.0.0.0", "Correct ScriptX emulation version via API");
    assert.equal(api.ComponentVersionString("scriptx.factory.services"), expectedVersion, "Correct library version via ComponentVersionString");

});

QUnit.test("Url handling", function (assert) {

    var api = window.factory;

    assert.strictEqual(api.baseURL("Test.html"), serverUrl + "/Tests/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("./Test.html"), serverUrl + "/Tests/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("../Test.html"), serverUrl + "/Test.html", "Correct simple baseUrl");
    assert.strictEqual(api.baseURL("../../Test.html"), serverUrl + "/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("../Thing/Test.html"), serverUrl + "/Thing/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("https://www.meadroid.com/Thing/Test.html"),"https://www.meadroid.com/Thing/Test.html", "Correct simple baseUrl");

    assert.strictEqual(api.baseURL("//Test/x.html"),"http://test/x.html", "Correct simple baseUrl");

});

QUnit.test("OnDocumentComplete", function (assert) {

    var api = window.factory;

    api.OnDocumentComplete(window, function () {
        assert.ok(true, "OnDocumentComplete called immediately on window.");
    });

    api.OnDocumentComplete(testFrame, function () {
        assert.ok(true, "OnDocumentComplete called immediately on frame.");
    });

    var done = assert.async(2);

    var url = api.baseURL("Frame2");

    var tf = document.getElementById("testFrame");

    tf.src = url;

    api.OnDocumentComplete(testFrame, function () {
        assert.ok(true, "OnDocumentComplete: " + tf.src + "  called after frame loaded.");
        assert.strictEqual(tf.contentWindow.document.readyState, "complete", "Frame state is correct");
        assert.strictEqual(tf.contentWindow.location.href, url, "Frame url is correct, url is: " + tf.contentWindow.document.URL);

        done();

        url = "https://www.meadroid.com";
        tf.src = url;

        api.OnDocumentComplete(testFrame, function () {
            assert.ok(true, "OnDocumentComplete: " + tf.src + "  called after frame loaded.");

            // NOTE: Cannot do this because of cross frame restrictions
            //assert.strictEqual(tf.contentWindow.document.readyState, "complete", "Frame state is correct");
            //assert.strictEqual(tf.contentWindow.location.href, url, "Frame url is correct, url is: " + tf.contentWindow.document.URL);
            done();
        });
    });

});

QUnit.test("factory.printing properties", function (assert) {

    var api = window.factory.printing;

    assert.strictEqual(api.header, "", "Default header is blank");

    api.header = "My header";
    assert.strictEqual(api.header, "My header", "Header read write ok");

    api.footer = "My footer";
    assert.strictEqual(api.footer, "My footer", "Footer read write ok");

    api.headerFooterFont = "A font";
    assert.strictEqual(api.headerFooterFont, "A font", "Header footer font ok");

    assert.strictEqual(api.orientation, "portrait", "Default orientation is correct");

    assert.ok(api.portrait, "Default is portrait");

    api.orientation = "gibberish";
    assert.strictEqual(api.orientation, "portrait", "Orientation is correct after setting garbage");

    api.orientation = "landscape";
    assert.strictEqual(api.orientation, "landscape", "Orientation is correct after setting landscape");
    assert.notOk(api.portrait, "Correctly not portrait");

    api.portrait = true;
    assert.strictEqual(api.orientation, "portrait", "Orientation is correct after set portrait");
    assert.ok(api.portrait, "is Portrait");

    api.orientation = "LAndsCape";
    assert.strictEqual(api.orientation, "landscape", "Orientation is correct after setting LAndsCape");
    assert.notOk(api.portrait, "Correctly not portrait");

    assert.strictEqual(api.leftMargin, "", "Default left margin ok");
    assert.strictEqual(api.rightMargin, "", "Default right margin ok");
    assert.strictEqual(api.topMargin, "", "Default top margin ok");
    assert.strictEqual(api.bottomMargin, "", "Default bottom margin ok");

    api.leftMargin = api.rightMargin = api.topMargin = api.bottomMargin = "5";

    assert.strictEqual(api.leftMargin, "5", "R/w left margin ok");
    assert.strictEqual(api.rightMargin, "5", "R/w right margin ok");
    assert.strictEqual(api.topMargin, "5", "R/w top margin ok");
    assert.strictEqual(api.bottomMargin, "5", "R/w bottom margin ok");

    assert.strictEqual(api.templateURL, "MeadCo://default", "templateURL is correct");

});


QUnit.test("factory.printing dialogs", function (assert) {

    var api = window.factory.printing;

    api.PageSetup();
    assert.equal($("#qunit-fixture").text(), "Page setup dialog", "Correct pageSetup dlg message");

    $("#qunit-fixture").text("");

    api.PrintSetup();
    assert.equal($("#qunit-fixture").text(), "Print settings dialog", "Correct settings dlg message");

});


QUnit.test("factory.printing device settings", function (assert) {

    var api = window.factory.printing;

    assert.strictEqual(api.units, MeadCo.ScriptX.Print.HTML.PageMarginUnits.MM, "Default margin units correct");
    assert.strictEqual(api.GetMarginMeasure(), MeadCo.ScriptX.Print.HTML.PageMarginUnits.MM, "Default margin measure units correct");

    assert.strictEqual(api.printer, "", "Correct null startup printer");

    api.printer = "My printer";
    assert.strictEqual(api.printer, "", "Set bad printer ok");

    var m = "";
    try {
        api.currentPrinter = "My printer";
    } catch (e) {
        m = e.message;
    }

    assert.strictEqual(api.printer, "", "Set bad currentPrinter ok");
    assert.strictEqual(m, "Not Found", "Set bad currentPrinter, correct exception");

    try {
        api.CurrentPrinter = "My printer";
    } catch (e) {
        m = e.message;
    }

    assert.strictEqual(api.printer, "", "Set bad CurrentPrinter");
    assert.strictEqual(m, "Not Found", "Set bad CurrentPrinter, correct exception");

    var done = assert.async(1);

    var api2 = MeadCo.ScriptX.Print.HTML;

    var url = serverUrl;

    api2.connectAsync(url, licenseGuid, function (data) {
        assert.equal(api.printer, "Test printer", "Default printer name has been set");
        assert.equal(api.header, "Default header from server", "header values collected from server");
        done();

        try {
            api.CurrentPrinter = "My printer";
        } catch (e) {
            m = e.message;
        }

        assert.strictEqual(api.printer, "Test printer", "Set bad connected CurrentPrinter");
        assert.strictEqual(m, "Not Found", "Set bad connected CurrentPrinter, correct exception");

    }, function (errorText) {
        assert.ok(false, "Should have connected to: " + url + " error: " + errorText);
        done();
    });

});
