function spawnKey(point, key, vel) {
    dungeonKey = game.add.sprite(point.x, point.y, key);
    dungeonKeyAnimPlayed = false;
    dungeonKeyAnim = dungeonKey.animations.add('bounce', [0,1,2,3], 6, true);
    dungeonKey.enableBody = true;
    game.physics.arcade.enable(dungeonKey);
    dungeonKey.body.bounce.set(0.8);
    dungeonKey.body.drag.x = 100;
    dungeonKey.body.drag.y = 100;
    keys.add(dungeonKey);

    var keyDirection = game.rnd.integerInRange(1, 360);
    game.physics.arcade.velocityFromAngle(keyDirection, vel, dungeonKey.body.velocity);
}

function updateKeyUI() {
    dungeonKeyGoldCount = 0;
    for (var i = 0; i <= player.keys.length; i++ ) {
        if (player.keys[i] === "gold") {
            dungeonKeyGoldCount++;
            dungeonKeyUI = game.add.sprite(448, 32, 'dungeonKeyGold');
            dungeonKeyUI.fixedToCamera = true;
        }
    }

    copperKeyText.setText(dungeonKeyCopperCount);
    bronzerKeyText.setText(dungeonKeyBronzeCount);
    silverKeyText.setText(dungeonKeySilverCount);
    goldKeyText.setText(dungeonKeyGoldCount);
    platKeyText.setText(dungeonKeyPlatCount);

}

function collectKey(player, key) {
    key.kill();
    player.keys.push("gold");
    updateKeyUI();
}

function endLevel(player, zone) {
    console.log(zone.keyType);
    if (player.keys.includes(zone.keyType)) {
        console.log("end");
    } else {
        console.log("no end");
    }
}

function lineSight(line, range, enemy) {
    enemy.inRange = false;
    enemy.canSee = true;
    tileHits = wallsLayer.getRayCastTiles(line, 4, false, false);
    if(tileHits.length <= range){
        enemy.inRange = true;
        tileHits.forEach(function(element){
            if(element.index !== -1){
                enemy.canSee = false;
            }
        });
    }


    if (enemy.inRange === true && enemy.canSee === true) {
        enemy.animations.play('walk');
        return true;
    }
    enemy.animations.play('idle');
}

// testing script to debug Tiled map objects -- not finished
function findObjectsByType(type, map) {
    var objectArr = [];
    map.objects.objects.forEach(function(obj){ //Check each object found in layer.

        if(obj.properties.type === type){ //Check if the type of this object matches with the one we want.
            obj.y -= map.tileHeight; //Phaser counts from top down, Tiled counts from bottom up.
            objectArr.push(obj); //Push obj into objectArr.
        }
    });
    return objectArr;
}

function hitAi(source, enemy) {
    if (enemy.hit === false) { // checks if the ai can be hit
        enemy.health -= playerWeaponStats.dmg;
        enemy.hit = true;
        enemy.tint = 0xff4444;
        enemy.stunned = true;

        enemy.hitTimer.loop(1000, function() { // timer settings
            enemy.tint = 0xffffff;
            enemy.hit = false;
            enemy.hitTimer.stop(true);
        });

        enemy.knockBackLine.start.set(enemy.x, enemy.y + (enemy.height / 4));
        enemy.knockBackLine.end.set(source.x, source.y);
        enemy.knockBackLine.rotateAround(enemy.x, enemy.y + (enemy.height / 4), 180, true);
        game.physics.arcade.moveToXY(enemy, enemy.knockBackLine.end.x, enemy.knockBackLine.end.y, playerWeaponStats.knockBack);


        enemy.knockBackTimer.loop(playerWeaponStats.knockBackDuration, function() { // timer settings
            enemy.stunned = false;
            enemy.knockBackTimer.stop(true);
        });


        enemy.hitTimer.start();
        enemy.knockBackTimer.start();
    }

    if (enemy.health <= 0) { // kill the ai when their health is 0
        aiDead(enemy);
    }
}

