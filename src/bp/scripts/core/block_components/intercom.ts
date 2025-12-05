import * as mc from "@minecraft/server";

type ComponentParams = {
	broadcastSound: string;
	pitch: number;
	volume: number;
};

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:intercom", {
		onPlayerInteract({ block, dimension }, arg1) {
			const params = arg1.params as ComponentParams;

			const isBroadcasting = !!block.permutation.getState("intercom:broadcasting");
			if (isBroadcasting) return;

			block.setPermutation(block.permutation.withState("intercom:broadcasting", true));

			dimension.getPlayers().forEach((player) => {
				player.playSound(params.broadcastSound, { ...params });
			});
		},
		onTick({ block }) {
			const isBroadcasting = !!block.permutation.getState("intercom:broadcasting");
			if (!isBroadcasting) return;

			block.setPermutation(block.permutation.withState("intercom:broadcasting", false));
		},
	});
});
