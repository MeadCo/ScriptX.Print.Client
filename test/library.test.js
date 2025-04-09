const server = require("./server");
const packageDescription = require("../package.json");
const versions = require("../configs/versions");

const serverUrl = `http://127.0.0.1:${server.port}`;
const badServerUrl = "http://127.0.0.0:12";
const licenseGuid = "{5091E665-8916-4D21-996E-00A2DE5DE416}";
const badLicenseGuid = "{218A8DB0-5A54-41A3-B349-1144546A3A8E}";

const util = require('util');

const { Console } = require('console');
// Create a custom console for logging with minimal formatting
const customConsole = new Console({ stdout: process.stdout, stderr: process.stderr });;

// revert to the standard console (which will create verbose formatting in jest)
// const customConsole = console;

const capturePageLogs = true;
async function pageStartup(pageName) {
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

    if (!pageName) {
        pageName = "test-page-src.html";
    }

    await page.goto("http://localhost:" + server.port + "/" + pageName);
}


//describe("Namespaces core", () => {
//    beforeAll(async () => {
//        await pageStartup();
//    });

//    afterAll(async () => {
//        await server.stop();
//    });

//    test("Library implements expected versions", async () => {
//        let v = await page.evaluate(() => {

//            console.debug("MeadCo: " + window.MeadCo.version);
//            console.debug("MeadCoScriptXPrint: " + window.MeadCo.ScriptX.Print.version);

//            return {
//                "MeadCo": window.MeadCo.version,
//                "MeadCoScriptXPrint": window.MeadCo.ScriptX.Print.version,
//                "MeadCoScriptXPrintLicensing": window.MeadCo.ScriptX.Print.Licensing.version,
//                "MeadCoScriptXPrintHTML": window.MeadCo.ScriptX.Print.HTML.version,
//                "MeadCoScriptXPrintPDF": window.MeadCo.ScriptX.Print.PDF.version
//            }
//        });

//        expect(v["MeadCo"]).toBe(versions.LibVersions.MeadCo);
//        expect(v["MeadCoScriptXPrint"]).toBe(versions.LibVersions.MeadCoScriptXPrint);
//        expect(v["MeadCoScriptXPrintLicensing"]).toBe(versions.LibVersions.MeadCoScriptXPrintLicensing);
//        expect(v["MeadCoScriptXPrintHTML"]).toBe(versions.LibVersions.MeadCoScriptXPrintHTML);
//        expect(v["MeadCoScriptXPrintPDF"]).toBe(versions.LibVersions.MeadCoScriptXPrintPDF);

//    });

//    test("Core API makeApiEndPoint is correct", async () => {
//        let serviceUrl = "http://testserver.com/";
//        let v = await page.evaluate((sUrl) => {
//            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
//        }, serviceUrl);

//        expect(v).toBe(serviceUrl + "api/v1/printHtml");

//        serviceUrl = "http://testserver.com";
//        v = await page.evaluate((sUrl) => {
//            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
//        }, serviceUrl);

//        expect(v).toBe(serviceUrl + "/api/v1/printHtml");

//        serviceUrl = "http://testserver.com/api/v1";
//        v = await page.evaluate((sUrl) => {
//            return window.MeadCo.makeApiEndPoint(sUrl, "v1/printHtml");
//        }, serviceUrl);

//        expect(v).toBe(serviceUrl + "/printHtml");
//    });

//    test("Namespace creation is correct", async () => {
//        // create a namespace and add a function to it
//        let v = await page.evaluate(() => {
//            const ns = window.MeadCo.createNS("MeadCo.Test.NS1");
//            if (ns) {
//                ns.test = function () { return 6; };
//                if (typeof (ns.test) === "function") {
//                    return ns.test() == 6;
//                }
//            }
//            return false;
//        });
//        expect(v).toBeTruthy()

//        // extend the namespace and ensure that the original namespace still has the function.
//        v = await page.evaluate(() => {
//            const ns2 = window.MeadCo.createNS("MeadCo.Test.NS1.NS2");
//            if (ns2) {
//                if (typeof (window.MeadCo.Test.NS1.test) === "function") {
//                    return window.MeadCo.Test.NS1.test() == 6;
//                }
//            }
//            return false;
//        });
//        expect(v).toBeTruthy();
//    });
//});

//describe("Service description", () => {
//    beforeAll(async () => {
//        await pageStartup();
//    });

//    afterAll(async () => {
//        await server.stop();
//    });

