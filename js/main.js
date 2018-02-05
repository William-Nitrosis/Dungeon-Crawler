window.onload = function() {

    /* ====== global variable ====== */
    var player, keyboard, keyLeft, keyRight, keyDown, keyUp;

    /* ====== create game object and canvas ====== */
    var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render });


    /* ====== preload ====== */
    function preload() {
        // make everything CRISP
        game.stage.smoothed = false;


        game.load.spritesheet('knight_idle', 'assets/characters/Knight/Knight_idle.png', 32, 32, 2);
    }


    /* ====== create ====== */
    function create() {
        // Player, camera and world setup
        game.world.setBounds(0, 0, 1280, 720);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        player = game.add.sprite(64, 64, 'knight_idle');
        game.physics.arcade.enable(player);
        cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        game.camera.scale.x = 4;
        game.camera.scale.y = 4;

        //animation
        player.animations.add('idle');
        player.animations.play('idle', 2, true);

        // enable keyboard inputs
        keyboard = game.input.keyboard.createCursorKeys();
        keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.W);
    }


    /* ====== update ====== */
    function update() {
        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -150; }	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = 150; }		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -150; }	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = 150; }		// move down
    }

    /* ====== render ====== */
    function render() {

        game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(player, 32, 500);

    }
};