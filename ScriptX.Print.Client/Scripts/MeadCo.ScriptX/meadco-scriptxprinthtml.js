/*!
 * MeadCo.ScriptX.Print.HTML (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

; (function (name, definition) {
    extendNamespace(name, definition);
})('MeadCo.ScriptX.Print.HTML', function () {

    var module = this;
   
    module.PageOrientation = {
        DEFAULT: 0,
        LANDSCAPE: 1,
        PORTRAIT: 2
    };

    module.PageMarginUnits = {
        DEFAULT: 0,
        INCHES: 1,
        MM: 2
    }

    var settingsCache =
    {
        header: "",
        footer: "",
        headerFooterFont: "",
        pageSettings: {
            orientation: module.PageOrientation.PORTRAIT,
            paperSize: "",
            paperSource: "",
            units: module.PageMarginUnits.DEFAULT,
            margins: {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0
            }
        }
    }

    module.settings =
    {
        set header(str) {
            log("MeadCo.ScriptX.Print.HTML setting header: " + str);
            settingsCache.header = str;
        },
        get header() {
            return settingsCache.header;
        },

        footer: "",
        headerFooterFont: "",
        pageSettings: {
            orientation: module.PageOrientation.PORTRAIT,
            paperSize: "",
            paperSource: "",
            units: module.PageMarginUnits.DEFAULT,
            margins: {
                left: 0,
                top: 0,
                bottom: 0,
                right: 0
            }
        }
    }

    log("MeadCo.ScriptX.Print.HTML loaded.");
    if (!this.jQuery) {
        log("**** warning :: no jQuery");
    }

    // public API
    return {
        PageMarginUnits: module.PageMarginUnits,
        PageOrientation: module.PageOrientation,

        pageSettings: module.settings,

        printFromUrl: function (sUrl) {
            log("html.printFromUrl: " + sUrl);
            printHtmlAtServer(ContentType.URL, sUrl, settingsCache);
        }
    };

});