import { directionToRotation } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

type SitType = "standard" | "toilet" | "toilet_buttghost";

const SIT_ENTITY_TYPE = "lc:dt_sit";

export const sit = (
	sitType: SitType,
	player: mc.Player,
	location: mc.Vector3,
	direction: mc.Direction,
): void => {
	const sitEntity = player.dimension.spawnEntity(SIT_ENTITY_TYPE, location, {
		initialRotation: directionToRotation(direction).y,
	});
	sitEntity.setProperty("sit:type", sitType);

	const rideable = sitEntity.getComponent("rideable")!;
	rideable.addRider(player);
};
