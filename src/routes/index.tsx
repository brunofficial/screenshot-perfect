import { createFileRoute } from "@tanstack/react-router";
import { BookingFlow } from "@/components/chama/BookingFlow";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — Protótipo de reserva demonstrativa` },
      { name: "description", content: "Protótipo navegável de reserva com perfis fictícios, preços claros e pagamento simulado. Apenas para maiores de 18 anos." },
      { property: "og:title", content: `${BRAND.name} — Protótipo demonstrativo` },
      { property: "og:description", content: "Experiência de reserva simulada, discreta e sem troca de mensagens." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingFlow,
});