//    test("Basics", async () => {
//        let v = await page.evaluate(() => {
//            const api = window.MeadCo.ScriptX.Print;
//            return {
//                "namespace": typeof api !== "undefined",
//                "version": typeof api !== "undefined" ? api.version : "",
//                "cloudEnum": api.ServiceClasses.CLOUD,
//                "xxEnum": api.ServiceClasses.XX
//            }
//        });

//        expect(v.namespace).toBeTruthy();
//        expect(v.version).toBe(versions.LibVersions.MeadCoScriptXPrint);
//        expect(v.cloudEnum).toBe(1);
//        expect(v.xxEnum).toBe(undefined);

//    });


//    test("Connection", async () => {
//        const result = await page.evaluate(async (serverUrl) => {
//            let v = {};
//            window.MeadCo.ScriptX.Print.connectLite(serverUrl, " ");
//            try {
//                // v = await window.MeadCo.ScriptX.Print.waitableServiceDescription();
//                v = await new Promise((resolve, reject) => {
//                    window.MeadCo.ScriptX.Print.serviceDescriptionAsync(resolve, reject);
//                });
//            }
//            catch (e) {
//            }
//            return v;
//        }, serverUrl);

//        expect(result).toBeDefined();
//        expect(result.serviceClass).toBe(3);
//        expect(result.currentAPIVersion).toBe("v1");
//    });

//});

//describe("Printing", () => {
//    beforeAll(async () => {
//        await pageStartup();
//    });

//    afterAll(async () => {
//        await server.stop();
//    });

//    //test("Namespace basics", async () => {
//    //    const v = await page.evaluate(async () => {
//    //        let result = {};
//    //        const api = window.MeadCo.ScriptX.Print;

//    //        result.namespace = typeof api !== "undefined";
//    //        result.version = typeof api !== "undefined" ? api.version : "";
//    //        result.ContentTypeUrl = api.ContentType.URL;
//    //        result.xxEnum = api.ContentType.XX;
//    //        result.ContentTypeHtml = window.MeadCo.ScriptX.Print.ContentType.INNERHTML;
//    //        result.PrintStatusDownloading = api.PrintStatus.DOWNLOADING;
//    //        result.xxPrintStatus = api.PrintStatus.XX;

//    //        if (typeof api !== "undefined") {
//    //            api.connectLite("http://clearServer", " ");

//    //            result.printerName = api.printerName;
//    //            result.deviceSettings = api.deviceSettings;
//    //        }

//    //        result.deviceError = "It shouldnt be this";

//    //        if (MeadCo.fetchEnabled) {
//    //            console.debug("Note fetch is enabled");
//    //            try {
//    //                result.deviceSettings2 = await new Promise((resolve, reject) => {
//    //                    api.deviceSettingsForAsync("My printer", resolve, reject);
//    //                });
//    //                console.debug("deviceSettingsForAsync succeeded");
//    //            }
//    //            catch (e) {
//    //                console.debug("deviceSettingsForAsync failed", e);
//    //                result.deviceSettings2 = undefined;
//    //                result.deviceError = e;
//    //            }
//    //        }
//    //        else {
//    //            result.deviceSettings2 = api.deviceSettingsFor("My printer");
//    //            result.deviceError = document.getElementById("qunit-fixture").textContent;
//    //        }

//    //        return result;
//    //    });

//    //    customConsole.debug(v);

//    //    expect(v.namespace).toBeTruthy();
//    //    expect(v.version).toBe(versions.LibVersions.MeadCoScriptXPrint);
//    //    expect(v.ContentTypeUrl).toBe(1);
//    //    expect(v.xxEnum).toBe(undefined);
//    //    expect(v.ContentTypeHtml).toBe(4);
//    //    expect(v.PrintStatusDownloading).toBe(3);
//    //    expect(v.xxPrintStatus).toBe(undefined);
//    //    expect(v.printerName).toBe("");
//    //    expect(v.deviceSettings).not.toBe(null);
//    //    expect(v.deviceSettings).toEqual({});

//    //    expect(v.devicesSettings2).toBe(undefined);
//    //    expect(v.deviceError).toBe("ScriptX.Services could not be found at \"http://clearServer\". Is it installed and running?");
//    //});

//    //test("Device settings basics", async () => {
//    //    let result = await page.evaluate(async () => {
//    //        const api = window.MeadCo.ScriptX.Print;

//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };

//    //        return api.deviceSettings;
//    //    });

//    //    expect(result).not.toEqual({});
//    //    expect(result.printerName).toBe("My printer");
//    //    expect(result.isDefault).toBeTruthy();
//    //    expect(result.paperSize).toBe("A4");

