all:
	mkdir -p /src/woff2-encoder/build
	
	emcc --bind -O3 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s SINGLE_FILE=1 \
		-s NODEJS_CATCH_REJECTION=0 \
		-s NODEJS_CATCH_EXIT=0 \
		-s MODULARIZE=1 \
		-s EXPORT_ES6=1 \
		-s ENVIRONMENT=web \
		-I/src/woff2/include/ \
		/src/build/woff2-wasm/libwoff2common.a \
		/src/build/brotli-wasm/libbrotlicommon.a \
		/src/woff2-encoder/bindings/woff2_compress.cc \
		/src/build/woff2-wasm/libwoff2enc.a \
		/src/build/brotli-wasm/libbrotlienc.a \
		/src/woff2-encoder/bindings/woff2_decompress.cc \
		/src/build/woff2-wasm/libwoff2dec.a \
		/src/build/brotli-wasm/libbrotlidec.a \
		-o /src/woff2-encoder/build/woff2-wasm.js
		
	cp /src/woff2-encoder/bindings/bindings.d.ts /src/woff2-encoder/build/woff2-wasm.d.ts
