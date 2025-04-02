const server = require("./server");
const packageDescription = require("../package.json");
const versions = require("../configs/versions");

const serverUrl = `http://127.0.0.1:${server.port}`;
const badServerUrl = "http://127.0.0.0:12";
const licenseGuid = "{5091E665-8916-4D21-996E-00A2DE5DE416}";

const util = require('util');

const { Console } = require('console');
// Create a custom console for logging with minimal formatting
const customConsole = new Console({ stdout: process.stdout, stderr: process.stderr });;

// revert to the standard console (which will create verbose formatting in jest)
// const customConsole = console;

const capturePageLogs = false;
async function pageStartup() {
    await server.start();

    // Redirect console.log from the browser to the Jest console
    page.on('console', async (msg) => {
        if (msg.type() === 'log') {
            if (capturePageLogs) {
                for (let i = 0; i < msg.args().length; ++i) {
                    try {
                        // Get the raw value from the JSHandle
                        const argValue = await msg.args()[i].jsonValue();

                        // Print only the value without any additional formatting
                        // console.log(argValue);
                        //
                        process.stdout.write(util.format('%s\n', argValue));
                    } catch (error) {
                        console.log(`[Could not serialize console argument: ${error}]`);
                    }
                }
            }
        }
        else {
            for (let i = 0; i < msg.args().length; ++i) {
                try {
                    // Get the raw value from the JSHandle
                    const argValue = await msg.args()[i].jsonValue();

                    // Print only the value without any additional formatting
                    // console.log(argValue);
                    //
                    process.stdout.write(util.format('%s\n', argValue));
                } catch (error) {
                    console.log(`[Could not serialize console argument: ${error}]`);
                }
            }
        }
    });


    await page.goto("http://localhost:" + server.port + "/test-page-src.html");
}


describe("Namespaces core", () => {
    beforeAll(async () => {
        await pageStartup();
    });

    afterAll(async () => {
        await server.stop();
    });

    test("Library implements expected versions", async () => {
        let v = await page.evaluate(() => {

            console.debug("MeadCo: " + window.MeadCo.version);
            console.debug("MeadCoScriptXPrint: " + window.MeadCo.ScriptX.Print.version);

            return {
                "MeadCo": window.MeadCo.version,
                "MeadCoScriptXPrint": window.MeadCo.ScriptX.Print.version,
                "MeadCoScriptXPrintLicensing": window.MeadCo.ScriptX.Print.Licensing.version,
                "MeadCoScriptXPrintHTML": window.MeadCo.ScriptX.Print.HTML.version,
                "MeadCoScriptXPrintPDF": window.MeadCo.ScriptX.Print.PDF.version
            }
        });

        expect(v["MeadCo"]).toBe(versions.LibVersions.MeadCo);
        expect(v["MeadCoScriptXPrint"]).toBe(versions.LibVersions.MeadCoScriptXPrint);
        expect(v["MeadCoScriptXPrintLicensing"]).toBe(versions.LibVersions.MeadCoScriptXPrintLicensing);
        expect(v["MeadCoScriptXPrintHTML"]).toBe(versions.LibVersions.MeadCoScriptXPrintHTML);
        expect(v["MeadCoScriptXPrintPDF"]).toBe(versions.LibVersions.MeadCoScriptXPrintPDF);

    });

    test("Core API makeApiEndPoint is correct", async () => {
        let serviceUrl = "http://testserver.com/";
        let v = await page.evaluate((sUrl) => {
            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
        }, serviceUrl);

        expect(v).toBe(serviceUrl + "api/v1/printHtml");

        serviceUrl = "http://testserver.com";
        v = await page.evaluate((sUrl) => {
            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
        }, serviceUrl);

        expect(v).toBe(serviceUrl + "/api/v1/printHtml");

        serviceUrl = "http://testserver.com/api/v1";
        v = await page.evaluate((sUrl) => {
            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
        }, serviceUrl);

        expect(v).toBe(serviceUrl + "/printHtml");
    });

    test("Namespace creation is correct", async () => {
        // create a namespace and add a function to it
        let v = await page.evaluate(() => {
            const ns = window.MeadCo.createNS("MeadCo.Test.NS1");
            if (ns) {
                ns.test = function () { return 6; };
                if (typeof (ns.test) === "function") {
                    return ns.test() == 6;
                }
            }
            return false;
        });
        expect(v).toBeTruthy()

        // extend the namespace and ensure that the original namespace still has the function.
        v = await page.evaluate(() => {
            const ns2 = window.MeadCo.createNS("MeadCo.Test.NS1.NS2");
            if (ns2) {
                if (typeof (window.MeadCo.Test.NS1.test) === "function") {
                    return window.MeadCo.Test.NS1.test() == 6;
                }
            }
            return false;
        });
        expect(v).toBeTruthy();
    });
});