//    //    result = await page.evaluate(async () => {
//    //        let results = {};
//    //        const api = window.MeadCo.ScriptX.Print;

//    //        // add a printer
//    //        api.deviceSettings = {
//    //            printerName: "A3 printer",
//    //            paperSize: "A3"
//    //        };

//    //        results.deviceSettings = api.deviceSettings;
//    //        results.paperSize = api.deviceSettingsFor("A3 printer").paperSize;
//    //        results.defaultPapersSize = api.deviceSettings.paperSize

//    //        return results;
//    //    });

//    //    expect(result.paperSize).toBe("A3");
//    //    expect(result.defaultPapersSize).toBe("A4");

//    //    result = await page.evaluate(async () => {
//    //        let results = {};
//    //        const api = window.MeadCo.ScriptX.Print;

//    //        // changing the printer should change the paper size
//    //        api.printerName = "A3 printer";

//    //        results.paperSize = api.deviceSettings.paperSize;
//    //        results.printerName = api.printerName;

//    //        api.printerName = "Garbage printer";
//    //        results.printerName2 = api.printerName;
//    //        return results;
//    //    });

//    //    expect(result.printerName).toBe("A3 printer");
//    //    expect(result.paperSize).toBe("A3");
//    //    expect(result.printerName2).toBe("A3 printer"); // changing to a non-existent printer should leave unchanged

//    //    result = await page.evaluate(async () => {
//    //        let results = {};
//    //        if (MeadCo.fetchEnabled) {
//    //            console.debug("Note fetch is enabled - 2");
//    //            try {
//    //                results.deviceSettings = await new Promise((resolve, reject) => {
//    //                    api.deviceSettingsForAsync("Garbage", resolve, reject);
//    //                });
//    //                console.debug("deviceSettingsForAsync - 2 - succeeded");
//    //            }
//    //            catch (e) {
//    //                console.debug("deviceSettingsForAsync - 2 - failed " + document.getElementById("qunit-fixture").textContent);
//    //                results.deviceSettings = undefined;
//    //                results.deviceError = document.getElementById("qunit-fixture").textContent;
//    //            }
//    //        }
//    //        else {
//    //            console.debug("Note fetch is NOT enabled - 2");
//    //            results.deviceSettings = api.deviceSettingsFor("Garbage");
//    //            results.deviceError = document.getElementById("qunit-fixture").textContent;
//    //        }
//    //        return results;
//    //    });

//    //    expect(result.deviceSettings).toBe(undefined);
//    //    expect(result.deviceError).toBe("MeadCo.ScriptX.Print : server connection is not defined.");
//    //});

//    //test("Test a connection (no license)", async () => {
//    //    let result = await page.evaluate(async (serverUrl) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        try {
//    //            results.result = await new Promise((resolve, reject) => {
//    //                api.connectTestAsync(serverUrl, resolve, reject);
//    //            });
//    //            results.error = "Should not get here";
//    //        } catch (e) {
//    //            results.error = e;
//    //        }

//    //        return results;
//    //    }, badServerUrl);

//    //    expect(result.error).toBe("ScriptX.Services could not be found at \"" + badServerUrl + "\". Is it installed and running?");

//    //    result = await page.evaluate(async (serverUrl) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        try {
//    //            results.result = await new Promise((resolve, reject) => {
//    //                api.connectTestAsync(serverUrl, resolve, reject);
//    //            });
//    //            results.error = "No Error";
//    //        } catch (e) {
//    //            results.error = e;
//    //        }

//    //        return results;
//    //    }, serverUrl);

//    //    expect(result.error).toBe("No Error");
//    //    expect(result.result.AdvancedPrinting).toBeFalsy();

//    //});

//    //test("Connecting", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        // ensure doesnt connect with no license
//    //        try {
//    //            results.result1 = await new Promise((resolve, reject) => {
//    //                api.connectAsync(serverUrl, {}, resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.result1 = e; //  document.getElementById("qunit-fixture").textContent;
//    //        }

//    //        try {
//    //            results.result2 = await new Promise((resolve, reject) => {
//    //                api.connectAsync(serverUrl, null, resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.result2 = e;
//    //        }

//    //        try {
//    //            results.result3 = await new Promise((resolve, reject) => {
//    //                api.connectAsync(serverUrl, "", resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.result3 = e;
//    //        }

