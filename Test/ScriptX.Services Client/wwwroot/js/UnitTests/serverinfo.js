var badServerUrl = "http://localhost:12";

var serverUrl = window.location.protocol + "//" + window.location.host;
//var serverUrl = "https://scriptxservices.meadroid.com";
//var serverUrl = "http://127.0.0.1:41191/";

var licenseGuid = "666140C4-DFC8-435E-9243-E8A54042F918".toLocaleLowerCase();

var badLicenseGuid = "123";

MeadCo.logEnabled = true;

MeadCo.ScriptX.Print.reportServerError = function (txt) {
    console.log("ReportServerError: ", txt);
    $("#qunit-fixture").text(txt);
};

MeadCo.ScriptX.Print.reportFeatureNotImplemented = function (featureDescription) {
    $("#qunit-fixture").text(featureDescription);
};
