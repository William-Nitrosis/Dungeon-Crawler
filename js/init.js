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