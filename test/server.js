// An implementation of a simple ScriptX.Services API server for testing purposes

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { Console } = require('console');

const preInstalledLicenseGuid = "{5091E665-8916-4D21-996E-00A2DE5DE416}"; // GUID for 'pre-installed' license

const enumContentType = {
    URL: 1, // the url will be downloaded and printed (for html and direct printing)
    HTML: 2, // the passed string is assumed to be a complete html document .. <html>..</html>
    INNERHTML: 4, // the passed string is a complete html document but missing the html tags
    STRING: 8 // the passed string is assumed to contain no html but may contain other language such as ZPL (for direct printing)
};

const enumResponseStatus = {
    UNKNOWN: 0,
    QUEUEDTODEVICE: 1,
    QUEUEDTOFILE: 2,
    SOFTERROR: 3,
    OK: 4
};

var enumPrintStatus = {
    NOTSTARTED: 0,

    // queue call back opcodes ...
    QUEUED: 1,
    STARTING: 2,
    DOWNLOADING: 3,
    DOWNLOADED: 4,
    PRINTING: 5,
    COMPLETED: 6,
    PAUSED: 7,
    PRINTPDF: 8,

    ERROR: -1,
    ABANDONED: -2
};

// Consoles .. 1,2,3

// 1. Create a custom console for logging with minimal formatting
const customConsole = new Console({ stdout: process.stdout, stderr: process.stderr });;

// 2. revert to the standard console (which will create verbose formatting in jest)
// const customConsole = console;

// 3. a console eater
//const customConsole = {
//    log: () => { },
//    warn: () => { },
//    error: () => { }
//}

const PORT = 41191; // standard ScriptX.Services 4WPC port

// Define the mimetypes for the server from extension to content type
const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

// Basic in-memory storage to simulate service state
const serviceState = {
    printers: [
        { name: "Microsoft Print to PDF", isDefault: true },
        { name: "Microsoft XPS Document Writer", isDefault: false }
    ],
    printJobs: [],
    nextJobId: 1,
    licenses: []
};

let pdfCounter = 0;

// Function to parse JSON request body
const parseRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
};

// Function to decode Basic Authorization header
const decodeBasicAuthHeader = (req) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return null;
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    return credentials.slice(0, -1); // Assuming the credentials are the GUID, remove the final :
};

// Helper to add CORS headers to response
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization,X-Meadroid-Path');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
}

// Helper to send JSON responses
function sendJsonResponse(res, statusCode, data) {
    setCorsHeaders(res);
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    customConsole.log("JsonResponse: ", statusCode, data);
    res.end(JSON.stringify(data));
}

// Helper to check a valid license was used
function isAuthorised(req, res) {
    const guid = decodeBasicAuthHeader(req);
    if (!guid) {
        customConsole.warn("Authorization header not found or invalid");
        sendJsonResponse(res, 401, "Unauthorized");
        return false;
    }
    //customConsole.log("Authorization GUID: ", guid);
    const license = serviceState.licenses.find(l => l.guid == guid)
    if (license) {
        //customConsole.log("License found: ", license);
        return true;
    }
    else {
        customConsole.warn("License not found: ", guid);
        sendJsonResponse(res, 401, "Unauthorized - unknown license");
        return false;
    }
}

/**
 * Extracts the printer name from a pathname in the format 'url/printerName/units'
 * @param {string} pathname - The pathname string in the format 'url/printerName/units'
 * @returns {string} The extracted printer name or empty string if not found
 */
function extractPrinterName(pathname) {
    // Split the pathname by '/'
    const parts = pathname.split('/').filter(part => part.length > 0);

    // If we have at least 2 parts (url and printerName)
    if (parts.length >= 2) {
        // Return the second-to-last part (printerName), and URL decode it
        return decodeURIComponent(parts[parts.length - 2]);
    }

    // Return empty string if the format doesn't match
    return "";
}

