/**
 * projectImages.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/data/projectImages.ts
 * @module Content
 *
 * @description
 * Mapa de imagens dos projetos, incluindo resolução do prefixo `local:`.
 *
 * @see src/data/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🖼️ Project Image Registry
 * Maps `local:<filename>` keys (stored in DB) → imported asset URLs.
 * Used as a bridge between dynamic DB data and bundled local assets.
 * For uploaded images, the cover_image field contains a full Supabase Storage URL instead.
 */

import projectPsicoOne from "@/assets/PsicoOne.png";
import projectGeorgeFiuza from "@/assets/GeorgeFiuza.png";
import projectRoane from "@/assets/Roane.jpg";
import projectDavidsonDias from "@/assets/DavidsonDias.jpg";
import projectGithubProViewer from "@/assets/GithubProViewer.jpeg";
import projectVortexx from "@/assets/Vortexx.jpg";
import projectStellarNavigator from "@/assets/StellarNavigator.jpg";
import projectNatalFestivo from "@/assets/NatalFestivo.png";
import projectNutriSmart from "@/assets/NutriSmart.jpeg";
import projectHomeOS from "@/assets/HomeOS.jpeg";
import projectIBANPS from "@/assets/Ibanps.jpeg";
import projectAcaiOS from "@/assets/AcaiOS.jpeg";
import projectFoodOpsX from "@/assets/FoodOpsX.jpeg";
import projectEcommerce from "@/assets/project-ecommerce.jpg";
import projectDelivery from "@/assets/project-delivery.jpg";
import projectAnalytics from "@/assets/project-analytics.jpg";
import projectErp from "@/assets/project-erp.jpg";
import projectMedical from "@/assets/project-medical.jpg";
import projectArchitecture from "@/assets/project-architecture.jpg";
import projectManagement from "@/assets/project-management.jpg";
import placeholder from "@/assets/logo.svg";

const LOCAL_IMAGE_MAP: Record<string, string> = {
  "PsicoOne.png": projectPsicoOne,
  "GeorgeFiuza.png": projectGeorgeFiuza,
  "Roane.jpg": projectRoane,
  "DavidsonDias.jpg": projectDavidsonDias,
  "GithubProViewer.jpeg": projectGithubProViewer,
  "Vortexx.jpg": projectVortexx,
  "StellarNavigator.jpg": projectStellarNavigator,
  "NatalFestivo.png": projectNatalFestivo,
  "NutriSmart.jpeg": projectNutriSmart,
  "HomeOS.jpeg": projectHomeOS,
  "Ibanps.jpeg": projectIBANPS,
  "AcaiOS.jpeg": projectAcaiOS,
  "FoodOpsX.jpeg": projectFoodOpsX,
  "project-ecommerce.jpg": projectEcommerce,
  "project-delivery.jpg": projectDelivery,
  "project-analytics.jpg": projectAnalytics,
  "project-erp.jpg": projectErp,
  "project-medical.jpg": projectMedical,
  "project-architecture.jpg": projectArchitecture,
  "project-management.jpg": projectManagement,
};

/**
 * Resolve a cover_image stored in the DB to a usable URL.
 * - `local:<filename>` → bundled asset
 * - `https://...` or `/...` → returned as-is
 * - unknown / null → placeholder
 */
export const resolveProjectImage = (cover?: string | null): string => {
  if (!cover) return placeholder;
  if (cover.startsWith("local:")) {
    const key = cover.slice(6);
    return LOCAL_IMAGE_MAP[key] || placeholder;
  }
  return cover;
};

export const LOCAL_IMAGE_KEYS = Object.keys(LOCAL_IMAGE_MAP);
