import * as mc from "@minecraft/server";

const playSound = (block: mc.Block) => {
	const locStr = `${block.x} ${block.y} ${block.z}`;
	block.dimension.runCommand(`execute positioned ${locStr} run playsound scpdt.alarm @a[r=16] ~~~`);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:alarm", {
		onPlayerInteract(arg) {
			const alarmState = Number(arg.block.permutation.getState("alarm:states"));
			arg.block.setPermutation(
				arg.block.permutation.withState("alarm:states", alarmState === 1 ? 2 : 1),
			);

			// Currently not on, so if gonna turn on
			if (alarmState === 1) {
				playSound(arg.block);
			}
		},
		onTick(arg) {
			const alarmState = Number(arg.block.permutation.getState("alarm:states"));
			if (alarmState !== 2) return;

			playSound(arg.block);
		},
	});
});
