var mainMenuState = {
    preload: function () {
        game.input.onDown.add(interactOptionsMenu, self);
        buttons = game.add.group();

        if (fullscreenEnabled === true) {
            game.input.onDown.add(function(){
                var scale = Math.min(window.innerWidth / game.width, window.innerHeight / game.height);
                game.scale.setUserScale(scale,scale,0,0);
                game.scale.startFullScreen();
                game.scale.fullScreenScaleMode = Phaser.ScaleManager.USER_SCALE;
            }, this);
        }

    },
    create: function (){
        var bOffSet = game.world.centerY * 0.2;
        createButton(game.world.centerX, game.world.centerY * 0.6, "New game", NewGameButton, this);
        createButton(game.world.centerX, game.world.centerY * 0.8, "Debugger mode", toggleDebugged, this);
        createButton(game.world.centerX, game.world.centerY * 1.0, "Options", openOptions, this);

        var resStyle = { font: "18px Arial", fill: "#00ff00", align: "center"};
        resText = game.add.text(game.world.centerX, 30, ("Viewport res: \n" + canvasWidth + " x " + canvasHeight), resStyle);
        resText.anchor.setTo(0.5);

        resTextCurrent = game.add.text(game.world.centerX, 80, ("Current res: \n" + window.innerWidth + " x " + window.innerHeight), resStyle);
        resTextCurrent.anchor.setTo(0.5);




    },
    update: function (){
        resTextCurrent.setText("Current res: \n" + window.innerWidth + " x " + window.innerHeight);
    }

};


