import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

const COMPONENT: mc.BlockCustomComponent = {
	onPlayerInteract(arg) {
		if (!arg.player) return;
		if (!isHoldingWrench(arg.player)) return;

		const currentCurveState = arg.block.permutation.getState("curve:states") as number;
		const nextCurveState = currentCurveState === 1 ? 2 : 1;

		arg.block.setPermutation(arg.block.permutation.withState("curve:states", nextCurveState));
	},
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:curve_block", COMPONENT);
});
