.PHONY: install ydotool.build

install:
	./install.sh

ydotool.build:
	podman build --target build -t ydotool-build-stage \
		-f container/Containerfile.buld-ydotool .
	podman create --name yb ydotool-build-stage
	mkdir dist
	podman cp yb:/src/ydotool/build/ydotool   ./dist/ydotool
	podman cp yb:/src/ydotool/build/ydotoold  ./dist/ydotoold
	podman rm yb
	podman rmi ydotool-build-stage
