EXT_DIR := ~/.local/share/gnome-shell/extensions/ultra-wide@sdotkim

.PHONY: ydt.build ydt.install ext.deploy ext.schema ext.test ext.reload

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

ext.reload: ext.schema ext.deploy
	@echo "Reloading UltraWide extension in running GNOME Shell..."
	gnome-extensions disable ultra-wide@sdotkim
	gnome-extensions enable ultra-wide@sdotkim

ext.test:
	export G_MESSAGES_DEBUG=all
	export MUTTER_DEBUG_DUMMY_MODE_SPECS=2160x1400
	export SHELL_DEBUG=all
	dbus-run-session -- gnome-shell --nested --wayland

ext.deploy: ext.schema
	mkdir -p $(EXT_DIR)
	cp -R extension/* $(EXT_DIR)


ext.schema:
	glib-compile-schemas extension/schemas
