"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";

export default function ClinicianNav() {
  const pathname = usePathname();

  const links = [
    { href: "/clinician/dashboard", label: "대시보드" },
    { href: "/clinician/chart", label: "차트" },
  ];

  return (
    <nav className="border-b border-white/5 bg-[#07111f]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">AcuTrack</span>
          <span className="text-slate-600 mx-1">·</span>
          <span className="text-xs text-slate-400">IMU 기반 관절가동범위 분석 시스템</span>
        </div>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname.startsWith(link.href)
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
            DEMO
          </span>
        </div>
      </div>
    </nav>
  );
}