// Helper to create a device info object from a printer object
function createDeviceInfo(printer) {
    return {
        "printerName": printer.name,
        "paperSizeName": "A4",
        "paperSourceName": "",
        "collate": 0,
        "copies": 0,
        "duplex": 0,
        "units": 0,
        "paperPageSize": {
            "width": 197,
            "height": 500
        },
        "unprintableMargins": {
            "left": "10",
            "top": "10",
            "bottom": "10",
            "right": "10"
        },
        "status": 0,
        "port": "LPT1:",
        "attributes": 0,
        "serverName": "",
        "shareName": "",
        "location": "",
        "isLocal": true,
        "isNetwork": false,
        "isShared": false,
        "isDefault": true,
        "bins": [
            ""
        ],
        "forms": [
            "A4",
            "Letter",
            "Legal",
            "Executive",
            "A3",
            "A5",
            "B4"
        ]
    }
}

// Create routes based on ScriptX Services API
const routes = {
    // Printer API
    "/api/v1/printHtml/deviceinfo/systemdefault":
    {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    sendJsonResponse(res, 200, createDeviceInfo(defaultPrinter));
                } else {
                    sendJsonResponse(res, 404, "Default printer not found");
                }
            }
        }
    },
    "/api/v1/printHtml/deviceinfo/systemdefault/0":
    {
        GET: (req, res) => {
            customConsole.log("Processing GET /api/v1/printHtml/deviceinfo/systemdefault/0");
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    const deviceInfo = createDeviceInfo(defaultPrinter);
                    customConsole.log(`GET /api/v1/printHtml/deviceinfo/systemdefault/0 returns: ${deviceInfo}`);
                    sendJsonResponse(res, 200, deviceInfo);
                } else {
                    customConsole.warn("GET /api/v1/printHtml/deviceinfo/systemdefault/0: Default printer not found");
                    sendJsonResponse(res, 404, "Default printer not found");
                }
            }
            else {
                customConsole.warn("GET /api/v1/printHtml/deviceinfo/systemdefault/0: Unauthorized");
            }
        }
    },
    "/api/v1/printHtml/deviceinfo/default": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    sendJsonResponse(res, 200, createDeviceInfo(defaultPrinter));
                } else {
                    sendJsonResponse(res, 404, "Default printer not found");
                }
            }
        }
    },
    "/api/v1/printHtml/deviceinfo/default/0": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    sendJsonResponse(res, 200, createDeviceInfo(defaultPrinter));
                } else {
                    sendJsonResponse(res, 404, "Default printer not found");
                }
            }
        }
    },
    "/api/v1/printHtml/deviceinfo": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const parsedUrl = url.parse(req.url, true);
                const pathname = parsedUrl.pathname;
                const printerName = extractPrinterName(pathname);

                customConsole.log("Printer name: ", printerName);
                const printer = serviceState.printers.find(p => p.name == printerName);
                if (printer) {
                    sendJsonResponse(res, 200, createDeviceInfo(printer));
                } else {
                    sendJsonResponse(res, 404, "Printer not found");
                }
            }
        }
    },

    "/api/v1/printHtml/htmlPrintDefaults": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    const params = url.parse(req.url, true).query;
                    sendJsonResponse(res, 200, {
                        "settings": {
                            "header": "page header",
                            "footer": "page footer",
                            "headerFooterFont": "Arial",
                            "page": {
                                "orientation": 0,
                                "units": 0,
                                "margins": {
                                    "left": "5",
                                    "top": "5",
                                    "bottom": "5",
                                    "right": "5"
                                }
                            },
                            "viewScale": 0,
                            "printBackgroundColorsAndImages": 0,
                            "pageRange": "",
                            "printingPass": 0,
                            "extraHeadersAndFooters": {
                                "allPagesHeader": "",
                                "allPagesFooter": "",
                                "firstPageHeader": "",
                                "firstPageFooter": "",
                                "extraFirstPageFooter": "",
                                "allHeaderHeight": 0,
                                "allFooterHeight": 0,
                                "firstHeaderHeight": 0,
                                "firstFooterHeight": 0,
                                "extraFirstFooterHeight": 0
                            }
                        },
                        device: createDeviceInfo(defaultPrinter),
                        availablePrinters: [
                            'Microsoft Print to PDF',
                            'Microsoft XPS Document Writer'
                        ]
                    });
                } else {
                    sendJsonResponse(res, 404, 'Default printer not found');
                }
            }
        }
    },

    "/api/v1/printHtml/htmlPrintDefaults/": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const defaultPrinter = serviceState.printers.find(p => p.isDefault);
                if (defaultPrinter) {
                    const params = url.parse(req.url, true).query;
                    const units = params.units;

                    customConsole.log("GET htmlPrintDefaults: ", params);
                    sendJsonResponse(res, 200, {
                        "settings": {
                            "header": "page header",
                            "footer": "page footer",
                            "headerFooterFont": "Arial",
                            "page": {
                                "orientation": 0,
                                "units": units,
                                "margins": {
                                    "left": "5",
                                    "top": "5",
                                    "bottom": "5",
                                    "right": "5"
                                }
                            },
                            "viewScale": 0,
                            "printBackgroundColorsAndImages": 0,
                            "pageRange": "",
                            "printingPass": 0,
                            "extraHeadersAndFooters": {
                                "allPagesHeader": "",
                                "allPagesFooter": "",
                                "firstPageHeader": "",
                                "firstPageFooter": "",
                                "extraFirstPageFooter": "",
                                "allHeaderHeight": 0,
                                "allFooterHeight": 0,
                                "firstHeaderHeight": 0,
                                "firstFooterHeight": 0,
                                "extraFirstFooterHeight": 0
                            }
                        },
                        "device": createDeviceInfo(defaultPrinter),
                        "availablePrinters": [
                            "Microsoft Print to PDF",
                            "Microsoft XPS Document Writer"
                        ]
                    });
                } else {
                    sendJsonResponse(res, 404, "Default printer not found");
                }
            }
        }
    },
    // License API
    "/api/v1/licensing/ping": {
        GET: (req, res) => {
            customConsole.log("GET /api/v1/licensing/ping");
            sendJsonResponse(res, 200, {
                "basicHtmlPrinting": true,
                "advancedPrinting": true,
                "enhancedFormatting": true,
                "printPdf": true,
                "printRaw": true
            });
        }
    },
    "/api/v1/licensing": {
        GET: (req, res) => {
            const guid = decodeBasicAuthHeader(req);
            if (!guid) {
                sendJsonResponse(res, 401, "Unauthorized" );
                return;
            }

            customConsole.log("GET License: ", guid);
            const license = serviceState.licenses.find(l => l.guid == guid)

            if (!license) {
                customConsole.warn("License not found: ", guid);
                sendJsonResponse(res, 401, "Unauthorized - unknown license");
                return;
            }

            customConsole.log("Return license: ", license);
            sendJsonResponse(res, 200, license);
        },
        POST: async (req, res) => {
            try {
                const licenseData = await parseRequestBody(req);
                const guid = licenseData.Guid;
                customConsole.log("POST License data: ", licenseData);
                if (!guid) {
                    sendJsonResponse(res, 400, "GUID is required");
                    return;
                }
                if (guid != preInstalledLicenseGuid) {
                    sendJsonResponse(res, 400, "Invalid guid");
                    return;
                }
                if (licenseData.Url == "http://localhost:41191/Bad-Warehouse") {
                    sendJsonResponse(res, 400, "Unknown warehouse");
                    return;
                }

                customConsole.log("guid: ", guid, typeof (guid));

                // License is "pre-installed" at startup
                //serviceState.licenses.push({
                //    guid: guid,
                //    company: "Test Company",
                //    companyHomePage: "https://www.example.com",
                //    from: new Date().toISOString(),
                //    to: new Date().toISOString(),
                //    options: {
                //        basicHtmlPrinting: true,
                //        advancedPrinting: true,
                //        enhancedFormatting: true,
                //        printPdf: true,
                //        printRaw: true
                //    },
                //    domains: [
                //        "example.com",
                //        "meadroid.com"
                //    ],
                //    revision: licenseData.Revision || 0
                //});

                sendJsonResponse(res, 201, serviceState.licenses.find(l => l.guid === guid));
            } catch (error) {
                sendJsonResponse(res, 400, "Invalid license data");
            }
        }
    },

    // Print HTML API
    "/api/v1/printHtml/print": {
        POST: async (req, res) => {
            if (isAuthorised(req, res)) {
                try {
                    const printData = await parseRequestBody(req);

                    customConsole.log("POST Print data: ", printData);
                    if (!printData) {
                        throw new Error("No print data provided");
                    }

                    if (!printData.Device.printerName) {
                        throw new Error("Printer name is required");
                    }

                    // Create a new print job
                    const jobId = serviceState.nextJobId++;
                    const printJob = {
                        id: jobId,
                        status: enumPrintStatus.QUEUED,
                        contentType: printData.ContentType,
                        content: printData.Content || "Empty document",
                        printer: printData.Device.printerName || "Default Printer",
                        createdAt: new Date().toISOString(),
                        completedAt: null,
                        timerId: null,
                        message: "No message"
                    };

                    if (printData.ContentType == enumContentType.STRING || printData.Device.PrintToFileName) {
                        printJob.status = enumResponseStatus.SOFTERROR;
                        printJob.message = "PrintToFileName: " + printData.Device.printToFileName;
                        printJob.id = 0
                    }
                    else
                        if (printData.ContentType != enumContentType.HTML && printData.ContentType != enumContentType.INNERHTML && printData.ContentType != enumContentType.URL) {
                            printJob.status = enumResponseStatus.SOFTERROR;
                            printJob.message = "Unsupported print content type: " + printData.ContentType;
                            printJob.id = 0
                        }


                    if (printJob.id != 0) {

                        serviceState.printJobs.push(printJob);

                        // Simulate job processing
                        printJob.timerId = setInterval(() => {
                            customConsole.log("Simulate print job processing: ", jobId);
                            const job = serviceState.printJobs.find(j => j.id === jobId);

                            if (job) {
                                customConsole.log(`Job found at state: ${job.status}`);

                                // job.status = job.status == enumPrintStatus.QUEUED ? enumPrintStatus.DOWNLOADING : job.status == enumPrintStatus.DOWNLOADING ? enumPrintStatus.PRINTING : enumPrintStatus.COMPLETED;

                                switch (job.contentType) {
                                    case enumContentType.INNERHTML:
                                        job.status = enumPrintStatus.COMPLETED;
                                        break;

                                    case enumContentType.URL:
                                        job.status = enumPrintStatus.ABANDONED;
                                        job.message = "Mocked abandon";
                                        break;

                                    case enumContentType.HTML:
                                        //job.status = ++counter < 3 ? PrintHtmlStatus.Printing : PrintHtmlStatus.Completed;
                                        job.status = job.status == enumPrintStatus.QUEUED ? enumPrintStatus.DOWNLOADING : job.status == enumPrintStatus.DOWNLOADING ? enumPrintStatus.PRINTING : enumPrintStatus.COMPLETED;
                                        break;

                                    case enumContentType.STRING:
                                        break;

                                    default:
                                        job.status = enumPrintStatus.ERROR;
                                        job.message = "Bad type from jobToken: " + jobId;
                                        break;
                                }

                                if (job.status == enumPrintStatus.COMPLETED || job.status == enumPrintStatus.ABANDONED || job.status == enumPrintStatus.ERROR || job.status == enumPrintStatus.SOFTERROR) {
                                    clearInterval(job.timerId);
                                    job.completedAt = new Date().toISOString();
                                }
                            }
                            else {
                                customConsole.log(`Job could not be found`);
                            }
                        }, 2000);
                    }
                    
                    sendJsonResponse(res, 202, { jobIdentifier: printJob.id.toString(), status: printJob.status, message: printJob.message });

                } catch (error) {
                    customConsole.error("Print job error: ", error);
                    sendJsonResponse(res, 400, `print failed: ${error}`);
                }
            }
        }
    },
    // Print job status API
    "/api/v1/printHtml/status": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                const parsedUrl = url.parse(req.url, true);
                const pathname = parsedUrl.pathname;
                const jobId = parseInt(pathname.substring(pathname.lastIndexOf("/") + 1));
                const job = serviceState.printJobs.find(j => j.id === jobId);

                if (job) {
                    if ( job.status == enumPrintStatus.COMPLETED || job.status == enumPrintStatus.ABANDONED || job.status == enumPrintStatus.ERROR ) {
                        customConsole.log("Job completed: " + jobId + " @" + job.status + " => " + job.message);
                        const jobIndex = serviceState.printJobs.findIndex(j => j.id === jobId);
                        if (jobIndex !== -1) {
                            serviceState.printJobs.splice(jobIndex, 1);
                        };
                    }
                    sendJsonResponse(res, 200, {
                        "message": (job.status == enumPrintStatus.COMPLETED || job.status == enumPrintStatus.ABANDONED || job.status == enumPrintStatus.ERROR) ? job.message : `printing: ${job.status}`,
                        "status": job.status,
                        "jobIdentifier": jobId.toString()
                    });
                }
                else {
                    sendJsonResponse(res, 404, "Job not found");
                }
            }
        }
    },

    // Print PDF API
    "/api/v1/printPdf/print": {
        POST: async (req, res) => {
            if (isAuthorised(req, res)) {
                try {
                    const printData = await parseRequestBody(req);
                    customConsole.log("POST Print PDF data: ", printData);
                    if (!printData) {
                        throw new Error("No print data provided");
                    }
                    if (!printData.Device.printerName) {
                        throw new Error("Printer name is required");
                    }

                    let docUri = url.parse(printData.Document, true);
                    const q = docUri.query;
                    customConsole.log("PDF Print query: ", q);

                    const jobId = q.f ? q.f : "pdf";
                    customConsole.log("jobId: ", jobId);

                    pdfCounter = 0;
                    sendJsonResponse(res, 202, { jobIdentifier: `${jobId}:job`, status: enumResponseStatus.QUEUEDTODEVICE, message: "No message" });
                } catch (error) {
                    customConsole.error("PDF Print job error: ", error);
                    sendJsonResponse(res, 400, `PDF print failed: ${error}`);
                }
            }
        }
    }, 

    // Print job status API
    "/api/v1/printPdf/status": {
        GET: (req, res) => {
            if (isAuthorised(req, res)) {
                customConsole.log("Processing GET /api/v1/printPdf/status/");

                const parsedUrl = url.parse(req.url, true);
                const pathname = parsedUrl.pathname;
                const jobId = pathname.substring(pathname.lastIndexOf("/") + 1);

                const parts = jobId.split(":");
                const js = {};

                js.jobIdentifier = jobId;
                js.message = "";

                customConsole.log("PDF jobId parts: ", parts);

                if (parts.length > 0) {
                    switch (parts[0]) {
                        case "pdf0":
                            js.status = enumPrintStatus.COMPLETED;
                            break;

                        case "pdf1":
                            js.status = enumPrintStatus.ABANDONED;
                            js.message = "Mocked abandon";
                            break;

                        case "pdf2":
                            js.status = ++pdfCounter < 3 ? enumPrintStatus.PRINTING : enumPrintStatus.COMPLETED;
                            break;

                        default:
                            js.status = enumPrintStatus.ERROR;
                            js.message = "Bad type from jobToken: " + jobToken;
                            break;
                    }
                }
                else {
                    js.status = enumPrintStatus.ERROR;
                    js.message = "Bad PDF print jobToken";
                }
                sendJsonResponse(res, 202, js);
            }
        }
    },


    // Direct Print API
    "/api/v1/printDirect/print": {
        POST: async (req, res) => {
            if (isAuthorised(req, res)) {
                try {
                    const printData = await parseRequestBody(req);
                    let statusResult = enumResponseStatus.OK;
                    let statusMessage = "No message";

                    customConsole.log("POST Print Direct data: ", printData);
                    if (!printData) {
                        throw new Error("No print data provided");
                    }
                    if (!printData.Device.printerName) {
                        throw new Error("Printer name is required");
                    }

                    if (printData.ContentType != enumContentType.STRING && printData.ContentType != enumContentType.URL ) {
                        statusResult = enumResponseStatus.SOFTERROR;
                        statusMessage = `Unsupported print content type: ${printData.ContentType}`;
                    }

                    if (printData.Device.printerName != "Microsoft Print to PDF" && printData.Device.printerName != "Microsoft XPS Document Writer") {
                        statusResult = enumResponseStatus.SOFTERROR;
                        statusMessage = `Printer not available: ${printData.Device.printerName}`;
                    }

                    sendJsonResponse(res, 202, { jobIdentifier: printData.ContentType.toString(), status: statusResult, message: statusMessage });

                } catch (error) {
                    customConsole.error("Print Direct job error: ", error);
                    sendJsonResponse(res, 400, `Direct print failed: ${error}`);
                }
            }
        }
    }, 

    // Service description
    "/api/": {
        GET: (req, res) => {
            sendJsonResponse(res, 200, {
                serviceClass: 3,
                currentAPIVersion: "v1",
                serverVersion: { major: 10, minor: 1, build: 2, revision: 3, majorRevision: 0, minorRevision: 0 },
                serviceVersion: { major: 11, minor: 12, build: 13, revision: 14, majorRevision: 0, minorRevision: 0 },
                serviceUpgrade: {},
                printHTML: true,
                printPDF: true,
                printDIRECT: false,
                availablePrinters: serviceState.printers
            });
        }
    }
};

