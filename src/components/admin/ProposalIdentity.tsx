/** @file Client logo presentation controls and brand assets shared with PDF export. */
import { useEffect, useState } from "react";
import type { Proposal } from "@/lib/proposals";
export function ProposalClientLogo({
  url,
  name,
  treatment,
  surface,
}: {
  url: string;
  name: string;
  treatment: Proposal["logoTreatment"];
  surface: Proposal["logoSurface"];
}) {
  const requestKey = `${url}|${treatment}`;
  const [image, setImage] = useState<{
    url: string;
    data: string;
    error: string;
  }>({ url: "", data: "", error: "" });
  useEffect(() => {
    let active = true;
    import("@/utils/proposalPdf")
      .then(({ proposalLogoData }) => proposalLogoData(url, treatment))
      .then((data) => {
        if (active) setImage({ url: requestKey, data, error: "" });
      })
      .catch(() => {
        if (active)
          setImage({
            url: requestKey,
            data: "",
            error:
              "Não foi possível preparar a logo. Selecione o modo original ou outra imagem.",
          });
      });
    return () => {
      active = false;
    };
  }, [url, treatment, requestKey]);
  if (image.url !== requestKey || (!image.data && !image.error))
    return (
      <p role="status" className="text-xs text-white/50 py-4">
        Preparando logo…
      </p>
    );
  if (image.error)
    return (
      <p role="alert" className="text-xs text-amber-300 py-4">
        {image.error}
      </p>
    );
  return (
    <img
      src={image.data}
      alt={`Logo de ${name}`}
      className={`w-40 h-24 object-contain rounded-lg mb-6 ${surface === "light" ? "bg-white p-3" : surface === "dark" ? "bg-[#18243a] p-3" : ""}`}
    />
  );
}
