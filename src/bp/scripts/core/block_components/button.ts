import * as mc from "@minecraft/server";
import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:button", {
		onPlayerInteract({ block }) {
			runCommandAtBlock(block, "function scpdt_system/push_button");
		},
	});
});
