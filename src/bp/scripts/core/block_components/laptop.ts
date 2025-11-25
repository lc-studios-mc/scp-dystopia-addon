import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:laptop", {
		onPlayerInteract({ block, dimension }) {
			const isOn = block.permutation.getState("laptop:on");

			block.setPermutation(block.permutation.withState("laptop:on", !isOn));

			if (isOn) {
				dimension.playSound("scpdt.machine.off1", block.center());
			} else {
				dimension.playSound("scpdt.machine.on1", block.center());
			}
		},
	});
});
