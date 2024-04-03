/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';


test('ground_truth', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.click_on_map('alpha');

	doc.click_on_point(7, 5);
	for (var i=0; i<3; i+=1){
		doc.chain_directions('UR');
	}
	doc.press_key('t'); //set ground truth
	doc.chain_directions('UURUU');

	Application_utils.check_all_fields(app, ['7 5', '6 5', '6 6', '7 6']);

	expect(app.current_state.marked._coordinates).toStrictEqual({'row':6, 'column':6});
	doc.auxclick_on_point(7, 5);
	document.getElementById('East_border').checked = true;
	doc.auxclick_on_point(7, 5);
	doc.chain_directions('RRURU');
	expect(app.current_state.marked._coordinates).toStrictEqual({'row':7, 'column':6});
	doc.chain_directions('RULULULU'); //pass through border
	expect(app.current_state.marked._coordinates).toStrictEqual({'row':7, 'column':6});
});