//    //        // ensure connects with (already/previously 'applied' or services) license
//    //        try {
//    //            results.result4 = await new Promise((resolve, reject) => {
//    //                api.connectAsync(serverUrl, guid, resolve, reject);
//    //            });
//    //            results.result5 = api.isConnected;
//    //        } catch (e) {
//    //            results.result3 = e;
//    //        }

//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    expect(result.result1).toBe("Unauthorized");
//    //    expect(result.result2).toBe("Unauthorized");
//    //    expect(result.result3).toBe("Unauthorized");

//    //    expect(result.result4.printerName).toBe("Microsoft Print to PDF");
//    //    expect(result.result5).toBeTruthy();
//    //});

//    //test("Device values and available printers", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        api.connectLite("http://clearServer", "{218A8DB0-5A54-41A3-B349-1144546A3A8E}");

//    //        results.badConnectionPrinterCount = api.availablePrinterNames.length;

//    //        api.connectDeviceAndPrinters(
//    //            {
//    //                printerName: "A3 printer",
//    //                paperSize: "A3",
//    //                isDefault: true
//    //            },
//    //            ["A3 printer", "A4 printer"]);

//    //        results.printerName = api.printerName;
//    //        results.manuallyConnectedPrinters = api.deviceSettings;
//    //        results.goodConnectionPrinterCount = api.availablePrinterNames.length;

//    //        return results;

//    //    }, serverUrl, licenseGuid);

//    //    expect(result.badConnectionPrinterCount).toBe(0);
//    //    expect(result.manuallyConnectedPrinters).not.toBe(null);
//    //    expect(result.printerName).toBe("A3 printer");
//    //    expect(result.manuallyConnectedPrinters.paperSize).toBe("A3");
//    //    expect(result.goodConnectionPrinterCount).toBe(2);
//    //});

//    //test("Call server api with GET", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};
//    //        api.connectLite("http://clearServer", "{218A8DB0-5A54-41A3-B349-1144546A3A8E}");

//    //        try {
//    //            results.result1 = "ok";
//    //            results.result1 = await new Promise((resolve, reject) => {
//    //                api.getFromServer("twaddle/?units=0",true, resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.error1 = e;
//    //        }

//    //        api.connectLite(serverUrl, "{218A8DB0-5A54-41A3-B349-1144546A3A8E}");
//    //        try {
//    //            results.result2 = "ok";
//    //            results.result2 = await new Promise((resolve, reject) => {
//    //                api.getFromServer("twaddle/?units=0", true, resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.error2 = e;
//    //        }

//    //        try {
//    //            results.result3 = "ok";
//    //            results.result3 = await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            });
//    //        } catch (e) {
//    //            results.error3 = e;
//    //        }

//    //        api.connectLite(serverUrl, guid);
//    //        try {
//    //            results.result4 = "ok";
//    //            results.result4 = (await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            })).settings.header;
//    //        } catch (e) {
//    //            results.error4 = e;
//    //        }

//    //        // connected, ignore null license
//    //        api.connectLite(serverUrl, null);
//    //        try {
//    //            results.result5 = "ok";
//    //            results.result5 = (await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            })).settings.header;
//    //        } catch (e) {
//    //            results.error5 = e;
//    //        }

//    //        // connected ignore empty license
//    //        api.connectLite(serverUrl, "");
//    //        try {
//    //            results.result6 = "ok";
//    //            results.result6 = (await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            })).settings.header;
//    //        } catch (e) {
//    //            results.error6 = e;
//    //        }

//    //        // ingore null server
//    //        api.connectLite(null, guid);
//    //        try {
//    //            results.result7 = "ok";
//    //            results.result7 = (await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            })).settings.header;
//    //        } catch (e) {
//    //            results.error7 = e;
//    //        }

//    //        // ingore empty server
//    //        api.connectLite(null, guid);
//    //        try {
//    //            results.result8 = "ok";
//    //            results.result8 = (await new Promise((resolve, reject) => {
//    //                api.getFromServer("/htmlPrintDefaults/?units=0", true, resolve, reject);
//    //            })).settings.header;
//    //        } catch (e) {
//    //            results.error8 = e;
//    //        }

//    //        return results;

//    //    }, serverUrl, licenseGuid);

//    //    customConsole.debug(result);

//    //    expect(result.result1).toBe("ok");
//    //    expect(result.error1).toBe("ScriptX.Services could not be found at \"http://clearServer\". Is it installed and running?");

//    //    expect(result.result2).toBe("ok");
//    //    expect(result.error2).toBe("\"API endpoint not found\"");

//    //    expect(result.result3).toBe("ok");
//    //    expect(result.error3).toBe("Unauthorized");

