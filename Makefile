all:
	mkdir -p /src/woff2-encoder/build

	# encoder + decoder

	emcc -lembind -O3 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s SINGLE_FILE=1 \
		-s MODULARIZE=1 \
		-s EXPORT_ES6=1 \
		-s ENVIRONMENT=web,worker \
		-I/src/woff2/include/ \
		/src/build/woff2-wasm/libwoff2common.a \
		/src/build/brotli-wasm/libbrotlicommon-static.a \
		/src/woff2-encoder/bindings/woff2_compress.cc \
		/src/build/woff2-wasm/libwoff2enc.a \
		/src/build/brotli-wasm/libbrotlienc-static.a \
		/src/woff2-encoder/bindings/woff2_decompress.cc \
		/src/build/woff2-wasm/libwoff2dec.a \
		/src/build/brotli-wasm/libbrotlidec-static.a \
		-o /src/woff2-encoder/build/woff2-wasm.js

	cp /src/woff2-encoder/bindings/bindings.d.ts /src/woff2-encoder/build/woff2-wasm.d.ts

	# decoder

	emcc -lembind -O3 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s SINGLE_FILE=1 \
		-s MODULARIZE=1 \
		-s EXPORT_ES6=1 \
		-s ENVIRONMENT=web,worker \
		-I/src/woff2/include/ \
		/src/build/woff2-wasm/libwoff2common.a \
		/src/build/brotli-wasm/libbrotlicommon-static.a \
		/src/woff2-encoder/bindings/woff2_decompress.cc \
		/src/build/woff2-wasm/libwoff2dec.a \
		/src/build/brotli-wasm/libbrotlidec-static.a \
		-o /src/woff2-encoder/build/woff2-decompress-wasm.js

	cp /src/woff2-encoder/bindings/decompress-bindings.d.ts /src/woff2-encoder/build/woff2-decompress-wasm.d.ts
