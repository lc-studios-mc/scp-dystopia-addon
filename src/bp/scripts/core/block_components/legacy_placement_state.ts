import { LEGACY_FACING_DIRECTION_INDEX } from "@/lib/direction";
import * as mc from "@minecraft/server";

const getPlayerFacingDirectionIndex = (player: mc.Player, reverse = false): number => {
	const rot = player.getRotation();
	const yaw = rot.y;

	// Normalize yaw to (-180, 180)
	const normalizedYaw = ((yaw + 180) % 360) - 180;

	if (normalizedYaw >= -45 && normalizedYaw < 45) {
		return reverse ? LEGACY_FACING_DIRECTION_INDEX.south : LEGACY_FACING_DIRECTION_INDEX.north;
	} else if (normalizedYaw >= 45 && normalizedYaw < 135) {
		return reverse ? LEGACY_FACING_DIRECTION_INDEX.west : LEGACY_FACING_DIRECTION_INDEX.east;
	} else if (normalizedYaw >= 135 || normalizedYaw < -135) {
		return reverse ? LEGACY_FACING_DIRECTION_INDEX.north : LEGACY_FACING_DIRECTION_INDEX.south;
	} else if (normalizedYaw >= -135 && normalizedYaw < -45) {
		return reverse ? LEGACY_FACING_DIRECTION_INDEX.east : LEGACY_FACING_DIRECTION_INDEX.west;
	}

	return 2;
};

const COMPONENT: mc.BlockCustomComponent = {
	beforeOnPlayerPlace(arg, arg1) {
		if (!arg.player) return;

		const params = arg1.params as Record<string, unknown>;

		const facingDirectionState = params.facingDirectionState;

		if (typeof facingDirectionState === "string") {
			const facingDirectionReverse = params.facingDirectionReverse === true;
			const index = getPlayerFacingDirectionIndex(arg.player, facingDirectionReverse);

			arg.permutationToPlace = arg.permutationToPlace.withState(facingDirectionState, index);
		}
	},
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:legacy_placement_state", COMPONENT);
});
