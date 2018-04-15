/* ====== create game object and canvas ====== */
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');

/* ====== create game states ====== */
game.state.add('mainMenu', mainMenuState);
game.state.add('tutorial', tutorialState);

/* ====== global variable ====== */
var player, keyboard, keyLeft, keyRight, keyDown, keyUp, wallsLayer, level1, background, floor, floorOverlay, ai, pathfinder, walkables, path, pad, stick, playerHitTimer, playerWeapon, playerAttackTimer, aiHealthBar, objectsLayer, playerExitZone;

// walkables - defines what tiles in the layers the ai can path find over
// pad and stick are the variables used to store the UI control sprites


var isBusy = false; // defines if the player sprite is currently busy playing an animation
var playerInvulnerable = false;
var playerAttacking = false;

var playerMovementSpeedMod = 1;
var playerMovementSpeedBase = 200;
var playerMovementSpeed = playerMovementSpeedMod * playerMovementSpeedBase;

var playerAttackSpeedMod = 1;
var playerAttackSpeedBase = 100;
var playerAttackSpeed = playerAttackSpeedMod * playerAttackSpeedBase;

var playerHealthMod = 1;
var playerHealthBase = 100;
var playerMaxHealth = playerHealthMod * playerHealthBase;
var playerHealth = playerHealthMod * playerHealthBase;

var playerHealthBar = healthbarConfig = {
    width: 250,
    height: 40,
    x: 150,
    y: 50,
    bg: {
        color: '#4e0002'
    },
    bar: {
        color: '#069500'
    },
    animationDuration: 1,
    flipped: false,
    isFixedToCamera: true
};



/* ====== start mainMenu state ====== */
var testingGroundButton, debuggerButton, debugged;

game.state.start('mainMenu');