// noinspection ES6ConvertVarToLetConst
var playState = {
    preload: function () {
        game.load.tilemap('map', ('assets/tilesets/'+ loadLevel +'.json'), null, Phaser.Tilemap.TILED_JSON);

        /* ================== PUSHING DATA ================== */
        console.log('Options clicked: '+optionsClicked);
        console.log('Debugger clicked: '+debuggerClicked);
        console.log('Time spent on menu: '+game.time.elapsedSecondsSince(currentTime));


    },
    create: function (){
        currentTime = new Date();
        // world setup
        game.world.setBounds(0, 0, 5000, 5000);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        cursors = game.input.keyboard.createCursorKeys();

        // render tiled level map
        map = game.add.tilemap('map'); // step 1
        map.addTilesetImage('DungeonTiles', 'mapTiles'); // step 2
        background = map.createLayer('background');
        floor = map.createLayer('floor');
        floorOverlay = map.createLayer('floorOverlay');
        wallsLayer = map.createLayer('walls');
        //objectsLayer = map.createLayer('objects');
        background.resizeWorld();
        map.setCollisionBetween(1, 3078, true, 'walls');

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
        walkables = [41,42,43,44,54,55,28,29,30,31,23,24,56,57];
        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(map.layers[1].data, walkables);

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


        // code for Tiled objects
        // Spawning enemies
        findObjectsByType("spawnZone", map).forEach(function(zone) {
            if (zone.properties.type === "spawnZone") {
                switch (zone.properties.enemy) {
                    case "slime":
                        for (var i = 0; i < zone.properties.count; i++){
                            var spawnX = game.rnd.integerInRange(zone.x, zone.x + zone.width);
                            var spawnY = game.rnd.integerInRange(zone.y, zone.y + zone.height);
                            spawnSlime(spawnX, spawnY);
                        }
                }
            }
        });


        // Spawning player
        findObjectsByType("playerSpawn", map).forEach(function(zone) {
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

            // player keys
            player.keys = [];
            keys = game.add.group();

            // player xp
            player.xp = 60;
            player.level = 5;
        });

        // spawning exit
        playerExitZones = game.add.group();
        playerExitZones.enableBody = true;
        game.physics.arcade.enable(playerExitZones);

        findObjectsByType("playerExit", map).forEach(function(zone) {
            playerExitZone = game.add.sprite(zone.x, zone.y + zone.height, 'playerExitPoint');
            playerExitZone.keyType = zone.properties.keyType;
            playerExitZone.nLevel = zone.properties.nLevel;
            playerExitZone.enableBody = true;
            game.physics.arcade.enable(playerExitZone);
            playerExitZones.add(playerExitZone);
        });

        // spawning items
        findObjectsByType("spawnItem", map).forEach(function(zone) {
            switch(zone.properties.item) {
                case "dungeonKeyGold":
                    spawnKey(zone, zone.properties.item, 0);
                    break;
            }
        });

        // UI
        healthAndKeys = game.add.sprite(10, 15, 'healthAndKeys');
        healthAndKeys.fixedToCamera = true;

        // -- key text
        copperKeyText = game.add.text(317, 73, dungeonKeyCopperCount, dungeonKeyStyle);
        bronzeKeyText = game.add.text(366, 73, dungeonKeyBronzeCount, dungeonKeyStyle);
        silverKeyText = game.add.text(411, 73, dungeonKeySilverCount, dungeonKeyStyle);
        goldKeyText = game.add.text(455, 73, dungeonKeyGoldCount, dungeonKeyStyle);
        platKeyText = game.add.text(500, 73, dungeonKeyPlatCount, dungeonKeyStyle);
        copperKeyText.fixedToCamera = true;
        bronzeKeyText.fixedToCamera = true;
        silverKeyText.fixedToCamera = true;
        goldKeyText.fixedToCamera = true;
        platKeyText.fixedToCamera = true;

        updateKeyUI();
    },
    update: function (){
        // collisions and calls
        game.physics.arcade.collide(wallsLayer, player);
        game.physics.arcade.collide(wallsLayer, enemies);
        game.physics.arcade.collide(wallsLayer, keys);
        game.physics.arcade.overlap(player, keys, collectKey, null, this, this);
        game.physics.arcade.overlap(playerExitZones, player, endLevel, null, this, this);
        game.physics.arcade.overlap(enemies, player, damagePlayer, null, this);
        game.physics.arcade.overlap(enemies, playerWeapon, hitAi, null, this);

        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        isBusy = false;

        // check joystick inputs
        if (stick.isDown) {
            isBusy = true;
            this.physics.arcade.velocityFromRotation(stick.rotation, stick.force * playerMovementSpeed, player.body.velocity);
        }

        // check if the player is moving
        if(stick.isUp) {
            isBusy = false;
        }

        // flip player sprite
        if (stick.angle < 89 && stick.angle > -89) {
            player.scale.x = 1;
        } else {
            player.scale.x = -1;
        }

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -playerMovementSpeed; player.scale.x = -1; isBusy=true}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = playerMovementSpeed; player.scale.x = 1; isBusy=true}		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -playerMovementSpeed; isBusy=true;}	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = playerMovementSpeed; isBusy=true;}		// move down`


        // check dpad input
        if (dpad.isDown) {
            // call attack function
            if (dpad.direction === Phaser.LEFT) {
                playerAttackMeele("left");
            } else if (dpad.direction === Phaser.RIGHT) {
                playerAttackMeele("right");
            } else if (dpad.direction === Phaser.UP) {
                playerAttackMeele("up");
            } else if (dpad.direction === Phaser.DOWN) {
                playerAttackMeele("down");
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
            if (enemy.stunned === false && lineSight(enemy.line, enemy.losRange, enemy)) {
                path = findPathTo(enemy, floor.getTileX(player.x+20), floor.getTileY(player.y+32));
                pathSetup(enemy);
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

        // Item updates
        if (typeof dungeonKey !== 'undefined' && dungeonKeyAnimPlayed === false) {
            if (dungeonKey.body.velocity.x === 0 && dungeonKey.body.velocity.y === 0) {
                dungeonKeyAnim.play();
                dungeonKeyAnimPlayed =! dungeonKeyAnimPlayed;
            }
        }

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
        game.debug.text('Elapsed seconds: ' + game.time.elapsedSecondsSince(currentTime), 32, 32);

        // -- end debugging code
    }
};