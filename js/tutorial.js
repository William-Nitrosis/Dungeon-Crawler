var tutorialState = {
    preload: function () {
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

        // player exit collision box
        this.load.image('playerStartPoint', 'assets/tilesets/playerExitZone.png');

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
        //objectsLayer = level1.createLayer('objects');
        background.resizeWorld();
        level1.setCollisionBetween(1, 3078, true, 'walls');

        // spawn ai
        enemies = game.add.group();
        enemies.enableBody = true;
        game.physics.arcade.enable(enemies);

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

        // joystick
        pad = game.plugins.add(Phaser.VirtualJoystick);

        stick = pad.addStick(0, 0, 200, 'arcade');
        stick.alignBottomLeft();

        // dpad
        dpad = pad.addDPad(0, 0, 200, 'dpad');
        dpad.alignBottomRight(0);

        // Health bars
        playerHealthBar = new HealthBar(this.game, healthbarConfig);

        // timers
        playerHitTimer = game.time.create(false);
        playerAttackTimer = game.time.create(false);

        // spawn zones and ai spawning
        //console.log(this.findObjectsByType("spawnZone", level1));

        // code for Tiled objects
        // enemies
        this.findObjectsByType("spawnZone", level1).forEach(function(zone) {
            //console.log(zone.properties.type);

            if (zone.properties.type === "spawnZone") {
                switch (zone.properties.enemy) {
                    case "slime":
                        //console.log(zone.properties.count);

                        for (var i = 0; i < zone.properties.count; i++){
                            var spawnX = game.rnd.integerInRange(zone.x, zone.x + zone.width);
                            var spawnY = game.rnd.integerInRange(zone.y, zone.y + zone.height);
                            spawnSlime(spawnX, spawnY);
                        }
                }
            }
        });

        // Spawning player
        this.findObjectsByType("playerSpawn", level1).forEach(function(zone) {
            // spawn and setup player, camera
            player = game.add.sprite(zone.x + (zone.width / 2), zone.y + (zone.height / 2), 'knightSheet');
            game.physics.arcade.enable(player);
            player.anchor.setTo(.5,.5);
            game.camera.follow(player);
            player.body.setSize(45, 55, 27, 41);

            // load player weapons
            playerWeapon = game.add.sprite(player.x, player.y, 'playerWeapon');
            game.physics.arcade.enable(playerWeapon);
            playerWeapon.visible = false;
            playerWeapon.body.setSize(0, 0, 0, 0);

            // player animation
            player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
            player.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
            player.animations.play('idle');
        });

        this.findObjectsByType("playerExit", level1).forEach(function(zone) {
            console.log(zone);
            playerExitZone = game.add.sprite(zone.x, zone.y + zone.height, 'playerStartPoint');
            playerExitZone.enableBody = true;
            game.physics.arcade.enable(playerExitZone);


        });



    },
    update: function (){
        // collisions and calls
        game.physics.arcade.collide(wallsLayer, player);
        game.physics.arcade.collide(wallsLayer, enemies);
        game.physics.arcade.overlap(playerExitZone, player, this.endLevel);
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

        // check joystick inputs
        if (stick.isDown) {
            isBusy = true;
            this.physics.arcade.velocityFromRotation(stick.rotation, stick.force * playerMovementSpeed, player.body.velocity);
        }

        // flip player sprite
        if (stick.angle < 89 && stick.angle > -89) {
            player.scale.x = 1;
        } else {
            player.scale.x = -1;
        }

        // check if the player is moving
        if(stick.isUp) {
            isBusy = false;
        }

        // check dpad input
        if (dpad.isDown) {
            // call attack function
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

        // animations for player
        if (isBusy === false) {
            player.animations.play('idle');
        }
        else {
            player.animations.play('walk');
        }


        // enemy updates
        enemies.forEachAlive(function(enemy) {
            if (enemy.stunned === false) {
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
            }


            // check line of sight
            enemy.line.start.set(enemy.x, enemy.y + (enemy.height / 4));
            enemy.line.end.set(player.x, player.y);

            // move setup pathing
            if (enemy.stunned === false && this.lineSight(enemy.line, enemy.losRange, enemy)) {
                path = this.findPathTo(enemy, floor.getTileX(player.x+20), floor.getTileY(player.y+32));
                this.pathSetup(enemy);
            }

            // scale enemy health bar and update position
            enemy.healthBar.setPercent(enemy.health * (100 / enemy.maxHealth));
            enemy.healthBar.setPosition(enemy.x, enemy.y);
        }, this);



        // update player weapon position
        playerWeapon.x = player.x;
        playerWeapon.y = player.y + 10;

        // UI updates
        playerHealthBar.setPercent(playerHealth * (100 / playerMaxHealth));

    },
    render: function () {
        // -- debugging code
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 30, 16, "#00ff00");

        if (debugged) {
            game.debug.cameraInfo(game.camera, 32, 100);
            game.debug.spriteCoords(player, 32, 250);

            game.debug.body(player);
            game.debug.body(wallsLayer);
            game.debug.body(playerWeapon);
            game.debug.body(playerExitZone);

            game.debug.pointer(game.input.mousePointer);
            game.debug.pointer(game.input.pointer1);
            game.debug.pointer(game.input.pointer2);

            enemies.forEachAlive(function(enemy) {
                game.debug.geom(enemy.line);
                game.debug.geom(enemy.knockBackLine);
                game.debug.body(enemy);
            }, this);
        }

        // -- end debugging code
    },

   // move the enemies along the path
    pathSetup: function (enemy) {
        if (path.length >= 4) {
            game.physics.arcade.moveToXY(enemy, path[3].x*48, path[3].y*48, 100);
        } else if (path.length >= 3) {
            game.physics.arcade.moveToXY(enemy, path[2].x * 48, path[2].y * 48, 100);
        } else {
            game.physics.arcade.moveToXY(enemy, path[1].x*48, path[1].y*48, 100);
        }

        // flip enemy sprite
        if (enemy.x > player.x) {
            enemy.scale.x = -1;
        } else {
            enemy.scale.x = 1;
        }


    },

    // run path finding algorithm to calculate the path to follow
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

    // function to apply damage to the player
    damagePlayer: function (x, src) {
        if (playerInvulnerable === false) { // checks if the player can take damage
            playerHealth -= src.dmg;
            console.log(playerHealth);
            playerInvulnerable = true;
            player.tint = 0xff4444;
            playerHitTimer.loop(500, function(){ playerInvulnerable = false; player.tint = 0xffffff; playerHitTimer.stop(true);});
            playerHitTimer.start();
        } else if (playerHealth <= 0) { // game over screen and styles for console log
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

    // function for the player melee attacking
    playerAttackMeele: function (direction) {
        if (playerAttacking === false) { // check if the player can attack
            playerAttacking = true;
            playerWeapon.x = player.x;
            playerWeapon.y = player.y + 10;
            playerWeapon.visible = true;
            playerWeapon.body.setSize(0, 0, 0, 0);

            switch (direction) {
                case "right":
                    playerWeapon.anchor.setTo(.5, 1.5); // set rotation point of weapon
                    playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, 0, 0); // set collision box
                    playerWeapon.angle = 0;
                    game.add.tween(playerWeapon).to( { angle: 180 }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true); // animation only
                    playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){ // timer settings for weapon duration
                        if (playerAttacking === true) {
                            playerWeapon.visible = false;
                            playerAttacking = false;
                            playerAttackTimer.stop(true);
                            playerWeapon.body.setSize(0, 0, 0, 0);
                        }
                    });
                    playerAttackTimer.start();
                    break;
                case "left": // see comments for case right
                    playerWeapon.anchor.setTo(.5, 1.5);
                    playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, -playerWeaponStats.rangeX, 0);
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
                case "up": // see comments for case right
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
                case "down": // see comments for case right
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

    // function for the ai taking damage
    hitAi: function (source, enemy) {
        if (enemy.hit === false) { // checks if the ai can be hit
            enemy.health -= playerWeaponStats.dmg;
            console.log(enemy.health);
            enemy.hit = true;
            enemy.tint = 0xff4444;
            enemy.stunned = true;

            enemy.hitTimer.loop(1000, function() { // timer settings
                enemy.tint = 0xffffff;
                enemy.hit = false;
                enemy.stunned = false;
                enemy.hitTimer.stop(true);
            });

            enemy.knockBackLine.start.set(enemy.x, enemy.y + (enemy.height / 4));
            enemy.knockBackLine.end.set(source.x, source.y);
            enemy.knockBackLine.rotateAround(enemy.x, enemy.y + (enemy.height / 4), 180, true);
            game.physics.arcade.moveToXY(enemy, enemy.knockBackLine.end.x, enemy.knockBackLine.end.y, 300);


            enemy.knockBackTimer.loop(200, function() { // timer settings
                enemy.stunned = false;
                enemy.knockBackTimer.stop(true);
            });


            enemy.hitTimer.start();
            enemy.knockBackTimer.start();
        }

        if (enemy.health <= 0) { // kill the ai when their health is 0
            enemy.healthBar.kill();
            enemy.kill();
        }
    },

    // testing script to debug Tiled map objects -- not finished
    findObjectsByType: function(type, map) {
        var objectArr = [];
        map.objects.objects.forEach(function(obj){ //Check each object found in layer.

            if(obj.properties.type === type){ //Check if the type of this object matches with the one we want.
                obj.y -= map.tileHeight; //Phaser counts from top down, Tiled counts from bottom up.
                objectArr.push(obj); //Push obj into objectArr.
            }
        });
        return objectArr;
    },

    lineSight: function (line, range, enemy) {
        enemy.inRange = false;
        enemy.canSee = true;
        tileHits = wallsLayer.getRayCastTiles(line, 4, false, false);
        if(tileHits.length <= range){
            enemy.inRange = true;
            tileHits.forEach(function(element){
                if(element.index !== -1){
                    enemy.canSee = false;
                }
            });
        }


        if (enemy.inRange === true && enemy.canSee === true) {
            enemy.animations.play('walk');
            return true;
        }
        enemy.animations.play('idle');
    },

    endLevel: function () {
        alert("Level complete");
    }
};