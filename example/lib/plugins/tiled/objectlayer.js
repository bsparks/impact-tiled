ig.module('plugins.tiled.objectlayer')
.requires('impact.entity', 'plugins.tiled.layer')
.defines(function() {

    ig.Tiled = ig.Tiled || {};

    ig.Tiled.ObjectLayer = ig.Tiled.Layer.extend({
        type: 'objectgroup',
        objects: [],

        init: function(map, json) {
            this.parent(map, json);
        }
    });

});