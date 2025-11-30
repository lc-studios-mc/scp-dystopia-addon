import * as mc from "@minecraft/server";
import mitt from "mitt";

type PlayerTickEventData = {
	player: mc.Player;
	health: mc.EntityHealthComponent;
	equippable: mc.EntityEquippableComponent;
};

type PlayerLoopEvents = {
	tick: PlayerTickEventData;
};

export const playerLoopEvents = mitt<PlayerLoopEvents>();

const playerTickEventDataCache = new Map<mc.Player, PlayerTickEventData>();

const onTickPlayer = (player: mc.Player): void => {
	let tickEventData: PlayerTickEventData | undefined = playerTickEventDataCache.get(player);

	if (!tickEventData) {
		const health = player.getComponent("health")!;
		const equippable = player.getComponent("equippable")!;
		tickEventData = {
			player,
			health,
			equippable,
		};
	}

	playerLoopEvents.emit("tick", tickEventData);
};

// Tick all players every tick
mc.world.afterEvents.worldLoad.subscribe((e) => {
	mc.system.runInterval(() => {
		const players = mc.world.getPlayers();
		for (let i = 0; i < players.length; i++) {
			onTickPlayer(players[i]!);
		}
	}, 1);
});

mc.world.beforeEvents.playerLeave.subscribe((e) => {
	playerTickEventDataCache.delete(e.player);
});
