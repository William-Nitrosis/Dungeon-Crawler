// noinspection ES6ConvertVarToLetConst
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
        game.load.tilemap('level1', 'assets/tilesets/levelTheSecond.json', null, Phaser.Tilemap.TILED_JSON);

        // timing
        game.time.advancedTiming = true;

        // ui
        game.load.image('joystickBall', 'assets/ui/joystickBall.png');
        game.load.image('joystickBackground', 'assets/ui/joystickBackground.png');
        game.load.atlas('arcade', 'assets/ui/arcade-joystick.png', 'assets/ui/arcade-joystick.json');
        game.load.atlas('dpad', 'assets/ui/dpad.png', 'assets/ui/dpad.json');

        game.load.image('healthAndKeys', 'assets/ui/healthAndKeys.png');

        // player exit collision box
        game.load.image('playerExitPoint', 'assets/tilesets/playerExitZone.png');

        // load items
        game.load.spritesheet('dungeonKeyGold', 'assets/items/keyGold.png', 24, 24, 4);

        // touch control
        game.input.addPointer();
        game.input.addPointer();
        game.input.addPointer();
        game.input.addPointer();

        // load player weapons
        playerWeaponStats = ironSword;
        game.load.image('playerWeapon', playerWeaponStats.image);
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
        walkables = [41,42,43,44,54,55,28,29,30,31,23,24,56,57];
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


        // code for Tiled objects
        // Spawning enemies
        this.findObjectsByType("spawnZone", level1).forEach(function(zone) {
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

            // player keys
            player.keys = [];
            keys = game.add.group();
        });

        // spawning exit
        playerExitZones = game.add.group();
        playerExitZones.enableBody = true;
        game.physics.arcade.enable(playerExitZones);

        this.findObjectsByType("playerExit", level1).forEach(function(zone) {
            playerExitZone = game.add.sprite(zone.x, zone.y + zone.height, 'playerExitPoint');
            playerExitZone.keyType = zone.properties.keyType;
            playerExitZone.enableBody = true;
            game.physics.arcade.enable(playerExitZone);
            playerExitZones.add(playerExitZone);
        });

        // spawning items
        this.findObjectsByType("spawnItem", level1).forEach(function(zone) {
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
        bronzerKeyText = game.add.text(366, 73, dungeonKeyBronzeCount, dungeonKeyStyle);
        silverKeyText = game.add.text(411, 73, dungeonKeySilverCount, dungeonKeyStyle);
        goldKeyText = game.add.text(455, 73, dungeonKeyGoldCount, dungeonKeyStyle);
        platKeyText = game.add.text(500, 73, dungeonKeyPlatCount, dungeonKeyStyle);
        copperKeyText.fixedToCamera = true;
        bronzerKeyText.fixedToCamera = true;
        silverKeyText.fixedToCamera = true;
        goldKeyText.fixedToCamera = true;
        platKeyText.fixedToCamera = true;

        this.updateKeyUI();
    },
    update: function (){
        // collisions and calls
        game.physics.arcade.collide(wallsLayer, player);
        game.physics.arcade.collide(wallsLayer, enemies);
        game.physics.arcade.collide(wallsLayer, keys);
        game.physics.arcade.overlap(player, keys, this.collectKey, null, this, this);
        game.physics.arcade.overlap(playerExitZones, player, this.endLevel);
        game.physics.arcade.overlap(enemies, player, this.damagePlayer, null, this);
        game.physics.arcade.overlap(enemies, playerWeapon, this.hitAi, null, this);

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
        if (keyLeft.isDown) 	{ player.body.velocity.x = -playerMovementSpeed; player.scale.x = -1; isBusy=true;}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = playerMovementSpeed; player.scale.x = 1; isBusy=true;}		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -playerMovementSpeed; isBusy=true;}	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = playerMovementSpeed; isBusy=true;}		// move down`


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

        // -- end debugging code
    },

   // move the enemies along the path
    pathSetup: function (enemy) {
        if (path.length >= 4) {
            game.physics.arcade.moveToXY(enemy, path[3].x*48, path[3].y*48, 100);
        } else if (path.length >= 3) {
            game.physics.arcade.moveToXY(enemy, path[2].x * 48, path[2].y * 48, 100);
        } else if (path.length >= 2) {
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
            playerInvulnerable = true;
            player.tint = 0xff4444;
            playerHitTimer.loop(500, function(){ playerInvulnerable = false; player.tint = 0xffffff; playerHitTimer.stop(true);});
            playerHitTimer.start();
        } else if (playerHealth <= 0) {
            console.log("Player dead \n Health 0");
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

            var startAngle;
            var endAngle;

            playerWeapon.body.enable = true;

            switch (direction) {
                case "right":
                    playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, 0, 0); // set collision box
                    startAngle = 0;
                    endAngle = 180;
                    break;
                case "left": // see comments for case right
                    playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, -playerWeaponStats.rangeX, 0);
                    startAngle = 0;
                    endAngle = -180;
                    break;
                case "up": // see comments for case right
                    playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, -20);
                    startAngle = -90;
                    endAngle = 90;
                    break;
                case "down": // see comments for case right
                    playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, playerWeaponStats.rangeX);
                    startAngle = -90;
                    endAngle = -270;
                    break;
            }

            playerWeapon.anchor.setTo(.5, 1.5);
            playerWeapon.angle = startAngle;
            game.add.tween(playerWeapon).to( { angle: endAngle }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
            playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
                if (playerAttacking === true) {
                    playerWeapon.visible = false;
                    playerAttacking = false;
                    playerAttackTimer.stop(true);
                    playerWeapon.body.setSize(0, 0, 0, 0);
                    playerWeapon.body.enable = false;
                }
            });
            playerAttackTimer.start();
        }
    },

    // function for the ai taking damage
    hitAi: function (source, enemy) {
        if (enemy.hit === false) { // checks if the ai can be hit
            enemy.health -= playerWeaponStats.dmg;
            enemy.hit = true;
            enemy.tint = 0xff4444;
            enemy.stunned = true;

            enemy.hitTimer.loop(1000, function() { // timer settings
                enemy.tint = 0xffffff;
                enemy.hit = false;
                enemy.hitTimer.stop(true);
            });

            enemy.knockBackLine.start.set(enemy.x, enemy.y + (enemy.height / 4));
            enemy.knockBackLine.end.set(source.x, source.y);
            enemy.knockBackLine.rotateAround(enemy.x, enemy.y + (enemy.height / 4), 180, true);
            game.physics.arcade.moveToXY(enemy, enemy.knockBackLine.end.x, enemy.knockBackLine.end.y, playerWeaponStats.knockBack);


            enemy.knockBackTimer.loop(playerWeaponStats.knockBackDuration, function() { // timer settings
                enemy.stunned = false;
                enemy.knockBackTimer.stop(true);
            });


            enemy.hitTimer.start();
            enemy.knockBackTimer.start();
        }

        if (enemy.health <= 0) { // kill the ai when their health is 0
            this.aiDead(enemy);
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

    endLevel: function (player, zone) {
        console.log(zone.keyType);
        if (player.keys.includes(zone.keyType)) {
            console.log("end");
        } else {
            console.log("no end");
        }
    },

    aiDead: function (enemy) {
        enemy.healthBar.kill();
        enemy.kill();
        if (enemies.countLiving() === 6) {
            spawnKey(enemy, "dungeonKeyGold", 150);
        }
    },

    collectKey: function (player, key) {
        key.kill();
        player.keys.push("gold");
        tutorialState.updateKeyUI();
    },

    updateKeyUI: function () {
        dungeonKeyGoldCount = 0;
        for (var i = 0; i <= player.keys.length; i++ ) {
            if (player.keys[i] === "gold") {
                dungeonKeyGoldCount++;
                dungeonKeyUI = game.add.sprite(448, 32, 'dungeonKeyGold');
                dungeonKeyUI.fixedToCamera = true;
            }
        }

        copperKeyText.setText(dungeonKeyCopperCount);
        bronzerKeyText.setText(dungeonKeyBronzeCount);
        silverKeyText.setText(dungeonKeySilverCount);
        goldKeyText.setText(dungeonKeyGoldCount);
        platKeyText.setText(dungeonKeyPlatCount);

    }
};