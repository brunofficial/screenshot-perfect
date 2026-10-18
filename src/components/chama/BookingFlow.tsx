import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { brl, priceBreakdown } from "@/lib/pricing";
import { LOGISTICS, PROFILES, TIMES, VENUES, type Profile } from "./data";

type Step = "age" | "location" | "profiles" | "when" | "logistics" | "venue" | "summary" | "checkout" | "done";
const FLOW: Step[] = ["location", "profiles", "when", "logistics", "venue", "summary"];

type State = {
  uf: string; ufName: string; city: string;
  profileId: string | null; hours: 1 | 2; date: string; time: string;
  logistics: string; logisticsPlace: string; venue: string; venueName: string;
};
const INITIAL: State = { uf: "", ufName: "", city: "", profileId: null, hours: 1, date: "", time: "", logistics: "own", logisticsPlace: "", venue: "", venueName: "" };

const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const fmtDate = (s: string) => (s ? new Date(s + "T12:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) : "—");

export function BookingFlow() {
  const [step, setStep] = useState<Step>("age");
  const [s, setS] = useState<State>(INITIAL);
  const set = (p: Partial<State>) => setS((o) => ({ ...o, ...p }));
  const profile = PROFILES.find((p) => p.id === s.profileId) ?? null;

  useEffect(() => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const valid: Record<string, boolean> = {
    location: !!s.uf && !!s.city,
    profiles: !!profile,
    when: !!s.date && s.date >= today() && !!s.time,
    logistics: s.logistics === "own" || s.logisticsPlace.trim().length > 1,
    venue: !!s.venue && s.venueName.trim().length > 1,
    summary: true,
  };
  const go = (d: 1 | -1) => setStep(FLOW[FLOW.indexOf(step) + d] ?? step);
  const showSummary = FLOW.includes(step) && step !== "location" && step !== "summary";

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
        <div className="orb absolute -left-20 top-10 h-72 w-72 rounded-full bg-ruby/40" />
        <div className="orb absolute right-0 top-1/2 h-80 w-80 rounded-full bg-glow/20 [animation-delay:-6s]" />
      </div>
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <button onClick={() => { setS(INITIAL); setStep(step === "age" ? "age" : "location"); }} aria-label={`${BRAND.name} — início`}><Logo /></button>
        <span className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">Demonstração</span>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-36 lg:pb-16">
        {FLOW.includes(step) && <Progress index={FLOW.indexOf(step)} />}
        <div className={showSummary ? "grid gap-8 lg:grid-cols-[1fr_340px]" : ""}>
          <div key={step} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            {step === "age" && <AgeGate onYes={() => setStep("location")} />}
            {step === "location" && <Location s={s} set={set} />}
            {step === "profiles" && <Profiles s={s} set={set} />}
            {step === "when" && profile && <When s={s} set={set} profile={profile} />}
            {step === "logistics" && <Logistics s={s} set={set} />}
            {step === "venue" && <Venue s={s} set={set} />}
            {step === "summary" && profile && <Summary s={s} profile={profile} onEdit={(st) => setStep(st)} />}
            {step === "checkout" && profile && <Checkout s={s} profile={profile} onBack={() => setStep("summary")} onPay={() => setStep("done")} />}
            {step === "done" && profile && <Done s={s} profile={profile} onEdit={() => setStep("summary")} onRestart={() => { setS(INITIAL); setStep("age"); }} />}

            {FLOW.includes(step) && (
              <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 p-4 backdrop-blur lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
                {showSummary && profile && <MiniTotal s={s} profile={profile} />}
                <div className="mx-auto flex max-w-6xl gap-3">
                  {step !== "location" && <button onClick={() => go(-1)} className="rounded-full border px-5 py-3.5 text-sm font-semibold hover:bg-muted">Voltar</button>}
                  <button disabled={!valid[step]} onClick={() => (step === "summary" ? setStep("checkout") : go(1))} className="btn-cta flex-1 rounded-full px-6 py-3.5 text-sm font-bold lg:flex-none lg:min-w-64">
                    {{ location: "Ver perfis", profiles: "Escolher este perfil", when: "Continuar", logistics: "Continuar", venue: "Revisar reserva", summary: "Continuar para pagamento" }[step as string]}
                  </button>
                </div>
              </div>
            )}
          </div>
          {showSummary && <aside className="hidden lg:block"><div className="sticky top-6"><SummaryCard s={s} profile={profile} /></div></aside>}
        </div>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden>
        <defs><linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--ruby)" /><stop offset="1" stopColor="var(--champagne)" /></linearGradient></defs>
        <path d="M11 1c1 5 9 8 9 15a9 9 0 0 1-18 0c0-4 3-6 4-9 1 3 2 4 4 4-1-3-1-6 1-10Z" fill="url(#fl)" />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-[0.25em]">{BRAND.name}</span>
    </span>
  );
}

function Progress({ index }: { index: number }) {
  return (
    <div className="mb-8 flex gap-1.5" aria-label={`Etapa ${index + 1} de ${FLOW.length}`}>
      {FLOW.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-glow" : "bg-muted"}`} />)}
    </div>
  );
}

function Title({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-7">
      {kicker && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-champagne">{kicker}</p>}
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {sub && <p className="mt-3 max-w-xl text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Option({ on, onClick, title, desc, children }: { on: boolean; onClick: () => void; title: string; desc: string; children?: ReactNode }) {
  return (
    <div className={`glass rounded-2xl transition-all ${on ? "option-on" : "hover:border-champagne/30"}`}>
      <button type="button" role="radio" aria-checked={on} onClick={onClick} className="flex w-full items-start gap-4 p-5 text-left">
        <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-glow" : "border-muted-foreground/50"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-glow" />}</span>
        <span><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-muted-foreground">{desc}</span></span>
      </button>
      {on && children && <div className="animate-in fade-in px-5 pb-5 pl-14">{children}</div>}
    </div>
  );
}

/* ---------- Steps ---------- */

function AgeGate({ onYes }: { onYes: () => void }) {
  const [left, setLeft] = useState(false);
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-champagne">{BRAND.tagline}</p>
      <h1 className="text-4xl font-extrabold sm:text-5xl">Uma experiência para adultos.</h1>
      {left ? (
        <p role="status" className="glass mt-8 rounded-2xl p-5 text-muted-foreground">Este conteúdo é destinado exclusivamente a maiores de 18 anos. Você pode fechar esta página.</p>
      ) : (
        <>
          <p className="mt-5 text-lg text-muted-foreground">Você confirma que tem 18 anos ou mais?</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button onClick={onYes} className="btn-cta flex-1 rounded-full px-6 py-4 font-bold">Sim, tenho 18 anos ou mais</button>
            <button onClick={() => setLeft(true)} className="rounded-full border px-6 py-4 font-semibold hover:bg-muted">Sair</button>
          </div>
        </>
      )}
      <p className="mt-10 text-xs text-muted-foreground/70">Protótipo: esta confirmação é apenas uma barreira de interface, não uma verificação real de idade.</p>
    </section>
  );
}

type Uf = { id: number; sigla: string; nome: string };
type Mun = { id: number; nome: string };

function useFetch<T>(url: string | null) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: boolean }>({ data: null, loading: !!url, error: false });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!url) { setState({ data: null, loading: false, error: false }); return; }
    let live = true;
    setState({ data: null, loading: true, error: false });
    fetch(url).then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => live && setState({ data: d, loading: false, error: false }))
      .catch(() => live && setState({ data: null, loading: false, error: true }));
    return () => { live = false; };
  }, [url, n]);
  return { ...state, retry: () => setN((x) => x + 1) };
}

