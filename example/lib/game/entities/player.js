ig.module('game.entities.player')
    .requires('impact.entity')
    .defines(function() {

        EntityPlayer = ig.Entity.extend({
            animSheet: new ig.AnimationSheet("media/entities/xam.png", 16, 16),
            collides: ig.Entity.COLLIDES.PASSIVE,
            size: {
                x: 12,
                y: 8
            },
            offset: {
                x: 2,
                y: 8
            },
            zIndex: 2,
            moveSpeed: 75,

            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.initAnimation();
            },

            initAnimation: function() {

                var idleDelay = 0.4;
                var moveDelay = 0.25;

                this.addAnim("idleDown", idleDelay, [0, 1]);
                this.addAnim("idleUp", idleDelay, [4, 5]);
                this.addAnim("idleLeft", idleDelay, [8, 9]);

                this.addAnim("moveDown", moveDelay, [0, 1]);
                this.addAnim("moveUp", moveDelay, [4, 5]);
                this.addAnim("moveLeft", moveDelay, [8, 9]);

                this.addAnim("painDown", moveDelay, [12, 13]);
                this.addAnim("painUp", moveDelay, [16, 17]);
                this.addAnim("painLeft", moveDelay, [20, 21]);


            },

            update: function() {
                if (ig.input.state("left")) {
                    this.vel.x = -this.moveSpeed;
                } else if (ig.input.state("right")) {
                    this.vel.x = this.moveSpeed;
                } else {
                    this.vel.x = 0;
                }

                if (ig.input.state("up")) {
                    this.vel.y = -this.moveSpeed;
                } else if (ig.input.state("down")) {
                    this.vel.y = this.moveSpeed;
                } else {
                    this.vel.y = 0;
                }

                this.parent();
            }
        });

    });