describe("Service description", () => {
    beforeAll(async () => {
        await pageStartup();
    });

    afterAll(async () => {
        await server.stop();
    });

    test("Basics", async () => {
        let v = await page.evaluate(() => {
            const api = window.MeadCo.ScriptX.Print;
            return {
                "namespace": typeof api !== "undefined",
                "version": typeof api !== "undefined" ? api.version : "",
                "cloudEnum": api.ServiceClasses.CLOUD,
                "xxEnum": api.ServiceClasses.XX
            }
        });

        expect(v.namespace).toBeTruthy();
        expect(v.version).toBe(versions.LibVersions.MeadCoScriptXPrint);
        expect(v.cloudEnum).toBe(1);
        expect(v.xxEnum).toBe(undefined);

    });


    test("Connection", async () => {
        const result = await page.evaluate(async (serverUrl) => {
            let v = {};
            window.MeadCo.ScriptX.Print.connectLite(serverUrl, " ");
            try {
                // v = await window.MeadCo.ScriptX.Print.waitableServiceDescription();
                v = await new Promise((resolve, reject) => {
                    window.MeadCo.ScriptX.Print.serviceDescriptionAsync(resolve, reject);
                });
            } 
            catch (e) {
            }
            return v;
        }, serverUrl);

        expect(result).toBeDefined();
        expect(result.serviceClass).toBe(3);
        expect(result.currentAPIVersion).toBe("v1");
    });

});

