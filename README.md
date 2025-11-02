Move cursor horisontally on ultrawide monitor

- ydotool used to emit mouse move events
- shell-extension
    - captures hotkey
    - gathers display info and current cursor position
    - invokes ydotool command


NOTE: disable mouse acceleration in gnome settings to prevent mouse cursor jumping eratically.


### Roadmap
1. Add prefs UI to configure keyboard shortcut
    - check gnome global keyboard shortcut to prevent overlap
