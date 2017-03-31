/*!
 * MeadCo ScriptX 'window.factory' shim (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

// we anti-polyfill <object id="factory" /> 
// enabling old code to run in modern browsers
//
; (function (name, definition,undefined) {

    if ( this[name] != undefined || document.getElementById(name) != null ) {
        console.log("ScriptX factory anti-polyfill believes it may not be requred.");
        if ( this[name] != undefined ) {
            console.log("this[" + name + "] is defined");
        }
        if (document.getElementById(name) != null) {
            console.log("document.getElementById(" + name + ") is defined");
        }
        if (this[name].object != undefined) {
            console.log("this[" + name + "].object is defined -- not required!!!");
            return;
        } else {
            console.log("this[" + name + "].object is *not* defined");
        }
    }

    var theModule = definition();

    // Assign to the global object (window)
    (this)[name] = theModule;

})('factory', function () {

    // protected API
    var version = "0.0.5.7";
    var emulatedVersion = "8.0.0.2";
    var module = this;

    function log (str) {
        console.log("factory anti-polyfill :: " + str);
    }

    // extend the namespace
    module.extendFactoryNamespace = function(name, definition) {
        var theModule = definition();

        log("MeadCo factory extending namespace2: " + name);
        // walk/build the namespace part by part and assign the module to the leaf
        var namespaces = name.split(".");
        var scope = this;
        for (var i = 0; i < namespaces.length; i++) {
            var packageName = namespaces[i];
            if (i === namespaces.length - 1) {
                if (typeof scope[packageName] === "undefined") {
                    log("installing implementation at: " + packageName);
                    scope[packageName] = theModule;
                } else {
                    log("Warning - not overwriting package: " + packageName);
                }
            } else if (typeof scope[packageName] === "undefined") {
                log("initialising new: " + packageName);
                scope[packageName] = {};
            } else {
                log("using existing package: " + packageName);
            }
            scope = scope[packageName];
        }

    }


    log("'factory' loaded.");

    // public API.
    return {
        log: log,

        GetComponentVersion: function(sComponent, a, b, c, d) {
            log("factory.object.getcomponentversion: " + sComponent);
            var v = emulatedVersion.split(".");
            a[0] = v[0];
            b[0] = v[1];
            c[0] = v[2];
            d[0] = v[3];
        },

        get ScriptXVersion() { return emulatedVersion },
        get SecurityManagerVersion() { return emulatedVersion },

        baseURL : function(sRelative) {
            return window.location.href.substring(0, window.location.href.length - window.location.pathname.length);
        },

        relativeURL : function(sUrl) {
            alert("MeadCo.ScriptX.Print :: relativeUrl is not implemented yet.");
        },

        FormatNumber : function (arg) {
                if (isNaN(arg)) {
                    return 0;
                } else {
                    if (typeof arg === 'string') {
                        return Number(arg);
                    } else {
                        return arg;
                    }
                }
            }
    };
});

; (function (name, definition) {
    if (typeof extendFactoryNamespace === "function") {
        extendFactoryNamespace(name, definition);
    }
})('factory.printing', function () {

    // protected API
    var printHtml = MeadCo.ScriptX.Print.HTML;
    var settings = printHtml.settings;
    var printApi = MeadCo.ScriptX.Print;
    var printBackground = false;

    factory.log("factory.Printing 2 loaded.");

    if (this.jQuery) {
        factory.log("Looking for auto connect");
        $("[data-meadco-server]").each(function () {
            var $this = $(this);
            factory.log("Auto connect to: " + $this.data("meadco-server") + "with license: " + $this.data("meadco-license"));
            printHtml.connect($this.data("meadco-server"), $this.data("meadco-license"));
            return false;
        });
    }

    // public API
    return {
        // basic properties
        //

        set header(str) {
            factory.log("set factory.printing.header: " + str);
            settings.header = str;
        },

        get header() {
            return settings.header;
        },

        set footer(str) {
            settings.footer = str;
        },

        get footer() {
            return settings.footer;
        },

        set headerFooterFont(str) {
            settings.headerFooterFont = str;
        },

        get headerHooterFont() {
            return settings.headerFooterFont;
        },


        set orientation(sOrientation) {
            switch (sOrientation.toLowerCase()) {
                case "landscape":
                    settings.page.orientation = printHtml.PageOrientation.LANDSCAPE;
                    break;

                case "portrait":
                    settings.page.orientation = printHtml.PageOrientation.PORTRAIT;
                    break;
            }
        },

        get orientation() {
            return settings.page.orientation === printHtml.PageOrientation.PORTRAIT ? "portrait" : "landscape";
        },

        set portrait(bPortrait) {
            settings.page.orientation = bPortrait ? printHtml.PageOrientation.PORTRAIT : printHtml.PageOrientation.LANDSCAPE;
        },

        get portrait() {
            return settings.page.orientation === printHtml.PageOrientation.PORTRAIT;
        },

        set leftMargin(n) {
            settings.page.margins.left = n;
        },

        get leftMargin() {
            return settings.page.margins.left;
        },

        set topMargin(n) {
            settings.page.margins.top = n;
        },

        get topMargin() {
            return settings.page.margins.top;
        },

        set bottomMargin(n) {
            settings.page.margins.bottom = n;
        },

        get bottomMargin() {
            return settings.page.margins.bottom;
        },

        set rightMargin(n) {
            settings.page.margins.right = n;
        },

        get rightMargin() {
            return settings.page.margins.right;
        },
        
        // templateURL is a no-op at this time. In the future may
        // enable alternative server behaviour.
        set templateURL(sUrl) {           
        },

        get templateURL() {
            return "MeadCo://default";
        },

        // basic functions
        //

        // No longer relevant, has returned true since IE 6 and was 
        // a proxy for testing if the browser was IE5.5 or later!
        IsTemplateSupported : function() {
            return true;
        },

        PageSetup : function() {
            alert("MeadCo.ScriptX.Print :: Page setup dialog is not implemented yet.");
        },

        PrintSetup : function() {
            alert("MeadCo.ScriptX.Print :: Print setup dialog is not implemented yet.");
        },

        Preview : function(sOrOFrame) {
            alert("MeadCo.ScriptX.Print :: Preview is not implemented yet.");
        },

        Print : function(bPrompt, sOrOFrame) { // needs and wants update to ES2015
            if (typeof (bPrompt) === 'undefined') bPrompt = true;
            if (typeof (sOrOFrame) === 'undefined') sOrOFrame = null;

            if (sOrOFrame != null) {
                var sFrame = typeof (sOrOFrame) === 'string' ? sOrOFrame : sOrOFrame.id;
                return printHtml.printFrame(sFrame, bPrompt);
            }

            return printHtml.printDocument(bPrompt);
        },

        PrintHTML : function(sUrl, bPrompt) {
            if (typeof (bPrompt) === 'undefined') bPrompt = true;

            // if a relative URL supplied then add the base URL of this website
            if (!(sUrl.indexOf('http://') === 0 || sUrl.indexOf('https://') === 0)) {
                var baseurl = factory.baseURL();
                if (baseurl.substring(baseurl.length - 1, baseurl.length) !== "/") {
                    if (sUrl.substring(0, 1) !== "/") {
                        sUrl = baseurl + "/" + sUrl;
                    } else {
                        sUrl = baseurl + sUrl;
                    }
                } else {
                    if (sUrl.substring(0, 1) !== "/") {
                        sUrl = baseurl + sUrl;
                    } else {
                        sUrl = baseurl + sUrl.substring(1)
                    }
                }
            }

            return printHtml.printFromUrl(sUrl);
        },

        PrintHTMLEx: function (sUrl, bPrompt, fnCallback, data) {
            alert("MeadCo.ScriptX.Print :: PrintHtmlEx is not implemented yet.");
        },

        // advanced (aka licensed properties - the server will reject
        // use if no license available)
        set units(enumUnits) {
            // TODO: Check licensed (or will obviously fail on the server)
            this.SetMarginMeasure(enumUnits);
        },

        get units() {
            return this.GetMarginMeasure();
        },

        // advanced functions
        set paperSize(sPaperSize) {
            printApi.deviceSettings.paperSizeName = sPaperSize;
        },

        get paperSize() {
            return printApi.deviceSettings.paperSizeName;
        },

        get pageWidth() {
            return printApi.deviceSettings.paperPageSize.width;
        },

        get pageHeight() {
            return printApi.deviceSettings.paperPageSize.height         ;
        },

        set copies(nCopies) {
            printApi.deviceSettings.copies = nCopies;
        },

        get copies() {
            return printApi.deviceSettings.copies;
        },

        set collate(bCollate) {
            printApi.deviceSettings.collate = (bCollate === true || bCollate === 1) ? printHtml.CollateOptions.TRUE : printHtml.CollateOptions.FALSE;
        },

        get collate() {
            return printApi.deviceSettings.collate == printHtml.CollateOptions.FALSE ? 2 : 1;
        },

        get CurrentPrinter() {
            return printApi.printerName;
        },

        set CurrentPrinter(sPrinterName) {
            printApi.printerName = sPrinterName;
        },

        get currentPrinter() {
            return printApi.printerName;
        },

        set currentPrinter(sPrinterName) {
            printApi.printerName = sPrinterName;
        },

        set printer(sPrinterName) {
            printApi.printerName = sPrinterName;
        },

        // implemented as simple property not persisted, TBA
        get printBackground() {
            return printBackground;
        },

        set printBackground(bPrintBackground) {
            printBackground = bPrintBackground;
        },

        get viewScale() {
            return settings.viewScale;
        },

        set viewScale(x) {
            settings.viewScale = x;
        },

        EnumPrinters: function (index) {
            if (index === 0) {
                return this.CurrentPrinter;
            }
            else {
                return "";
            }
        },

        printerControl: function (value) {
            // for now ignore value parameter and return an array of paper sizes in the Forms property
            var x = {};
            x.Forms = ["A3", "A4", "A5", "Letter"];
            x.Bins = ["Automatically select", "Printer auto select", "Manual Feed Tray", "Tray 1", "Tray 2", "Tray 3", "Tray 4"];
            return x;
        },

        GetMarginMeasure: function() {
            return settings.page.units == printHtml.PageMarginUnits.INCHES ? 2 : 1;
        },

        SetMarginMeasure: function (enumUnits) {
            settings.page.units = enumUnits == 2 ? printHtml.PageMarginUnits.INCHES : printHtml.PageMarginUnits.MM;
        },

        SetPrintScale: function (value) {
            settings.viewScale = value;
        },


    };

});

; (function (name, definition) {
    if (typeof extendFactoryNamespace === "function") {
        extendFactoryNamespace(name, definition);
    }
})('factory.object', function () {

    // protected API
    var module = this;

    factory.log("factory.object loaded.");

    // public API
    return this.factory;
});

; (function (name, definition) {
    if (typeof extendFactoryNamespace === "function") {
        extendFactoryNamespace(name, definition);
    }
})('factory.object.js', function () {

    // protected API
    var module = this;

    factory.log("factory.object.js loaded.");

    // public API
    return this.factory;
});