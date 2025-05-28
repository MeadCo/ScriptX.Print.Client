// MeadCo.ScriptX.Print.UI
//
// Depends on MeadCo.ScriptX.Print.HTML
//
// A lightweight plug-in not implemented as a plug-in as it will only be used once or twice on a document
// so polluting jQuery is unneccessary.
//
// Optional dependency: bootstrap-select.js : Bootstrap-select (http://silviomoreto.github.io/bootstrap-select)
// The above dependency is completely optional - the code looks for the enabling class.
//

(function (topLevelNs, undefined) {
    "use strict";

    if ( !topLevelNs ) {
        return;
    }

    let ui = topLevelNs.createNS("MeadCo.ScriptX.Print.UI");
    ui.version = "1.16.3.0";

    topLevelNs.log("MeadCo.ScriptX.Print.UI version is: " + ui.version);

    let bAccepted = false;
    let dlg = null;
    let fnDlgCallback = null;

    function okHandler(ev) {
        ev.preventDefault();
        savePageSetup();
        bAccepted = true;
        dlg.hide();
    }

    function hideHandler() {
        if (fnDlgCallback) fnDlgCallback(bAccepted);
    }

    function measureChangeHandler() {
        switch (document.querySelector('[name="fld-measure"]:checked').value) {
            case '2': // mm from inches
                document.querySelectorAll(`#dlg-printoptions input[type=number][data-rule=measure]`)
                    .forEach(box => { convertAndDisplayinchesToMM(box); });
                break;

            case '1': // inches from mm
                document.querySelectorAll(`#dlg-printoptions input[type=number][data-rule=measure]`)
                    .forEach(box => { convertAndDisplayMMtoInches(box); });
                break;
        }

    }

    function savePageSetup() {
        const dlg = document.querySelector('#dlg-printoptions');
        const settings = MeadCo.ScriptX.Print.HTML.settings;

        if (dlg) {
            settings.page.orientation = dlg.querySelector('[name="fld-orientation"]:checked').value;
            settings.printBackgroundColorsAndImages = dlg.querySelector('#fld-printbackground').checked;
            settings.viewScale = dlg.querySelector('#fld-shrinktofit').checked ? -1 : 100;
            settings.page.units = parseInt(dlg.querySelector('[name="fld-measure"]:checked').value);
            settings.page.margins.left = dlg.querySelector('#fld-marginL').value;
            settings.page.margins.top = dlg.querySelector('#fld-marginT').value;
            settings.page.margins.right = dlg.querySelector('#fld-marginR').value;
            settings.page.margins.bottom = dlg.querySelector('#fld-marginB').value;
            settings.header = dlg.querySelector('#fld-header').value;
            settings.footer = dlg.querySelector('#fld-footer').value;

            MeadCo.ScriptX.Print.deviceSettings.paperSizeName = dlg.querySelector('#fld-papersize').value
        }
    }


    // MeadCo.ScriptX.Print.UI.PageSetup()
    ui.PageSetup = function (fnCallBack) {

        if ( !bootstrap.Modal) {
            console.error("MeadCo.ScriptX.Print.UI requires bootstrap v5 or later");
            fnCallBack(false);
            return;
        }

        bAccepted = false;
        fnDlgCallback = fnCallBack;

        const sClass = "";
        const bs_majorVersion = (bootstrap.Modal.VERSION || '').split(' ')[0].split('.')[0];

        // page setup modal to attach to the page
        //
        // Simple override is to include the dialog in the page with id="dlg-printoptions"
        //
        const dlgId = "dlg-printoptions";
        let dlgEl = document.getElementById(dlgId);

        if (!dlgEl) {
            console.log("UI.PageSetup bootstrap modal version: " + bootstrap.Modal.VERSION + ", major: " + bs_majorVersion);
            let dlgHtml;

            switch (bs_majorVersion) {
                case '5':
                    dlgHtml = '<div class="modal" tabindex="-1" id="dlg-printoptions"><div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg" role = "document">' +
                        '<div class="modal-content"><div class="modal-header"><h5 class="modal-title">Page setup</h5><button type="button" class="btn-close" data-dismiss="modal" aria-label="Close">' +
                        '<span aria-hidden="true"></span></button></div><div class="modal-body"><div class="bs-component"><fieldset><legend>Paper</legend><div class="row">' +
                        '<label for="fld-papersize" class="col-md-4 col-form-label text-right col-form-label-sm">Size</label><div class="col-md-8"><select class="' + sClass + ' form-select form-select-sm" id="fld-papersize"></select>' +
                        '</div></div><div class="row mt-2"><div class="col-md-8 offset-md-4">' +
                        '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="2" id="fld-portrait" name="fld-orientation" /><label class="form-check-label" for="fld-portrait">Portrait</label></div>' +
                        '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="1" id="fld-landscape" name="fld-orientation" /><label class="form-check-label" for="fld-portrait">Landscape</label></div></div></div>' +
                        '<div class="row"><div class="col-md-8 offset-md-4"><div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="fld-shrinktofit" id="fld-shrinktofit">' +
                        '<label class="form-check-label" for="fld-shrinktofit">Shrink to fit</label></div></div></div><div class="row"><div class="col-md-8 offset-md-4"><div class="form-check form-check-inline">' +
                        '<input class="form-check-input" type="checkbox" name="fld-printbackground" id="fld-printbackground"><label class="form-check-label" for="fld-printbackground">Print background colour and images</label>' +
                        '</div></div></div></fieldset><fieldset><legend>Margins</legend><div class="row"><div class="col-md-8 offset-md-4" id="radiomeasures">' +
                        '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="2" id="fld-millimetres" name="fld-measure" /><label class="form-check-label" for="fld-millimetres">Millimetres</label></div>' +
                        '<div class="form-check form-check-inline"><input class="form-check-input" type="radio" value="1" id="fld-inches" name="fld-measure" /><label class="form-check-label" for="fld-inches">Inches</label></div></div></div>' +
                        '<div class="row mt-2"><label class="col-md-4 col-form-label text-right col-form-label-sm">Left</label>' +
                        '<div class="col-md-3"><div class="input-group"><input name="fld-marginL" id="fld-marginL" type="number" min="0" max="30" step="0.1" class="form-control text-right form-control-sm" data-rule="measure" value="1" />' +
                        '</div></div><label class="col-md-2 col-form-label text-right col-form-label-sm">Top</label><div class="col-md-3"><div class="input-group"><input name="fld-marginT" id="fld-marginT" type="number" min="0" max="30" step="0.1" class="form-control text-right form-control-sm" data-rule="measure" value="1" />' +
                        '</div></div></div><div class="row mt-2"><label class="col-md-4 col-form-label text-right col-form-label-sm">Right</label><div class="col-md-3"><div class="input-group">' +
                        '<input name="fld-marginR" id="fld-marginR" type="number" min="0" max="30" step="0.1" class="form-control text-right form-control-sm" value="1" data-rule="measure"/></div></div><label class="col-md-2 col-form-label text-right col-form-label-sm">Bottom</label>' +
                        '<div class="col-md-3"><div class="input-group"><input name="fld-marginB" id="fld-marginB" type="number" min="0" max="30" step="0.1" class="form-control text-right form-control-sm" value="1" data-rule="measure"/>' +
                        '</div></div></div></fieldset><fieldset class="mt-2"><legend>Headers and footers</legend><div class="row"><label for="fld-header" class="col-md-4 col-form-label text-right col-form-label-sm">Header</label>' +
                        '<div class="col-md-8"><input type="text" name="fld-header" id="fld-header" class="form-control form-control-sm" /></div></div><div class="row mt-2"><label for="fld-footer" class="col-md-4 col-form-label text-right col-form-label-sm">Footer</label>' +
                        '<div class="col-md-8"><input type="text" name="fld-footer" id="fld-footer" class="form-control form-control-sm" /></div></div></fieldset></div>' +
                        '</div><div class="modal-footer"><button type="button" class="btn btn-primary" id="btn-saveoptions">OK</button><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button></div></div></div></div>';
                    break;

                default:
                    console.error("Unknown version of bootstrap: " + bs_majorVersion);
                    fnCallBack(false);
                    return;
            }

            const tempContainer = document.createElement('div');

            tempContainer.innerHTML = dlgHtml;
            document.body.appendChild(tempContainer, null);
            dlgEl = document.getElementById(dlgId);
        }

        if (dlgEl) {
            const measure = dlgEl.querySelector('#radiomeasures');
            measure.addEventListener("change", measureChangeHandler);

            const btnOk = dlgEl.querySelector("#btn-saveoptions");
            if (btnOk) {
                btnOk.addEventListener("click", okHandler);
            }

            dlgEl.addEventListener("hidden.bs.modal", hideHandler);
        }

        let settings = MeadCo.ScriptX.Print.HTML.settings;

        let rb = dlgEl.querySelector(`input[name="fld-orientation"][value="${settings.page.orientation}"]`);
        if ( rb ) rb.checked = true;

        dlgEl.querySelector('#fld-printbackground').checked = settings.printBackgroundColorsAndImages;
        dlgEl.querySelector('#fld-shrinktofit').checked = settings.viewScale == -1;

        rb = dlgEl.querySelector(`input[name="fld-measure"][value="${settings.page.units}"]`);
        if ( rb ) rb.checked = true;

        dlgEl.querySelector('#fld-marginL').value = settings.page.margins.left;
        dlgEl.querySelector('#fld-marginT').value = settings.page.margins.top;
        dlgEl.querySelector('#fld-marginR').value  = settings.page.margins.right;
        dlgEl.querySelector('#fld-marginB').value = settings.page.margins.bottom;
        dlgEl.querySelector('#fld-header').value = settings.header;
        dlgEl.querySelector('#fld-footer').value = settings.footer;

        // grab the paper size options 
        const printApi = MeadCo.ScriptX.Print;
        const paperSelect = document.querySelector('#fld-papersize');
        const forms = printApi.deviceSettingsFor(printApi.printerName).forms;

        removeAll(paperSelect);
        for (var i in forms) {
            paperSelect.add(new Option(forms[i]));
        }

        paperSelect.value = MeadCo.ScriptX.Print.deviceSettings.paperSizeName;

        dlg = new bootstrap.Modal(document.getElementById(dlgId), {
            backdrop: 'static',
            keyboard: false
        });

        dlg.show();

    };

    // MeadCo.ScriptX.Print.UI.PrinterSettings()
    function okPrinterSettingsHandler(ev) {
        ev.preventDefault();
        savePrinterSettings();
        bAccepted = true;
        dlg.hide();
    }


    function printerChange(ev) {
        onSelectPrinter(document.getElementById("dlg-printersettings"), ev.target.options[ev.target.selectedIndex].value);
    }

    ui.PrinterSettings = function (fnCallBack) {

        if ( !bootstrap.Modal ) {
            console.error("MeadCo.ScriptX.Print.UI requires bootstrap Modal");
            fnCallBack(false);
            return;
        }

        const bs_majorVersion = (bootstrap.Modal.VERSION || '').split(' ')[0].split('.')[0];

        const dlgId = "dlg-printersettings";

        let dlgEl = document.getElementById(dlgId);

        bAccepted = false;
        const sClass = "";
        fnDlgCallback = fnCallBack;

        // printer settings modal to attach to the page
        if (!dlgEl) {
            console.log("UI.PageSetup bootstrap modal version: " + bootstrap.Modal.VERSION + ", major: " + bs_majorVersion);
            let dlgHtml;
            

            switch (bs_majorVersion) {

                case '5':
                    dlgHtml = '<div class="modal" id="dlg-printersettings"><div class="modal-dialog role = "document"><div class="modal-content">' +
                        '<div class="modal-header"><h5 class="modal-title">Print</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span>' +
                        '</button></div><div class="modal-body"><div class="bs-component"><div class="row"><label for="fld-printerselect" class="col-md-4 form-label text-right col-form-label-sm">Printer</label>' +
                        '<div class="col-md-8"><select class="' + sClass + ' form-select form-select-sm" id="fld-printerselect"></select></div></div><div class="row mt-2">' +
                        '<label for="fld-papersource" class="col-md-4 form-label text-right col-form-label-sm">Paper source</label><div class="col-md-8"><select class="' + sClass + ' form-select form-select-sm" id="fld-papersource"></select>' +
                        '</div></div><div class="row g-3" style="margin-top:-8px"><label for="fld-copies" class="col-md-4 form-label text-right col-form-label-sm">Copies</label><div class="col-md-3">' +
                        '<input name="fld-copies" id="fld-copies" type="number" min="1" max="5" step="1" class="form-control form-control-sm text-right" data-rule="quantity" value="1" /></div><div class="col-md-5"><div class="form-check" style="margin-top: 4px">' +
                        '<input class="form-check-input" type="checkbox" name="fld-collate" id="fld-collate"><label class="form-check-label" for="fld-collate">Collate</label></div></div></div></div>' +
                        '</div><div class="modal-footer"><button type="button" class="btn btn-primary" id="btn-savesettings">Print</button><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button></div></div></div></div >';
                    break;

                default:
                    console.error("Unknown version of bootstrap: " + bs_majorVersion);
                    fnCallBack(false);
                    return;
            }

            const tempContainer = document.createElement('div');

            tempContainer.innerHTML = dlgHtml;
            document.body.appendChild(tempContainer, null);

            dlgEl = document.getElementById(dlgId);

        }

        if (dlgEl) {

            let el = dlgEl.querySelector("#btn-savesettings");
            if (el) {
                el.addEventListener("click", okPrinterSettingsHandler);
            }

            el = dlgEl.querySelector("#fld-printerselect");
            if (el)
                el.addEventListener("change", printerChange);

            dlgEl.addEventListener("hidden.bs.modal", hideHandler);            

        }

        fillPrintersList(dlgEl);
        showPrinterSettings(dlgEl);

        dlg = new bootstrap.Modal(document.getElementById(dlgId), {
            backdrop: 'static',
            keyboard: false
        });

        dlg.show();
    }

    // show available sources and options 
    function showPrinterSettings(dlgEl) {

        fillAndSetBinsList(dlgEl, MeadCo.ScriptX.Print.printerName, () => {
            const printApi = MeadCo.ScriptX.Print;
            const settings = printApi.deviceSettings;

            dlgEl.querySelector('#fld-collate').setAttribute('checked', settings.collate === printApi.CollateOptions.TRUE);
            dlgEl.querySelector('#fld-copies').value = settings.copies;
        });
    }

    function savePrinterSettings() {
        let dlg = document.querySelector('#dlg-printersettings');
        const printApi = MeadCo.ScriptX.Print;

        if ( dlg ) {
            // must set the printer first and note this might trigger a getDeviceSettings call to the server
            const a = printApi.onErrorAction;

            printApi.onErrorAction = printApi.ErrorAction.THROW;

            // eat all and any errors. finally might be better but
            // minifiers dont like empty blocks 
            try {
                printApi.printerName = dlg.querySelector('#fld-printerselect').value
            }
            finally {
                printApi.onErrorAction = a;
            }

            // update settings for the active printer
            let settings = printApi.deviceSettings;
            settings.paperSourceName = dlg.querySelector('#fld-papersource').value;
            settings.collate = dlg.querySelector('#fld-collate').getAttribute('checked') ? printApi.CollateOptions.TRUE : printApi.CollateOptions.FALSE
            settings.copies = parseInt(dlg.querySelector('#fld-copies').value);
        }
    }

    // fill printers dropdown with those available
    function fillPrintersList(dlgEl) {
        const printApi = MeadCo.ScriptX.Print;
        const printers = dlgEl.querySelector('#fld-printerselect');
        const arrPrinters = printApi.availablePrinterNames;

        removeAll(printers);
        for (let i = 0; i < arrPrinters.length; i++) {
            printers.add(new Option(arrPrinters[i]));
        }

        printers.value = printApi.printerName;
        onSelectPrinter(dlgEl,printApi.printerName);
    }

    function onSelectPrinter(dlgEl,printerName) {
        fillAndSetBinsList(dlgEl,printerName);
    }

    function fillAndSetBinsList(dlgEl,printerName,fnDone) {
        const printApi = MeadCo.ScriptX.Print;

        printApi.deviceSettingsForAsync(printerName, (settings) => {
            const binsArray = settings.bins;
            const bins = dlgEl.querySelector('#fld-papersource');

            removeAll(bins);
            for (var i = 0; i < binsArray.length; i++) {
                bins.add(new Option(binsArray[i]));
            }

            bins.value = settings.paperSourceName;
            if (fnDone) fnDone();
        },
            (eTxt) => {
                MeadCo.ScriptX.Print.reportError(eTxt);
                if (fnDone) fnDone();
            });

    }

    // convert the current inches value in the control to MM
    function convertAndDisplayinchesToMM(el) {
        el.value = ((parseFloat(el.value) * 2540) / 100).toFixed(2);
    }

    // convert the current mm value in the control to inches
    function convertAndDisplayMMtoInches(el) {
        el.value = ((parseFloat(el.value) * 100) / 2540).toFixed(2);
    }

    function removeAll(selectEl) {
        for (let i = selectEl.options.length - 1; i >= 0; i--) {
            selectEl.remove(i);
        }
    }

})(window.MeadCo = window.MeadCo || null);
