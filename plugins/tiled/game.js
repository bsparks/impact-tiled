ig.module('plugins.tiled.game')
    .requires('impact.game', 'impact.entity', 'impact.entity-pool', 'plugins.tiled.map', 'plugins.layers')
    .defines(function() {

        ig.Game.inject({
            loadTiledMap: function(mapData) {
                var game = this,
                    map = new ig.Tiled.Map(mapData),
                    hitEntities = false;

                ig.EntityPool.drainAllPools();
                game.screen = {
                    x: 0,
                    y: 0
                };

                // Clear out existing stuff
                _.each(game.layerOrder, function(name) {
                    var layer = game.layers[name];
                    if(layer && layer.clearOnLoad) {
                        layer.items.length = 0;
                    }
                });

                game.namedEntities = {};

                game.collisionMap = map.collisionMap;

                // setup game layers based on map layers
                _.each(map.layers, function(layer) {
                    // collision is a special case
                    if (layer.name === 'collision') {
                        return;
                    }

                    if (layer.type === 'tilelayer') {
                        game.setLayerProperties(layer.name, {
                            mapLayer: true,
                            clearOnLoad: true
                        });

                        game.addItem(layer, hitEntities ? 'foregroundMaps' : 'backgroundMaps');
                    }

                    // entity layers
                    if (layer.type === 'objectgroup') {
                        // TODO: support multiple object layers with varying foregroundness?
                        hitEntities = true;

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
                            if (!entity.type || entity.type.length === 0) {
                                // TODO: should just ignore these instead? perhaps also having a valid entity registry to test?
                                entity.type = ig.Entity;
                            }

                            game.spawnEntity(entity.type, entity.x, entity.y, entity.properties);
                        });
                    }

                    game.sortEntities();

                    _.each(game.layerOrder, function(name) {
                        var layer = game.layers[name];
                        if(layer.entityLayer) {
                            _.each(layer.items, function(item) {
                                item.ready();
                            });
                        }
                    });

                });

                return map;
            }
        });

    });