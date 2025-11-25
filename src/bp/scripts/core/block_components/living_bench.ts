import { sit } from "@/lib/sit";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:living_bench", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			sit(player, block.bottomCenter());
		},
	});
});