// function for the player melee attacking
function playerAttackMeele(direction) {
    if (playerAttacking === false) { // check if the player can attack
        playerAttacking = true;
        playerWeapon.x = player.x;
        playerWeapon.y = player.y + 10;
        playerWeapon.visible = true;
        playerWeapon.body.setSize(0, 0, 0, 0);

        var startAngle;
        var endAngle;

        playerWeapon.body.enable = true;

        switch (direction) {
            case "right":
                playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, 0, 0); // set collision box
                startAngle = 0;
                endAngle = 180;
                break;
            case "left": // see comments for case right
                playerWeapon.body.setSize(playerWeaponStats.rangeX, playerWeaponStats.rangeY, -playerWeaponStats.rangeX, 0);
                startAngle = 0;
                endAngle = -180;
                break;
            case "up": // see comments for case right
                playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, -20);
                startAngle = -90;
                endAngle = 90;
                break;
            case "down": // see comments for case right
                playerWeapon.body.setSize(playerWeaponStats.rangeY, playerWeaponStats.rangeX, -playerWeaponStats.rangeY / 2.1, playerWeaponStats.rangeX);
                startAngle = -90;
                endAngle = -270;
                break;
        }

        playerWeapon.anchor.setTo(.5, 1.5);
        playerWeapon.angle = startAngle;
        game.add.tween(playerWeapon).to( { angle: endAngle }, playerWeaponStats.animSpeed, Phaser.Easing.Linear.None, true);
        playerAttackTimer.loop(playerWeaponStats.attackSpeed, function(){
            if (playerAttacking === true) {
                playerWeapon.visible = false;
                playerAttacking = false;
                playerAttackTimer.stop(true);
                playerWeapon.body.setSize(0, 0, 0, 0);
                playerWeapon.body.enable = false;
            }
        });
        playerAttackTimer.start();
    }
}

function damagePlayer(x, src) {
    if (playerInvulnerable === false) { // checks if the player can take damage
        playerHealth -= src.dmg;
        playerInvulnerable = true;
        player.tint = 0xff4444;
        playerHitTimer.loop(500, function(){ playerInvulnerable = false; player.tint = 0xffffff; playerHitTimer.stop(true);});
        playerHitTimer.start();
    } else if (playerHealth <= 0) {
        console.log("Player dead \n Health 0");
        game.paused = true;
    }
}

// run path finding algorithm to calculate the path to follow
function findPathTo(enemy, tilex, tiley) {
    var goodPath = [];

    pathfinder.setCallbackFunction(function(path) {
        path = path || [];
        goodPath = path;
    });

    pathfinder.preparePathCalculation([floor.getTileX(enemy.x),floor.getTileY(enemy.y)], [tilex,tiley]);
    pathfinder.calculatePath();

    return goodPath;
}

// move the enemies along the path
function pathSetup(enemy) {
    if (path.length >= 4) {
        game.physics.arcade.moveToXY(enemy, path[3].x*48, path[3].y*48, 100);
    } else if (path.length >= 3) {
        game.physics.arcade.moveToXY(enemy, path[2].x * 48, path[2].y * 48, 100);
    } else if (path.length >= 2) {
        game.physics.arcade.moveToXY(enemy, path[1].x*48, path[1].y*48, 100);
    }

    // flip enemy sprite
    if (enemy.x > player.x) {
        enemy.scale.x = -1;
    } else {
        enemy.scale.x = 1;
    }
}

function aiDead(enemy) {
    enemy.healthBar.kill();
    enemy.kill();
    if (enemies.countLiving() === 6) {
        spawnKey(enemy, "dungeonKeyGold", 150);
    }
}
function xpToNextLevel(player) {
    var lvl = player.level + 1;
    return Math.round(((4 * Math.pow(lvl,3)) / 5) - player.xp);
}

function createButton(x, y, text, call, context){
    var button = game.add.button(x, y, 'uiButton', call, context, 2, 1, 0);
    button.anchor.set(0.5);

    var bStyle = { font: "18px Arial", fill: "#ffffff", align: "center"};
    var bText = game.add.text(x, y, text, bStyle);
    bText.anchor.setTo(0.5);

    buttons.add(button);
}

function toggleDebugged(button) {
    debugged = !debugged;

    if (debugged) {
        button.setFrames(0);
    } else if (!debugged) {
        button.setFrames(1);
    }
}

function NewGameButton(){
    game.state.start('play');
}

function openOptions() {
    menuBackground = game.add.sprite(game.world.centerX, game.world.centerY, 'uiBackground');
    menuBackground.anchor.set(0.5);
    menuBackground.inputEnabled = true;
    menuBackgroundOpen = true;

}

function interactOptionsMenu(click) {
    if (menuBackgroundOpen) {
        var left = menuBackground.x - (menuBackground.width / 2);
        var right = menuBackground.x + (menuBackground.width / 2);
        var top = menuBackground.y - (menuBackground.height / 2);
        var bottom = menuBackground.y + (menuBackground.height / 2);

        if (click.x > left && click.x < right && click.y > top && click.y < bottom) {
            console.log("true");
        } else {
            menuBackground.destroy();
            menuBackgroundOpen = false;
        }
    }




}