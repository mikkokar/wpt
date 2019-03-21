function test_blob(fn, expectations) {
  var expected = expectations.expected,
      type = expectations.type,
      desc = expectations.desc;

  var t = async_test(desc);
  t.step(function() {
    var blob = fn();
    assert_true(blob instanceof Blob);
    assert_false(blob instanceof File);
    assert_equals(blob.type, type);
    assert_equals(blob.size, expected.length);

    var fr = new FileReader();
    fr.onload = t.step_func_done(function(event) {
      assert_equals(this.result, expected);
    }, fr);
    fr.onerror = t.step_func(function(e) {
      assert_unreached("got error event on FileReader");
    });
    fr.readAsText(blob, "UTF-8");
  });
}

function test_blob_binary(fn, expectations) {
  var expected = expectations.expected,
      type = expectations.type,
      desc = expectations.desc;

  var t = async_test(desc);
  t.step(function() {
    var blob = fn();
    assert_true(blob instanceof Blob);
    assert_false(blob instanceof File);
    assert_equals(blob.type, type);
    assert_equals(blob.size, expected.length);

    var fr = new FileReader();
    fr.onload = t.step_func_done(function(event) {
      assert_true(this.result instanceof ArrayBuffer,
                  "Result should be an ArrayBuffer");
      assert_array_equals(new Uint8Array(this.result), expected);
    }, fr);
    fr.onerror = t.step_func(function(e) {
      assert_unreached("got error event on FileReader");
    });
    fr.readAsArrayBuffer(blob);
  });
}

function test_blob_readable_stream(fn, expectations) {
  const { expected, desc } = expectations;
  promise_test(async function () {
    const stream = fn();
    assert_true(stream instanceof ReadableStream);

    assert_true('getReader' in stream);
    const reader = stream.getReader();

    assert_true('read' in reader);
    let read_value = await reader.read();

    let combined_chunks = ""
    while (!read_value.done) {
      let blob_string = new TextDecoder("utf-8").decode(read_value.value);
      combined_chunks += blob_string;
      read_value = await reader.read();
    }

    assert_equals(combined_chunks, expected);
  }, desc);
}

function test_blob_text(fn, expectations) {
  const { expected, desc } = expectations;
  promise_test(async function () {
    const text = await fn();
    assert_equals(typeof text, String);

    assert_equals(text, expected);
  }, desc);
}

function test_blob_array_buffer(fn, expectations) {
  const { expected, desc } = expectations;

  promise_test(async () => {
    const array_buffer = await fn();
    assert_true(array_buffer instanceof ArrayBuffer);

    assert_array_equals(array_buffer_to_string(array_buffer), expected);
  })
}

function array_buffer_to_string(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
