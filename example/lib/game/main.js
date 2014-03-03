ig.module(
    'game.main'
)
    .requires(
        'impact.game',
        'impact.font',
        'plugins.layers',
        'plugins.tiled.game',
        'game.levels.test',
        'game.entities.player', 'impact.debug.debug'
)
    .defines(function() {

        MyGame = ig.Game.extend({

            // Load a font
            font: new ig.Font('media/04b03.font.png'),


            init: function() {
                // normally with impact-layers you'd call the parent init method here
                // however we don't need the default layers with the tiled loader

                ig.input.bind(ig.KEY.UP_ARROW, "up");
                ig.input.bind(ig.KEY.W, "up");

                ig.input.bind(ig.KEY.LEFT_ARROW, "left");
                ig.input.bind(ig.KEY.A, "left");

                ig.input.bind(ig.KEY.DOWN_ARROW, "down");
                ig.input.bind(ig.KEY.S, "down");

                ig.input.bind(ig.KEY.RIGHT_ARROW, "right");
                ig.input.bind(ig.KEY.D, "right");

                this.mainMap = this.loadTiledMap(TestMap);

                this.createLayer('gui');

                this.addItem({
                    _layer: 'gui',

                    font: this.font,

                    update: function() {
                        this.x = ig.system.width / 2;
                        this.y = ig.system.height / 2;
                    },

                    draw: function() {
                        this.font.draw(
                            'Hello World!, I am a layer!',
                            this.x,
                            this.y,
                            ig.Font.ALIGN.CENTER
                        );
                    }
                });
            }
        });


        // Start the Game with 60fps, a resolution of 320x240, scaled
        // up by a factor of 2
        ig.main('#canvas', MyGame, 60, 320, 240, 2);

    });