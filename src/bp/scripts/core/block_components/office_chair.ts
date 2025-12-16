import { convertLegacyFacingDirectionToDir, getLegacyFacingDirectionIndex } from "@/lib/direction";
import { sit } from "@/lib/sit";
import { reverseDirection } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:office_chair", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			const facingDirIndex = getLegacyFacingDirectionIndex(block.permutation);
			const sitDirection = reverseDirection(convertLegacyFacingDirectionToDir(facingDirIndex));
			sit("standard", player, block.center(), sitDirection);
		},
	});
});
