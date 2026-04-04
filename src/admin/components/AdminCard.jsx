export function AdminCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,45,91,0.06)] ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-[#002D5B]">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
