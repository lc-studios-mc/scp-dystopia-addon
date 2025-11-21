import { getEntityClearanceLevel } from "@/lib/clearance_level";
import { getBlockCardinalDirection } from "@/lib/direction";
import * as mc from "@minecraft/server";

const onRemoveDoorEntity = (entity: mc.Entity): void => {
	entity.setDynamicProperty("dontHandleRemoval", true);
};

const onBreak = (block: mc.Block, player?: mc.Player): void => {
	const doorEntity = block.dimension.getEntities({
		closest: 1,
		type: "lc:dt_blast_door_e",
		location: block.bottomCenter(),
		maxDistance: 0.3,
	})[0];

	if (!doorEntity) {
		player?.sendMessage({ translate: "dt.guide.blast_door_v2.block_broken_but_no_entity" });
		player?.playSound("scpdt.fart");
		return;
	}

	mc.system.run(() => {
		try {
			doorEntity.remove();
		} catch {}
	});

	const dontHandleRemoval = !!doorEntity.getDynamicProperty("dontHandleRemoval");
	if (dontHandleRemoval) return;

	onRemoveDoorEntity(doorEntity);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:blast_door", {
		onPlace({ block, dimension }) {
			const dir = getBlockCardinalDirection(block.permutation);
			const clearanceLevel = Number(block.permutation.getState("scpdt:clearance_level"));

			const shouldRotate = dir === mc.Direction.East || dir === mc.Direction.West;
			const entityYaw = shouldRotate ? 90 : 0;

			const entity = dimension.spawnEntity("lc:dt_blast_door_e", block.bottomCenter());
			entity.setRotation({ x: 0, y: entityYaw });

			entity.setProperty("scpdt:clearance_level", clearanceLevel);
			entity.setProperty("scpdt:is_rotated", shouldRotate);
		},
		onPlayerBreak({ block, player }) {
			onBreak(block, player);
		},
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const playerClearanceLevel = Math.max(0, getEntityClearanceLevel(player));
			const requiredClearanceLevel = Number(block.permutation.getState("scpdt:clearance_level"));

			if (playerClearanceLevel < requiredClearanceLevel) {
				player.onScreenDisplay.setActionBar({ translate: "dt.guide.not_enough_clearance" });
				return;
			}

			if (requiredClearanceLevel > 0) {
				dimension.playSound("scpdt.card_read", block.center());
			}
		},
	});
});

mc.world.afterEvents.blockExplode.subscribe((e) => {
	if (e.block.typeId !== "lc:dt_blast_door_v2") return;
	const player = e.source instanceof mc.Player ? e.source : undefined;
	onBreak(e.block, player);
});

mc.world.afterEvents.entityDie.subscribe((e) => {
	if (e.deadEntity.typeId !== "lc:dt_blast_door_e") return;

	const dontHandleRemoval = !!e.deadEntity.getDynamicProperty("dontHandleRemoval");
	if (dontHandleRemoval) return;

	onRemoveDoorEntity(e.deadEntity);
});

mc.world.beforeEvents.entityRemove.subscribe((e) => {
	if (e.removedEntity.typeId !== "lc:dt_blast_door_e") return;

	const dontHandleRemoval = !!e.removedEntity.getDynamicProperty("dontHandleRemoval");
	if (dontHandleRemoval) return;

	onRemoveDoorEntity(e.removedEntity);
});
