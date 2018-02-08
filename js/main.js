window.onload = function() {

    /* ====== global variable ====== */
    var player, keyboard, keyLeft, keyRight, keyDown, keyUp, wallsLayer, level1, background, floor, floorOverlay;
    var isBusy = false;
    var movementSpeed = 200;

    /* ====== create game object and canvas ====== */
    var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render });



    /* ====== preload ====== */
    function preload() {
        // make everything CRISP
        game.camera.scale.x = 1;
        game.camera.scale.y = 1;
        game.stage.smoothed = false;


        game.load.atlas('knightSheet', 'assets/characters/Knight/Knight_spritesheetX4.png', 'assets/characters/Knight/Knight.json');

        game.load.spritesheet('knight_idle', 'assets/characters/Knight/Knight_idle.png', 32, 32, 2);
        game.load.spritesheet('knight_walk', 'assets/characters/Knight/Knight_walk.png', 32, 32, 8);

        this.game.load.image('mapTiles', 'assets/tilesets/DarkDungeonv2_3x.png');
        this.game.load.tilemap('level1', 'assets/tilesets/DungeonTest.json', null, Phaser.Tilemap.TILED_JSON);

        game.time.advancedTiming = true;
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
        player.body.setSize(45, 68, 27, 27);


        //animation
        player.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 7, '', 4), 15, true);
        player.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
        player.animations.play('idle');

        // enable keyboard inputs
        keyboard = game.input.keyboard.createCursorKeys();
        keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.W);

    }


    /* ====== update ====== */
    function update() {
        game.physics.arcade.collide(wallsLayer, player);
        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        isBusy = false;

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -movementSpeed; player.scale.x = -1; player.animations.play('walk'); isBusy=true;}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = movementSpeed; player.scale.x = 1; player.animations.play('walk'); isBusy=true;}		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -movementSpeed; player.animations.play('walk'); isBusy=true;}	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = movementSpeed; player.animations.play('walk'); isBusy=true;}		// move down

        // animations
        if (isBusy === false) {
            player.animations.play('idle');
        }
    }

    /* ====== render ====== */
    function render() {

        game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(player, 32, 500);

        game.debug.body(player);
        //game.debug.body(wallsLayer);
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 30, 16, "#00ff00");

    }
};