function Location({ s, set }: { s: State; set: (p: Partial<State>) => void }) {
  const ufs = useFetch<Uf[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
  const muns = useFetch<Mun[]>(s.uf ? `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${s.uf}/municipios?orderBy=nome` : null);
  const sortedUfs = useMemo(() => ufs.data?.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [ufs.data]);
  const sortedMuns = useMemo(() => muns.data?.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [muns.data]);
  return (
    <section className="max-w-xl">
      <Title kicker="Localização" title="Por onde começamos?" sub="Escolha a região para visualizar os perfis disponíveis na demonstração." />
      <div className="glass space-y-5 rounded-3xl p-6">
        <div>
          <label htmlFor="uf" className="mb-2 block text-sm font-semibold">Estado</label>
          <select id="uf" className="field" value={s.uf} disabled={ufs.loading || ufs.error}
            onChange={(e) => { const u = sortedUfs?.find((x) => x.sigla === e.target.value); set({ uf: e.target.value, ufName: u?.nome ?? "", city: "" }); }}>
            <option value="">{ufs.loading ? "Carregando estados…" : "Selecione o estado"}</option>
            {sortedUfs?.map((u) => <option key={u.id} value={u.sigla}>{u.nome}</option>)}
          </select>
          {ufs.error && <Err msg="Não foi possível carregar os estados do IBGE." retry={ufs.retry} />}
        </div>
        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-semibold">Cidade</label>
          <select id="city" className="field" value={s.city} disabled={!s.uf || muns.loading || muns.error} onChange={(e) => set({ city: e.target.value })}>
            <option value="">{!s.uf ? "Selecione um estado primeiro" : muns.loading ? "Carregando municípios…" : "Selecione a cidade"}</option>
            {sortedMuns?.map((m) => <option key={m.id} value={m.nome}>{m.nome}</option>)}
          </select>
          {muns.error && <Err msg="Não foi possível carregar os municípios." retry={muns.retry} />}
        </div>
        <p className="text-xs text-muted-foreground">Localidades oficiais do IBGE. Isso não confirma a presença de profissionais nem horários disponíveis.</p>
      </div>
    </section>
  );
}

function Err({ msg, retry }: { msg: string; retry: () => void }) {
  return <p role="alert" className="mt-2 flex items-center justify-between gap-3 text-sm text-glow">{msg}<button onClick={retry} className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold text-foreground">Tentar novamente</button></p>;
}

function Portrait({ p, size = "lg" }: { p: Profile; size?: "lg" | "sm" }) {
  return (
    <div className={`relative overflow-hidden ${size === "lg" ? "aspect-[4/5] rounded-2xl" : "h-14 w-14 shrink-0 rounded-xl"}`}
      style={{ background: `radial-gradient(70% 60% at 50% 35%, oklch(0.75 0.08 ${p.hue}) 0%, oklch(0.45 0.15 ${p.hue}) 40%, var(--wine) 75%, var(--background))` }} aria-hidden>
      <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full opacity-60">
        <ellipse cx="50" cy="48" rx="17" ry="21" fill="var(--background)" opacity=".55" />
        <path d="M15 125c3-30 18-42 35-42s32 12 35 42Z" fill="var(--background)" opacity=".55" />
      </svg>
      {size === "lg" && <span className="absolute bottom-3 left-3 font-display text-5xl font-extrabold text-foreground/90">{p.name[0]}</span>}
    </div>
  );
}

function Profiles({ s, set }: { s: State; set: (p: Partial<State>) => void }) {
  const [all, setAll] = useState(false);
  const list = all ? PROFILES : PROFILES.slice(0, 3);
  return (
    <section>
      <Title kicker={`${s.city} · ${s.uf}`} title="Escolha um perfil" sub="Perfis fictícios. Dados, imagens e agenda são apenas demonstrativos." />
      <div role="radiogroup" aria-label="Perfis" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const on = s.profileId === p.id;
          return (
            <button key={p.id} role="radio" aria-checked={on} onClick={() => set({ profileId: p.id })} className={`glass rounded-3xl p-3 text-left transition-all ${on ? "option-on" : "hover:-translate-y-0.5"}`}>
              <Portrait p={p} />
              <div className="flex items-end justify-between gap-2 px-2 pb-1 pt-4">
                <div><p className="font-display text-xl font-bold">{p.name}, {p.age}</p><p className="text-sm text-muted-foreground">{p.area}</p></div>
                <div className="text-right"><p className="font-bold text-champagne">{brl(p.price)}</p><p className="text-xs text-muted-foreground">por hora</p></div>
              </div>
              <p className="px-2 pt-2 text-[11px] uppercase tracking-wider text-muted-foreground/70">Perfil fictício · agenda demonstrativa</p>
            </button>
          );
        })}
      </div>
      {!all && <button onClick={() => setAll(true)} className="mt-6 rounded-full border px-5 py-3 text-sm font-semibold hover:bg-muted">Ver todos os perfis</button>}
    </section>
  );
}

