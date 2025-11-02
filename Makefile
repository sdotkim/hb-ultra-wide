.PHONY: ydt.build ydt.install ext.deploy ext.schema ext.test

ydt.build:
	podman build --target build -t ydotool-build-stage \
		--build-arg CACHE_BUSTER=$(date +%s) \
		-f container/Containerfile.buld-ydotool .
	podman create --name yb ydotool-build-stage
	podman cp yb:/src/ydotool/build/ydotool   ./dist/ydotool
	podman cp yb:/src/ydotool/build/ydotoold  ./dist/ydotoold
	podman rm yb

ydt.install:
	./install.sh


ext.test:
	export G_MESSAGES_DEBUG=all
	export MUTTER_DEBUG_DUMMY_MODE_SPECS=2160x1400
	export SHELL_DEBUG=all
	dbus-run-session -- \
		gnome-shell --nested \
					--wayland

ext.deploy: ext.schema
	cp -R extension/* ~/.local/share/gnome-shell/extensions/ultra-wide@sdotkim


ext.schema:
	glib-compile-schemas extension/schema
