import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:tesla_shock_block", {
		onStepOn({ block, dimension }) {
			const teslaState = Number(block.permutation.getState("tesla:state"));

			if (teslaState !== 0) return;

			dimension.playSound("scpdt.tesla.windup", block.center(), { volume: 1.5 });
			block.setPermutation(block.permutation.withState("tesla:state", 1));
		},
		onTick({ block, dimension }) {
			const teslaState = Number(block.permutation.getState("tesla:state"));

			if (teslaState === 1) {
				dimension.playSound("scpdt.tesla.shock", block.center(), { volume: 1.5 });
				runCommandAtBlock(block, "effect @e[r=3] instant_damage 1 20 true");
				runCommandAtBlock(block, "summon lightning_bolt ~~1~");
				block.setPermutation(block.permutation.withState("tesla:state", 2));
			} else if (teslaState === 2) {
				block.setPermutation(block.permutation.withState("tesla:state", 0));
			}
		},
	});
});
