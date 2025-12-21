import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:button", {
		onPlayerInteract({ block, dimension }) {
			const center = block.center();

			const keyreadEntityLocation: mc.Vector3 = {
				x: center.x,
				y: center.y - 3,
				z: center.z,
			};

			dimension.spawnEntity("lc:dt_keyread", keyreadEntityLocation);

			dimension.playSound("scpdt.push_button", center, { volume: 0.9 });
		},
	});
});
