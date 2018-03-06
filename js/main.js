//window.onload = function() {

    /* ====== global variable ====== */
    var player, keyboard, keyLeft, keyRight, keyDown, keyUp, wallsLayer, level1, background, floor, floorOverlay, ai, pathfinder, walkables, path, pad, stick, dpad, eSword, playerCurrentHealth;

    // player variables
    var isWalking = false;

    var playerMovementSpeedMod = 1;
    var playerMovementSpeedBase = 200;
    var playerMovementSpeed = playerMovementSpeedMod * playerMovementSpeedBase;

    var playerAttackSpeedMod = 1;
    var playerAttackSpeedBase = 100;
    var playerAttackSpeed = playerAttackSpeedMod * playerAttackSpeedBase;

    var playerHealthMod = 1;
    var playerHealthBase = 100;
    var playerHealth = playerHealthMod * playerHealthBase;


    /* ====== create game object and canvas ====== */
    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render });



    /* ====== preload ====== */
    function preload() {
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
    }


    /* ====== create ====== */
    function create() {
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

        playerCurrentHealth = playerHealth;
        console.log(playerHealth);
        console.log(playerCurrentHealth);

        // player animation
        player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
        player.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
        player.animations.play('idle');

        // spawn ai
        ai = game.add.sprite(1800, 830, 'slimeSheet');
        game.physics.arcade.enable(ai);
        ai.anchor.setTo(.5,.5);
        ai.body.setSize(45, 47, 27, 49);
        //ai.damage = 30;

        // slim animation
        ai.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
        ai.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
        ai.animations.play('idle');

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

        // swords
        //eSword = game.add.sprite(player.x, player.y);

    }


    /* ====== update ====== */
    function update() {
        game.physics.arcade.collide(wallsLayer, player);
        game.physics.arcade.collide(wallsLayer, ai);
        game.physics.arcade.overlap(player, ai, console.log("collision"));
        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        isWalking = false;

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -playerMovementSpeed; player.scale.x = -1; player.animations.play('walk'); isBusy=true;}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = playerMovementSpeed; player.scale.x = 1; player.animations.play('walk'); isBusy=true;}	// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -playerMovementSpeed; player.animations.play('walk'); isBusy=true;}	                    // move up
        if (keyDown.isDown) 	{ player.body.velocity.y = playerMovementSpeed; player.animations.play('walk'); isBusy=true;}		                // move down

        // check joystick input
        if (stick.isDown) {
            isWalking = true;
            this.physics.arcade.velocityFromRotation(stick.rotation, stick.force * playerMovementSpeed, player.body.velocity);
        }

        if (stick.angle < 89 && stick.angle > -89) {
            player.scale.x = 1;
        } else {
            player.scale.x = -1;
        }

        // check dpad input
        if (dpad.isDown) {
            // set attack 0

            if (dpad.direction === Phaser.LEFT) {

            } else if (dpad.direction === Phaser.RIGHT) {

            } else if (dpad.direction === Phaser.UP) {

            } else if (dpad.direction === Phaser.DOWN) {

            }
        }


        if(stick.isUp) {
            isWalking = false;
        }

        // animations
        if (isWalking === false) {
            player.animations.play('idle');
        }
        else {
            player.animations.play('walk');
        }


        // path finding
        path = findPathTo(floor.getTileX(player.x+20), floor.getTileY(player.y+32));

        if (path.length >= 4) {
            game.physics.arcade.moveToXY(ai, path[3].x*48, path[3].y*48, 100);
        } else {
            game.physics.arcade.moveToXY(ai, path[1].x*48, path[1].y*48, 100);
        }


    }

    /* ====== render ====== */
    function render() {

        //game.debug.cameraInfo(game.camera, 32, 32);
        //game.debug.spriteCoords(player, 32, 500);

        game.debug.body(player);
        //game.debug.body(eSword);
        game.debug.body(ai);
        //game.debug.body(wallsLayer);
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 30, 16, "#00ff00");

        game.debug.pointer(game.input.mousePointer);
        game.debug.pointer(game.input.pointer1);
        game.debug.pointer(game.input.pointer2);
        game.debug.pointer(game.input.pointer3);
        game.debug.pointer(game.input.pointer4);
        game.debug.pointer(game.input.pointer5);
        game.debug.pointer(game.input.pointer6);

    }

    /* ====== path finding ====== */
    function findPathTo(tilex, tiley) {
        var goodPath = [];

        pathfinder.setCallbackFunction(function(path) {
            path = path || [];
            goodPath = path;
        });

        pathfinder.preparePathCalculation([floor.getTileX(ai.x),floor.getTileY(ai.y)], [tilex,tiley]);
        pathfinder.calculatePath();

        return goodPath;
    }

    function damagePlayer(damage) {
        playerCurrentHealth -= damage;
        if (playerCurrentHealth <= 0) {
            //gameOver();
        }
    }

    function gameOver() {
        console.log(playerHealth);
        console.log(playerCurrentHealth);

        alert("Game over, you died");
        window.location.reload();
    }

function attack(direction) {
    switch (direction) {
        case up:

            break;
        case down:
            break;
        case left:
            break;
        case right:
            break;

    }
}
//};
