import * as mc from "@minecraft/server";

const FACING_DIRECTION_INDEX = {
	NORTH: 2,
	EAST: 5,
	SOUTH: 3,
	WEST: 4,
} as const;

const getPlayerFacingDirectionIndex = (player: mc.Player, reverse = false): number => {
	const rot = player.getRotation();
	const yaw = rot.y;

	// Normalize yaw to (-180, 180)
	const normalizedYaw = ((yaw + 180) % 360) - 180;

	if (normalizedYaw >= -45 && normalizedYaw < 45) {
		return reverse ? FACING_DIRECTION_INDEX.SOUTH : FACING_DIRECTION_INDEX.NORTH;
	} else if (normalizedYaw >= 45 && normalizedYaw < 135) {
		return reverse ? FACING_DIRECTION_INDEX.WEST : FACING_DIRECTION_INDEX.EAST;
	} else if (normalizedYaw >= 135 || normalizedYaw < -135) {
		return reverse ? FACING_DIRECTION_INDEX.NORTH : FACING_DIRECTION_INDEX.SOUTH;
	} else if (normalizedYaw >= -135 && normalizedYaw < -45) {
		return reverse ? FACING_DIRECTION_INDEX.EAST : FACING_DIRECTION_INDEX.WEST;
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
