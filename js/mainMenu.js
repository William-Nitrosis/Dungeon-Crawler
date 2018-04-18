var mainMenuState = {
    preload: function () {
        if (fullscreenEnabled === true) {
            game.input.onDown.add(function(){
                var scale = Math.min(window.innerWidth / game.width, window.innerHeight / game.height);
                game.scale.setUserScale(scale,scale,0,0);
                game.scale.startFullScreen();
                game.scale.fullScreenScaleMode = Phaser.ScaleManager.USER_SCALE;
            }, this);
        }

        // load ui
        game.load.spritesheet('newGameButton', 'assets/ui/newGameButton.png', 200, 100);
        game.load.spritesheet('debuggedButton', 'assets/ui/debuggerButton.png', 200, 100);
        game.load.spritesheet('optionsButton', 'assets/ui/optionsButton.png', 200, 100);
        game.load.spritesheet('touchscreenButton', 'assets/ui/touchscreenButton.png', 200, 100);
        game.load.spritesheet('keyboardAndMouseButton', 'assets/ui/keyboardAndMouseButton.png', 200, 100);

    },
    create: function (){
        testingGroundButton = game.add.button(game.world.centerX - 100, game.world.centerY - 250, 'newGameButton', function(){
            game.state.start('play');
            }, this, 2, 1, 0);

        debuggerButton = game.add.button(game.world.centerX - 100, game.world.centerY - 100, 'debuggedButton', function(){
            debugged =! debugged;

            if (debugged) {
                debuggerButton.setFrames(0);
            } else if (!debugged) {
                debuggerButton.setFrames(1);
            }

        }, this, 2, 1, 0);

        optionsButton = game.add.button(game.world.centerX - 100, game.world.centerY + 50, 'optionsButton', this.openOptions, this, 2, 1, 0);

        var resStyle = { font: "18px Arial", fill: "#00ff00", align: "center"};
        resText = game.add.text(game.world.centerX, 30, ("Viewport res: \n" + canvasWidth + " x " + canvasHeight), resStyle);
        resText.anchor.setTo(0.5);

        resTextCurrent = game.add.text(game.world.centerX, 80, ("Current res: \n" + window.innerWidth + " x " + window.innerHeight), resStyle);
        resTextCurrent.anchor.setTo(0.5);


    },
    update: function (){
        resTextCurrent.setText("Current res: \n" + window.innerWidth + " x " + window.innerHeight);
    },

    openOptions: function () {
        console.log('options opened');
    }

};


