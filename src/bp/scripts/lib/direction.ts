import * as mc from "@minecraft/server";

export const LEGACY_FACING_DIRECTION_INDEX = {
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
