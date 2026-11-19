import type { IconType } from "react-icons";
import {
  LuBadgeCheck,
  LuBlocks,
  LuBot,
  LuBrainCircuit,
  LuBuilding2,
  LuCloudCog,
  LuCode,
  LuCpu,
  LuDatabaseZap,
  LuDraftingCompass,
  LuFactory,
  LuFlaskConical,
  LuGraduationCap,
  LuHammer,
  LuHardHat,
  LuHeartPulse,
  LuKeyRound,
  LuLandmark,
  LuLayers,
  LuLockKeyhole,
  LuMap,
  LuNetwork,
  LuRocket,
  LuRoute,
  LuScale,
  LuSearch,
  LuServerCog,
  LuShieldCheck,
  LuTarget,
  LuTrendingUp,
  LuTruck,
  LuUmbrella,
  LuWallet,
  LuWorkflow,
} from "react-icons/lu";

export const serviceIcons: Record<string, IconType> = {
  rocket: LuRocket,
  brain: LuBrainCircuit,
  bot: LuBot,
  workflow: LuWorkflow,
  database: LuDatabaseZap,
  cloud: LuCloudCog,
  shield: LuShieldCheck,
  flask: LuFlaskConical,
  badge: LuBadgeCheck,
  blocks: LuBlocks,
};

export const categoryIcons: Record<string, IconType> = {
  cpu: LuCpu,
  server: LuServerCog,
  lock: LuLockKeyhole,
  network: LuNetwork,
};

export const industryIcons: Record<string, IconType> = {
  health: LuHeartPulse,
  logistics: LuTruck,
  fintech: LuWallet,
  edtech: LuGraduationCap,
  realestate: LuBuilding2,
  manufacturing: LuFactory,
  insurance: LuUmbrella,
  construction: LuHardHat,
  government: LuLandmark,
};

export const stageIcons: IconType[] = [
  LuSearch,
  LuMap,
  LuDraftingCompass,
  LuHammer,
  LuRocket,
  LuShieldCheck,
  LuTrendingUp,
];

export const whyIcons: Record<string, IconType> = {
  target: LuTarget,
  route: LuRoute,
  key: LuKeyRound,
  layers: LuLayers,
  shield: LuShieldCheck,
  trending: LuTrendingUp,
};

export const disciplineIcons: IconType[] = [
  LuBrainCircuit,
  LuDatabaseZap,
  LuCode,
  LuCloudCog,
  LuLockKeyhole,
  LuScale,
  LuWorkflow,
];
