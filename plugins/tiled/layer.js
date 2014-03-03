ig.module('plugins.tiled.layer')
.requires('impact.impact')
.defines(function() {

    ig.Tiled = ig.Tiled || {};

    // abstract layer
    ig.Tiled.Layer = ig.Class.extend({
        height: 10,
        name: "",
        opacity: 1,
        visible: true,
        width: 10,
        x: 0,
        y: 0,
        _map: null,
        type: 'layer',

        init: function(map, json) {
            // we need a reference to the map object for tilesets
            this._map = map;

            _.extend(this, json);
        }
    });
})