// A simple test to ensure QUnit is working
QUnit.module("Basic tests");
QUnit.test("OK test", function (assert) {
    assert.ok(true, "true succeeds");
    assert.ok("non-empty", "non-empty string succeeds");

    assert.ok(false, "false fails");
    assert.ok(0, "0 fails");
    assert.ok(NaN, "NaN fails");
    assert.ok("", "empty string fails");
    assert.ok(null, "null fails");
    assert.ok(undefined, "undefined fails");
});

QUnit.test("equal test", function (assert) {
    assert.equal(0, 0, "Zero, Zero; equal succeeds");
    assert.equal("", 0, "Empty, Zero; equal succeeds");
    assert.equal("", "", "Empty, Empty; equal succeeds");
    assert.equal(0, false, "Zero, false; equal succeeds");

    assert.equal("three", 3, "Three, 3; equal fails");
    assert.equal(null, false, "null, false; equal fails");
});

QUnit.test("deepEqual test", function (assert) {
    var obj = { foo: "bar" };

    assert.deepEqual(obj, { foo: "bar" }, "Two objects can be the same in value");
});

QUnit.module("Synchronous callbacks");
QUnit.test("a test", function (assert) {
    assert.expect(2);

    function calc(x, operation) {
        return operation(x);
    }

    var result = calc(2, function (x) {
        assert.ok(true, "calc() calls operation function");
        return x * x;
    });

    assert.equal(result, 4, "2 square equals 4");
});
