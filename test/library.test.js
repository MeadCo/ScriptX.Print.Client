const server = require("./server");
const packageDescription = require("../package.json");
const versions = require("../configs/versions");

const serverUrl = `http://127.0.0.1:${server.port}`;
const licenseGuid = "{5091E665-8916-4D21-996E-00A2DE5DE416}";

const util = require('util');

//function pageStartup() {
//    return new Promise((resolve, reject) => {
//        server.start().then(() => {
//            // Redirect console.log from the browser to the Jest console
//            page.on('console', async (msg) => {
//                if (msg.type() === 'log') {
//                    for (let i = 0; i < msg.args().length; ++i) {
//                        try {
//                            // Get the raw value from the JSHandle
//                            const argValue = await msg.args()[i].jsonValue();

//                            // Print only the value without any additional formatting
//                            // console.log(argValue);
//                            //
//                            process.stdout.write(util.format('%s\n', argValue));
//                        } catch (error) {
//                            console.log(`[Could not serialize console argument: ${error}]`);
//                        }
//                    }
//                }
//                else {
//                    console.log(`[Console.${msg.type()}]: ${msg.text()}`);
//                }
//            });

//            page.goto("http://localhost:" + server.port + "/test-page-src.html").then(() => {
//                resolve();
//            }).catch((err) => {
//                    reject(err);
//            });
//        }).catch((err) => {
//            reject(err);
//        });
//    });
//}

async function pageStartup() {
    await server.start();

    // Redirect console.log from the browser to the Jest console
    page.on('console', async (msg) => {
        if (msg.type() === 'log') {
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
        else {
            console.log(`[Console.${msg.type()}]: ${msg.text()}`);
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

            console.log("MeadCo: " + window.MeadCo.version);
            console.log("MeadCoScriptXPrint: " + window.MeadCo.ScriptX.Print.version);

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
            window.MeadCo.ScriptX.Print.connectLite(serverUrl, " ");
            return await window.MeadCo.ScriptX.Print.waitableServiceDescription();
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
        let v = await page.evaluate(() => {
            let result = {};
            const api = window.MeadCo.ScriptX.Print;

            result.namespace = typeof api !== "undefined";
            result.version = typeof api !== "undefined" ? api.version : "";
            result.ContentTypeUrl = api.ContentType.URL;
            result.xxEnum = api.ContentType.XX;
            result.ContentTypeHtml = window.MeadCo.ScriptX.Print.ContentType.INNERHTML;

            if (typeof api !== "undefined") {

            }

            return result;
        });

        expect(v.namespace).toBeTruthy();
        expect(v.version).toBe(versions.LibVersions.MeadCoScriptXPrint);
        expect(v.cloudEnum).toBe(1);
        expect(v.xxEnum).toBe(undefined);
    });


    test("PrintHtml", async () => {
        const result = await page.evaluate(async (serverUrl, licenseGuid) => {
            window.MeadCo.ScriptX.Print.connectLite(serverUrl, licenseGuid);
            return await window.MeadCo.ScriptX.Print.printHtml("<html><head></head><body><p>Test</p></body></html>");
        }, serverUrl, licenseGuid);
        expect(result).toBeDefined();
        expect(result.success).toBeTruthy();
    });


});
