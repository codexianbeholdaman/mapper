var map_element_height = 50;
var map_element_width = 200;
var map_element_font = Math.floor(map_element_width*0.08);

var point_size = 50;
var arrow_size = Math.floor(point_size*0.4);
var single_distance_teleport = Math.floor(point_size/6);
var point_shortcut_font_size = Math.floor(point_size*7/24);

var marking_size = Math.floor(point_size*0.5);

var standard_style = {
	'display':'inline-block',
	'position':'relative',
	'width':`${point_size}px`,
	'height':`${point_size}px`,
	'backgroundColor':'gray',
	'verticalAlign':'middle',
	'lineHeight':`${point_size}px`,
	'text-align':'center',
	'border': '1px solid black'
};
var map_element_style = {
	'height':`${map_element_height}px`,
	'width':`${map_element_width}px`,
	'textAlign':'center',
	'color':'white',
	'backgroundColor':'#880000',
	'verticalAlign':'middle',
	'lineHeight':`${map_element_height}px`,
	'fontSize':`${map_element_font}px`,
	'display':'inline-block',
	'fontFamily':'Arial'
};
var arrowy_style = {
	'zIndex': 2,
	'position': 'absolute',
	'top': 0,
	'left': 0,
	'border': '',
	'color': 'red',
	'backgroundColor': 'rgba(0, 0, 0, 0)',
	'fontSize': `${arrow_size}px`
}
var inputter_style = {
	'position':'absolute',
	'width':`${point_size}px`,
	'height':`${point_size-15}px`, //czory - czemu funkcjonalne?
	'bottom':0,
	'left':0,
	'border': 'none',
	'backgroundColor':'rgba(0, 0, 0, 0)',
	'fontSize':`${point_shortcut_font_size}px`,
	'textAlign':'center',
	'display':'inline',
	'fontFamily':'Arial'
}
var point_of_entry_style = {
	'lineHeight': '50px',
	'height': '50px',
	'width': '50px',
	'backgroundColor': '#331100',	
	'color': 'white'
}
var marking_style = {
	'border': '',
	'position': 'absolute',
	'width': `${marking_size}px`,
	'height': `${marking_size}px`,
	'top': 0,
	'left': 0,
	'background': 'rgba(0, 0, 0, 0)'
}
var teleports_style = {
	'left':'',
	'right': 0,
	'width':`${3*single_distance_teleport}px`,
	'height':`${3*single_distance_teleport}px`,
}
var mini_teleport_style = {
	'width':`${single_distance_teleport}px`,
	'height':`${single_distance_teleport}px`,
	'position':'absolute',
	'background':'rgba(0, 0, 0, 0)',
	'lineHeight':`${single_distance_teleport}px`,
	'fontSize':`${single_distance_teleport}px`
}

function assign_style_to_element(element, style){
	for (var style_part in style){
		element.style[style_part] = style[style_part];
	}
}