//    //    expect(result.result4).toBe("page header");
//    //    expect(result.error4).not.toBeDefined();

//    //    expect(result.result5).toBe("page header");
//    //    expect(result.error5).not.toBeDefined();

//    //    expect(result.result6).toBe("page header");
//    //    expect(result.error6).not.toBeDefined();

//    //    expect(result.result7).toBe("page header");
//    //    expect(result.error7).not.toBeDefined();

//    //    expect(result.result7).toBe("page header");
//    //    expect(result.error7).not.toBeDefined();

//    //    expect(result.result8).toBe("page header");
//    //    expect(result.error8).not.toBeDefined();

//    //});

//    //test("queue management", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        results.result1 = api.queue != null;
//    //        results.result2 = api.queue.length;
//    //        results.result3 = api.activeJobs;
//    //        results.result4 = api.isSpooling;

//    //        const lock = api.ensureSpoolingStatus();

//    //        results.result5 = api.clientSideJobs > 0;
//    //        results.result6 = api.isSpooling;

//    //        api.freeSpoolStatus(lock);
//    //        results.result7 = api.clientSideJobs;
//    //        results.result8 = api.isSpooling;

//    //        const w = await new Promise((resolve, reject) => {
//    //            api.waitForSpoolingComplete(-1,resolve);
//    //        });
//    //        results.result9 = w;

//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    expect(result.result1).toBeTruthy();
//    //    expect(result.result2).toBe(0);
//    //    expect(result.result3).toBe(0);
//    //    expect(result.result4).toBeFalsy();
//    //    expect(result.result5).toBeTruthy();
//    //    expect(result.result6).toBeTruthy();
//    //    expect(result.result7).toBe(0);
//    //    expect(result.result8).toBeFalsy();
//    //    expect(result.result9).toBeTruthy();
//    //});

//    //test("WaitForSpoolingComplete time out", async () => {

//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        const lock = api.ensureSpoolingStatus();
//    //        const w = await new Promise((resolve, reject) => {
//    //            api.waitForSpoolingComplete(2000, resolve);
//    //        });

//    //        // it should timeout so w will be false.
//    //        if (!w) {
//    //            api.freeSpoolStatus(lock);
//    //        }

//    //        results.result1 = w;
//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    expect(result.result1).toBeFalsy();

//    //});

//    //test("printing with no arguments", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        api.connectLite(serverUrl, guid);
//    //        results.error1 = api.printHtml();

//    //        api.printHtml(0, null, null, (txt) => {
//    //            results.error2 = document.getElementById("qunit-fixture").textContent;
//    //            results.error3 = txt;
//    //        });
//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    customConsole.debug(result);
//    //    expect(result.error1).toBeFalsy();
//    //    expect(result.error2).toBe("Request to print no content - access denied?");
//    //    expect(result.error3).toBe("Request to print no content");

//    //});

//    //test("Printing single piece of html content", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        api.connectLite(serverUrl, guid);
//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };

//    //        // immediate completion
//    //        try {
//    //            results.print1 = await new Promise((resolve, reject) => {
//    //                api.printHtml(api.ContentType.INNERHTML, "hello world", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data1 = data;
//    //                }, "ProgressData1")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }

//    //        // error in job from server
//    //        try {
//    //            results.print2 = await new Promise((resolve, reject) => {
//    //                api.printHtml(api.ContentType.URL, "hello world", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data2 = data;
//    //                }, "ProgressData2")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error2 = e;
//    //            results.error21 = document.getElementById("qunit-fixture").textContent;
//    //        }

//    //        // require moinitor to run in a few loops
//    //        try {
//    //            results.print3 = await new Promise((resolve, reject) => {
//    //                api.printHtml(api.ContentType.HTML, "hello world", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data3 = data;
//    //                }, "ProgressData3")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error3 = e;
//    //        }

//    //        results.wait1 = await new Promise((resolve, reject) => {
//    //            api.waitForSpoolingComplete(10000, resolve);
//    //        });

//    //        console.log(results);
//    //        return results;

//    //    }, serverUrl, licenseGuid);

//    //    expect(result.print1).toBe("ok");
//    //    expect(result.data1).toBe("ProgressData1");
//    //    expect(result.error1).not.toBeDefined();

//    //    expect(result.print2).not.toBeDefined();
//    //    expect(result.data2).toBe("ProgressData2");
//    //    expect(result.error2).toBe("Server error");
//    //    expect(result.error21).toBe("The print failed with the error: Mocked abandon");

