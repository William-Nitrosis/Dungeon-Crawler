function spawnSlime(spawnX, spawnY) {
    ai = game.add.sprite(spawnX, spawnY, 'slimeSheet');
    game.physics.arcade.enable(ai);
    ai.anchor.setTo(.5,.5);
    ai.body.setSize(45, 47, 27, 49);
    ai.dmg = 15;
    ai.maxHealth = 10;
    ai.health = 10;
    ai.hit = false;
    ai.stunned = false;
    ai.line = new Phaser.Line();
    ai.losRange = 20;
    ai.inRange = false;
    ai.canSee = false;

// styling for the ai health bar
    aiHealthBar = {
        width: 62,
        height: 10,
        x: 0,
        y: 0,
        bg: {
            color: '#4e0002'
        },
        bar: {
            color: '#069500'
        },
        animationDuration: 1,
        flipped: false,
        isFixedToCamera: false
    };

    ai.healthBar = new HealthBar(this.game, aiHealthBar);

    ai.healthBar.setPercent(ai.health);
    ai.healthBar.setPosition(ai.x, ai.y);

// slim animation
    ai.animations.add('walk', Phaser.Animation.generateFrameNames('walk', 0, 5, '', 4), 10, true);
    ai.animations.add('idle', Phaser.Animation.generateFrameNames('idle', 0, 1, '', 4), 2, true);
    ai.animations.play('idle');
    enemies.add(ai);
}
