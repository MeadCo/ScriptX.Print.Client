The library contains the following source files :

### Core

| File | Namespace | Purpose |
|--- |--- |---|
| meadco-core.js | MeadCo | Core functionality required for creating objects in the namespace and other general utilities |
| meadco-scriptxprint.js | MeadCo.ScriptX.Print | Implements calls to the ScriptX.Services Web print APIs including processing of responses with tracking of jobs at the server |
| meadco-scriptxprinthtml.js | MeadCo.ScriptX.Print.HTML | Implements support for the structures required by the Web API for html printing and functions to gather the HTML to be printed from the current document |
| meadco-scriptxprintpdf.js | MeadCo.ScriptX.Print.PDF | Implements support for the structures required by the Web API for printing PDF documents |
| meadco-scriptxfactory.js | &quot;factory&quot; | Implements emulations of factory, factory.printing..., factory.rawPrinting, factory.js |

### Licensing

| File | Namespace | Purpose |
|--- |--- |---|
| meadco-scriptxprintlicensing.js | MeadCo.ScriptX.Print.Licensing | Implements calls to the ScriptX.Services Web licensing API |
| meadco-secmgr.js | &quot;secmgr&quot; | Implements emulation of secmgr |

### UI

| File | Namespace | Purpose |
|--- |--- |---|
| jQuery-MeadCo.ScriptX.Print.UI.js | MeadCo.ScriptX.Print.UI | Implements the dialogs PageSetup and PrinterSettings with Bootstrap 3/4 and jQuery  |
| Bootstrap5-MeadCo.ScriptX.Print.UI.js | MeadCo.ScriptX.Print.UI | Implements the dialogs PageSetup and PrinterSettings with Bootstrap 5 without jQuery  |

## Collections

The following minimised collections are provided/available from each repository:

| Name | Includes | Purpose |
|---|--- |---|
| meadco-scriptxservices.min.js | All core modules for printing including window.factory and window.secmgr emulation but no support for UI prompts. | Full support for ScriptX Services on Windows PC. But, **no** UI dialog modules are included. |
| meadco-scriptxservicesUI.min.js | As above but includes UI prompt Page and Print setup UI dialogs (require Bootstrap 3/4 and jQuery).  | Full support for ScriptX Services on Windows PC where print promopt dialogs are required. |
| meadco-scriptxservicesUI-2.min.js | As above but includes UI prompt Page and Print setup UI dialogs (require Bootstrap 5 no jQuery).  | Full support for ScriptX Services on Windows PC where print promopt dialogs are required. |
| meadco-scriptxservicesprint.min.js | All core modules for printing print including window.factory emulation. No UI modules or support licensing for ScriptX Services on Windows PC. | Intended for working with ScriptX.Services on Cloud or On Premise. |
| meadco-scriptxservicesprintUI.min.js | As above but includes Page and Print setup UI dialogs (require Bootstrap 3/4 and jQuery).  | For working with ScriptX.Services on Cloud or On Premise where print prompt dialogs are required. |
| meadco-scriptxservicesprintUI-2.min.js | As above but includes Page and Print setup UI dialogs (require Bootstrap5 no jQuery).  | For working with ScriptX.Services on Cloud or On Premise where print prompt dialogs are required. |
| meadco-scriptxserviceslicensing.min.js | window.secmgr emulation for ScriptX Services on Windows PC. | Super low download cost for a 'license install' page. |
