import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Wind, 
  Trash2, 
  Table, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { MasterTelemetry, CriticalHazard } from '../types';

interface ResourcesAndCapaViewProps {
  telemetry: MasterTelemetry;
  onResolveHazard: (hazardId: string) => void;
}

export const ResourcesAndCapaView: React.FC<ResourcesAndCapaViewProps> = ({
  telemetry,
  onResolveHazard
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'capa'>('capa');
  const [ecoStage, setEcoStage] = useState<'power' | 'fluids' | 'voc' | 'waste'>('power');

  const { environmental, complianceMatrix, criticalHazards } = telemetry;

  return (
    <div className="space-y-4 pb-20">
      {/* Primary Toggle: CAPA Velocity vs Environmental Telemetry */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('capa')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'capa'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Compliance & CAPA Matrix
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'resources'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Environmental Resources
        </button>
      </div>

      {/* VIEW 1: CAPA VELOCITY & CRITICAL HAZARDS */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          {/* Compliance & CAPA Pipeline Matrix Card */}
          <div className="mobile-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Audit & CAPA Velocity Matrix
                </h3>
                <span className="text-[10px] text-slate-400">Master Ledger Tracking</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
                <Table className="w-3 h-3" />
                <span>Audit Velocity</span>
              </div>
            </div>

            {/* Matrix Tracks */}
            <div className="space-y-3.5">
              {Object.entries(complianceMatrix).map(([auditType, stats]) => {
                const pctClosed = stats.total > 0 ? (stats.closed / stats.total) * 100 : 0;
                const pctWip = stats.total > 0 ? (stats.wip / stats.total) * 100 : 0;
                const pctOpen = stats.total > 0 ? (stats.open / stats.total) * 100 : 0;

                return (
                  <div key={auditType} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-300 text-[11px]">{auditType}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {stats.closed}/{stats.total} Closed
                      </span>
                    </div>

                    {/* Stacked bar */}
                    <div className="w-full h-2.5 bg-slate-800/80 rounded-full flex overflow-hidden border border-slate-700/60 shadow-inner">
                      {pctClosed > 0 && (
                        <div 
                          className="bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${pctClosed}%` }}
                          title={`Closed: ${stats.closed}`}
                        />
                      )}
                      {pctWip > 0 && (
                        <div 
                          className="bg-amber-500 transition-all duration-500" 
                          style={{ width: `${pctWip}%` }}
                          title={`WIP: ${stats.wip}`}
                        />
                      )}
                      {pctOpen > 0 && (
                        <div 
                          className="bg-red-500 transition-all duration-500" 
                          style={{ width: `${pctOpen}%` }}
                          title={`Open: ${stats.open}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Closed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> WIP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Open
              </span>
            </div>
          </div>

          {/* Critical Hazards & Action Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Critical Hazards & Action Plans ({criticalHazards.length})
              </h3>
            </div>

            {criticalHazards.length === 0 ? (
              <div className="mobile-card rounded-2xl p-6 text-center border-emerald-500/30">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Zero Critical Hazards
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  All Master Ledger action items are currently resolved.
                </p>
              </div>
            ) : (
              criticalHazards.map((item) => (
                <div 
                  key={item.id}
                  className="mobile-card rounded-2xl p-3.5 border-l-4 border-l-red-500 relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {item.source} • {item.id}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-100 mb-2.5 leading-snug">
                    {item.desc}
                  </p>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Approved Corrective Action (CAPA):
                    </span>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {item.capa}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="font-bold">Team:</span>
                      <span className="text-slate-200 font-semibold">{item.assignedTo}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-400 font-mono">
                        Due: {item.dueDate}
                      </span>
                      <button
                        onClick={() => onResolveHazard(item.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ENVIRONMENTAL RESOURCES TELEMETRY */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {/* Segmented Controller */}
          <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-center">
            <button
              onClick={() => setEcoStage('power')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                ecoStage === 'power' ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Power
            </button>
            <button
              onClick={() => setEcoStage('fluids')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                ecoStage === 'fluids' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" /> Fluids
            </button>
            <button
              onClick={() => setEcoStage('voc')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                ecoStage === 'voc' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> VOC
            </button>
            <button
              onClick={() => setEcoStage('waste')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                ecoStage === 'waste' ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Waste
            </button>
          </div>

          {/* STAGE: POWER */}
          {ecoStage === 'power' && (
            <div className="mobile-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Electricity Consumption (Grid & DG)
                </h4>
                <span className="text-[10px] text-slate-400">Daily Telemetry</span>
              </div>

              {/* Grid Power */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-bold">Grid Electricity</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {environmental.power.gridChange}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    {environmental.power.gridKWh.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">kWh</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[75%]" />
                </div>
              </div>

              {/* DG 750 KVA */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-bold">DG 750 KVA</span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                    +{environmental.power.dg750Change}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    {environmental.power.dg750Liters}
                  </span>
                  <span className="text-xs text-slate-400">Liters Diesel</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[45%]" />
                </div>
              </div>

              {/* DG 400 KVA */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-bold">DG 400 KVA</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {environmental.power.dg400Change}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    {environmental.power.dg400Liters}
                  </span>
                  <span className="text-xs text-slate-400">Liters Diesel</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full w-[15%]" />
                </div>
              </div>
            </div>
          )}

          {/* STAGE: FLUIDS */}
          {ecoStage === 'fluids' && (
            <div className="mobile-card rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">
                  Fluids Intake & Effluent Treatment
                </h4>
                <span className="text-[10px] text-slate-400">Daily Balance</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                {/* Fresh Water */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Fresh Water Intake
                  </span>
                  <span className="text-2xl font-black text-blue-400 font-mono block">
                    {environmental.fluids.freshWaterKL} <span className="text-xs font-sans text-slate-400">KL</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1 block">
                    Normal Baseline
                  </span>
                </div>

                {/* ETP Discharge */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    ETP Discharge
                  </span>
                  <span className="text-2xl font-black text-emerald-400 font-mono block">
                    {environmental.fluids.etpDischargeKL} <span className="text-xs font-sans text-slate-400">KL</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1 block">
                    Compliant PCB Limit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE: VOC */}
          {ecoStage === 'voc' && (
            <div className="mobile-card rounded-2xl p-4 text-center space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Atmospheric Volatile Organic Compounds (VOC)
              </h4>
              <div className="py-4">
                <span className="text-4xl font-black text-slate-100 font-mono block">
                  {environmental.voc.value} <span className="text-sm font-sans text-slate-400">mg/m³</span>
                </span>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {environmental.voc.status} Atmospheric Range
                </span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Continuous real-time optical spectroscopy sensors deployed in Paint Shop & Resin Synthesis.
              </p>
            </div>
          )}

          {/* STAGE: WASTE */}
          {ecoStage === 'waste' && (
            <div className="mobile-card rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 pb-2 border-b border-slate-800">
                Hazardous Waste Manifest (YTD)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                    Cat 1: Used Oil
                  </span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {environmental.waste.usedOilLiters} <span className="text-xs text-slate-400">L</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                    Cat 2: Waste Paint
                  </span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {environmental.waste.wastePaintKg} <span className="text-xs text-slate-400">Kg</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                    Cat 3: Drums
                  </span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {environmental.waste.drumsCount} <span className="text-xs text-slate-400">Nos</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                    Cat 4: ETP Sludge
                  </span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {environmental.waste.etpSludgeKg} <span className="text-xs text-slate-400">Kg</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
