import { destroyBlock } from "@/lib/block_utils";
import { getEntityClearanceLevel } from "@/lib/clearance_level";
import { flattenCoordinates, unflattenToCoordinates } from "@/lib/math_utils";
import * as mc from "@minecraft/server";

type DoorAction = "close" | "open";

type ComponentParams = {
	openSound?: {
		id: string;
		volume?: number;
		pitch?: number;
	};
	closeSound?: {
		id: string;
		volume?: number;
		pitch?: number;
	};
	minClearanceLevel?: number;
};

const STATE_NAME = {
	isBottomPart: "lc:is_bottom_part",
	action: "lc:action",
	stepMajor: "lc:step_major",
	stepMinor: "lc:step_minor",
} as const;

const MIN_STEP_INDEX = 0;
const MAX_STEP_INDEX = 15;

const getUpdatedStepIndex = (
	currentStepIndex: number,
	nextAction: DoorAction,
	minStepIndex: number,
	maxStepIndex: number,
): number => {
	if (mc.system.currentTick % 2 !== 0) return currentStepIndex; // Steps are updated only every 2 ticks
	if (nextAction === "open" && currentStepIndex < maxStepIndex) {
		return currentStepIndex + 1;
	}
	if (nextAction === "close" && currentStepIndex > minStepIndex) {
		return currentStepIndex - 1;
	}
	return currentStepIndex;
};

const getStep = (permutation: mc.BlockPermutation): { major: number; minor: number } => {
	const major = Number(permutation.getState(STATE_NAME.stepMajor));
	const minor = Number(permutation.getState(STATE_NAME.stepMinor));
	return { major, minor };
};

const COMPONENT: mc.BlockCustomComponent = {
	onPlace({ block }) {
		const isBottomPart = Boolean(block.permutation.getState(STATE_NAME.isBottomPart));

		if (!isBottomPart) {
			const blockBelow = block.below();

			if (!blockBelow || blockBelow.typeId === block.typeId) return;

			block.setType("minecraft:air");
			return;
		}

		const blockAbove = block.above();

		if (!blockAbove || !(blockAbove.isAir || block.isLiquid)) {
			destroyBlock(block);
			return;
		}

		const upperPartPermutation = block.permutation.withState(STATE_NAME.isBottomPart, false);

		blockAbove.setPermutation(upperPartPermutation);
	},
	onPlayerBreak({ block, brokenBlockPermutation }) {
		const isBottomPart = Boolean(brokenBlockPermutation.getState(STATE_NAME.isBottomPart));
		const otherPartBlock = isBottomPart ? block.above() : block.below();

		if (!otherPartBlock || otherPartBlock.typeId !== brokenBlockPermutation.type.id) return;

		destroyBlock(otherPartBlock);
	},
	onPlayerInteract({ block, dimension, player }, arg1) {
		if (!player) return;

		const isBottomPart = Boolean(block.permutation.getState(STATE_NAME.isBottomPart));

		const otherPartBlock = isBottomPart ? block.above() : block.below();
		if (!otherPartBlock || otherPartBlock.typeId !== block.typeId) return;

		const params = arg1.params as ComponentParams;
		const minClearanceLevel = params.minClearanceLevel ?? -1;

		const playerClearanceLevel = getEntityClearanceLevel(player);
		const isAccepted = playerClearanceLevel >= minClearanceLevel;

		if (!isAccepted) return;

		const blockToUpdate = isBottomPart ? block : otherPartBlock;

		const currentAction = blockToUpdate.permutation.getState(STATE_NAME.action) as DoorAction;
		const nextAction: DoorAction = currentAction === "close" ? "open" : "close";

		blockToUpdate.setPermutation(
			blockToUpdate.permutation.withState(STATE_NAME.action, nextAction),
		);

		if (minClearanceLevel !== -1) {
			dimension.playSound("scpdt.card_read", block.center());
		}
	},
	onTick({ block, dimension }, arg1) {
		if (mc.system.currentTick % 2 !== 0) return;

		const params = arg1.params as ComponentParams;

		const isBottomPart = Boolean(block.permutation.getState(STATE_NAME.isBottomPart));
		if (!isBottomPart) return; // Only the bottom part should be updated

		const otherPartBlock = isBottomPart ? block.above() : block.below();
		if (!otherPartBlock || otherPartBlock.typeId !== block.typeId) return;

		const currentStep = getStep(block.permutation);
		const currentStepFlat = flattenCoordinates(currentStep.major, currentStep.minor, 4);

		const action = block.permutation.getState(STATE_NAME.action) as DoorAction;

		let nextStepFlat = currentStepFlat;
		if (action === "close" && currentStepFlat > MIN_STEP_INDEX) nextStepFlat--;
		if (action === "open" && currentStepFlat < MAX_STEP_INDEX) nextStepFlat++;

		if (nextStepFlat === currentStepFlat) return;

		const nextStep = unflattenToCoordinates(nextStepFlat, 4);

		block.setPermutation(
			block.permutation
				.withState(STATE_NAME.stepMajor, nextStep.major)
				.withState(STATE_NAME.stepMinor, nextStep.minor),
		);

		otherPartBlock.setPermutation(
			otherPartBlock.permutation
				.withState(STATE_NAME.stepMajor, nextStep.major)
				.withState(STATE_NAME.stepMinor, nextStep.minor),
		);

		// --- Play Sounds ---
		if (params.openSound && action === "open" && nextStepFlat === 1) {
			dimension.playSound(params.openSound.id, block.location, {
				volume: params.openSound.volume,
				pitch: params.openSound.pitch,
			});
		}
		if (params.closeSound && action === "close" && nextStepFlat === 14) {
			dimension.playSound(params.closeSound.id, block.location, {
				volume: params.closeSound.volume,
				pitch: params.closeSound.pitch,
			});
		}
	},
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:sliding_door", COMPONENT);
});
