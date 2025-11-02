.PHONY: ydotool.build

ydotool.build:
	podman build --target build -t ydotool-build-stage \
		-f container/Containerfile.buld-ydotool .
	podman create --name yb ydotool-build-stage
	podman cp yb:/src/ydotool/build/ydotool   ./bin/ydotool
	podman cp yb:/src/ydotool/build/ydotoold  ./bin/ydotoold
	podman rm yb
	podman rmi ydotool-build-stage
