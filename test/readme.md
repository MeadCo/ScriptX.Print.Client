# Tests

## Jest Tests
In project folder

> npm test

The tests are implemented/described in library.test.js. A report is produced at: testresults\test-report.html

The tests load test-page.html, test-page-attribs.html, frame.html and frame2.html

The above files load the minified version of the library. The following files use the unminified (source) files:

test-page-src.html, test-page-attribs-src.html

To run the test with minified or source libraries, edit library.test.js:

`javascript` const testSources = true;

## Test pages

To run test pages, start the server first.

In folder 'Test'
	
	node start-stop-server.js start
	node start-stop-server.js stop

To access the test pages by browser.

- http://localhost:41191/test-page-src-debug.html

## Test Pages Table

| Page                | Purpose                |
|---------------------|------------------------|
| test-page-src-debug.html | For "Library Tests with no initialisation" |

## The server

server.js implements the ScriptX.Services API without mocked printing functionality.
