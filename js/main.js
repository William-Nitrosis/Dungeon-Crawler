window.onload = function() {

    /* ====== global variable ====== */
    var player, keyboard, keyLeft, keyRight, keyDown, keyUp;
    var isBusy = false;

    /* ====== create game object and canvas ====== */
    var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render });


    /* ====== preload ====== */
    function preload() {
        // make everything CRISP
        game.stage.smoothed = false;


        game.load.atlas('knightSheet', 'assets/characters/Knight/Knight_spritesheet.png', 'assets/characters/Knight/Knight.json');

        game.load.spritesheet('knight_idle', 'assets/characters/Knight/Knight_idle.png', 32, 32, 2);
        game.load.spritesheet('knight_walk', 'assets/characters/Knight/Knight_walk.png', 32, 32, 8);
    }


    /* ====== create ====== */
    function create() {
        // Player, camera and world setup
        game.world.setBounds(0, 0, 1280, 720);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        player = game.add.sprite(64, 64, 'knightSheet');
        game.physics.arcade.enable(player);
        player.anchor.setTo(.5,.5);
        cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(player);
        game.camera.scale.x = 3.5;
        game.camera.scale.y = 3.5;

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
        // reset players physics movement variable
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        isBusy = false;

        // check for inputss
        if (keyLeft.isDown) 	{ player.body.velocity.x = -100; player.scale.x = -1; player.animations.play('walk'); isBusy=true;}	// move left
        if (keyRight.isDown) 	{ player.body.velocity.x = 100; player.scale.x = 1; player.animations.play('walk'); isBusy=true;}		// move right
        if (keyUp.isDown) 		{ player.body.velocity.y = -100; player.animations.play('walk'); isBusy=true;}	// move up
        if (keyDown.isDown) 	{ player.body.velocity.y = 100; player.animations.play('walk'); isBusy=true;}		// move down

        // animations
        if (isBusy === false) {
            player.animations.play('idle');
        }
    }

    /* ====== render ====== */
    function render() {

        game.debug.cameraInfo(game.camera, 32, 32);
        game.debug.spriteCoords(player, 32, 500);

    }
};