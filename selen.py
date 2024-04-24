from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from pynput import keyboard
import os

GECKODRIVER_PATH = "/snap/bin/geckodriver"
MAPS_DIR = os.path.join(os.path.dirname(__file__), 'map_data', 'maps')

KEY_STOP_INTERCEPTING = '`'
KEY_START_INTERCEPTING = '!'

service_data = {'executable_path':GECKODRIVER_PATH} if GECKODRIVER_PATH else {}
driver_service = webdriver.FirefoxService(**service_data)
options = Options()
firefox_profile = FirefoxProfile()
firefox_profile.set_preference("browser.download.manager.showWhenStarting", True)
firefox_profile.set_preference("browser.download.manager.focusWhenStarting", True)
firefox_profile.set_preference("browser.download.manager.useDownloadDir", False)
firefox_profile.set_preference("browser.download.useDownloadDir", False)
firefox_profile.set_preference("browser.download.folderList", 2)
firefox_profile.set_preference("browser.download.dir", MAPS_DIR)
options.profile = firefox_profile

driver = webdriver.Firefox(service=driver_service, options=options)

path = os.path.join(os.path.dirname(__file__), 'neodist', 'index.html')
driver.get(f'file://{path}')

keys_mapping = {
        keyboard.Key.up: Keys.ARROW_UP,
        keyboard.Key.down: Keys.ARROW_DOWN,
        keyboard.Key.left: Keys.ARROW_LEFT,
        keyboard.Key.right: Keys.ARROW_RIGHT,
        keyboard.KeyCode.from_char('@'): Keys.BACKSPACE,
        keyboard.KeyCode.from_char('y'): 'y',
        keyboard.KeyCode.from_char('+'): 't',
        keyboard.KeyCode.from_char('/'): 'm',
}

dead = False
def on_press(key):
    global dead
    if key == keyboard.KeyCode.from_char(KEY_STOP_INTERCEPTING):
        dead = True
    elif key == keyboard.KeyCode.from_char(KEY_START_INTERCEPTING):
        dead = False
    elif key in keys_mapping and not dead:
        action = ActionChains(driver)
        action.send_keys(keys_mapping[key]).perform()

with keyboard.Listener(on_press=on_press) as listener:
    listener.join()
