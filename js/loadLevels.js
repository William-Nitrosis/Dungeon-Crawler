function endLevel(player, zone) {
    if (player.keys.includes(zone.keyType)) {
        loadLevel = zone.nLevel;
        console.log(loadLevel);
        console.log('Time spent level: '+game.time.elapsedSecondsSince(currentTime));
        game.state.start('play');
    } else {
        console.log("no end");
    }
}