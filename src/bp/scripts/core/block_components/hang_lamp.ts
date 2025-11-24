import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:hang_lamp", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);
			const lightState = Number(block.permutation.getState("light:state"));
			const shouldBlink = !!block.permutation.getState("light:blinking");

			if (hasWrench) {
				block.setPermutation(block.permutation.withState("light:blinking", !shouldBlink));
				return;
			}

			dimension.playSound("scpdt.light.switch", block.center());

			const newLightState = lightState === 0 ? 1 : 0;
			block.setPermutation(block.permutation.withState("light:state", newLightState));
		},
		onTick({ block, dimension }) {
			const shouldBlink = !!block.permutation.getState("light:blinking");
			if (!shouldBlink) return;

			const lightState = Number(block.permutation.getState("light:state"));
			const newLightState = lightState === 0 ? 1 : 0;
			block.setPermutation(block.permutation.withState("light:state", newLightState));

			const blinkSoundPitch = lightState === 0 ? 1.2 : 1.4;
			dimension.playSound("block.click", block.center(), { pitch: blinkSoundPitch });
		},
	});
});
