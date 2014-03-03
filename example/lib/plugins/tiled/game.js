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
                            // for now just spawn to 'entities' TODO: support named (injection)
                            game.spawnEntity(entity.type, entity.x, entity.y, entity.properties);
                        });
                    }
                });

                return map;
            }
        });

    });