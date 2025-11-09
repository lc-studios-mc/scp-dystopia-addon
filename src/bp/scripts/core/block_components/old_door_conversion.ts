import { createBlockStatesString } from "@/lib/block_utils";
import { convertLegacyFacingDirectionToDir, getLegacyFacingDirectionIndex } from "@/lib/direction";
import * as vecarr from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";

type ComponentParams = {
	newType: string;
};

const convert = (block: mc.Block, params: ComponentParams) => {
	// Remove the old upper part block if it exists
	const above = block.above();
	if (above?.typeId === "lc:dt_door_dummy" || above?.typeId === "minecraft:barrier") {
		above.setType("minecraft:air");
	}

	const facingDirection = getLegacyFacingDirectionIndex(block.permutation)!;

	const cardinalDirection = convertLegacyFacingDirectionToDir(facingDirection).toLocaleLowerCase();
	const statesString = createBlockStatesString({
		"minecraft:cardinal_direction": cardinalDirection,
	});

	const location = vecarr.toArr3(block.location).join(" ");

	const cmd = `setblock ${location} ${params.newType} [${statesString}]`;

	block.dimension.runCommand(cmd);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:old_door_conversion", {
		onPlayerInteract(arg0, arg1) {
			convert(arg0.block, arg1.params as ComponentParams);
		},
		onTick(arg0, arg1) {
			convert(arg0.block, arg1.params as ComponentParams);
		},
	});
});
