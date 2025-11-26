import * as mc from "@minecraft/server";

export const LEGACY_FACING_DIRECTION_INDEX = {
	down: 0,
	up: 1,
	north: 2,
	east: 5,
	south: 3,
	west: 4,
} as const;

export const getLegacyFacingDirectionIndex = (
	permutation: mc.BlockPermutation,
): number | undefined => permutation.getState("facing:direction") as number | undefined;

export const convertLegacyFacingDirectionToDir = (facingDirection?: number): mc.Direction => {
	switch (facingDirection) {
		default:
		case 0:
			return mc.Direction.Down;
		case 1:
			return mc.Direction.Up;
		case 2:
			return mc.Direction.North;
		case 5:
			return mc.Direction.East;
		case 3:
			return mc.Direction.South;
		case 4:
			return mc.Direction.West;
	}
};

export const getBlockCardinalDirection = (
	permutation: mc.BlockPermutation,
): mc.Direction | undefined => {
	const blockDir = permutation.getState("minecraft:cardinal_direction");

	switch (blockDir) {
		case "north":
			return mc.Direction.North;
		case "south":
			return mc.Direction.South;
		case "west":
			return mc.Direction.West;
		case "east":
			return mc.Direction.East;
	}

	return undefined;
};
