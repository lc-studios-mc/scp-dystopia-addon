import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp1074", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			dimension.playSound("scpdt.scp1074.touch", block.center());
			player.addEffect("wither", 60 * mc.TicksPerSecond, { amplifier: 1 });
		},
	});
});
