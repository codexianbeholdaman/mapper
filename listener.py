from pynput import keyboard
import subprocess
BROWSER_NAME = "Mozilla";

mozilla_pid = subprocess.run(["xdotool", "search", BROWSER_NAME], capture_output=True).stdout
mozilla_pid = int(mozilla_pid.decode("utf-8"))
keys_mapping = {
        keyboard.Key.up: "Up",
        keyboard.Key.down: "Down",
        keyboard.Key.left: "Left",
        keyboard.Key.right: "Right",
        keyboard.KeyCode.from_char('y'): 'y',
        keyboard.KeyCode.from_char('-'): 'j',
        keyboard.KeyCode.from_char('+'): 't',
        keyboard.KeyCode.from_char('/'): 'd',
        keyboard.KeyCode.from_char('*'): 'w'
}

def on_press(key):
    if key in keys_mapping:
        subprocess.run(["xdotool", "key", "--window", str(mozilla_pid), keys_mapping[key]])

with keyboard.Listener(on_press=on_press) as listener:
    listener.join()

listener.start()
