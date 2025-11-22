import { getEntityClearanceLevel } from "@/lib/clearance_level";
import { getBlockCardinalDirection } from "@/lib/direction";
import { isPlayerCreativeOrSpectator } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

type ComponentParams = {
	clearanceLevel: number;
};

const onRemoveDoorEntity = (entity: mc.Entity): void => {
	entity.setDynamicProperty("dontHandleRemoval", true);
	entity.runCommand("fill ^-2 ^2 ^ ^2 ^0 ^ air replace lc:dt_door_dummy");
};

const getDoorEntityAtBlock = (block: mc.Block, player?: mc.Player): mc.Entity | undefined => {
	const doorEntity = block.dimension.getEntities({
		closest: 1,
		type: "lc:dt_blast_door_e",
		location: block.bottomCenter(),
		maxDistance: 0.3,
	})[0];

	if (doorEntity) return doorEntity;

	player?.sendMessage({ translate: "dt.guide.blast_door_v2.entity_not_found" });
	player?.playSound("scpdt.fart");
};

const onBreak = (block: mc.Block, player?: mc.Player): void => {
	const doorEntity = getDoorEntityAtBlock(block, player);
	if (!doorEntity) return;

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
		onPlace({ block, dimension }, arg1) {
			const params = arg1.params as ComponentParams;

			const dir = getBlockCardinalDirection(block.permutation);

			const shouldRotate = dir === mc.Direction.East || dir === mc.Direction.West;
			const entityYaw = shouldRotate ? 90 : 0;

			const entity = dimension.spawnEntity("lc:dt_blast_door_e", block.bottomCenter());
			entity.setRotation({ x: 0, y: entityYaw });

			entity.setProperty("scpdt:clearance_level", params.clearanceLevel);
			entity.setProperty("scpdt:is_rotated", shouldRotate);
		},
		onPlayerBreak({ block, dimension, brokenBlockPermutation, player }) {
			const shouldDropItem =
				mc.world.gameRules.doTileDrops && player && !isPlayerCreativeOrSpectator(player);
			if (shouldDropItem) {
				const itemStackToDrop = new mc.ItemStack(brokenBlockPermutation.type.id, 1);
				dimension.spawnItem(itemStackToDrop, block.center());
			}

			onBreak(block, player);
		},
		onPlayerInteract({ block, dimension, player }, arg1) {
			const params = arg1.params as ComponentParams;

			if (!player) return;

			const doorEntity = getDoorEntityAtBlock(block, player);
			if (!doorEntity) return;

			const playerClearanceLevel = Math.max(0, getEntityClearanceLevel(player));
			const requiredClearanceLevel = params.clearanceLevel;

			if (playerClearanceLevel < requiredClearanceLevel) {
				player.onScreenDisplay.setActionBar({ translate: "dt.guide.not_enough_clearance" });
				return;
			}

			if (requiredClearanceLevel > 0) {
				dimension.playSound("scpdt.card_read", block.center());
			}

			const currentDoorState = String(doorEntity.getProperty("scpdt:door_state"));

			if (currentDoorState === "closed") {
				doorEntity.triggerEvent("scpdt:open");
			} else if (currentDoorState === "opened") {
				doorEntity.triggerEvent("scpdt:close");
			}
		},
	});
});

mc.world.afterEvents.blockExplode.subscribe((e) => {
	if (e.block.typeId !== "lc:dt_blast_door_v2") return;
	const player = e.source instanceof mc.Player ? e.source : undefined;
	onBreak(e.block, player);
});

mc.world.afterEvents.dataDrivenEntityTrigger.subscribe(
	(e) => {
		const block = e.entity.dimension.getBlock(e.entity.location);
		if (!block) return;
		if (!block.getComponent("scpdt:blast_door")) return;

		block.setPermutation(block.permutation.withState("lc:has_collision", true));
	},
	{
		entityTypes: ["lc:dt_blast_door_e"],
		eventTypes: ["scpdt:enable_block_collision"],
	},
);

mc.world.afterEvents.dataDrivenEntityTrigger.subscribe(
	(e) => {
		const block = e.entity.dimension.getBlock(e.entity.location);
		if (!block) return;
		if (!block.getComponent("scpdt:blast_door")) return;

		block.setPermutation(block.permutation.withState("lc:has_collision", false));
	},
	{
		entityTypes: ["lc:dt_blast_door_e"],
		eventTypes: ["scpdt:disable_block_collision"],
	},
);

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
