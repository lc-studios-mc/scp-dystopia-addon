import { convertLegacyFacingDirectionToDir, getLegacyFacingDirectionIndex } from "@/lib/direction";
import { sit } from "@/lib/sit";
import { reverseDirection } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:toilet", {
		beforeOnPlayerPlace(arg) {
			const shouldBeButtghost = Math.random() < 0.1;
			if (shouldBeButtghost) {
				arg.permutationToPlace = arg.permutationToPlace.withState("toilet:buttghost", 1);
			}
		},
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const isButtghost = block.permutation.getState("toilet:buttghost") === 1;

			const facingDirIndex = getLegacyFacingDirectionIndex(block.permutation);
			const sitDirection = reverseDirection(convertLegacyFacingDirectionToDir(facingDirIndex));
			sit(isButtghost ? "toilet_buttghost" : "toilet", player, block.center(), sitDirection);
		},
		onTick({ block, dimension }) {
			const isButtghost = block.permutation.getState("toilet:buttghost") === 1;
			if (isButtghost) {
				dimension.playSound("scpdt.scp789j.butt", block.center());
			}
		},
	});
});
