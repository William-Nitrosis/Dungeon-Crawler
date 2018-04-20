function endLevel(player, zone) {
    if (player.keys.includes(zone.keyType)) {

        loadLevel = zone.nLevel;
        console.log(loadLevel);
        game.state.start('play');
    } else {
        console.log("no end");
    }
}