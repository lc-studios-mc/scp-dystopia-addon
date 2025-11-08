import * as mc from "@minecraft/server";

const playSound = (block: mc.Block) => {
	const locStr = `${block.x} ${block.y} ${block.z}`;
	block.dimension.runCommand(
		`execute positioned ${locStr} run playsound scpdt.air_conditioner @a[r=16] ~~~`,
	);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:air_conditioner", {
		onPlayerInteract(arg) {
			const isOn = arg.block.permutation.getState("air_conditioner:on") === true;
			arg.block.setPermutation(arg.block.permutation.withState("air_conditioner:on", !isOn));

			// Currently not on, so if gonna turn on
			if (!isOn) {
				playSound(arg.block);
			}
		},
		onTick(arg) {
			const isOn = arg.block.permutation.getState("air_conditioner:on") === true;
			if (!isOn) return;

			playSound(arg.block);
		},
	});
});
