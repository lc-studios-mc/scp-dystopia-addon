import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:desktop_display", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const isOn = !!block.permutation.getState("desktop_display:on");

			block.setPermutation(block.permutation.withState("desktop_display:on", !isOn));

			if (isOn) {
				dimension.playSound("scpdt.machine.off1", block.center());
			} else {
				dimension.playSound("scpdt.machine.on1", block.center());
			}
		},
	});
});
