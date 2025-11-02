import GLib from "gi://GLib";
import Clutter from "gi://Clutter";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
// import Gio from "gi://Gio";
// import Util from "resource:///org/gnome/shell/util.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class UltraWide extends Extension {
    #settings;
    #scrollSignal;

    // Lazy-load settings
    get settings() {
        if (!this.#settings) {
            this.#settings = this.getSettings();
        }
        return this.#settings;
    }

    enable() {
        if (!Main.wm) return;

        // Register keybinding
        Main.wm.addKeybinding(
            "cursor-scroll-hotkey",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            this.enterScrollMode.bind(this)
        );
    }

    disable() {
        if (!Main.wm) return;

        Main.wm.removeKeybinding("cursor-scroll-hotkey");
        this.exitScrollMode();
    }

    enterScrollMode() {
        if (this.#scrollSignal) return; // already active

        this.#scrollSignal = global.stage.connect("scroll-event", this.handleScroll.bind(this));

        // Auto-exit after 5 seconds
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
            this.exitScrollMode();
            return GLib.SOURCE_REMOVE;
        });
    }

    exitScrollMode() {
        if (this.#scrollSignal) {
            global.stage.disconnect(this.#scrollSignal);
            this.#scrollSignal = null;
        }
    }

    handleScroll(event) {
        const delta = 50;
        const direction = event.get_scroll_direction();

        if (direction === Clutter.ScrollDirection.UP) {
            this.moveCursor(delta, 0);
        } else if (direction === Clutter.ScrollDirection.DOWN) {
            this.moveCursor(-delta, 0);
        }

        return Clutter.EVENT_STOP;
    }

    moveCursor(dx, dy) {
        // Use GLib to spawn the external tool
        GLib.spawn_command_line_async(`ydotool mousemove_relative ${dx.toString()} ${dy.toString()}`);
    }
}
