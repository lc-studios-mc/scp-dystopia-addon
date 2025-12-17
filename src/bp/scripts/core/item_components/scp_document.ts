import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp_document", {
		onUse({ source, itemStack }, arg1) {
			if (!source.isSneaking) return;

			const equippable = source.getComponent("equippable")!;
			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);
			if (!mainhandItem) return;
			if (mainhandItem.type !== itemStack?.type) return;

			const structureId = String((arg1.params as any).structureId);
			const structure = mc.world.structureManager.get(structureId);
			if (!structure) throw new Error(`No structure found with ID: ${structureId}`);

			// Consume item
			if (mainhandItem.amount > 1) {
				mainhandItem.amount--;
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
			} else {
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, undefined);
			}

			const structureLocation = new v.HybridVec3();
			vec3.add(structureLocation, v.toArr3(source.location), [1, 0, 1]);

			mc.world.structureManager.place(structure, source.dimension, structureLocation);

			source.dimension.playSound("random.anvil_land", structureLocation, {
				volume: 2.0,
				pitch: 0.8,
			});
		},
	});
});
