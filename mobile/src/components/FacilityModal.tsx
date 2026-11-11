import React, { useState } from 'react';
import { X, Factory, Check, Building, ShieldCheck } from 'lucide-react';
import { MobileUniversalSaaSClient } from '../services/universalSaaSClient';
import { AppleHaptics } from '../services/appleHaptics';

interface FacilityModalProps {
  currentFacility: string;
  onSelectFacility: (facility: string) => void;
  onClose: () => void;
}

export const FacilityModal: React.FC<FacilityModalProps> = ({
  currentFacility,
  onSelectFacility,
  onClose
}) => {
  const companies = MobileUniversalSaaSClient.getCompanies() as any[];
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => MobileUniversalSaaSClient.getCompanyId());

  const currentCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];
  const facilities = (MobileUniversalSaaSClient.getFacilities() as any[]).filter(
    f => f.company_id === selectedCompanyId
  );

  const fallbackFacilities = [
    {
      id: 'Lalru Unit-3',
      name: 'Lalru Unit-3',
      desc: 'Synthetic Resin, Paint & Industrial Coatings (Primary Command Node)',
      status: 'Active'
    },
    {
      id: 'Derabassi Unit-1',
      name: 'Derabassi Unit-1',
      desc: 'Chemical Formulations & Polymer Blending',
      status: 'Connected'
    },
    {
      id: 'Derabassi Unit-2',
      name: 'Derabassi Unit-2',
      desc: 'Industrial Pigments & High-Build Coatings',
      status: 'Connected'
    }
  ];

  const displayFacilities = facilities.length > 0 
    ? facilities.map(f => ({
        id: f.name,
        name: f.name,
        desc: `${f.city}, ${f.state} • ${f.code}`,
        status: f.is_primary ? 'Primary Node' : 'Connected'
      }))
    : fallbackFacilities;

  const handleSelectCompany = (compId: string) => {
    AppleHaptics.selection();
    setSelectedCompanyId(compId);
    MobileUniversalSaaSClient.setCompanyId(compId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-5">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
              Tenant & Facility Gateway
            </h3>
          </div>
          <button 
            onClick={() => {
              AppleHaptics.light();
              onClose();
            }} 
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Tenant Switcher */}
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Active Tenant Company
          </span>
          <div className="space-y-1.5">
            {companies.map((comp) => {
              const isSelected = comp.id === selectedCompanyId;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{comp.name}</span>
                  </div>
                  {isSelected && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facility Selector */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Operating Facility
          </span>
          <div className="space-y-2">
            {displayFacilities.map((fac) => {
              const isSelected = currentFacility === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => {
                    AppleHaptics.selection();
                    onSelectFacility(fac.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-900/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{fac.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {fac.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{fac.desc}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