describe("Printing", () => {
    beforeAll(async () => {
        await pageStartup();
    });

    afterAll(async () => {
        await server.stop();
    });

    test("Namespace basics", async () => {
        const v = await page.evaluate(async () => {
            let result = {};
            const api = window.MeadCo.ScriptX.Print;

            result.namespace = typeof api !== "undefined";
            result.version = typeof api !== "undefined" ? api.version : "";
            result.ContentTypeUrl = api.ContentType.URL;
            result.xxEnum = api.ContentType.XX;
            result.ContentTypeHtml = window.MeadCo.ScriptX.Print.ContentType.INNERHTML;
            result.PrintStatusDownloading = api.PrintStatus.DOWNLOADING;
            result.xxPrintStatus = api.PrintStatus.XX;

            if (typeof api !== "undefined") {
                api.connectLite("http://clearServer", " ");

                result.printerName = api.printerName;
                result.deviceSettings = api.deviceSettings;
            }

            result.deviceError = "It shouldnt be this";

            if (MeadCo.fetchEnabled) {
                console.debug("Note fetch is enabled");
                try {
                    result.deviceSettings2 = await new Promise((resolve, reject) => {
                        api.deviceSettingsForAsync("My printer", resolve, reject);
                    });
                    console.debug("deviceSettingsForAsync succeeded");
                }
                catch (e) {
                    console.debug("deviceSettingsForAsync failed", e);
                    result.deviceSettings2 = undefined;
                    result.deviceError = e;
                }
            }
            else {
                result.deviceSettings2 = api.deviceSettingsFor("My printer");
                result.deviceError = document.getElementById("qunit-fixture").textContent;
            }

            return result;
        });

        customConsole.debug(v);

        expect(v.namespace).toBeTruthy();
        expect(v.version).toBe(versions.LibVersions.MeadCoScriptXPrint);
        expect(v.ContentTypeUrl).toBe(1);
        expect(v.xxEnum).toBe(undefined);
        expect(v.ContentTypeHtml).toBe(4);
        expect(v.PrintStatusDownloading).toBe(3);
        expect(v.xxPrintStatus).toBe(undefined);
        expect(v.printerName).toBe("");
        expect(v.deviceSettings).not.toBe(null);
        expect(v.deviceSettings).toEqual({});

        expect(v.devicesSettings2).toBe(undefined);
        expect(v.deviceError).toBe("ScriptX.Services could not be found at \"http://clearServer\". Is it installed and running?");
    });

    test("Device settings basics", async () => {
        let result = await page.evaluate(async () => {
            const api = window.MeadCo.ScriptX.Print;

            api.deviceSettings = {
                printerName: "My printer",
                isDefault: true,
                paperSize: "A4"
            };

            return api.deviceSettings;
        });

        expect(result).not.toEqual({});
        expect(result.printerName).toBe("My printer");
        expect(result.isDefault).toBeTruthy();
        expect(result.paperSize).toBe("A4");

        result = await page.evaluate(async () => {
            let results = {};
            const api = window.MeadCo.ScriptX.Print;

            // add a printer
            api.deviceSettings = {
                printerName: "A3 printer",
                paperSize: "A3"
            };

            results.deviceSettings = api.deviceSettings;
            results.paperSize = api.deviceSettingsFor("A3 printer").paperSize;
            results.defaultPapersSize = api.deviceSettings.paperSize

            return results;
        });

        expect(result.paperSize).toBe("A3");
        expect(result.defaultPapersSize).toBe("A4");

        result = await page.evaluate(async () => {
            let results = {};
            const api = window.MeadCo.ScriptX.Print;

            // changing the printer should change the paper size
            api.printerName = "A3 printer";

            results.paperSize = api.deviceSettings.paperSize;
            results.printerName = api.printerName;

            api.printerName = "Garbage printer";
            results.printerName2 = api.printerName;
            return results;
        });

        expect(result.printerName).toBe("A3 printer");
        expect(result.paperSize).toBe("A3");
        expect(result.printerName2).toBe("A3 printer"); // changing to a non-existent printer should leave unchanged

        result = await page.evaluate(async () => {
            let results = {};
            if (MeadCo.fetchEnabled) {
                console.debug("Note fetch is enabled - 2");
                try {
                    results.deviceSettings = await new Promise((resolve, reject) => {
                        api.deviceSettingsForAsync("Garbage", resolve, reject);
                    });
                    console.debug("deviceSettingsForAsync - 2 - succeeded");
                }
                catch (e) {
                    console.debug("deviceSettingsForAsync - 2 - failed " + document.getElementById("qunit-fixture").textContent);
                    results.deviceSettings = undefined;
                    results.deviceError = document.getElementById("qunit-fixture").textContent;
                }
            }
            else {
                console.debug("Note fetch is NOT enabled - 2");
                results.deviceSettings = api.deviceSettingsFor("Garbage");
                results.deviceError = document.getElementById("qunit-fixture").textContent;
            }
            return results;
        });

        expect(result.deviceSettings).toBe(undefined);
        expect(result.deviceError).toBe("MeadCo.ScriptX.Print : server connection is not defined.");
    });

    test("Test a connection", async () => {
        let result = await page.evaluate(async (serverUrl) => {
            const api = window.MeadCo.ScriptX.Print;
            let results = {};

            try {
                results.result = await new Promise((resolve, reject) => {
                    api.connectTestAsync(serverUrl, resolve, reject);
                });
                results.error = "Should not get here";
            } catch (e) {
                console.debug("connectTestAsync failed", e, document.getElementById("qunit-fixture").textContent);
                results.error = e;
            }

            return results;
        }, badServerUrl);

        expect(result.error).toBe("ScriptX.Services could not be found at \"" + badServerUrl + "\". Is it installed and running?");

        result = await page.evaluate(async (serverUrl) => {
            const api = window.MeadCo.ScriptX.Print;
            let results = {};

            try {
                results.result = await new Promise((resolve, reject) => {
                    api.connectTestAsync(serverUrl, resolve, reject);
                });
                results.error = "No Error";
            } catch (e) {
                console.debug("connectTestAsync failed", e, document.getElementById("qunit-fixture").textContent);
                results.error = e;
            }

            return results;
        }, serverUrl);

        expect(result.error).toBe("No Error");
        expect(result.result.AdvancedPrinting).toBeFalsy();

    });


});
