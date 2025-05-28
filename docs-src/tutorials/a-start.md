## Quick start - ScriptX.Services for Microsoft Windows PC

1. [Download and install ScriptX.Services for Microsoft Windows (x64) PC](https://www.meadroid.com/Downloads/ScriptXServices/Download)
2. Link to the required libraries with service connection details
3. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
4. Initilise print parameters

```javascript
<!-- ScriptX Services client emulation libraries optionally use jQuery. It is **not** a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- Connect to server with publishing license id. -->
<!-- Use an evaluation license id for the value of data-meadco-license -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservices.min.js" 
        data-meadco-server="http://127.0.0.1:41191" 
        data-meadco-license="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></script>

<script type="text/javascript">
   $(window).on('load', async () => {
        try {
           await MeadCo.ScriptX.InitAsync();
           MeadCo.ScriptX.Printing.header = 
              "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
           MeadCo.ScriptX.Printing.footer = 
              "The de facto standard for advanced web-based printing";
           MeadCo.ScriptX.Printing.orientation = "landscape";
           $("#btnprint").click(() => { 
                MeadCo.ScriptX.PrintPage(false); });
        }
        catch (e) {
            console.error(e);
        }
   });
</script>
```

## Quick start - ScriptX.Services on Cloud for any browser

1. [Sign up for a subscription identifier](https://scriptxservices.meadroid.com/CloudService/Signup)
2. Link to the required libraries with service connection details
3. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
4. Initilise print parameters

```javascript
<!-- ScriptX Services client emulation libraries optionally use jQuery. It is **not** a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- Connect to cloud server with registered use id. -->
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1.6/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="https://scriptxservices.meadroid.com" 
        data-meadco-subscription="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></script>

<script type="text/javascript">
   $(window).on('load', function () {
     MeadCo.ScriptX.InitAsync().then(function {
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";
       $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
       });
     })      
   });
</script>
```

## Quick start - ScriptX.Services On Premise

1. [Download and install ScriptX.Services for On Premise Devices](https://www.meadroid.com/Downloads/ScriptXServices/Download)
2. Request and install an evaluation license
3. Link to the required libraries with service connection details
4. Initialise the [MeadCoScriptXJS](https://meadco.github.io/MeadCoScriptXJS) library
5. Initilise print parameters

```javascript
<!-- ScriptX Services client emulation libraries optionally use jQuery. It is **not** a dependency -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>

<!-- MeadCoScriptXJS Library -->
<script src="https://cdn.jsdelivr.net/npm/meadco-scriptxjs@1/src/meadco-scriptx.min.js"></script>

<!-- Connect to on premise server, no subscription id is required as it is the srver that is licensed.
<script src="https://cdn.jsdelivr.net/npm/scriptxprint-html@1/dist/meadco-scriptxservicesprint.min.js" 
        data-meadco-server="http://<yourlocalserver>/scriptxservices/" 
        data-meadco-subscription=""></script>

<script type="text/javascript">
   $(window).on('load', function () {
     MeadCo.ScriptX.InitAsync().then(function {
       MeadCo.ScriptX.Printing.header = 
          "MeadCo's ScriptX&b:&p of &P:&bBasic Printing Sample";
       MeadCo.ScriptX.Printing.footer = 
          "The de facto standard for advanced web-based printing";
       MeadCo.ScriptX.Printing.orientation = "landscape";
       $("#btnprint").click(function() { 
            MeadCo.ScriptX.PrintPage(false);
       });
     })      
   });
</script>
```
