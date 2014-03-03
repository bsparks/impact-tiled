# impact-tiled

Plugin for ImpactJS to read Tiled (http://mapeditor.org) map files.

## Dependencies

- underscore http://underscorejs.org/
- impact-layers https://github.com/amadeus/impact-layers

## Notes

- Will load the map from exported JSON using the layer order provided by the map.
- Tiled will save the paths to the tilesets relative to the saved map. For this reason, I suggest saving the map at the same level or one higher from the tilesets.
For example, media/maps/test.json and media/maps/tilesets/ground.png.
- Also this plugin makes no assumptions on how you load the JSON file. Easiest way is to just wrap it in a module and store it as a variable. (or use ajax to load the json directly)

## TODO

- base entity types that use the tiled entities
- image layers
- docs

## Credits

Assets used in the example:
- font: included with Impact
- Village, Forest, Collision, and Xam are from LostDecadeGames https://github.com/lostdecade/onslaught2_impact
- Tiles_12 is by Buch http://opengameart.org/users/buch