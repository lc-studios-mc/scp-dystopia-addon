import * as mc from "@minecraft/server";

const getPlayerFacingDirectionIndex = (player: mc.Player): number => {
	const rot = player.getRotation();
	const yaw = rot.y;

	// Normalize yaw to (-180, 180)
	const normalizedYaw = ((yaw + 180) % 360) - 180;

	if (normalizedYaw >= -45 && normalizedYaw < 45) {
		return 2; // North
	} else if (normalizedYaw >= 45 && normalizedYaw < 135) {
		return 5; // East
	} else if (normalizedYaw >= 135 || normalizedYaw < -135) {
		return 3; // South
	} else if (normalizedYaw >= -135 && normalizedYaw < -45) {
		return 4; // West
	}

	return 2;
};

const COMPONENT: mc.BlockCustomComponent = {
	beforeOnPlayerPlace(arg, arg1) {
		if (!arg.player) return;

		const params = arg1.params as Record<string, unknown>;

		const facingDirectionState = params.facingDirectionState;
		if (typeof facingDirectionState === "string") {
			const index = getPlayerFacingDirectionIndex(arg.player);

			arg.permutationToPlace = arg.permutationToPlace.withState(facingDirectionState, index);
		}
	},
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:legacy_placement_state", COMPONENT);
});
