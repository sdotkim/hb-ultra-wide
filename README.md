## Move cursor horisontally on ultrawide monitor

- ydotool used to emit mouse move events
- gnome shell-extension
    - bind hotkey
    - gather display info and current cursor position
    - invokes ydotool command


NOTE: disable mouse acceleration in gnome settings to prevent mouse cursor jumping eratically.

### Usage
run `make ydt.build && make ext.deploy && make ydt.install`
logout

### Roadmap
1. Add prefs UI to configure keyboard shortcut
    - check gnome global keyboard shortcut to prevent overlap
