Automapper for might & magic 1

# The mapper part
In order to be able to save the map, you need to create it by giving it the name and clicking a '+' button.
In order to change its name, well, edit the JSON file resulting from a save (key *title*)
In order to place a pointer on the map, click on the map.
For moving the pointer, use arrow keys.
In order to move back (possibly overriding last changes made by a pointer), use backspace.
In order to give a description (or script it, or manually give a border to it) to a field, click on it using middle mouse button.
In order to disallow making changes to the map by a pointer, use the *ground truth mode*.
A 'fly' signature can be defined in order to place a pointer on a given map. After defining a 'fly' value, clicking on *F* button by the map name results in beibng transported to a given signature without changing direction.
To change grid size, change the *GRID_SIZE* variable in the *mapping.js* file.

Possible scripts:
  *signature* refers to 'y x' coordinates of a field, 
  *direction* refers to the direction of a pointer - either N,W,E or S
 T;*map_name*;*signature*
  Moving on the field results in being teleported to another field defined by *signature* on the map *map_name*.
  For example, 
   T;B3;13 3
   T;\_S; 7 0
  *map_name* equal to *_S* refers to self.
 P;*direction*;*map_name*;*signature*
  Being on a given field and clicking *y* while the pointer is directed in a correct way results in transition to another field defined by *signature* on the map *map_name*.
  For example,
   P;N;B3;13 5
 WS;*direction*
  Being on a given field and moving in a given direction results in transition between maps in the overworld as in the game's system.
  For example,
   WS;N
  On a map B3, signature 15,7 leads to a map B2, signature 0,7.
 R
  Clicking *y* on a given field reverses the pointer.

Other controls:
 t - switch ground truth mode.
 backspace - undo last movement.
 j - jump (not implemented as in game - always 2 steps forward, just a convenience)
 d - switch desert
 w - switch water


# The auto part
The "Auto" part consists of a single file - *listener.py* ; all it does is:
1. Capturing certain key presses (directional buttons and 'y' in particular) - the ones present on the left side of *keys_mapping* dictionary.
2. Sending value for a given key (the one on the right side of *keys_mapping* dictionary) to a mozilla process.
The file uses *xdotool* for sending keys - so, if you don't have a system allowing to use xdotool (such as Windows), you'll have to tinker (probably with autohotkey).

#Overview
To run the mapper:
1. Run *map.html* (probably in a browser).
2. Run *listener.py* (perhaps after tinkering with it, depending on the operating system).
