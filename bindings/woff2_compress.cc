/*
  Copyright 2013 Google Inc. All Rights Reserved.

  Distributed under MIT license.
  https://github.com/google/woff2/blob/master/LICENSE
*/

#include <woff2/encode.h>
#include <emscripten/bind.h>

emscripten::val compress(std::string input) {
  const uint8_t* input_data = reinterpret_cast<const uint8_t*>(input.data());
  size_t output_size = woff2::MaxWOFF2CompressedSize(input_data, input.size());
  std::string output(output_size, 0);
  uint8_t* output_data = reinterpret_cast<uint8_t*>(&output[0]);

  woff2::WOFF2Params params;
  if (!woff2::ConvertTTFToWOFF2(input_data, input.size(),
                                output_data, &output_size, params)) {
    return emscripten::val::null();
  }
  output.resize(output_size);

  return emscripten::val(emscripten::typed_memory_view(
      output.size(),
      reinterpret_cast<unsigned const char*>(output.data())
    ));
}

EMSCRIPTEN_BINDINGS(woff2_compress) {
  emscripten::function("compress", &compress);
}
