﻿// Module/Plugin core
// Note: the wrapper code you see around the module is what enables
// us to support multiple module formats and specifications by 
// mapping the arguments defined to what a specific format expects
// to be present. Our actual module functionality is defined lower 
// down, where a named module and exports are demonstrated. 

; (function (name, definition) {
    var theModule = definition(),
        // this is considered "safe":
        hasDefine = typeof define === 'function' && define.amd,
        // hasDefine = typeof define === 'function',
        hasExports = typeof module !== 'undefined' && module.exports;

    if (hasDefine) { // AMD Module
        define(theModule);
    } else if (hasExports) { // Node.js Module
        module.exports = theModule;
    } else { // Assign to common namespaces or simply the global object (window)
        (this.jQuery || this.ender || this.$ || this)[name] = theModule;
    }
})('core', function () {
    var module = this;
    module.highlightColor = "yellow";
    module.errorColor = "red";

    console.log("core starting");
    // define the core module here and return the public API

    // this is the highlight method used by the core highlightAll()
    // method and all of the plugins highlighting elements different
    // colors
    module.highlight = function (el, strColor) {
        // this module uses jQuery, however plain old JavaScript
        // or say, Dojo could be just as easily used.
        console.log("core.module.highlight2");
        if (this.jQuery) {
            jQuery(el).css('background', strColor);
        }
    }
    return {
        highlightAll: function () {
            console.log("core.module.highlight");
            module.highlight('div', module.highlightColor);
        }
    };

});

