ig.module('plugins.tiled.tileset')
    .requires('impact.image')
    .defines(function() {

        ig.Tiled = ig.Tiled || {};

        // TODO: something better here (config?)
        var MEDIA_PATH = '/media/maps/';

        ig.Tiled.Tileset = ig.Class.extend({
            firstgid: 1,
            image: "", // path not actual image
            _image: null, // actual image
            imageheight: 32,
            imagewidth: 32,
            margin: 0,
            name: "",
            properties: {},
            spacing: 0,
            tileheight: 16,
            tilewidth: 16,

            init: function(json) {
                _.extend(this, json);

                this.setImage(this.image);

                // TODO: these are fine as long as provided by Tiled export (should use Image dimensions though?)
                this.numTiles = (this.imageheight / this.tileheight) * (this.imagewidth / this.tilewidth);
                this.lastgid = this.firstgid + this.numTiles - 1;
            },

            setImage: function(path) {
                this.image = path;
                this._image = new ig.Image(MEDIA_PATH + path);
            },

            // draw actual image tile based on firstgid indexing
            drawTile: function(index, x, y) {
                var actualIndex = index - this.firstgid;

                if(actualIndex < 0) {
                    throw "out of range";
                }

                this._image.drawTile(x, y, actualIndex, this.tilewidth, this.tileheight);
            }

        });

    });