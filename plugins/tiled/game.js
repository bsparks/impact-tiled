ig.module('plugins.tiled.game')
    .requires('impact.game', 'impact.entity', 'plugins.tiled.map', 'plugins.layers')
    .defines(function() {

        ig.Game.inject({
            loadTiledMap: function(mapData) {
                var game = this,
                    map = new ig.Tiled.Map(mapData);

                game.collisionMap = map.collisionMap;

                // setup game layers based on map layers
                _.each(map.layers, function(layer) {
                    // collision is a special case
                    if (layer.name === 'collision') {
                        return;
                    }

                    game.createLayer(layer.name);

                    if (layer.type === 'tilelayer') {
                        game.setLayerProperties(layer.name, {
                            mapLayer: true,
                            clearOnLoad: true
                        });
                        game.addItem(layer, layer.name);
                    }

                    // entity layers
                    if (layer.type === 'objectgroup') {
                        game.setLayerProperties(layer.name, {
                            clearOnLoad: true,
                            entityLayer: true,
                            autoSort: game.autoSort,
                            sortBy: game.sortBy,
                            _doSortEntities: false
                        });

                        _.each(layer.objects, function(entity) {
                            // use the Tiled name so that it doesn't *need* to be specified in properties of the object
                            // this name is used during spawnEntity for the hashmap lookup, so it has to be set NOW
                            if(entity.name && entity.name.length > 0 && !entity.properties.name) {
                                entity.properties.name = entity.name;
                            }

                            // since type is also not required in Tiled...
                            if(!entity.type || entity.type.length === 0) {
                                // TODO: should just ignore these instead? perhaps also having a valid entity registry to test?
                                entity.type = ig.Entity;
                            }

                            game.spawnEntity(entity.type, entity.x, entity.y, entity.properties);
                        });
                    }
                });

                return map;
            }
        });

    });