// Helper to generate a simple GUID
function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to remove characters after the last '/' character in a string
function removeAfterLastSlash(str) {
    const lastSlashIndex = str.lastIndexOf('/');
    return lastSlashIndex !== -1 ? str.substring(0, lastSlashIndex ) : str;
}

// Create the service server
const serviceServer = http.createServer(async (req, res) => {

    // Handle preflight OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse the URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    customConsole.log(`ScriptX Service API request: ${method} ${pathname}`);

    // Check if we have a route handler for this path and method
    if (routes[pathname] && routes[pathname][method]) {
        // Call the route handler
        await routes[pathname][method](req, res);
    }
    // Handle 404 for API routes
    else if (pathname.startsWith('/api/')) {

        let apiPath = removeAfterLastSlash(pathname);

        customConsole.log("removed last part, searching API path: ", apiPath);
        if (routes[apiPath] && routes[apiPath][method]) {
            customConsole.log("found ...");
            await routes[apiPath][method](req, res);
        }
        else {
            apiPath = removeAfterLastSlash(apiPath);
            customConsole.log("removed last part, searching API path: ", apiPath);
            if (routes[apiPath] && routes[apiPath][method]) {
                customConsole.log("found ...");
                await routes[apiPath][method](req, res);
            }
            else {
                customConsole.warn("API endpoint not found: ", apiPath);
                customConsole.log(routes);
                sendJsonResponse(res, 404, "API endpoint not found");
            }
        }
    }
    // Serve static files for non-API routes 
    else {
        let filePath = path.join(__dirname, "test-page.html");
        if (pathname !== "/") {
            if (pathname.startsWith("/src")) {
                filePath = path.join(__dirname, "../src", pathname.substring(5));
            }
            else {
                if (pathname.startsWith("/dist")) {
                    filePath = path.join(__dirname, "../dist", pathname.substring(5));
                }
                else {
                    if (pathname.startsWith("/scriptxprint-html/dist/dist")) {
                        filePath = path.join(__dirname, "../node_modules/scriptxprint-html/dist", pathname.substring("/scriptxprint-html/dist/dist".length));
                    }
                    else {
                        if (pathname.startsWith("/scriptxprint-html/dist")) {
                            filePath = path.join(__dirname, "../node_modules/scriptxprint-html/dist", pathname.substring("/scriptxprint-html/dist".length));
                        }
                        else {
                            filePath = path.join(__dirname, pathname);
                        }
                    }
                }
             }
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || "application/octet-stream";

        customConsole.log("Server will return content of: " + filePath);

        fs.readFile(filePath, (err, data) => {
            setCorsHeaders(res);
            if (err) {
                if (pathname != "/favicon.ico") // its ok to not find the favicon
                    customConsole.error(err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error loading page");
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(data);
            }
        });
    }
});

// Modify the exported module to include the service server
module.exports = {
    start: () => new Promise((resolve) => {
        serviceState.licenses.push({
            guid: preInstalledLicenseGuid,
            company: "Mead & Co Ltd.",
            companyHomePage: "https://www.meadroid.com",
            from: new Date().toISOString(),
            to: new Date().toISOString(),
            options: {
                basicHtmlPrinting: true,
                advancedPrinting: true,
                enhancedFormatting: true,
                printPdf: true,
                printRaw: true
            },
            domains: [
                "meadroid.com",
                "support.meadroid.com"
            ],
            revision: 1
        });

        serviceServer.listen(PORT, () => {
            customConsole.log(`ScriptX Service API running at http://localhost:${PORT}`);
            resolve();
        });
    }),
    stop: () => new Promise((resolve) => {
        serviceServer.close(() => {
            customConsole.log("ScriptX Service API stopped");
            resolve();
        });
    }),
    debug: () => new Promise((resolve) => {
        customConsole.log(routes);
        resolve();
    }),
    port: PORT,
    jobCount: () => serviceState.printJobs.length
};

if (require.main === module) {
    module.exports.start().then(() => {
        customConsole.log(`Server running on port ${PORT}`);
    });
}



