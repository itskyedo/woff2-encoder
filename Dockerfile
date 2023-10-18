FROM emscripten/emsdk:3.1.46

RUN git clone --recursive https://github.com/google/woff2.git
RUN cd woff2 && \
    git checkout 4721483ad780ee2b63cb787bfee4aa64b61a0446

RUN mkdir -p /src/build/brotli-wasm && \
    cd /src/build/brotli-wasm && \
    emcmake cmake /src/woff2/brotli -DCMAKE_BUILD_TYPE=Release && \
    emmake make -j2

RUN mkdir -p /src/build/woff2-wasm && \
    cd /src/build/woff2-wasm && \
    emcmake cmake /src/woff2 \
    -DCMAKE_BUILD_TYPE=Release \
    -DNOISY_LOGGING=OFF \
    -DBROTLIENC_INCLUDE_DIRS=/src/woff2/brotli/c/include/ \
    -DBROTLIDEC_INCLUDE_DIRS=/src/woff2/brotli/c/include/ \
    -DBROTLIENC_LIBRARIES=/src/build/brotli-wasm/libbrotlienc.a \
    -DBROTLIDEC_LIBRARIES=/src/build/brotli-wasm/libbrotlidec.a \
    && \
    emmake make -j2 woff2enc woff2dec

RUN chmod -R 777 /emsdk/upstream/emscripten/cache
