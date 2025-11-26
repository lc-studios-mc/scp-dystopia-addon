import { LEGACY_FACING_DIRECTION_INDEX } from "@/lib/direction";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:pipe", {
		onPlace({ block }) {
			const blockFace = block.permutation.getState("minecraft:block_face");

			// @ts-expect-error
			const legacyFacingDir: number = LEGACY_FACING_DIRECTION_INDEX[blockFace];

			block.setPermutation(block.permutation.withState("facing:direction", legacyFacingDir));
		},
	});
});
