/*!
 * MeadCo.ScriptX.Print.HTML (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

; (function (name, definition) {
    extend(name, definition(), (this.jQuery || this.ender || this.$ || this));
})('MeadCo.ScriptX.Print.HTML', function () {

    var module = this;

    module.PageOrientation = {
        Default: 0,
        Landscape: 1,
        Portrait: 2
    };

    module.PageMarginUnits = {
        Default: 0,
        Inches: 1,
        Mm: 2
    }

    module.Settings =
    {
        header: "",
        footer: "",
        headerFooterFont: "",
        pageSettings: {
            orientation: module.PageOrientation.Portrait,
            paperSize: "",
            paperSource: "",
            units: module.PageMarginUnits.Default,
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
        printFromUrl: function (sUrl) {
            log("html.printFromUrl: " + sUrl);
            printHtmlAtServer(ContentType.Url, sUrl,module.Settings);
        },

        pageMarginUnits: module.PageMarginUnits,
        pageOrientation: module.PageOrientation,

        pageSettings: module.settings
    };

});