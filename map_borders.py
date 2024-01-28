import json

for letter in ['A', 'B', 'C', 'D', 'E', 'F']:
    for digit in [1, 2, 3, 4]:
        map_name = f'{letter}{digit}'
        with open(f'map_data/maps/MMXeen/{map_name}.txt') as map_:
            proper_map = json.load(map_)
            points = proper_map['points']
            for x in points:
                signature = [int(_) for _ in x.split(' ')]
                proper_scripts = [_ for _ in points[x]['scripts'].split('\n') if _!='' and not _.startswith('WS')]
                if signature[0] == 0 and digit !=4:
                    proper_scripts.append('WS;S')
                if signature[1] == 0 and letter!='A':
                    proper_scripts.append('WS;W')

                if signature[0] == 15 and digit!=1:
                    proper_scripts.append('WS;N')
                if signature[1] == 15 and letter!='F':
                    proper_scripts.append('WS;E')
                points[x]['scripts'] = '\n'.join(proper_scripts)
            new_points = json.dumps(proper_map)


        with open(f'map_data/maps/MMXeen/{map_name}.txt', 'w') as map_:
            map_.write(new_points)
