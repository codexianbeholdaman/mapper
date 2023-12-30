import shutil
import os

CAPS_FOLDER = f'{os.environ["HOME"]}/.dosbox/capture'
PREFIX = 'mm2_'
DESTINATION = './caps/MM2/'

all_files = os.listdir(CAPS_FOLDER)
all_prefixed = sorted([x for x in all_files if x[0:len(PREFIX)] == PREFIX], key=lambda x: int(x.split('.')[0][len(PREFIX):]))
last_prefixed = all_prefixed[-1]

shutil.copy(os.path.join(CAPS_FOLDER, last_prefixed), DESTINATION)
proper_path = os.path.join(DESTINATION, last_prefixed)
print(proper_path)
