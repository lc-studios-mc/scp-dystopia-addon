import { sit } from "@/lib/sit";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:wood_chair", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			sit(player, block.bottomCenter());
		},
	});
});
