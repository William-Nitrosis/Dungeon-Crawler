var mainMenuState = {
    preload: function () {


        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.input.onDown.add(function(){
            game.scale.startFullScreen();
        }, this);
        //game.scale.setUserScale(window.innerWidth/ canvasWidth, window.innerHeight / canvasHeight);


        /* ====== start tutorial state ====== */

        // load ui
        game.load.spritesheet('newGameButton', 'assets/ui/newGameButton.png', 200, 100);
        game.load.spritesheet('debuggedButton', 'assets/ui/debuggerButton.png', 200, 100);
        game.load.spritesheet('optionsButton', 'assets/ui/optionsButton.png', 200, 100);
        game.load.spritesheet('touchscreenButton', 'assets/ui/touchscreenButton.png', 200, 100);
        game.load.spritesheet('keyboardAndMouseButton', 'assets/ui/keyboardAndMouseButton.png', 200, 100);

    },
    create: function (){
        testingGroundButton = game.add.button(game.world.centerX - 100, game.world.centerY - 250, 'newGameButton', function(){
            game.state.start('tutorial');
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



    },
    update: function (){

    },

    openOptions: function () {
        console.log('options opened');
    }

};


