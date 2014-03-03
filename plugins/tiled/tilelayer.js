ig.module('plugins.tiled.tilelayer')
    .requires('plugins.tiled.layer')
    .defines(function() {

        ig.Tiled = ig.Tiled || {};

        // a tile map (similar to ig.BackgroundMap)
        ig.Tiled.TileLayer = ig.Tiled.Layer.extend({
            data: [],
            type: "tilelayer",
            preRender: true,
            preRenderedChunks: null,
            chunkSize: 512,
            debugChunks: false,
            scroll: {
                x: 0,
                y: 0
            },
            distance: 1,
            repeat: false,

            init: function(map, json) {
                this.parent(map, json);
            },

            getTile: function(x, y) {
                var index = x + (y * this.width);

                return this.data[index];
            },

            setTile: function(x, y, tile) {
                var index = x + (y * this.width);

                this.data[index] = tile;
            },

            setScreenPos: function(x, y) {
                this.scroll.x = x / this.distance;
                this.scroll.y = y / this.distance;
            },

            drawTile: function(gid, x, y) {
                // no tile!
                if (gid === 0) {
                    return;
                }

                // tiled maps are based on a global index across multiple tilesets
                var tileset = _.find(this._map.tilesets, function(set) {
                    return gid <= set.lastgid && gid >= set.firstgid;
                });

                if (tileset) {
                    //console.log('dt: ', gid, x, y);
                    tileset.drawTile(gid, x, y);
                } else {
                    console.error('tileset not found for gid: ' + gid);
                }
            },

            draw: function() {
                if (!this.visible || !this._map || !this._map.allTilesetsLoaded()) {
                    return;
                }

                if (this.preRender) {
                    this.drawPreRendered();
                } else {
                    this.drawTiled();
                }
            },

            preRenderMapToChunks: function() {
                // do something for non square?
                this.tilesize = this._map.tilewidth;

                var totalWidth = this.width * this.tilesize * ig.system.scale,
                    totalHeight = this.height * this.tilesize * ig.system.scale;

                // If this layer is smaller than the chunkSize, adjust the chunkSize
                // accordingly, so we don't have as much overdraw
                this.chunkSize = Math.min(Math.max(totalWidth, totalHeight), this.chunkSize);

                var chunkCols = Math.ceil(totalWidth / this.chunkSize),
                    chunkRows = Math.ceil(totalHeight / this.chunkSize);

                this.preRenderedChunks = [];
                for (var y = 0; y < chunkRows; y++) {
                    this.preRenderedChunks[y] = [];

                    for (var x = 0; x < chunkCols; x++) {
                        var chunkWidth = (x == chunkCols - 1) ? totalWidth - x * this.chunkSize : this.chunkSize;
                        var chunkHeight = (y == chunkRows - 1) ? totalHeight - y * this.chunkSize : this.chunkSize;

                        this.preRenderedChunks[y][x] = this.preRenderChunk(x, y, chunkWidth, chunkHeight);
                    }
                }
            },

            preRenderChunk: function(cx, cy, w, h) {
                // do something for non square?
                this.tilesize = this._map.tilewidth;

                var tw = w / this.tilesize / ig.system.scale + 1,
                    th = h / this.tilesize / ig.system.scale + 1;

                var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
                    ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;

                var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
                    ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);

                var chunk = ig.$new('canvas');
                chunk.width = w;
                chunk.height = h;
                chunk.retinaResolutionEnabled = false; // Opt out for Ejecta

                var chunkContext = chunk.getContext('2d');
                ig.System.scaleMode(chunk, chunkContext);

                var screenContext = ig.system.context;
                ig.system.context = chunkContext;

                for (var x = 0; x < tw; x++) {
                    for (var y = 0; y < th; y++) {
                        if (x + tx < this.width && y + ty < this.height) {
                            var tile = this.getTile(x + tx, y + ty);
                            this.drawTile(tile, x * this.tilesize - nx, y * this.tilesize - ny);
                        }
                    }
                }
                ig.system.context = screenContext;

                return chunk;
            },

            drawPreRendered: function() {
                // do something for non square?
                this.tilesize = this._map.tilewidth;

                if (!this.preRenderedChunks) {
                    this.preRenderMapToChunks();
                }

                var dx = ig.system.getDrawPos(this.scroll.x),
                    dy = ig.system.getDrawPos(this.scroll.y);


                if (this.repeat) {
                    var w = this.width * this.tilesize * ig.system.scale;
                    dx = (dx % w + w) % w;

                    var h = this.height * this.tilesize * ig.system.scale;
                    dy = (dy % h + h) % h;
                }

                var minChunkX = Math.max(Math.floor(dx / this.chunkSize), 0),
                    minChunkY = Math.max(Math.floor(dy / this.chunkSize), 0),
                    maxChunkX = Math.ceil((dx + ig.system.realWidth) / this.chunkSize),
                    maxChunkY = Math.ceil((dy + ig.system.realHeight) / this.chunkSize),
                    maxRealChunkX = this.preRenderedChunks[0].length,
                    maxRealChunkY = this.preRenderedChunks.length;


                if (!this.repeat) {
                    maxChunkX = Math.min(maxChunkX, maxRealChunkX);
                    maxChunkY = Math.min(maxChunkY, maxRealChunkY);
                }


                var nudgeY = 0;
                for (var cy = minChunkY; cy < maxChunkY; cy++) {

                    var nudgeX = 0;
                    for (var cx = minChunkX; cx < maxChunkX; cx++) {
                        var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];

                        var x = -dx + cx * this.chunkSize - nudgeX;
                        var y = -dy + cy * this.chunkSize - nudgeY;
                        ig.system.context.drawImage(chunk, x, y);
                        ig.Image.drawCount++;

                        if (this.debugChunks) {
                            ig.system.context.strokeStyle = '#f0f';
                            ig.system.context.strokeRect(x, y, this.chunkSize, this.chunkSize);
                        }

                        // If we repeat in X and this chunk's width wasn't the full chunk size
                        // and the screen is not already filled, we need to draw anohter chunk
                        // AND nudge it to be flush with the last chunk
                        if (this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth) {
                            nudgeX += this.chunkSize - chunk.width;
                            maxChunkX++;
                        }
                    }

                    // Same as above, but for Y
                    if (this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight) {
                        nudgeY += this.chunkSize - chunk.height;
                        maxChunkY++;
                    }
                }
            },

            drawTiled: function() {
                // do something for non square?
                this.tilesize = this._map.tilewidth;

                var tile = 0,
                    tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
                    tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
                    pxOffsetX = this.scroll.x % this.tilesize,
                    pxOffsetY = this.scroll.y % this.tilesize,
                    pxMinX = -pxOffsetX - this.tilesize,
                    pxMinY = -pxOffsetY - this.tilesize,
                    pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
                    pxMaxY = ig.system.height + this.tilesize - pxOffsetY;


                // FIXME: could be sped up for non-repeated maps: restrict the for loops
                // to the map size instead of to the screen size and skip the 'repeat'
                // checks inside the loop.

                for (var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
                    var tileY = mapY + tileOffsetY;

                    // Repeat Y?
                    if (tileY >= this.height || tileY < 0) {
                        if (!this.repeat) {
                            continue;
                        }
                        tileY = (tileY % this.height + this.height) % this.height;
                    }

                    for (var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize) {
                        var tileX = mapX + tileOffsetX;

                        // Repeat X?
                        if (tileX >= this.width || tileX < 0) {
                            if (!this.repeat) {
                                continue;
                            }
                            tileX = (tileX % this.width + this.width) % this.width;
                        }

                        // Draw!
                        this.drawTile(this.getTile(tileX, tileY), pxX, pxY);
                    } // end for x
                } // end for y
            }
        });

    });