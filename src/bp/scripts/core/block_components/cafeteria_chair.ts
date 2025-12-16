import { convertLegacyFacingDirectionToDir, getLegacyFacingDirectionIndex } from "@/lib/direction";
import { sit } from "@/lib/sit";
import { isHoldingWrench } from "@/lib/wrench";
import { reverseDirection } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:cafeteria_chair", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);

			if (hasWrench) {
				const currentVariant = Number(block.permutation.getState("cafeteria_chair:color"));
				const nextVariant = (currentVariant + 1) % 4;

				block.setPermutation(block.permutation.withState("cafeteria_chair:color", nextVariant));
			} else {
				const facingDirIndex = getLegacyFacingDirectionIndex(block.permutation);
				const sitDirection = reverseDirection(convertLegacyFacingDirectionToDir(facingDirIndex));
				sit("standard", player, block.center(), sitDirection);
			}
		},
	});
});