//    //    expect(result.print3).toBe("ok");
//    //    expect(result.data3).toBe("ProgressData3");
//    //    expect(result.error3).not.toBeDefined();

//    //    expect(result.wait1).toBeTruthy();

//    //});

//    //test("Printing a pdf document", async () => {

//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};

//    //        api.connectLite(serverUrl, guid);
//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };

//    //        // immediate completion
//    //        try {
//    //            results.print1 = await new Promise((resolve, reject) => {
//    //                api.printPdf("http://flipflip.com/?f=pdf0", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data1 = data;
//    //                }, "ProgressData0")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }

//    //        // error in job from server
//    //        try {
//    //            results.print2 = await new Promise((resolve, reject) => {
//    //                api.printPdf("http://flipflip.com/?f=pdf1", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data2 = data;
//    //                }, "ProgressData1")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error2 = e;
//    //            results.error21 = document.getElementById("qunit-fixture").textContent;
//    //        }

//    //        // require moinitor to run in a few loops
//    //        try {
//    //            results.print3 = await new Promise((resolve, reject) => {
//    //                api.printPdf("http://flipflip.com/?f=pdf2", {}, (errorTxt) => {
//    //                    if (errorTxt) {
//    //                        reject(errorTxt);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                }, (status, sInformation, data) => {
//    //                    results.data3 = data;
//    //                }, "ProgressData2")
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error3 = e;
//    //        }

//    //        results.wait1 = await new Promise((resolve, reject) => {
//    //            api.waitForSpoolingComplete(10000, resolve);
//    //        });

//    //        console.log(results);
//    //        return results;

//    //    }, serverUrl, licenseGuid);

//    //    expect(result.print1).toBe("ok");
//    //    expect(result.data1).toBe("ProgressData0");
//    //    expect(result.error1).not.toBeDefined();

//    //    expect(result.print2).not.toBeDefined();
//    //    expect(result.data2).toBe("ProgressData1");
//    //    expect(result.error2).toBe("Server error");
//    //    expect(result.error21).toBe("The print failed with the error: Mocked abandon");

//    //    expect(result.print3).toBe("ok");
//    //    expect(result.data3).toBe("ProgressData2");
//    //    expect(result.error3).not.toBeDefined();

//    //    expect(result.wait1).toBeTruthy();

//    //});

//    //test("Direct print basics", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};
//    //        api.connectLite(serverUrl, guid);

//    //        try {
//    //            results.printed1 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.STRING, "", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }

//    //        try {
//    //            results.printed2 = await new Promise((resolve, reject) => {
//    //                api.printDirect(225, "^XA", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error2 = e;
//    //        }

//    //        try {
//    //            results.printed3 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.STRING, "^XA", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error3 = e;
//    //        }

//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };
//    //        api.printerName = "My printer";

//    //        try {
//    //            results.printed4 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.STRING, "OK", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });
//    //        }
//    //        catch (e) {
//    //            results.error4 = e;
//    //            results.error41 = document.getElementById("qunit-fixture").textContent;
//    //        }

//    //        return results;
//    //    }, serverUrl, badLicenseGuid);

//    //    expect(result.printed1).not.toBeDefined();
//    //    expect(result.error1).toBe("Request to print no content");
//    //    expect(result.printed2).not.toBeDefined();
//    //    expect(result.error2).toBe("Bad content type for direct printing");
//    //    expect(result.printed3).not.toBeDefined();
//    //    expect(result.error3).toBe("Request to print but no current printer defined.");
//    //    expect(result.printed4).not.toBeDefined();
//    //    expect(result.error4).toBe("Server error");
//    //    expect(result.error41).toBe("Unauthorized");
//    //});

//    //test("Direct print string", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};
//    //        api.connectLite(serverUrl, guid);
//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };
//    //        api.printerName = "My printer";
//    //        try {
//    //            results.printed1 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.STRING, "OK", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });

//    //            results.wait1 = await new Promise((resolve, reject) => {
//    //                api.waitForSpoolingComplete(10000, resolve);
//    //            });

//    //            console.log(results);
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }
//    //        return results;
//    //    }, serverUrl, licenseGuid);
//    //    expect(result.printed1).toBe("ok");
//    //    expect(result.error1).not.toBeDefined();
//    //    expect(result.wait1).toBeTruthy();
//    //});

//    //test("Direct print string to unknown printer", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};
//    //        api.connectLite(serverUrl, guid);
//    //        api.deviceSettings = {
//    //            printerName: "A printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };
//    //        api.printerName = "A printer";
//    //        try {
//    //            results.printed1 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.STRING, "OK", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });

