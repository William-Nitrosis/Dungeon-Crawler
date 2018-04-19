var loadState = {
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

        // timing
        game.time.advancedTiming = true;

        // game ui
        game.load.image('joystickBall', 'assets/ui/joystickBall.png');
        game.load.image('joystickBackground', 'assets/ui/joystickBackground.png');
        game.load.atlas('arcade', 'assets/ui/arcade-joystick.png', 'assets/ui/arcade-joystick.json');
        game.load.atlas('dpad', 'assets/ui/dpad.png', 'assets/ui/dpad.json');

        // main menu ui
        game.load.spritesheet('uiButton', 'assets/ui/uiButton.png', 264, 68);
        game.load.image('uiBackground', 'assets/ui/uiBackground.png');

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
    create: function () {

        game.state.start('mainMenu');
    }
};