import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import {
  salesTrainingMeta,
  salesTrainingSections,
} from '../training/salesTrainingContent';

function Block({ block }) {
  switch (block.type) {
    case 'h3':
      return (
        <h3 className="mt-8 text-base font-bold text-slate-900 first:mt-0">{block.text}</h3>
      );
    case 'p':
      return <p className="mt-4 text-[15px] leading-relaxed text-slate-700 first:mt-0">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case 'blockquote':
      return (
        <blockquote className="mt-4 border-l-4 border-[#2562FF] bg-slate-50/90 py-3 pl-4 pr-3 text-[15px] italic leading-relaxed text-slate-800">
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

export default function AdminTrainingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <header className="mb-8 border-b border-slate-200/80 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#002D5B]/60">
            Team training
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#002D5B] md:text-3xl">
            {salesTrainingMeta.title}
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] text-slate-600">{salesTrainingMeta.subtitle}</p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Mobile section toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm"
            >
              <span>Jump to section</span>
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {mobileNavOpen && (
              <nav className="mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {salesTrainingSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setMobileNavOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {s.number}. {s.title}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Desktop sticky nav */}
          <nav className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Sections
              </div>
              <ul className="space-y-0.5">
                {salesTrainingSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#002D5B]"
                    >
                      <span className="font-semibold text-slate-400">{s.number}.</span>{' '}
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-12">
            {salesTrainingSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
              >
                <h2 className="text-lg font-bold text-[#002D5B] md:text-xl">
                  Section {section.number}: {section.title}
                </h2>
                <div className="mt-6">
                  {section.blocks.map((block, i) => (
                    <Block key={`${section.id}-${i}`} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
