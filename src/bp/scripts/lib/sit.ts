import * as mc from "@minecraft/server";

export const sit = (
	player: mc.Player,
	location: mc.Vector3,
	type: "lc:dt_sit" | "lc:dt_sit_toilet" | "lc:dt_sit_toilet_buttghost" = "lc:dt_sit",
): void => {
	const { dimension } = player;
	const entityType = type;
	const sitEntity = dimension.spawnEntity(entityType, location);
	const rideable = sitEntity.getComponent("rideable")!;
	rideable.addRider(player);
};
