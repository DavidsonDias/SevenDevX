import { resolveLucideIcon } from "@/components/ui/MobileLucideIconRender";
import ServicesPreviewContent from "./ServicesPreviewContent";

/** Mobile loads only the SVGs used by the current CMS services. */
export default function ServicesPreviewMobile() {
  return <ServicesPreviewContent resolveIcon={resolveLucideIcon} />;
}
