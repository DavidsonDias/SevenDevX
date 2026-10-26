/** @file Shared brand symbols, rasterized locally for PDF export. */
import {
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaFacebookF,
  FaTiktok,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";
import { Globe, Mail, Phone, MessageSquare } from "lucide-react";
import type { ProposalChannelKind } from "@/lib/proposals";
export const channelIcons = {
  whatsapp: FaWhatsapp,
  instagram: FaInstagram,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  github: FaGithub,
  x: FaXTwitter,
  email: Mail,
  phone: Phone,
  website: Globe,
  other: MessageSquare,
};
export { proposalChannelColors as channelColors } from "@/lib/proposalIdentity";
export async function proposalIconData(kinds: ProposalChannelKind[]) {
  const [{ renderToStaticMarkup }, { proposalLogoData }] = await Promise.all([
    import("react-dom/server"),
    import("@/utils/proposalPdf"),
  ]);
  return Object.fromEntries(
    await Promise.all(
      [...new Set(kinds)].map(async (kind) => {
        const Icon = channelIcons[kind];
        const svg = renderToStaticMarkup(
          <Icon size={120} color="#ffffff" />,
        ).replace(/currentColor/g, "#ffffff");
        return [
          kind,
          await proposalLogoData(`data:image/svg+xml;base64,${btoa(svg)}`),
        ];
      }),
    ),
  );
}