function When({ s, set, profile }: { s: State; set: (p: Partial<State>) => void; profile: Profile }) {
  const two = priceBreakdown(profile.price, 2);
  return (
    <section>
      <Title kicker={profile.name} title="Quando e por quanto tempo?" sub="A agenda é fictícia: os horários servem apenas para testar a navegação." />
      <div role="radiogroup" aria-label="Duração" className="grid gap-3 sm:grid-cols-2">
        <Option on={s.hours === 1} onClick={() => set({ hours: 1 })} title={`1 hora — ${brl(profile.price)}`} desc="Preço-base do perfil." />
        <div className="relative">
          <span className="absolute -top-2.5 right-4 z-10 rounded-full bg-glow px-2.5 py-0.5 text-[11px] font-bold">2ª hora −40%</span>
          <Option on={s.hours === 2} onClick={() => set({ hours: 2 })} title="2 horas — a segunda hora com 40% de desconto." desc={`De ${brl(two.full)} por ${brl(two.total)} · 1ª hora ${brl(two.first)} + 2ª hora ${brl(two.second)}`} />
        </div>
      </div>
      <div className="glass mt-6 grid gap-5 rounded-3xl p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-semibold">Data do encontro</label>
          <input id="date" type="date" className="field" min={today()} value={s.date} onChange={(e) => set({ date: e.target.value })} />
          {s.date && s.date < today() && <p className="mt-2 text-sm text-glow">Escolha uma data a partir de hoje.</p>}
        </div>
        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-semibold">Horário de início</label>
          <select id="time" className="field" value={s.time} onChange={(e) => set({ time: e.target.value })}>
            <option value="">Selecione</option>
            {TIMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}

function Logistics({ s, set }: { s: State; set: (p: Partial<State>) => void }) {
  return (
    <section>
      <Title kicker="Deslocamento" title="Como será o deslocamento?" sub="O transporte deve ser acordado com segurança e consentimento mútuo. Custos de transporte não estão incluídos." />
      <div role="radiogroup" aria-label="Deslocamento" className="space-y-3">
        {LOGISTICS.map((o) => (
          <Option key={o.id} on={s.logistics === o.id} onClick={() => set({ logistics: o.id, logisticsPlace: "" })} title={o.title} desc={o.desc}>
            {o.field && (<><label htmlFor="lp" className="mb-2 block text-sm font-semibold">{o.field}</label>
              <input id="lp" className="field" placeholder="Ex.: praça, estação, ponto público" value={s.logisticsPlace} onChange={(e) => set({ logisticsPlace: e.target.value })} />
              <p className="mt-2 text-xs text-muted-foreground">Não informe endereço residencial. Nada é enviado a terceiros.</p></>)}
          </Option>
        ))}
      </div>
    </section>
  );
}

function Venue({ s, set }: { s: State; set: (p: Partial<State>) => void }) {
  return (
    <section>
      <Title kicker="Local" title="Onde será o encontro?" />
      <div role="radiogroup" aria-label="Local" className="space-y-3">
        {VENUES.map((o) => (
          <Option key={o.id} on={s.venue === o.id} onClick={() => set({ venue: o.id })} title={o.title} desc={o.desc}>
            <label htmlFor="vn" className="mb-2 block text-sm font-semibold">Nome do estabelecimento ou local</label>
            <input id="vn" className="field" required value={s.venueName} onChange={(e) => set({ venueName: e.target.value })} />
            {o.note && <p className="mt-3 rounded-xl border border-champagne/30 bg-champagne/5 p-3 text-xs text-champagne">{o.note}</p>}
          </Option>
        ))}
      </div>
    </section>
  );
}

function rows(s: State, profile: Profile | null) {
  const lg = LOGISTICS.find((l) => l.id === s.logistics);
  const vn = VENUES.find((v) => v.id === s.venue);
  return [
    ["Perfil", profile ? `${profile.name} (fictício)` : "—", "profiles"],
    ["Região", s.city ? `${s.city} · ${s.uf}` : "—", "location"],
    ["Data", fmtDate(s.date), "when"],
    ["Início", s.time || "—", "when"],
    ["Duração", s.hours === 2 ? "2 horas" : "1 hora", "when"],
    ["Deslocamento", lg ? lg.title + (s.logisticsPlace ? ` — ${s.logisticsPlace}` : "") : "—", "logistics"],
    ["Local", vn ? `${vn.title}${s.venueName ? ` — ${s.venueName}` : ""}` : "—", "venue"],
  ] as const;
}

function PriceLines({ s, profile }: { s: State; profile: Profile }) {
  const p = priceBreakdown(profile.price, s.hours);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-muted-foreground">Primeira hora</span><span>{brl(p.first)}</span></div>
      {s.hours === 2 && <div className="flex justify-between"><span className="text-muted-foreground">Segunda hora <span className="text-glow">−40%</span></span><span><s className="mr-2 text-muted-foreground/60">{brl(profile.price)}</s>{brl(p.second)}</span></div>}
      {s.hours === 2 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Desconto na segunda hora</span><span className="text-champagne">−{brl(p.discount)}</span></div>}
      <div className="mt-3 flex items-end justify-between border-t pt-4"><span className="font-semibold">Total da experiência</span><span className="font-display text-3xl font-extrabold text-champagne">{brl(p.total)}</span></div>
      <p className="text-xs text-muted-foreground">Valor demonstrativo. Quarto e transporte não incluídos.</p>
    </div>
  );
}

function SummaryCard({ s, profile, onEdit }: { s: State; profile: Profile | null; onEdit?: (st: Step) => void }) {
  return (
    <div className="glass rounded-3xl p-6">
      {profile && <div className="mb-5 flex items-center gap-3"><Portrait p={profile} size="sm" /><div><p className="font-display text-lg font-bold">{profile.name}</p><p className="text-sm text-muted-foreground">{brl(profile.price)} / hora</p></div></div>}
      <dl className="mb-5 space-y-2.5 text-sm">
        {rows(s, profile).map(([k, v, st]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right">{v}{onEdit && <button onClick={() => onEdit(st as Step)} className="ml-2 text-xs font-semibold text-glow underline-offset-2 hover:underline">Editar</button>}</dd>
          </div>
        ))}
      </dl>
      {profile && <PriceLines s={s} profile={profile} />}
    </div>
  );
}

function MiniTotal({ s, profile }: { s: State; profile: Profile }) {
  const p = priceBreakdown(profile.price, s.hours);
  return (
    <div className="mx-auto mb-3 flex max-w-6xl items-center justify-between text-sm lg:hidden">
      <span className="text-muted-foreground">{profile.name} · {s.hours}h{s.hours === 2 && <span className="text-glow"> (2ª hora −40%)</span>}</span>
      <span className="font-display text-lg font-bold text-champagne">{brl(p.total)}</span>
    </div>
  );
}

function Summary({ s, profile, onEdit }: { s: State; profile: Profile; onEdit: (st: Step) => void }) {
  return (
    <section className="max-w-xl">
      <Title kicker="Resumo" title="Confira sua reserva" sub="Revise as escolhas. Você pode editar qualquer item." />
      <SummaryCard s={s} profile={profile} onEdit={onEdit} />
    </section>
  );
}

function Checkout({ s, profile, onBack, onPay }: { s: State; profile: Profile; onBack: () => void; onPay: () => void }) {
  return (
    <section className="mx-auto max-w-xl">
      <Title kicker="Checkout demonstrativo" title="Revisão do pedido" sub="Nenhum dado de pagamento é solicitado. Nada é cobrado nem enviado." />
      <SummaryCard s={s} profile={profile} />
      <div className="mt-6 flex gap-3">
        <button onClick={onBack} className="rounded-full border px-5 py-4 text-sm font-semibold hover:bg-muted">Voltar</button>
        <button onClick={onPay} className="btn-cta flex-1 rounded-full px-6 py-4 font-bold">Simular pagamento</button>
      </div>
    </section>
  );
}

function Done({ s, profile, onEdit, onRestart }: { s: State; profile: Profile; onEdit: () => void; onRestart: () => void }) {
  return (
    <section className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-6 grid h-20 w-20 animate-in zoom-in place-items-center rounded-full btn-cta duration-500">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Compra demonstrativa concluída.</p>
      <h1 className="text-3xl font-bold sm:text-4xl">Tudo pronto para a demonstração.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">Você percorreu todas as etapas da experiência. Nenhum pagamento real foi realizado e nenhuma reserva real foi criada.</p>
      <div className="mt-8 text-left">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Recibo demonstrativo</p>
        <SummaryCard s={s} profile={profile} />
        <p className="mt-3 text-center text-xs text-muted-foreground">Esta é apenas uma simulação. Nenhum pagamento real foi processado e nenhum encontro foi reservado.</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={onEdit} className="flex-1 rounded-full border px-5 py-4 font-semibold hover:bg-muted">Editar reserva</button>
        <button onClick={onRestart} className="btn-cta flex-1 rounded-full px-5 py-4 font-bold">Voltar ao início</button>
      </div>
    </section>
  );
}