//    //            results.wait1 = await new Promise((resolve, reject) => {
//    //                api.waitForSpoolingComplete(10000, resolve);
//    //            });

//    //            console.log(results);
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }
//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    expect(result.printed1).not.toBeDefined();
//    //    expect(result.error1).toBe("Printer not available: A printer");
//    //    expect(result.wait1).not.toBeDefined();
//    //});

//    //test("Direct print of content of url", async () => {
//    //    let result = await page.evaluate(async (serverUrl, guid) => {
//    //        const api = window.MeadCo.ScriptX.Print;
//    //        let results = {};
//    //        api.connectLite(serverUrl, guid);
//    //        api.deviceSettings = {
//    //            printerName: "My printer",
//    //            isDefault: true,
//    //            paperSize: "A4"
//    //        };
//    //        api.printerName = "My printer";
//    //        try {
//    //            results.printed1 = await new Promise((resolve, reject) => {
//    //                api.printDirect(api.ContentType.URL, "https://scriptxsamples.meadroid.com/label", (errorText) => {
//    //                    if (errorText) {
//    //                        reject(errorText);
//    //                    }
//    //                    else {
//    //                        resolve("ok");
//    //                    }
//    //                });
//    //            });
//    //            results.wait1 = await new Promise((resolve, reject) => {
//    //                api.waitForSpoolingComplete(10000, resolve);
//    //            });
//    //            console.log(results);
//    //        }
//    //        catch (e) {
//    //            results.error1 = e;
//    //        }
//    //        return results;
//    //    }, serverUrl, licenseGuid);

//    //    expect(result.printed1).toBe("ok");
//    //    expect(result.error1).not.toBeDefined();
//    //    expect(result.wait1).toBeTruthy();
//    //});
//});

