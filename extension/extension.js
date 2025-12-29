import GLib from "gi://GLib";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
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

        // Register keybindings
        Main.wm.addKeybinding(
            "cursor-move-left",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            this.kb.bind(this, -1)
        );
        Main.wm.addKeybinding(
            "cursor-move-right",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL,
            this.kb.bind(this, 1)
        );
    }

    disable() {
        if (!Main.wm) return;

        Main.wm.removeKeybinding("cursor-move-left");
        Main.wm.removeKeybinding("cursor-move-right");
    }

    kb(direction) {
        const position = this.getNewPosition(direction)
        this.moveCursor(...position);
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
