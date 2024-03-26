/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, set_configs} from './fundamental.js';


test('backspacing', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();

	var doc = new Document_utils(document);
	doc.add_map('alpha');
	doc.add_map('beta');
	doc.click_on_map('alpha');
	doc.click_on_point(7, 5);

	doc.auxclick_on_point(6, 5);
	document.getElementById('scripts_text').value = 'P;N;beta;7 1';
	doc.auxclick_on_point(6, 5);

	doc.press_key('ArrowUp');
	doc.press_key('y');

	doc.press_key('ArrowUp');
	doc.press_key('ArrowUp');

	doc.auxclick_on_point(4, 1);
	document.getElementById('scripts_text').value = 'P;N;alpha;10 8';
	doc.auxclick_on_point(12, 12);

	doc.press_key('ArrowUp');
	doc.press_key('y');

	doc.auxclick_on_point(9, 8);
	document.getElementById('scripts_text').value = 'P;N;_S;6 5';
	doc.auxclick_on_point(12, 12);
	doc.press_key('ArrowUp');
	doc.press_key('y');

	var data_alpha_end = new Map_data_parser(app.create_data_dump());
	expect(data_alpha_end.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5', '10 8', '9 8']));

	doc.press_key('Backspace');
	doc.press_key('Backspace');
	doc.press_key('Backspace');
	doc.press_key('ArrowRight');
	doc.press_key('ArrowUp');
	doc.press_key('ArrowUp');

	var data_beta_end = new Map_data_parser(app.create_data_dump());
	expect(data_beta_end.get_all_usable()).toStrictEqual(new Set(['7 1', '6 1', '5 1', '4 1', '4 2', '4 3']));

	for (var i=0; i<7; i+=1){
		doc.press_key('Backspace');
	}
	var data_alpha_start = new Map_data_parser(app.create_data_dump());
	expect(data_alpha_start.get_all_usable()).toStrictEqual(new Set(['7 5', '6 5']));
});
