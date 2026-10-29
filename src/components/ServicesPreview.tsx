import { resolveLucideIcon } from "@/components/ui/LucideIconRender";
import ServicesPreviewContent from "./ServicesPreviewContent";

/** Desktop keeps the existing icon implementation and the same shared view. */
export default function ServicesPreview() {
  return <ServicesPreviewContent resolveIcon={resolveLucideIcon} />;
}
