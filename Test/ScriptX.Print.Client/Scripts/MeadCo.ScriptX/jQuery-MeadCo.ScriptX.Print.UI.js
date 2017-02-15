// MeadCo.ScriptX.Print.UI
//
// Depends on MeadCo.ScriptX.Print.HTML
//
// A lightweight plug-in not implemented as a plug-in as it will only be used once or twice on a document
// so poluting jQuery is unneccessary.
//
// Trigger with attrubute data-meado-ui = "print" 
//

"use strict";
(function (topLevelNs, $, undefined) {

    var ui = topLevelNs.createNS("MeadCo.ScriptX.Print.UI");

    // MeadCo.PrintUI.Attach(
    //  id - id of clickable element
    //  
    ui.Attach = function (el) {
        console.log("starting PrintUI.attach");

        var $to = $(el);

        $to.click(function() {
            var $this = $(this);

            switch ($this.data("action")) {
                case "document":
                    break;

                case "remote":
                    MeadCo.ScriptX.Print.HTML.printURL($this.data("url"));
                    break;

                case "element":
                    break;
            }
        });
    }

    console.log("Autostart meadco.PrintUI ...");

    $("[data-meadco-ui='print']").each(function (i) {
        ui.Attach(this);
    });

}(window.MeadCo = window.MeadCo || {}, jQuery));
