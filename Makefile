.PHONY: install ydotool.build

install:
	./install.sh

ydotool.build:
	podman build --target build -t ydotool-build-stage \
		--build-arg CACHE_BUSTER=$(date +%s) \
		-f container/Containerfile.buld-ydotool .
	podman create --name yb ydotool-build-stage
	podman cp yb:/src/ydotool/build/ydotool   ./dist/ydotool
	podman cp yb:/src/ydotool/build/ydotoold  ./dist/ydotoold
	podman rm yb
