ig.module('plugins.tiled.map')
    .requires('plugins.tiled.tileset', 'plugins.tiled.tilelayer', 'plugins.tiled.objectlayer', 'impact.collision-map')
    .defines(function() {

        // namespace
        ig.Tiled = ig.Tiled || {};

        var convertToImpact = function(data, width, height) {
            var out = [[]],
                x, y, i;

            i = 0;
            for (y = 0; y < height; y++) {
                if (!out[y]) {
                    out[y] = [];
                }
                for (x = 0; x < width; x++) {
                    out[y][x] = data[i];
                    i++;
                }
            }

            return out;
        };

        ig.Tiled.Map = ig.Class.extend({
            name: "",
            width: 10,
            height: 10,
            orientation: "orthogonal",
            tilesets: [],
            layers: [],
            tilewidth: 16,
            tileheight: 16,
            version: 1,
            properties: {},
            collisionMap: ig.CollisionMap.staticNoCollision,

            init: function(json) {
                var map = this;

                _.extend(map, json);

                // we don't want the raw json for this
                map.tilesets = [];
                map.layers = [];

                // coerce into objects
                _.each(json.tilesets, function(set) {
                    map.tilesets.push(new ig.Tiled.Tileset(set));
                });
                // make sure tilesets are sorted by firstgid for later lookup
                _.sortBy(map.tilesets, 'firstgid');

                _.each(json.layers, function(layer) {
                    map.createLayer(layer);
                });
            },

            allTilesetsLoaded: function() {
                return _.every(this.tilesets, function(set) { return set._image.loaded; });
            },

            createLayer: function(json) {
                var map = this;

                // check layer type
                if (!json.type) {
                    throw "layer type is required!";
                }

                if (json.type === 'objectgroup') {
                    map.layers.push(new ig.Tiled.ObjectLayer(map, json));
                }

                if (json.type === 'tilelayer') {
                    if (json.name === 'collision') {
                        map.collisionMap = new ig.CollisionMap(map.tilewidth, convertToImpact(json.data, map.width, map.height));
                    } else {
                        map.layers.push(new ig.Tiled.TileLayer(map, json));
                    }
                }
            }
        });

    });