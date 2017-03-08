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
    var version = "0.0.5.2";
   
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

    var settingsCache =
    {
        header: "",
        footer: "",
        headerFooterFont: "",
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
            settingsCache.header = str;
        },
        get header() {
            return settingsCache.header;
        },

        set footer(str) {
            settingsCache.footer = str;
        },

        get footer() {
            return settingsCache.footer;
        },

        set headerFooterFont(str) {
            settingsCache.headerFooterFont = str;
        },

        get headerHooterFont() {
            return settingsCache.headerFooterFont;
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

    function printHtmlAtServer(a, b, c) {
        MeadCo.ScriptX.Print.printHtml(a, b, c);
    }

    MeadCo.log("MeadCo.ScriptX.Print.HTML loaded.");
    if (!this.jQuery) {
        MeadCo.log("**** warning :: no jQuery");
    }

    // public API
    return {
        PageMarginUnits: mPageMarginUnits,
        PageOrientation: mPageOrientation,

        settings: iSettings,

        printFromUrl: function (sUrl) {
            MeadCo.log("html.printFromUrl: " + sUrl);
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.URL, sUrl, settingsCache);
        },

        printDocument: function(bPrompt) {
            MeadCo.log("html.printDocument. *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.INNERTHTML, documentContent(), settingsCache);
        },
        
        printFrame : function(sFrame, bPrompt) {
            MeadCo.log("html.printFrame: " + sFrame + " *warning* ignoring bPrompt");
            printHtmlAtServer(MeadCo.ScriptX.Print.ContentType.INNERTHTML, frameContent(sFrame), settingsCache);
        },

        connect: function (serverUrl, licenseGuid) {
            MeadCo.ScriptX.Print.connect(serverUrl, licenseGuid);
        },

        get version() { return version }

    };

});