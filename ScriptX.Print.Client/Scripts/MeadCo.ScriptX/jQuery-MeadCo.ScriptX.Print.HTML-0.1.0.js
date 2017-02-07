/*
 * jQuery dependent implementation of MeadCo.ScriptX.Print.HTML
 * 
 * jQuery provides $.post and helpers for snap shotting
 */
"use strict";
(function (topLevelNs, $, undefined) {
    if ($ == undefined) {
        console.log("no jquery!");
        return;
    }

    var printHtml = topLevelNs.createNS("MeadCo.ScriptX.Print.HTML");

    printHtml.configure = function(serverUrl,slicenseGuid) {
        console.log("MeadCo.ScriptX.Print attaching to server: " + serverUrl);
        MeadCo.ScriptX.Print.Core.configure($.post, serverUrl, slicenseGuid);
    }

    printHtml.printURL = function(url) {
        console.log("MeadCo.ScriptX.Print.PrintURL: " + url);
        MeadCo.ScriptX.Print.Core.print(MeadCo.ScriptX.Print.Core.ContentType.Url, url, MeadCo.ScriptX.Print.Core.activeSettings);
    }

    console.log("Autostart jQuery MeadCo.ScriptX.Print.HTML ...");

    // auto-find configuration data on a (e.g script) element ...
    $("[data-meadco-print-server]").each(function (i) {
        var $this = $(this);
        printHtml.configure($this.data("meadco-print-server"), $this.data("licenseGuid"));
        return false; // the first is the winner.
    });

}(window.MeadCo = window.MeadCo || {}, jQuery));
