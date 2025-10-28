import React from 'react'

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-white rounded-2xl shadow-card border border-slate-200 ${className}`} {...props} />
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-5 border-b border-slate-200">
      <h3 className="text-slate-900 font-semibold">{title}</h3>
      {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function CardBody({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`} {...props} />
}
