import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:pizza_box", {
		onPlayerInteract({ block, dimension }) {
			const pizzaBoxState = Number(block.permutation.getState("pizza_box:states"));
			const newPizzaBoxState = pizzaBoxState === 1 ? 2 : 1;

			block.setPermutation(block.permutation.withState("pizza_box:states", newPizzaBoxState));

			dimension.playSound("item.book.page_turn", block.center(), { volume: 0.7 });
		},
	});
});
