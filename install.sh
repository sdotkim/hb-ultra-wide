#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------------------------
# CONFIG
# ----------------------------------------------------------------
SERVICE_SOURCE="./dist/ydotoold.service"               # must exist in same directory
SERVICE_TARGET="$HOME/.config/systemd/user/ydotoold.service"
BIN_YDOTOOL="./dist/ydotool"
BIN_DAEMON="./dist/ydotoold"
INSTALL_DIR="$HOME/.local/bin"                      # can be customized
UINPUT_GROUP="uinput"

# ----------------------------------------------------------------
echo "[1/8] Checking service file…"
# ----------------------------------------------------------------
if [[ ! -f "$SERVICE_SOURCE" ]]; then
    echo "ERROR: Missing $SERVICE_SOURCE"
    echo "Place ydotoold.service next to this script."
    exit 1
fi


# ----------------------------------------------------------------
echo "[2/8] Creating group 'uinput' (if needed)…"
# ----------------------------------------------------------------
if ! getent group "$UINPUT_GROUP" >/dev/null; then
    sudo groupadd --system "$UINPUT_GROUP"
fi


# ----------------------------------------------------------------
echo "[3/8] Adding current user to 'uinput' group…"
# ----------------------------------------------------------------
sudo usermod -aG "$UINPUT_GROUP" "$USER"


# ----------------------------------------------------------------
echo "[4/8] Installing ydotool binaries…"
# ----------------------------------------------------------------
sudo install -m 0755 "$BIN_YDOTOOL"  "$INSTALL_DIR/ydotool"
sudo install -m 0755 "$BIN_DAEMON"   "$INSTALL_DIR/ydotoold"


# ----------------------------------------------------------------
echo "[5/8] Persistent udev permission for /dev/uinput…"
# ----------------------------------------------------------------
sudo tee /etc/udev/rules.d/99-uinput.rules >/dev/null <<EOF
KERNEL=="uinput", MODE="0660", GROUP="$UINPUT_GROUP"
EOF

sudo udevadm control --reload-rules
sudo udevadm trigger


# ----------------------------------------------------------------
echo "[6/8] Creating user-level systemd directory…"
# ----------------------------------------------------------------
mkdir -p "$HOME/.config/systemd/user"


# ----------------------------------------------------------------
echo "[7/8] Copying systemd service to user-level directory…"
# ----------------------------------------------------------------
cp "$SERVICE_SOURCE" "$SERVICE_TARGET"


# ----------------------------------------------------------------
echo "[8/8] Enabling & starting user-level systemd service…"
# ----------------------------------------------------------------
systemctl --user daemon-reload
systemctl --user enable --now ydotoold.service


echo "-------------------------------------------------------"
echo "User-level ydotoold setup complete."
echo "Service file: $SERVICE_TARGET"
echo "You must log out/in for group changes to apply."
echo "Check status: systemctl --user status ydotoold"
echo "Logs:         journalctl --user -u ydotoold -f"
echo "-------------------------------------------------------"
