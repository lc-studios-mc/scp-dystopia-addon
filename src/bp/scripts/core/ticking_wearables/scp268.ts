import * as mc from "@minecraft/server";
import { playerLoopEvents } from "../player_loop";

playerLoopEvents.on("tick", (data) => {
	if (data.equippable.getEquipment(mc.EquipmentSlot.Head)?.typeId !== "lc:dt_scp268") return;
	data.player.addEffect("invisibility", 25, {
		amplifier: 255,
		showParticles: false,
	});
});
