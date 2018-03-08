var tutorialState = {
    preload: function () {
        // Window scaling
        //this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.game.scale.setShowAll();
        //window.addEventListener('resize', function () {
        //    this.game.scale.refresh();
        //} );
        //this.game.scale.refresh();

        // make everything CRISP
        game.camera.scale.x = 1;
        game.camera.scale.y = 1;
        game.stage.smoothed = false;

        // Knight sheet and atlas
        game.load.atlas('knightSheet', 'assets/characters/Knight/Knight_spritesheetX3.png', 'assets/characters/Knight/Knight.json');

        // Slime sheet and atlas
        game.load.atlas('slimeSheet', 'assets/ai/Slime/Slime_spritesheetX3.png', 'assets/ai/Slime/Slime.json');

        // map tiles stuff
        game.load.image('mapTiles', 'assets/tilesets/DarkDungeonv2_3x.png');
        game.load.tilemap('level1', 'assets/tilesets/DungeonTest.json', null, Phaser.Tilemap.TILED_JSON);

        // timing
        game.time.advancedTiming = true;

        // ui
        this.load.image('joystickBall', 'assets/ui/joystickBall.png');
        this.load.image('joystickBackground', 'assets/ui/joystickBackground.png');
        this.load.atlas('arcade', 'assets/ui/arcade-joystick.png', 'assets/ui/arcade-joystick.json');
        this.load.atlas('dpad', 'assets/ui/dpad.png', 'assets/ui/dpad.json');

        // touch control
        game.input.addPointer();
        game.input.addPointer();
        game.input.addPointer();
        game.input.addPointer();

        // load player weapons
        playerWeaponStats = ironSword;
        this.load.image('playerWeapon', playerWeaponStats.image);
    },
    create: function (){
        // world setup
        game.world.setBounds(0, 0, 5000, 5000);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        cursors = game.input.keyboard.createCursorKeys();

        // render tiled level map
        level1 = game.add.tilemap('level1'); // step 1
        level1.addTilesetImage('DungeonTiles', 'mapTiles'); // step 2
        background = level1.createLayer('background');
        floor = level1.createLayer('floor');
        floorOverlay = level1.createLayer('floorOverlay');
        wallsLayer = level1.createLayer('walls');
        background.resizeWorld();
        level1.setCollisionBetween(1, 3078, true, 'walls');

        // spawn and setup player, camera
        player = game.add.sprite(1300, 830, 'knightSheet');
        game.physics.arcade.enable(player);
        player.anchor.setTo(.5,.5);
        game.camera.follow(player);
        //player.body.setSize(45, 68, 27, 27);
        player.body.setSize(45, 55, 27, 41);

        // load player weapons
        playerWeapon = game.add.sprite(player.x, player.y, 'playerWeapon');
        game.physics.arcade.enable(playerWeapon);
        playerWeapon.visible = false;


        // player animation
        player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
        player.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
        player.animations.play('idle');

        // spawn ai
        enemies = game.add.group();
        enemies.enableBody = true;
        game.physics.arcade.enable(enemies);
        for (var i = 0; i < 4; i++) {
            ai = game.add.sprite(1800 + (i * 100), 830, 'slimeSheet');
            game.physics.arcade.enable(ai);
            ai.anchor.setTo(.5,.5);
            ai.body.setSize(45, 47, 27, 49);
            ai.dmg = 15;

            // slim animation
            ai.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
            ai.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
            ai.animations.play('idle');
            enemies.add(ai);
        }

        // enable keyboard inputs
        keyboard = game.input.keyboard.createCursorKeys();
        keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.W);


        // path finding
        walkables = [41,42,43,44,54,55,28,29,30,31,23,24];
        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(level1.layers[1].data, walkables);

        // Joystick
        pad = game.plugins.add(Phaser.VirtualJoystick);

        stick = pad.addStick(0, 0, 200, 'arcade');
        stick.alignBottomLeft();

        dpad = pad.addDPad(0, 0, 200, 'dpad');
        dpad.alignBottomRight(0);

        // timers
        playerHitTimer = game.time.create(false);
        playerAttackTimer = game.time.create(false);

    },
    update: function (){
        game.physics.arcade.collide(wallsLayer, player);
        game.physics.arcade.collide(wallsLayer, enemies);
        game.physics.arcade.overlap(enemies, player, this.damagePlayer, null, this);
        game.physics.arcade.overlap(enemies, playerWeapon, this.hitAi, null, this);
        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        isBusy = false;

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -playerMovementSpeed; player.scale.x = -1; player.animations.play('walk'); isBusy=true;}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = playerMovementSpeed; player.scale.x = 1; player.animations.play('walk'); isBusy=true;}		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -playerMovementSpeed; player.animations.play('walk'); isBusy=true;}	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = playerMovementSpeed; player.animations.play('walk'); isBusy=true;}		// move down

        if (stick.isDown) {
            isBusy = true;
            //player.animations.play('walk');
            this.physics.arcade.velocityFromRotation(stick.rotation, stick.force * playerMovementSpeed, player.body.velocity);
        }

        if (stick.angle < 89 && stick.angle > -89) {
            player.scale.x = 1;
        } else {
            player.scale.x = -1;
        }

        if(stick.isUp) {
            isBusy = false;
        }

        // check dpad input
        if (dpad.isDown) {
            // set attack 0

            if (dpad.direction === Phaser.LEFT) {
                this.playerAttackMeele("left");
            } else if (dpad.direction === Phaser.RIGHT) {
                this.playerAttackMeele("right");
            } else if (dpad.direction === Phaser.UP) {
                this.playerAttackMeele("up");
            } else if (dpad.direction === Phaser.DOWN) {
                this.playerAttackMeele("down");
            }
        }

        // animations
        if (isBusy === false) {
            player.animations.play('idle');
        }
        else {
            player.animations.play('walk');
        }


        // path finding
        //path = this.findPathTo(floor.getTileX(player.x+20), floor.getTileY(player.y+32));

        //enemies.forEachAlive(this.pathSetup, this);

        enemies.forEachAlive(function(enemy) {
            path = this.findPathTo(enemy, floor.getTileX(player.x+20), floor.getTileY(player.y+32));
            this.pathSetup(enemy)
        }, this);


        // player weapon stuff
        playerWeapon.x = player.x;
        playerWeapon.y = player.y + 10;
    },
    render: function () {
        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.spriteCoords(player, 32, 500);

        //game.debug.body(player);
        //game.debug.body(ai);
        //game.debug.body(wallsLayer);
        game.debug.body(playerWeapon);
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 30, 16, "#00ff00");

        game.debug.pointer(game.input.mousePointer);
        game.debug.pointer(game.input.pointer1);
        game.debug.pointer(game.input.pointer2);
        game.debug.pointer(game.input.pointer3);
        game.debug.pointer(game.input.pointer4);
        game.debug.pointer(game.input.pointer5);
        game.debug.pointer(game.input.pointer6);
    },

    pathSetup: function (enemy) {
        if (path.length >= 4) {
            game.physics.arcade.moveToXY(enemy, path[3].x*48, path[3].y*48, 100);
        } else {
            game.physics.arcade.moveToXY(enemy, path[1].x*48, path[1].y*48, 100);
        }
    },

    findPathTo: function (enemy, tilex, tiley) {
        var goodPath = [];

        pathfinder.setCallbackFunction(function(path) {
            path = path || [];
            goodPath = path;
        });

        pathfinder.preparePathCalculation([floor.getTileX(enemy.x),floor.getTileY(enemy.y)], [tilex,tiley]);
        pathfinder.calculatePath();

        return goodPath;
    },

    damagePlayer: function (x, src) {
        if (playerInvulnerable === false) {
            playerHealth -= src.dmg;
            console.log(playerHealth);
            playerInvulnerable = true;
            player.tint = 0xff4444;
            playerHitTimer.loop(500, function(){ playerInvulnerable = false; player.tint = 0xffffff; playerHitTimer.stop(true);});
            playerHitTimer.start();
        } else if (playerHealth <= 0) {
            var styles = [
                'background: linear-gradient(#D33106, #571402)'
                , 'border: 1px solid #3E0E02'
                , 'color: white'
                , 'display: block'
                , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
                , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
                , 'line-height: 40px'
                , 'text-align: center'
                , 'font-weight: bold'
            ].join(';');

            console.log('%c PLAYER DEAD \n GAME OVER', styles);
            game.paused = true;
        }
    },

    playerAttackMeele: function (direction) {
        if (playerAttacking === false) {
            playerAttacking = true;
            playerWeapon.x = player.x;
            playerWeapon.y = player.y + 10;
            playerWeapon.visible = true;
            playerWeapon.body.setSize(0, 0, 0, 0);

            switch (direction) {
                case "right":
                    playerWeapon.anchor.setTo(.5, 1.5);
                    playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, 0, 0);
                    playerWeapon.angle = 0;
                    game.add.tween(playerWeapon).to( { angle: 180 }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
                    playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
                        if (playerAttacking === true) {
                            playerWeapon.visible = false;
                            playerAttacking = false;
                            playerAttackTimer.stop(true);
                            playerWeapon.body.setSize(0, 0, 0, 0);
                        }
                    });
                    playerAttackTimer.start();
                    break;
                case "left":
                    playerWeapon.anchor.setTo(.5, 1.5);
                    playerWeapon.body.setSize(-playerWeaponStats.rangeX, playerWeaponStats.rangeY, 0, 0);
                    playerWeapon.angle = 0;
                    game.add.tween(playerWeapon).to( { angle: -180 }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
                    playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
                        if (playerAttacking === true) {
                            playerWeapon.visible = false;
                            playerAttacking = false;
                            playerAttackTimer.stop(true);
                            playerWeapon.body.setSize(0, 0, 0, 0);
                        }
                    });
                    playerAttackTimer.start();
                    break;
                case "up":
                    playerWeapon.anchor.setTo(.5, 1.5);
                    playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, -20);
                    playerWeapon.angle = -90;
                    game.add.tween(playerWeapon).to( { angle: 90 }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
                    playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
                        if (playerAttacking === true) {
                            playerWeapon.visible = false;
                            playerAttacking = false;
                            playerAttackTimer.stop(true);
                            playerWeapon.body.setSize(0, 0, 0, 0);
                        }
                    });
                    playerAttackTimer.start();
                    break;
                case "down":
                    playerWeapon.anchor.setTo(.5, 1.5);
                    playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, playerWeaponStats.rangeX);
                    playerWeapon.angle = -90;
                    game.add.tween(playerWeapon).to( { angle: -270 }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
                    playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
                        if (playerAttacking === true) {
                            playerWeapon.visible = false;
                            playerAttacking = false;
                            playerAttackTimer.stop(true);
                            playerWeapon.body.setSize(0, 0, 0, 0);
                        }
                    });
                    playerAttackTimer.start();
                    break;
            }

        }
    },

    hitAi: function (x, enemy) {
        enemy.kill();
    }
};