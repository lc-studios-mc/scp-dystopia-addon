import * as mc from "@minecraft/server";

export const sit = (player: mc.Player, location: mc.Vector3, toilet = false): void => {
	const { dimension } = player;
	const entityType = toilet ? "lc:dt_sit_toilet" : "lc:dt_sit";
	const sitEntity = dimension.spawnEntity(entityType, location);
	const rideable = sitEntity.getComponent("rideable")!;
	rideable.addRider(player);
};