describe("MeadCo.ScriptX.Print.HTML", () => {
    beforeAll(async () => {
        await pageStartup();
    });

    afterAll(async () => {
        await server.stop();
    });

    test("Namespace basics", async () => {
        const results = await page.evaluate(() => {
            const api = window.MeadCo.ScriptX.Print.HTML;
            let results = {};

            results.vMeadCoScriptXPrintHTML = api.version;
            results.vMM = MeadCo.ScriptX.Print.MeasurementUnits.MM;
            results.xx = MeadCo.ScriptX.Print.MeasurementUnits.XX;
            results.viewScale = api.settings.viewScale;

            api.settings.viewScale = 100;
            results.viewScale100 = api.settings.viewScale;

            results.locale = (navigator.languages && navigator.languages.length)
                ? navigator.languages[0]
                : navigator.language;

            results.apiLocale = api.settings.locale;

            results.enum = MeadCo.ScriptX.Print.ContentType.INNERHTML;

            console.log(results);
            return results;

        });

        expect(results.vMeadCoScriptXPrintHTML).toBe(versions.LibVersions.MeadCoScriptXPrintHTML);
        expect(results.vMM).toBe(2);
        expect(results.xx).not.toBeDefined();
        expect(results.viewScale).toBe(0);
        expect(results.viewScale100).toBe(100);
        expect(results.locale).toBeDefined();
        expect(results.apiLocale).toBeDefined();
        expect(results.apiLocale).toBe(results.locale);
        expect(results.enum).toBe(4);
    });

    test("Connecting to service", async () => {
        const results = await page.evaluate(async (serverUrl, guid) => {
            const api = window.MeadCo.ScriptX.Print.HTML;
            let results = {};
            const url = serverUrl;

            // do not connect with no license.
            try {
                results.result1 = await new Promise((resolve, reject) => {
                    api.connectAsync(url, {}, resolve, reject);
                });
            }
            catch (e) {
                results.result1 = e;
            }

            try {
                results.result2 = await new Promise((resolve, reject) => {
                    api.connectAsync(url, null, resolve, reject);
                });
            }
            catch (e) {
                results.result2 = e;
            }

            try {
                results.result3 = await new Promise((resolve, reject) => {
                    api.connectAsync(url, "", resolve, reject);
                });
            }
            catch (e) {
                results.result3 = e;
            }

            // sucessful connect, note that this should also get print defaults
            try {
                // there should be no printer.
                results.check1 = MeadCo.ScriptX.Print.printerName;
                results.result4 = await new Promise((resolve, reject) => {
                    api.connectAsync(url, guid, resolve, reject);
                });
 
                results.result5 = window.MeadCo.ScriptX.Print.isConnected;

                results.check2 = MeadCo.ScriptX.Print.printerName;
                results.check3 = api.settings.header;
                results.check4 = api.settings.locale;
            }
            catch (e) {
                console.error(e);
                results.result4 = e;
            }

            console.log(results);
            return results;
        }, serverUrl, licenseGuid);

        expect(results.result1).toBe("Unauthorized");
        expect(results.result2).toBe("Unauthorized");
        expect(results.result3).toBe("Unauthorized");
        expect(results.check1).toBe("");
        expect(results.result4).toBeTruthy();
        expect(results.result5).toBeTruthy();
        expect(results.check2).toBe("Microsoft Print to PDF");
        expect(results.check3).toBe("page header");
        expect(results.check4).toBe(Intl.DateTimeFormat().resolvedOptions().locale);
    });

    test("grabbing content", async () => {
        const results = await page.evaluate(() => {
            const api = window.MeadCo.ScriptX.Print.HTML;
            let results = {};

            results.t1 = api.documentContentToPrint;
            results.t2 = api.frameContentToPrint("testFrame");

            results.doc = api.documentContentToPrint.indexOf("<h1>Test page</h1>");
            results.f = api.frameContentToPrint("testFrame").indexOf("A massively simple frame");
            results.f2 = api.frameContentToPrint("testFrame-2").indexOf("A massively simple frame");

            console.log(results);
            return results;
        });

        expect(results.doc).not.toBe(-1);
        expect(results.f).not.toBe(-1);
        expect(results.f2).not.toBe(-1);
    });

    test("Printing content", async () => {
        const results = await page.evaluate(async (serverUrl, guid) => {
            const api = window.MeadCo.ScriptX.Print.HTML;
            let results = {};

            try {
                results.connected = await new Promise((resolve, reject) => {
                    api.connectAsync(serverUrl, guid, resolve, reject);
                });
            }
            catch (e) {
                results.error1 = e;
            }

            if (results.connected) {

                try {
                    results.data2 = [];
                    results.result2 =  await new Promise((resolve, reject) => {
                        api.printDocument((errorText) => {
                            if (errorText) {
                                reject(errorText);
                            }
                            else {
                                resolve("ok");
                            }
                        }, (status, sInformation, data) => {
                            results.data2.push(`${status}:${sInformation}:${data}`);
                        }, "ProgressData2");
                    });
                }
                catch (e) {
                    results.error2 = e;
                }

                try {
                    results.data3 = [];
                    results.result3 = await new Promise((resolve, reject) => {
                        api.printFromUrl("https://www.meadroid.com",(errorText) => {
                            if (errorText) {
                                reject(errorText);
                            }
                            else {
                                resolve("ok");
                            }
                        }, (status, sInformation, data) => {
                            results.data3.push(`${status}:${sInformation}:${data}`);
                        }, "ProgressData3");
                    });
                }
                catch (e) {
                    results.error3 = e;
                    results.error31 = document.getElementById("qunit-fixture").textContent;
                }

                try {
                    results.data4 = [];
                    results.result4 = await new Promise((resolve, reject) => {
                        api.printHtml("<!Doctype html><html><body>Hello world</body></html>", (errorText) => {
                            if (errorText) {
                                reject(errorText);
                            }
                            else {
                                resolve("ok");
                            }
                        }, (status, sInformation, data) => {
                            results.data4.push(`${status}:${sInformation}:${data}`);
                        }, "ProgressData4");
                    });
                }
                catch (e) {
                    results.error4 = e;
                    results.error41 = document.getElementById("qunit-fixture").textContent;
                }

                results.wait1 = await new Promise((resolve, reject) => {
                    MeadCo.ScriptX.Print.waitForSpoolingComplete(10000, resolve);
                });
            }

            console.log(results);
            console.log(results.data2);
            console.log(results.data3);
            console.log(results.data4);

            return results;
        }, serverUrl, licenseGuid);

        expect(results.connected).toBeTruthy();
        expect(results.error1).not.toBeDefined();
        expect(results.result2).toBe("ok");
        expect(results.error2).not.toBeDefined();
        expect(results.data2.length).toBeGreaterThan(0);

        expect(results.result3).not.toBeDefined(); 
        expect(results.error3).toBe("Server error");
        expect(results.error31).toBe("The print failed with the error: Mocked abandon");
        expect(results.data3.length).toBeGreaterThan(0);

        expect(results.result4).toBe("ok");
        expect(results.error4).not.toBeDefined();
        expect(results.data4.length).toBeGreaterThan(0);

        expect(results.wait1).toBeTruthy();


    });

});