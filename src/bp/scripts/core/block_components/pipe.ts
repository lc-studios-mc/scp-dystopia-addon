import { LEGACY_FACING_DIRECTION_INDEX } from "@/lib/direction";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:pipe", {
		beforeOnPlayerPlace(arg) {
			const blockFace = arg.permutationToPlace.getState("minecraft:block_face");

			// @ts-expect-error
			const legacyFacingDir: number = LEGACY_FACING_DIRECTION_INDEX[blockFace];

			arg.permutationToPlace = arg.permutationToPlace.withState(
				"facing:direction",
				legacyFacingDir,
			);
		},
	});
});
