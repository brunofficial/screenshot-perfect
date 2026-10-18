export type Profile = { id: string; name: string; age: number; area: string; price: number; hue: number };

// Fictional demo profiles — names, prices and areas are editable examples.
export const PROFILES: Profile[] = [
  { id: "luna", name: "Luna", age: 26, area: "Região central (demo)", price: 300, hue: 10 },
  { id: "isabela", name: "Isabela", age: 29, area: "Zona sul (demo)", price: 350, hue: 30 },
  { id: "marina", name: "Marina", age: 31, area: "Zona oeste (demo)", price: 420, hue: 350 },
  { id: "valentina", name: "Valentina", age: 24, area: "Zona norte (demo)", price: 280, hue: 20 },
  { id: "helena", name: "Helena", age: 33, area: "Região central (demo)", price: 380, hue: 0 },
  { id: "aurora", name: "Aurora", age: 28, area: "Zona leste (demo)", price: 450, hue: 40 },
];

export const LOGISTICS = [
  { id: "own", title: "Cada um vai por conta própria", desc: "A profissional e o cliente organizam seus próprios deslocamentos.", field: null },
  { id: "pickup", title: "Buscar a profissional em um ponto combinado", desc: "O ponto de encontro é definido durante a reserva e não aparece no perfil público.", field: "Ponto de encontro combinado" },
  { id: "ride", title: "Carona combinada", desc: "Somente se ambas as partes concordarem. A profissional pode recusar e optar por transporte independente.", field: "Ponto de embarque combinado" },
] as const;

export const VENUES = [
  { id: "motel", title: "Motel ou suíte por disponibilidade", desc: "Você escolhe o estabelecimento. A disponibilidade depende das condições no momento da chegada.",
    note: "Esta demonstração não consulta vagas reais nem garante a disponibilidade de quartos. Em uma versão real, as condições de indisponibilidade, cancelamento, reembolso e escolha de outro local deverão ser definidas claramente antes do pagamento." },
  { id: "hotel", title: "Hotel ou local previamente reservado", desc: "Informe o estabelecimento que já foi escolhido ou reservado.",
    note: "A demonstração não verifica a reserva nem o acesso ao estabelecimento." },
  { id: "other", title: "Outro local previamente combinado", desc: "Um local permitido, adequado e aceito por ambas as partes.", note: null },
] as const;

export const TIMES = Array.from({ length: 28 }, (_, i) => {
  const m = 10 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`;
});
