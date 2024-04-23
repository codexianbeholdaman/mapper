/**
 * @jest-environment jsdom
 */
import {Application} from '../../src/seminal.js';
import * as configs from '../../src/config.js';
import {full_mock, click_event, Document_utils, Map_data_parser, Application_utils, set_configs} from './fundamental.js';

test('script_C', () => {
	set_configs();

	document.write(full_mock);
	var app = new Application();
	var doc = new Document_utils(document);
	doc.add_map('a');
	doc.click_on_map('a');

	doc.click_on_point(7, 5);

	doc.auxclick_set([0, 4], 'scripts_text', 'C;N');
	doc.auxclick_set([15, 7], 'scripts_text', 'C;S');
	doc.auxclick_set([13, 0], 'scripts_text', 'C;W');
	doc.auxclick_set([6, 15], 'scripts_text', 'C;E');

	doc.chain_directions('UUUUUUULURU');
	expect(app.current_state.marked._signature).toStrictEqual('15 4');
	doc.chain_directions('RUUURU');
	expect(app.current_state.marked._signature).toStrictEqual('0 7');

	doc.click_on_point(13, 2);
	doc.chain_directions('LUUU');
	expect(app.current_state.marked._signature).toStrictEqual('13 15');
	doc.chain_directions('RUUUUUUURU');
	expect(app.current_state.marked._signature).toStrictEqual('6 0');
});
