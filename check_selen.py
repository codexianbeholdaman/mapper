from selenium import webdriver

GECKODRIVER_PATH = "/snap/bin/geckodriver"

service_data = {'executable_path':GECKODRIVER_PATH} if GECKODRIVER_PATH else {}
driver_service = webdriver.FirefoxService(**service_data)
driver = webdriver.Firefox(service=driver_service)
