const server = require("./server");
const packageDescription = require("../package.json");
const versions = require("../configs/versions");

const serverUrl = `http://localhost:${server.port}`;
const badServerUrl = "http://127.0.0.0:12";
const licenseGuid = "{5091E665-8916-4D21-996E-00A2DE5DE416}";
const badLicenseGuid = "{218A8DB0-5A54-41A3-B349-1144546A3A8E}";

const util = require('util');

const testSources = true;

const { Console } = require('console');
// Create a custom console for logging with minimal formatting
const customConsole = new Console({ stdout: process.stdout, stderr: process.stderr });;

// revert to the standard console (which will create verbose formatting in jest)
// const customConsole = console;

const capturePageLogs = true;
async function pageStartup(pageName = "test-page") {
    await server.start();

    // Redirect console.log from the browser to the Jest console
    page.on('console', async (msg) => {
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
    });

    if (testSources) {
        pageName += "-src";
    }

    await page.goto("http://localhost:" + server.port + "/" + pageName + ".html");
}


describe("Attribute init MeadCo.ScriptX.Print.Licensing", () => {
    beforeAll(async () => {
        await pageStartup("test-page-attribs");
    });
    afterAll(async () => {
        await server.stop();
    });

    test("Namespace basics", async () => {
        const results = await page.evaluate(() => {
            const api = window.MeadCo.ScriptX.Print.Licensing;
            let results = {};

            try {
                results.api = !!api; // Set to true if api is defined, false otherwise
                results.vMeadCoScriptXPrintLicensing = api.version;
            }
            catch (e) {
                results.error = e;
            }
            console.log(results);
            return results;
        });

        expect(results.error).not.toBeDefined();
        expect(results.api).toBeTruthy();
        expect(results.vMeadCoScriptXPrintLicensing).toBe(versions.LibVersions.MeadCoScriptXPrintLicensing);
    });

    test("Attribute applied license", async () => {
        const results = await page.evaluate(async () => {
            const api = window.MeadCo.ScriptX.Print.Licensing;

            let results = {};

            try {
                const license = await new Promise((resolve, reject) => {
                    api.GetLicenseAsync(resolve, reject);
                });

                results.licenseok = !!license;
            }
            catch (e) {
                results.error = e;
            }

            console.log(results);
            return results;
        });

        expect(results.licenseok).toBeTruthy();
        expect(results.error).not.toBeDefined();
    });
});
