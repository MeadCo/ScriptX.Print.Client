/*!
 * MeadCo.ScriptX.Print.HTML (support for modern browsers and IE 11) JS client library
 * Copyright 2017 Mead & Company. All rights reserved.
 * https://github.com/MeadCo/ScriptX.Print.Client
 *
 * Released under the MIT license
 */

; (function (name, definition) {
    extendMeadCoNamespace(name, definition);
})('MeadCo.ScriptX.Print.HTML', function () {

    var moduleversion = "1.1.0.6";

    var mPageOrientation = {
        DEFAULT: 0,
        LANDSCAPE: 1,
        PORTRAIT: 2
    };

    var mPageMarginUnits = {
        DEFAULT: 0,
        INCHES: 1,
        MM: 2
    };

    var mCollateOptions = {
        DEFAULT: 0,
        TRUE: 1,
        FALSE: 2
    };

    var settingsCache =
    {
        header: null,
        footer: null,
        headerFooterFont: null,
        viewScale: 0,
        locale: (navigator.languages && navigator.languages.length)
        ? navigator.languages[0]
        : navigator.language,
        timezoneOffset: 0,
        shortDateFormat: "",
        longDateFormat: "",
        printBackgroundColorsAndImages: false,
        pageSettings: {
            orientation: mPageOrientation.PORTRAIT,
            units: mPageMarginUnits.DEFAULT,
            margins: {
                left: "",
                top: "",
                bottom: "",
                right: ""
            }
        }
    };

    var iSettings =
    {
        set header(str) {
            MeadCo.log("MeadCo.ScriptX.Print.HTML setting header: " + str);
            if (str.length === 0) {
                str = "%20";
            }
            settingsCache.header = str;
        },
        get header() {
            return settingsCache.header;
        },

        set footer(str) {
            if (str.length === 0) {
                str = "%20";
            }
            settingsCache.footer = str;
        },

        get footer() {
            return settingsCache.footer;
        },

        set headerFooterFont(str) {
            if (str.length === 0) {
                str = "%20";
            }
            settingsCache.headerFooterFont = str;
        },

        get headerFooterFont() {
            return settingsCache.headerFooterFont;
        },

        set viewScale(x) {
            settingsCache.viewScale = x;
        },

        get viewScale() {
            return settingsCache.viewScale;
        },

        set locale(x) {
            settingsCache.locale = x;
        },

        set shortDateFormat(x) {
            settingsCache.longDateFormat = x;
        },

        set longDateFormat(x) {
            settingsCache.longDateFormat = x;
        },

        set printBackgroundColorsAndImages(b) {
            settingsCache.printBackgroundColorsAndImages = b;
        },

        get printBackgroundColorsAndImages() {
            return settingsCache.printBackgroundColorsAndImages;
        },

        page: {
            set orientation(enumOrientation) {
                settingsCache.pageSettings.orientation = enumOrientation;
            },

            get orientation() {
                return settingsCache.pageSettings.orientation;
            },

            set units(enumUnits) {
                settingsCache.pageSettings.units = enumUnits;
            },

            get units() {
                return settingsCache.pageSettings.units;
            },

            margins: {
                set left(n) {
                    settingsCache.pageSettings.margins.left = n;
                },

                get left() {
                    return settingsCache.pageSettings.margins.left;
                },

                set top(n) {
                    settingsCache.pageSettings.margins.top = n;
                },

                get top() {
                    return settingsCache.pageSettings.margins.top;
                },

                set bottom(n) {
                    settingsCache.pageSettings.margins.bottom = n;
                },

                get bottom() {
                    return settingsCache.pageSettings.margins.bottom;
                },

                set right(n) {
                    settingsCache.pageSettings.margins.right = n;
                },

                get right() {
                    return settingsCache.pageSettings.margins.right;
                }

            }
        }
    };

    function updateSettingsWithServerDefaults(sDefaults) {
        settingsCache = sDefaults;
        settingsCache.locale = (navigator.languages && navigator.languages.length)
            ? navigator.languages[0]
            : navigator.language;
        settingsCache.timezoneOffset = (new Date()).getTimezoneOffset();
        MeadCo.log("Settings cache updated, .locale: [" + settingsCache.locale + "], .offset: " + settingsCache.timezoneOffset);
    }

    function persistData($element) {
        // preserve all form values.
        //Radiobuttons and checkboxes
        $(":checked", $element).each(function () {
            this.setAttribute('checked', 'checked');
        });
        //simple text inputs
        $("input[type='text']", $element).each(function () {
            this.setAttribute('value', $(this).val());
        });
        $("select", $element).each(function () {
            var $select = $(this);
            $("option", $select).each(function () {
                if ($select.val() == $(this).val())
                    this.setAttribute('selected', 'selected');
            });
        });
        $("textarea", $element).each(function () {
            var value = $(this).attr('value');
            if ($.browser.mozilla && this.firstChild)
                this.firstChild.textContent = value;
            else
                this.innerHTML = value;
        });

    }

    function getBaseHref() {
        var port = (window.location.port) ? ':' + window.location.port : '';
        return window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;
    }

    function printableHtmlDocument($html) {

        persistData($html);
        $("script", $html).remove();
        $("object", $html).remove();

        if (!$("head>base",$html).length) {
            MeadCo.log("No base element, fabricating one to: " + getBaseHref());
            var base = $("<base />",
            {
                href: getBaseHref()
            });
            $("head", $html).append(base);
        }

        return $html.html();
    }

    function documentHtml() {
        return printableHtmlDocument($("html"));
    }

    function documentContent() {
        if (this.jQuery) {
            return documentHtml();
        }

        throw new Error("No supported html snapshot helper available (jQuery is required)");
    }

    function frameContent(sFrame) {
        if (this.jQuery) {
            var $frame = $("#" + sFrame);

            if (!$frame.length)
                throw new Error("Unabled to print frame - frame does not exist");

            return printableHtmlDocument($frame.contents().find("html"));
        }

        throw new Error("No supported framed html snapshot helper available (jQuery is required)");

    }

    function printHtmlAtServer(contentType, content, htmlPrintSettings, fnDone, fnCallback, data) {
        MeadCo.ScriptX.Print.printHtml(contentType, content, htmlPrintSettings, fnDone, null, fnCallback, data);
    }

    MeadCo.log("MeadCo.ScriptX.Print.HTML " + moduleversion + " loaded.");

    if (!this.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    // public API
    return {
        PageMarginUnits: mPageMarginUnits,
        PageOrientation: mPageOrientation,
        CollateOptions: mCollateOptions,

        settings: iSettings,

        printDocument: function (bPrompt, fnCallOnDone, fnCallback, data) {
            MeadCo.log("html.printDocument. *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.INNERTHTML, documentContent(), settingsCache, fnCallOnDone, fnCallback, data);
        },

        printFrame: function (sFrame, bPrompt, fnCallOnDone, fnCallback, data) {
            MeadCo.log("html.printFrame: " + sFrame + " *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.INNERTHTML, frameContent(sFrame), settingsCache, fnCallOnDone, fnCallback, data);
        },

        printFromUrl: function (sUrl, bPrompt, fnCallOnDone, fnCallback, data) {
            MeadCo.log("html.printFromUrl: " + sUrl + " *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.URL, sUrl, settingsCache, fnCallOnDone, fnCallback, data);
        },

        printHtml: function (sHtml, bPrompt, fnCallOnDone, fnCallback, data) {
            MeadCo.log("html.printHtml(string)" + " *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.HTML, sHtml, settingsCache, fnCallOnDone, fnCallback, data);
        },

        connectLite : function(serverUrl, licenseGuid) {
            MeadCo.ScriptX.Print.connectLite(serverUrl, licenseGuid);
        },

        connect: function (serverUrl, licenseGuid) {
            MeadCo.warn("Print.HTML SYNC connection request");
            MeadCo.ScriptX.Print.connectLite(serverUrl, licenseGuid);
            MeadCo.ScriptX.Print.getFromServer("/htmlPrintDefaults/?units=0",false,
                function (data) {
                    MeadCo.log("got default html settings");
                    updateSettingsWithServerDefaults(data.htmlPrintSettings);
                    if (data.deviceSettings != null) {
                        MeadCo.ScriptX.Print.connectDevice(data.deviceSettings);
                    }
                });
        },

        connectAsync: function (serverUrl, licenseGuid,resolve,reject) {
            MeadCo.log("Print.HTML ASYNC connection request");
            MeadCo.ScriptX.Print.connectLite(serverUrl, licenseGuid);
            MeadCo.ScriptX.Print.getFromServer("/htmlPrintDefaults/?units=0",true,
                function (data) {
                    MeadCo.log("got default html settings");
                    updateSettingsWithServerDefaults(data.htmlPrintSettings);
                    if (data.deviceSettings != null) {
                        MeadCo.ScriptX.Print.connectDevice(data.deviceSettings);
                    }
                    resolve();
                },reject);
        },

        get version() { return moduleversion }

    };

});