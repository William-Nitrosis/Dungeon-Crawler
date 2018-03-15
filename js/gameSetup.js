/* ====== create game object and canvas ====== */
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '');

/* ====== create game states ====== */
game.state.add('mainMenu', mainMenuState);
game.state.add('tutorial', tutorialState);

/* ====== global variable ====== */
var player, keyboard, keyLeft, keyRight, keyDown, keyUp, wallsLayer, level1, background, floor, floorOverlay, ai, pathfinder, walkables, path, pad, stick, playerHitTimer, playerWeapon, playerAttackTimer;

var isBusy = false;
var playerInvulnerable = false;
var playerAttacking = false;

var playerMovementSpeedMod = 1;
var playerMovementSpeedBase = 200;
var playerMovementSpeed = playerMovementSpeedMod * playerMovementSpeedBase;

var playerAttackSpeedMod = 1;
var playerAttackSpeedBase = 100;
var playerAttackSpeed = playerAttackSpeedMod * playerAttackSpeedBase;

var playerHealthMod = 100;
var playerHealthBase = 100;
var playerHealth = playerHealthMod * playerHealthBase;



/* ====== start mainMenu state ====== */
game.state.start('mainMenu');