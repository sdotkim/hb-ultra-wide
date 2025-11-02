const { Gio, GLib, Clutter, Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;

let settings;
let scrollSignal;

function init() {
    settings = new Gio.Settings({ schema: 'org.gnome.shell.extensions.ultra-wide' });
}

function enable() {
    Main.wm.addKeybinding(
        'cursor-scroll-hotkey',
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.NORMAL,
        enterScrollMode
    );
}

function disable() {
    Main.wm.removeKeybinding('cursor-scroll-hotkey');
    exitScrollMode();
}

function enterScrollMode() {
    if (scrollSignal) return; // already active

    scrollSignal = global.stage.connect('scroll-event', (actor, event) => {
        handleScroll(event);
        return Clutter.EVENT_STOP; // prevent propagation
    });

    // auto-exit after 5 seconds
    GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
        exitScrollMode();
        return GLib.SOURCE_REMOVE;
    });
}

function exitScrollMode() {
    if (scrollSignal) {
        global.stage.disconnect(scrollSignal);
        scrollSignal = null;
    }
}

function handleScroll(event) {
    const delta = 50; // pixels per scroll
    const direction = event.get_scroll_direction();

    if (direction === Clutter.ScrollDirection.UP) {
        moveCursor(delta, 0); // move right
    } else if (direction === Clutter.ScrollDirection.DOWN) {
        moveCursor(-delta, 0); // move left
    }
}

function moveCursor(dx, dy) {
    Util.spawn(['ydotool', 'mousemove_relative', dx.toString(), dy.toString()]);
}
