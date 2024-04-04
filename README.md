Automapper for Might & Magic 1, 2, World of Xeen, and some Gold Box titles.

# Overview
To run the mapper:
1. Run *neodist/index.html* (probably in a browser).
2. Run *listener.py* (perhaps after tinkering with it, depending on the operating system).

# Quickstart
1. Create a game entry in a GAME\_DATA object looking like this:  
```
	'Game name':{
		'terrains':{
		},
		'default map size':[16, 16],
	}
```  
Where the 'default map size' option denotes default size of a map (this is relevant only for new maps, you can change it later).

2. In a neodist/config.js file, set variable `_CONFIG_GAME` to the same game name (like this):  
```
const _CONFIG_GAME = 'Game name';
```
3. Run *index.html* in a browser. Create a map by entering the name and clicking on a '+' button.

# The mapper part
In order to be able to save the map, you need to create it by giving it the name and clicking a '+' button.  
In order to change its name, click on the *Rename* button while the map is active, change the value of the input field to a desired name, then click the *Rename* button again.  
In order to place a pointer on the map, click on the map.  
For moving the pointer, use the arrow keys.  
In order to move back (possibly overriding the last changes made by a pointer), use backspace.  
In order to give a description (or script it, or manually give a border to it) to a field, click on it using a middle mouse button (later referred to as 'focusing' on it).  
In order to disallow making changes to the map by a pointer, use the *ground truth mode*.  
A 'fly' signature can be defined in order to place a pointer on a given map. After defining a 'fly' value, clicking on the *F* button by the map name results in being transported to a given signature without changing direction.  
A 'teleport' signature and a direction can be defined in order to place a pointer on a given map. After defining a 'teleport' value, clicking on the *F* button by the map name results in being transported to a given signature with direction defined by a value given. This field can be set to *new_y new_x;new_direction*; for example, after setting it to *4 5;W* the button 'T' teleports to a field '4 5' on a given map facing west.  
A map can be cut using the *Default cut* button. Using the button leads to a map with padding cut from it (fields on the map's borders without any written text or being in use).  
A map can be translated; in order to do that, set the value in the *translate* field to 'delta\_y,delta\_x' and switch the map, perhaps to itself. The updated map will move field 'y x' to the position 'y+delta\_y x+delta\_x'.  

To change the grid size, change the *map_size* parameter. It can be changed dynamically, and, as expected, it can result in a loss of data (so it might be preferred to save before changing the map size).  
To apply any changes to fly, teleport, or a transform, the mp needs to be changed (maybe to itself - by clicking on any map on the belt with maps).
To make changes to a field visible on a map using a focus, change a focus (maybe to itself).

A movement model can be changed between *overhead* (using *left arrow* moves characters to the left) or *blobber* (using *left arrow* changes the direction characters face).
The *Order* button allows to order maps according to:
- The 'Order' parameter defined for a map, sorted lexicographically.
- The map name, sorted lexicographically

For example, if there are four maps:
- name:a, order:1 5
- name:b, order:1 4
- name:c, order:*undefined*
- name:d, order:*undefined*

Then the order of maps after clicking the button *Order* will be c,d,b,a

## Scripts
Scripts allow to programatically move a pointer to a different map and/or a different field, possibly changing its direction. Fields can contain multiple scripts, each separated by a newline. While describing scripts, following definitions were frequently used:  
&nbsp;&nbsp;*signature* refers to 'y x' coordinates of a field,  
&nbsp;&nbsp;*direction* refers to the direction of a pointer - either N,W,E or S (north, west, east or south).  
&nbsp;&nbsp;*new_direction* refers to the new direction of a pointer - either N,W,E,S or R. By default (if not specified), it is equal to *direction*. R specifies reversing the pointer - for example, if the direction is 'N', then the *new_direction* equal to 'R' is equivalent to 'S'.  

The following types of scripts can be defined:  
&nbsp;T;*map_name*;*signature*[;*new_direction*]  
&nbsp;&nbsp;Moving on the field results in being teleported to another field defined by *signature* on the map *map_name* facing the *new_direction*.  
&nbsp;&nbsp;For example,  
&nbsp;&nbsp;&nbsp;T;B3;13 3  
&nbsp;&nbsp;Moving on a field with this script leads to a field with signature 13,3 on a map B3.

  
&nbsp;P;*direction*;*map_name*;*signature*[;*new_direction*]  
&nbsp;&nbsp;Being on a given field and pressing *y* while the pointer is directed in a correct way results in transition to another field defined by *signature* on the map *map_name* facing the *new_direction*.  
&nbsp;&nbsp;For example,  
&nbsp;&nbsp;&nbsp;P;N;B3;13 5  
&nbsp;&nbsp;Clicking 'y' on a given field while facing north field leads to a map B3, signature 13,5, facing north. It is equivalent to:  
&nbsp;&nbsp;&nbsp;P;N;B3;13 5;N  

&nbsp;W;*direction*;*map_name*;*signature*[;*new_direction*]  
&nbsp;&nbsp;Being on a given field and moving forward while the pointer is directed in a correct way results in transition to another field defined by *signature* on the map *map_name* facing the *new_direction*.  
&nbsp;&nbsp;For example,  
&nbsp;&nbsp;&nbsp;W;N;B3;13 5  
&nbsp;&nbsp;Moving forward on a given field while facing north field leads to a map B3, signature 13,5, facing north. It is equivalent to:  
&nbsp;&nbsp;&nbsp;W;N;B3;13 5;N  

  
&nbsp;WS;*direction*  
&nbsp;&nbsp;Being on a given field and moving in a given direction results in transition between maps in the overworld as in the game's system.  
&nbsp;&nbsp;For example,  
&nbsp;&nbsp;&nbsp;WS;N  
&nbsp;&nbsp;On a map B3, signature 15,7 leads to a map B2, signature 0,7.  
  
&nbsp;R;*direction*  
&nbsp;&nbsp;Pressing *y* on a given field while pointer is directed in a *direction* reverses the pointer.  
&nbsp;&nbsp;For example,  
&nbsp;&nbsp;&nbsp;R;S  
&nbsp;&nbsp;Changes direction of a pointer from *S* to *N* after pressing *y*.

### Possible shortcuts:  
Setting the *signature* to _P is equivalent to setting the signature to a current field. For example,  
&nbsp;P;N;X;_P  
On a field with signature '7 11' is equivalent to:  
&nbsp;P;N;X;7 11


Setting the *map_name* to \_S (self) is equivalent to setting the map name to a current map name. For example,  
&nbsp;&nbsp;&nbsp;T;\_S;7 0  
&nbsp;&nbsp;On a field on a map called 'XYZ' is equivalent to:  
&nbsp;&nbsp;&nbsp;T;XYZ;7 0  

Setting the *map_name* to \_UP or \_DOWN is equivalent to setting the map name to a current map name with the last number in a name replaced by a number higher or lower by one, respectively. For example,  
&nbsp;&nbsp;&nbsp;P;N;\_DOWN;7 0  
&nbsp;&nbsp;On a field on a map called 'XYZ 13' is equivalent to:  
&nbsp;&nbsp;&nbsp;P;N;XYZ 12;7 0  
While  
&nbsp;&nbsp;&nbsp;P;N;\_UP;7 0  
&nbsp;&nbsp;On a field on a map called 'XYZ 13' is equivalent to:  
&nbsp;&nbsp;&nbsp;P;N;XYZ 14;7 0  

One may specify multiple directions for a single script, written one by one: for example:  
&nbsp;&nbsp;&nbsp;P;NWE;XYZ;7 0  
&nbsp;&nbsp;On a field on a map called 'XYZ' is equivalent to:  
&nbsp;&nbsp;&nbsp;P;N;XYZ;7 0;N  
&nbsp;&nbsp;&nbsp;P;E;XYZ;7 0;E  
&nbsp;&nbsp;&nbsp;P;W;XYZ;7 0;W  
The order of directions is immaterial.



## Other controls:  
&nbsp;t - switch ground truth mode.  
&nbsp;backspace - undo last movement.  
&nbsp;j - jump (not implemented as in the game - always 2 steps forward, just a convenience)  

# The auto part
The "Auto" part consists of a single file - *listener.py* ; all it does is:
1. Capturing certain key presses (directional buttons and 'y' in particular) - the ones present on the left side of *keys_mapping* dictionary.
2. Sending a value for a given key (the one on the right side of the *keys_mapping* dictionary) to a Mozilla process.
The file uses *xdotool* for sending keys - so, if you don't have a system allowing you to use xdotool (such as Windows), you'll have to tinker (probably with autohotkey).

# General config
Right now, the *neodist/config.js* file allows one to specify the following options:
1. The mouse button allowing access to the data of a point (a field) on a map: either the middle mouse button (auxclick) or the right mouse click (contextmenu)
2. The game, configuration for which is utilized; 
3. The prefix for finding images, as explained in the file itself.

# Game-specific config
All configurations for a single game can be defined in the *neodist/game_terrains.js* file.
1. *terrains*: Terrains can be defined by specifying the color of a field and a button, pressing which leads to switching a given terrain of a field.
2. *default_map_size*: Default size of a map.
3. *y_order*: The order of y-coordinates. If equal to 'ascending', then moving SOUTH is equivalent to moving towards a higher y coordinate (like in the Pool of Radiance). When omitted, it is treated as 'descending'.
4. *backspace*: If not set, using *arrow down* moves the pointer one step backwards. If set to *revert*, pressing the *arrow down* button reverts the pointer. 

# Dependencies
In order to use the auto part of automapper, one needs:
1. Linux distribution, and, if you don't want to tinker, one with Xorg:  
   https://en.wikipedia.org/wiki/X.Org_Server
2. Python installed: on any linux distribution it should be already present.
3. xdotool installed: details about installation depending on distribution are located here: https://github.com/jordansissel/xdotool#installation  
   If you have Wayland rather than Xorg, you will have to manually change references to xdotool within *listener.py* to one of these:  
   https://github.com/jordansissel/xdotool#wayland
5. pynput library: it can be installed by typing in the terminal:
   ```bash
   pip install pynput
   ```
