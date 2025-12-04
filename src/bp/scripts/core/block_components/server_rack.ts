import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:server_rack", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const serverRackState = Number(block.permutation.getState("server_rack:states"));
			block.setPermutation(
				block.permutation.withState("server_rack:states", serverRackState === 1 ? 2 : 1),
			);
		},
	});
});
