import * as builder from "@mcbe-toolbox-lc/builder";
import path from "node:path";
import packageConfig from "../package.json" with { type: "json" };

// Referenced environment variables:
// `DEV`                    | Mark as dev build when set to 1.
// `DEV_BEHAVIOR_PACKS_DIR` | Path to your com.mojang/development_behavior_packs folder. Required when `DEV=1`.
// `DEV_RESOURCE_PACKS_DIR` | Path to your com.mojang/development_resource_packs folder. Required when `DEV=1`.
// `VERSION`                | Add-on version string in `0.6.9` format. Does nothing when `DEV=1`.
// `WATCH`                  | Whether to watch for file changes to rebuild automatically.

// --- Define important variables

const addonName = "scp-dystopia";
const isDev = Boolean(builder.getEnv("DEV"));
const shouldWatch = Boolean(builder.getEnv("WATCH"));
const versionArray = builder.parseVersionString(builder.getEnvWithFallback("VERSION", "0.0.1"));
const versionForHumans = `v${versionArray.join(".")}`;
const minecraftPackageVersions = builder.getMinecraftPackageVersions(packageConfig);
const minEngineVersion = [1, 21, 120];
const behaviorPackUuid = "9fa24742-04b5-4fc3-89df-0b0be593866e";
const resourcePackUuid = "ddf2b8c2-0a9a-4ef9-b305-601872a22e46";

// --- Define pack manfiests

const packManifestName = `SCP: Dystopia ${isDev ? "DEV" : versionForHumans}`;
const packManifestDescription = "An add-on for SCP Foundation-themed creations.";

const behaviorPackManifest = {
	format_version: 2,
	header: {
		description: packManifestDescription,
		name: packManifestName,
		uuid: behaviorPackUuid,
		version: versionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "data",
			uuid: "882ce1a3-6037-4e1f-9e8b-8b88b14bb1ef",
			version: versionArray,
		},
		{
			language: "javascript",
			type: "script",
			uuid: "6e3788b6-ac53-42ae-a2fe-d605715891c9",
			version: versionArray,
			entry: "scripts/main.js",
		},
	],
	dependencies: [
		{
			uuid: resourcePackUuid,
			version: versionArray,
		},
		{
			module_name: "@minecraft/server",
			version: minecraftPackageVersions["@minecraft/server"],
		},
		{
			module_name: "@minecraft/server-ui",
			version: minecraftPackageVersions["@minecraft/server-ui"],
		},
	],
};

const resourcePackManifest = {
	format_version: 2,
	header: {
		description: packManifestDescription,
		name: packManifestName,
		uuid: resourcePackUuid,
		version: versionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "resources",
			uuid: "f1f9a0b5-25c6-435f-87f0-53706bdfcd52",
			version: versionArray,
		},
	],
	capabilities: ["pbr"],
};

// --- Define configuration object

const behaviorPackTargets: string[] = [];
const resourcePackTargets: string[] = [];
const archiveOptions: builder.ArchiveOptions[] = [];

if (isDev) {
	const devBehaviorPacksDir = builder.getEnvRequired("DEV_BEHAVIOR_PACKS_DIR");
	const devResourcePacksDir = builder.getEnvRequired("DEV_RESOURCE_PACKS_DIR");

	const mainTargetPrefix = `build/dev`;
	behaviorPackTargets.push(path.join(mainTargetPrefix, "bp"));
	resourcePackTargets.push(path.join(mainTargetPrefix, "rp"));
	behaviorPackTargets.push(path.join(devBehaviorPacksDir, `${addonName}-bp-dev`));
	resourcePackTargets.push(path.join(devResourcePacksDir, `${addonName}-rp-dev`));
} else {
	const mainTargetPrefix = `build/${versionForHumans}`;
	behaviorPackTargets.push(path.join(mainTargetPrefix, "bp"));
	resourcePackTargets.push(path.join(mainTargetPrefix, "rp"));

	const archivePath = path.join(mainTargetPrefix, `${addonName}-${versionForHumans}`);
	archiveOptions.push({ outFile: `${archivePath}.mcaddon` });
	archiveOptions.push({ outFile: `${archivePath}.zip` });
}

const config: builder.ConfigInput = {
	behaviorPack: {
		srcDir: "src/bp",
		targetDir: behaviorPackTargets,
		manifest: behaviorPackManifest,
		scripts: {
			entry: "src/bp/scripts/main.ts",
			bundle: true,
			sourceMap: isDev,
		},
	},
	resourcePack: {
		srcDir: "src/rp",
		targetDir: resourcePackTargets,
		manifest: resourcePackManifest,
		generateTextureList: true,
	},
	watch: shouldWatch,
	archive: archiveOptions,
};

// --- Start build

await builder.build(config);
