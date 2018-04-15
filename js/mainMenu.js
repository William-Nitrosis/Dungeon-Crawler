var mainMenuState = {
    preload: function () {
        /* ====== start tutorial state ====== */

        // load ui
        game.load.spritesheet('testingGroundButton', 'assets/ui/testingGroundButton.png', 200, 100);
        game.load.spritesheet('debuggedButton', 'assets/ui/debuggerButton.png', 200, 100);
    },
    create: function (){
        testingGroundButton = game.add.button(game.world.centerX - 100, game.world.centerY - 250, 'testingGroundButton', function(){
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


    },
    update: function (){

    }
};


