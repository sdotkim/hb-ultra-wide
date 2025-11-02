import GLib from "gi://GLib";
import Clutter from "gi://Clutter";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
// import Gio from "gi://Gio";
// import Util from "resource:///org/gnome/shell/util.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

let home = GLib.get_home_dir();
let ydotoolPath = `${home}/.local/bin/ydotool`;

export default class UltraWide extends Extension {
    #settings;
    #scrollSignal;
    #zones;
    #mh;
    #mw;

    // Lazy-load settings
    get settings() {
        if (!this.#settings) {
            this.#settings = this.getSettings();
        }
        return this.#settings;
    }

    enable() {
        if (!Main.wm) return;

        const monitor = global.display.get_primary_monitor();
        let {x: mx, y:my, width: mw, height: mh} = global.display.get_monitor_geometry(monitor);
        this.#mh = mh;
        this.#mw = mw;
        this.#zones = this.settings.get_int("display-zones");

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

    handleScroll(actor, event) {
        if (event.type() !== Clutter.EventType.SCROLL) return Clutter.EVENT_STOP;

        const scrollDirection = event.get_scroll_direction()
        if (scrollDirection == Clutter.ScrollDirection.SMOOTH) return Clutter.EVENT_STOP;

        const position = this.getNewPosition(scrollDirection? -1: 1)
        this.moveCursor(...position);

        return Clutter.EVENT_STOP;
    }

    getNewPosition(direction) {
        let [cx, cy] = global.get_pointer();

        // compute zone sizes
        const zoneWidth = Math.floor(this.#mw / this.#zones);

        // detect current zone
        let currentZone = Math.floor(cx / zoneWidth) + 1;

        // compute target zone
        let newZone = currentZone + direction;
        newZone = Math.max(1, Math.min(this.#zones, newZone));

        // compute target absolute coordinate
        const targetX = Math.floor((newZone - 1) * zoneWidth + zoneWidth / 2);
        const targetY = Math.floor(this.#mh / 2);

        // convert to relative movement for ydotool
        const dx = targetX - cx;
        const dy = targetY - cy;

        return [dx, dy];
    }

    moveCursor(dx, dy) {
        GLib.spawn_async(
            null,
            [ydotoolPath, 'mousemove', '-x', `${dx.toString()}`, '-y', `${dy.toString()}`],
            null,
            GLib.SpawnFlags.SEARCH_PATH,
            null
        );
    }
}
