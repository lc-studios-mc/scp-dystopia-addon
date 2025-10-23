import {
	build,
	getMinecraftPackageVersions,
	getRequiredEnv,
	getRequiredEnvWithFallback,
	parseVersionString,
	type BuildConfig,
} from "ganban";
import packageConfig from "../package.json" with { type: "json" };
import path from "node:path";

const isDevBuild = Boolean(getRequiredEnvWithFallback("DEV", ""));
const addonVersionArray = parseVersionString(getRequiredEnvWithFallback("ADDON_VERSION", "0.0.1"));
const addonVersionForHumans = "v" + addonVersionArray.join(".");

const minEngineVersion = [1, 21, 111];
const behaviorPackUuid = "9fa24742-04b5-4fc3-89df-0b0be593866e";
const resourcePackUuid = "ddf2b8c2-0a9a-4ef9-b305-601872a22e46";

const minecraftPackageVersions = getMinecraftPackageVersions(packageConfig);

const behaviorPackManifest = {
	format_version: 2,
	header: {
		description: "An add-on for SCP Foundation-themed creations.",
		name: isDevBuild
			? `SCP: Dystopia BP - §7DEV§r`
			: `SCP: Dystopia BP - §7${addonVersionForHumans}§r`,
		uuid: behaviorPackUuid,
		version: addonVersionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "data",
			uuid: "882ce1a3-6037-4e1f-9e8b-8b88b14bb1ef",
			version: addonVersionArray,
		},
		{
			language: "javascript",
			type: "script",
			uuid: "6e3788b6-ac53-42ae-a2fe-d605715891c9",
			version: addonVersionArray,
			entry: "scripts/main.js",
		},
	],
	dependencies: [
		{
			// Resource pack dependency
			uuid: resourcePackUuid,
			version: addonVersionArray,
		},
		{
			module_name: "@minecraft/server",
			version: minecraftPackageVersions["@minecraft/server"],
		},
	],
};

const resourcePackManifest = {
	format_version: 2,
	header: {
		description: "An add-on for SCP Foundation-themed creations.",
		name: isDevBuild
			? `SCP: Dystopia RP - §7DEV§r`
			: `SCP: Dystopia RP - §7${addonVersionForHumans}§r`,
		uuid: resourcePackUuid,
		version: addonVersionArray,
		min_engine_version: minEngineVersion,
	},
	modules: [
		{
			type: "resources",
			uuid: "f1f9a0b5-25c6-435f-87f0-53706bdfcd52",
			version: addonVersionArray,
		},
	],
};

const buildConfigRaw = {
	behaviorPack: {
		type: "behavior",
		srcDir: "src/bp",
		outDir: isDevBuild ? "build/dev/bp" : `build/${addonVersionForHumans}/bp`,
		targetDirs: [] as string[],
		manifest: behaviorPackManifest,
		scripts: {
			entry: "src/bp/scripts/main.ts",
			bundle: true,
			minify: false,
			sourceMap: isDevBuild,
			tsconfig: "tsconfig.json",
		},
	},
	resourcePack: {
		type: "resource",
		srcDir: "src/rp",
		outDir: isDevBuild ? "build/dev/rp" : `build/${addonVersionForHumans}/rp`,
		targetDirs: [] as string[],
		manifest: resourcePackManifest,
		generateTextureList: true,
	},
	watch: Boolean(getRequiredEnvWithFallback("WATCH", "")),
} satisfies BuildConfig;

const buildConfig: BuildConfig = buildConfigRaw;

if (isDevBuild) {
	const devBehaviorPacksDir = getRequiredEnv("DEV_BEHAVIOR_PACKS_DIR");
	const devResourcePacksDir = getRequiredEnv("DEV_RESOURCE_PACKS_DIR");

	buildConfigRaw.behaviorPack.targetDirs = [
		path.join(devBehaviorPacksDir, "scp-dystopia-addon-bp-dev"),
	];
	buildConfigRaw.resourcePack.targetDirs = [
		path.join(devResourcePacksDir, "scp-dystopia-addon-rp-dev"),
	];
}

// Create archive for release builds
if (!isDevBuild) {
	const archiveName = `build/${addonVersionForHumans}/scp-dystopia-addon-${addonVersionForHumans}`;
	buildConfig.archives = [
		{
			outFile: `${archiveName}.mcaddon`,
		},
		{
			outFile: `${archiveName}.zip`,
		},
	];
}

await build(buildConfig);
