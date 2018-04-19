/* ====== create game object and canvas ====== */
var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, '');

/* ====== create game states ====== */
game.state.add('boot', loadState);
game.state.add('mainMenu', mainMenuState);
game.state.add('play', playState);

/* ====== global variable ====== */
var player, keyboard, keyLeft, keyRight, keyDown, keyUp, wallsLayer, map, background, floor, floorOverlay, ai, pathfinder, walkables, path, pad, stick, playerHitTimer, playerWeapon, playerAttackTimer, aiHealthBar,
    playerExitZone, dungeonKey, dungeonKeyAnim, healthAndKeys, keys, dungeonKeyUI, playerExitZones, resText, resTextCurrent, buttons, menuBackground;
var dungeonKeyAnimPlayed = false;
// walkables - defines what tiles in the layers the ai can path find over
// pad and stick are the variables used to store the UI control sprites

var loadLevel = "levelTheFirst";

// keys
var dungeonKeyStyle = { font: "12px Arial", fill: "#fff", boundsAlignH: "center"};
var dungeonKeyCopperCount = 0;
var dungeonKeyBronzeCount = 0;
var dungeonKeySilverCount = 0;
var dungeonKeyGoldCount = 0;
var dungeonKeyPlatCount = 0;
var copperKeyText, bronzerKeyText, silverKeyText, goldKeyText, platKeyText;


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
var  debugged, menuBackgroundOpen;

game.state.start('boot');