from bs4 import BeautifulSoup

with open('./dist/index.html') as index:
    base = index.read()
parsed_base = BeautifulSoup(base, 'html.parser')
parsed_base.script.extract()


scripts = ['config.js', 'game_terrain.js', 'presentation.js', 'seminal.js', 'index.js']
build_directory = './neodist'

for script in scripts:
    with open(f'./src/{script}') as _:
        script_text = _.read()

    _ = script_text.split('\n')
    _ = [x for x in _ if 'import' not in x]
    new_script = '\n'.join(_)
    new_script = new_script.replace('export ', '')

    with open(f'{build_directory}/{script}', 'w') as new_script_file:
        new_script_file.write(new_script)

    tag = parsed_base.new_tag('script', src=f'./{script}')
    parsed_base.body.append(tag)

with open(f'{build_directory}/index.html', 'w') as neue_index:
    neue_index.write(parsed_base.prettify())
