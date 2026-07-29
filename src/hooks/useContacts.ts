/**
 * useContacts.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useContacts.ts
 * @module Hooks
 *
 * @description
 * Leads e mensagens de contato, com invalidação de cache após mutações.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

 /**
  * 📋 useContacts - Hook para gerenciamento de leads/contatos
  * SevenDevX Enterprise Edition
  */
 
 import { useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import type { Database } from "@/integrations/supabase/types";
 
 type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
 type ContactStatus = Database["public"]["Enums"]["contact_status"];
 
 interface ContactFormData {
   name: string;
   email: string;
   phone?: string;
   company?: string;
   message?: string;
   service_type?: string;
   budget?: string;
   source?: string;
 }
 
 export const useContacts = () => {
   const { toast } = useToast();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   /**
    * Salva um novo contato/lead no banco de dados
    * @returns true se salvou com sucesso, false caso contrário
    */
   const saveContact = async (data: ContactFormData): Promise<boolean> => {
     setIsSubmitting(true);
     setError(null);
 
     try {
       const contactData: ContactInsert = {
         name: data.name,
         email: data.email,
         phone: data.phone || null,
         company: data.company || null,
         message: data.message || null,
         service_type: data.service_type || null,
         budget: data.budget || null,
         source: data.source || "website",
         status: "new" as ContactStatus,
       };
 
       const { error: insertError } = await supabase
         .from("contacts")
         .insert(contactData);
 
       if (insertError) {
         console.error("[useContacts] Insert error:", insertError);
         setError(insertError.message);
         return false;
       }
 
       console.log("[useContacts] Contact saved successfully");
       return true;
 
     } catch (err) {
       console.error("[useContacts] Unexpected error:", err);
       setError(err instanceof Error ? err.message : "Erro ao salvar contato");
       return false;
 
     } finally {
       setIsSubmitting(false);
     }
   };
 
   /**
    * Salva contato e abre WhatsApp (sempre abre WhatsApp, mesmo se falhar o save)
    */
   const saveAndOpenWhatsApp = async (
     data: ContactFormData,
     whatsappMessage: string,
     whatsappNumber: string = "5531984740625"
   ): Promise<void> => {
     // Tenta salvar no banco (não bloqueia WhatsApp)
     const saved = await saveContact(data);
 
     if (saved) {
       toast({
         title: "✅ Dados salvos!",
         description: "Suas informações foram registradas. Redirecionando para WhatsApp...",
       });
     } else {
       toast({
         title: "⚠️ Aviso",
         description: "Não foi possível salvar os dados, mas você será redirecionado para WhatsApp.",
         variant: "destructive",
       });
     }
 
     // Sempre abre WhatsApp (fallback garantido)
     const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
     window.open(whatsappUrl, "_blank");
   };
 
   return {
     saveContact,
     saveAndOpenWhatsApp,
     isSubmitting,
     error,
   };
 };
 
 export default useContacts;