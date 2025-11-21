import { createBlockStatesString } from "@/lib/block_utils";
import * as vecarr from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";

type ComponentParams = {
	isRotated: boolean;
	clearanceLevel: number;
};

const convert = (block: mc.Block, params: ComponentParams) => {
	const dir = params.isRotated ? "west" : "north";

	const statesString = createBlockStatesString({
		"minecraft:cardinal_direction": dir,
	});

	const location = vecarr.toArr3(block.location).join(" ");

	let newType: string;
	switch (params.clearanceLevel) {
		default:
		case 0:
			newType = "lc:dt_blast_door_v2";
			break;
	}

	const cmd = `setblock ${location} ${newType} [${statesString}]`;

	block.dimension.runCommand(cmd);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:old_blast_door_conversion", {
		onPlayerInteract(arg0, arg1) {
			convert(arg0.block, arg1.params as ComponentParams);
		},
		onTick(arg0, arg1) {
			convert(arg0.block, arg1.params as ComponentParams);
		},
	});
});
