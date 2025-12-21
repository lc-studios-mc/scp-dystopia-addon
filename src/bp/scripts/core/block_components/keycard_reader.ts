import * as mc from "@minecraft/server";
import { getEntityClearanceLevel } from "@/lib/clearance_level";

type ComponentParams = {
	clearanceLevel: number;
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:keycard_reader", {
		onPlayerInteract({ block, dimension, player }, arg1) {
			const params = arg1.params as ComponentParams;

			if (!player) return;

			const requiredClearanceLevel = params.clearanceLevel;
			const playerClearanceLevel = getEntityClearanceLevel(player);

			if (playerClearanceLevel < requiredClearanceLevel) {
				player.onScreenDisplay.setActionBar({ translate: "dt.guide.not_enough_clearance" });
				return;
			}

			const center = block.center();

			const keyreadEntityLocation: mc.Vector3 = {
				x: center.x,
				y: center.y - 3,
				z: center.z,
			};

			dimension.spawnEntity("lc:dt_keyread", keyreadEntityLocation);

			dimension.playSound("scpdt.card_read", center, { volume: 0.6 });
		},
	});
});
