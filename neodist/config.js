//A button for accessing data of a point; options:
// auxclick - middle mouse click
// contextmenu - right mouse click
const _CONFIG_ACCESS_POINT_DATA = 'auxclick';
//Map, for which terrains defined in 'game_terrain.js' file will be used
const _CONFIG_GAME = 'MMXeen';
//Folder, in which map data is stored. It is added as a prefix to the image path. Right now it is used only to get screen captures
//For example: if you want to access image located in ./a/b/c/d/e/f.png, you can:
// define _CONFIG_PREFIX as a/ and add a line ./b/c/d/e/f.png to images
// define _CONFIG_PREFIX as a/b/c/d/ and add a line ./e/f.png to images
//The slash at the end is necessary - the trivial string concatenation was used
const _CONFIG_PREFIX = './map_data/';
