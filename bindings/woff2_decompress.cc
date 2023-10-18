/*
  Copyright 2013 Google Inc. All Rights Reserved.

  Distributed under MIT license.
  See file LICENSE-THIRD-PARTY for detail or copy at https://opensource.org/licenses/MIT
*/

#include <woff2/decode.h>
#include <emscripten/bind.h>

emscripten::val decompress(std::string input) {
  const uint8_t* raw_input = reinterpret_cast<const uint8_t*>(input.data());
  std::string output(
    std::min(woff2::ComputeWOFF2FinalSize(raw_input, input.size()),
              woff2::kDefaultMaxSize),
    0);
  woff2::WOFF2StringOut out(&output);

  const bool ok = woff2::ConvertWOFF2ToTTF(raw_input, input.size(), &out);

  if (ok) {
    return emscripten::val(emscripten::typed_memory_view(
        output.size(),
        reinterpret_cast<unsigned const char*>(output.data())
      ));
  }

  return emscripten::val::null();
}

EMSCRIPTEN_BINDINGS(woff2_decompress) {
  emscripten::function("decompress", &decompress);
}
