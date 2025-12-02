import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp458_pizza_box", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const boxState = Number(block.permutation.getState("pizza_box:states"));
			const nextBoxState = boxState === 1 ? 2 : 1;

			block.setPermutation(block.permutation.withState("pizza_box:states", nextBoxState));

			if (boxState === 2) return;

			// Spawn pizza slice when opened
			const pizzaSliceItem = new mc.ItemStack("lc:dt_pizza_slice", 1);
			block.dimension.spawnItem(pizzaSliceItem, block.bottomCenter());

			block.dimension.playSound("random.pop", block.center());
		},
	});
});
