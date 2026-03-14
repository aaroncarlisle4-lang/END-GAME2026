import { useState } from "react";
import { 
  ShieldCheck, Target, Users, Zap, Search, ClipboardCheck, 
  BookMarked, Lightbulb, ChevronRight, AlertCircle, Info, Stethoscope,
  Clock, Microscope, Repeat, MessageSquare, GraduationCap, ArrowRight,
  Stethoscope as StethIcon, ShieldAlert, Binary, Network, Maximize2, X
} from "lucide-react";

interface LibraryItem {
  trigger: string;
  action: string;
  rationale: string;
  script: string;
}

interface Section {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  formula: string[];
  library: LibraryItem[];
}

export function ManagementFormula() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);

  const sections: Section[] = [
    {
      id: "safety",
      title: "1. Immediate Clinical Safety",
      shortTitle: "Safety",
      subtitle: "The 'Emergency' phase: Life, limb, and urgent communication.",
      icon: ShieldAlert,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      formula: [
        "Immediate direct communication with the referring team (Verbal/Bleep).",
        "Assess for surgical emergencies (e.g. vascular compromise, tension).",
        "Rule out 'must-not-miss' complications (e.g. cord compression, perforation)."
      ],
      library: [
        { 
          trigger: "Chance Fracture / Unstable Spinal Injury", 
          action: "Immediate 'Red Flag' bleep to the Neurosurgical/Spinal team.",
          rationale: "Chance fractures are flexion-distraction injuries; highly unstable with risk of permanent paralysis if not immediately immobilized.",
          script: "I will bleep the neurosurgical registrar immediately to report an unstable Chance fracture at L2 and ensure the patient is spinal-protected."
        },
        { 
          trigger: "Posterior Shoulder / Perilunate Dislocation", 
          action: "Urgent Orthopaedic referral for reduction under sedation/GA.",
          rationale: "Posterior shoulder dislocations (3% of all dislocations) and perilunate injuries carry high risk of median nerve/vascular compromise.",
          script: "I will contact the orthopaedic team directly as this requires urgent reduction to mitigate neurovascular risk."
        },
        { 
          trigger: "Acute Renal Transplant Failure (Day 0-3)", 
          action: "Urgent Doppler US to exclude vascular thrombosis.",
          rationale: "Early graft failure is a surgical emergency; arterial/venous thrombosis requires immediate re-exploration to save the kidney.",
          script: "I will recommend an urgent Doppler ultrasound in the first instance to exclude vascular occlusion requiring re-intervention."
        },
        { 
          trigger: "Suspected Tension Pneumothorax", 
          action: "Immediate clinical decompression; do not delay for further imaging.",
          rationale: "A radiological diagnosis of tension requires immediate bedside needle decompression before any further scans.",
          script: "I will bleep the clinical team immediately to recommend needle decompression as this is a life-threatening emergency."
        }
      ]
    },
    {
      id: "confidence",
      title: "2. Diagnostic Confidence & Practicality",
      shortTitle: "Confidence",
      subtitle: "The 'Optimization' phase: Increasing specificity and using history.",
      icon: Binary,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      formula: [
        "Review prior imaging (Stability is the 'Gold Standard' for benignity).",
        "Perform practical 'on-table' maneuvers (e.g. weight-bearing, delayed phases).",
        "Suggest a more specific/sensitive modality (MRI/MRCP/Primovist)."
      ],
      library: [
        { 
          trigger: "Suspected Bladder Injury (Pelvic Trauma)", 
          action: "Perform a delayed 15-minute CT Cystogram (clamped catheter).",
          rationale: "Standard portal phase CT is insensitive; a delayed scan allows contrast extravasation into the peritoneum/extraperitoneal space.",
          script: "To increase diagnostic confidence, I would perform a delayed 15-minute scan with a clamped catheter to assess for a bladder leak."
        },
        { 
          trigger: "Occult Scaphoid Fracture (Normal X-ray)", 
          action: "Thumb spica cast + MRI within 48-72 hours.",
          rationale: "Up to 20% of scaphoid fractures are occult on initial XR. MRI is the gold standard, preventing unnecessary cast time.",
          script: "If clinical suspicion remains high despite normal radiographs, I would suggest an MRI as the gold standard for occult scaphoid injury."
        },
        { 
          trigger: "Equivocal Biliary Obstruction on CT", 
          action: "Suggest MRI/MRCP for superior anatomical delineation.",
          rationale: "CT has limited sensitivity for small common bile duct stones; MRI/MRCP is superior for defining strictures and anatomy.",
          script: "I would suggest an MRI/MRCP to better characterize the biliary tree and exclude small, non-obstructing calculi."
        },
        { 
          trigger: "Lisfranc Injury (Equivocal XR)", 
          action: "Urgent weight-bearing radiographs of the foot.",
          rationale: "Non-weight bearing films often miss Lisfranc instability; stress views are essential to see widening of the 1st/2nd metatarsal space.",
          script: "I would recommend weight-bearing radiographs in the first instance to assess for dynamic widening of the Lisfranc interval."
        }
      ]
    },
    {
      id: "mdt",
      title: "3. Collaborative Management (MDT)",
      shortTitle: "MDT",
      subtitle: "The 'Specialist' phase: Aligning with regional expertise.",
      icon: Network,
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
      formula: [
        "Refer to the relevant Regional MDT (Sarcoma, HPB, Lung, Bone Tumor).",
        "Seek a sub-specialist consultant second opinion.",
        "Involve niche teams (Fetal Medicine, Renal Transplant, Pediatrics)."
      ],
      library: [
        { 
          trigger: "Indeterminate Soft Tissue Mass", 
          action: "Refer to the Regional Soft Tissue Sarcoma MDT.",
          rationale: "Crucial rule: Never biopsy a soft tissue mass until the specialist team has planned the surgical track to avoid seeding.",
          script: "This mass should be discussed at the regional sarcoma MDT. I would strongly advise against biopsy before specialist review."
        },
        { 
          trigger: "Giant Cell Tumor (GCT) of Bone", 
          action: "Urgent Orthopaedic Oncology referral + mandatory CT Chest.",
          rationale: "GCT is locally aggressive and carries a 2-5% risk of benign pulmonary metastases which must be staged at presentation.",
          script: "I will refer this patient to the orthopaedic oncology team and perform a CT chest to stage for pulmonary metastases."
        },
        { 
          trigger: "Perihilar Cholangiocarcinoma (Klatskin)", 
          action: "Refer to HPB MDT for Bismuth-Corlette staging.",
          rationale: "Surgical resectability is determined by fine-grained biliary involvement, requiring expert review of MRI/CT/PTC.",
          script: "I would recommend discussion at the HPB MDT to determine the Bismuth-Corlette classification and assess for surgical resectability."
        },
        { 
          trigger: "Possible Fetal Neural Tube Defect", 
          action: "Urgent referral to a Fetal Medicine specialist.",
          rationale: "Requires highly specialized counseling and targeted 3D US/MRI to plan the legal and clinical pathway.",
          script: "I would recommend an urgent referral to fetal medicine for specialized counseling and targeted characterization of the defect."
        }
      ]
    },
    {
      id: "closure",
      title: "4. Definitive Action & Staging",
      shortTitle: "Closure",
      subtitle: "The 'Finality' phase: Tissue diagnosis and standardized rules.",
      icon: Microscope,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      formula: [
        "Recommend image-guided biopsy (US/CT) for tissue diagnosis.",
        "Perform mandatory systemic staging (e.g. CT CAP).",
        "Apply standardized follow-up rules (Fleischner, O-RADS, LI-RADS)."
      ],
      library: [
        { 
          trigger: "Solitary Pulmonary Nodule (SPN)", 
          action: "Apply Fleischner Society guidelines for CT follow-up.",
          rationale: "Provides an evidence-based timeline (6, 12, or 24 months) to assess for growth/stability.",
          script: "I would follow this nodule in 12 months per Fleischner Society guidelines to ensure its stability."
        },
        { 
          trigger: "Suspected TIPS Shunt Failure", 
          action: "Spectral Doppler measuring velocity (>200cm/s).",
          rationale: "Physiological proof of high-velocity stenosis is required before proceeding to invasive venography and revision.",
          script: "I would perform a spectral Doppler of the TIPS shunt; a velocity over 200cm/s would suggest hemodynamically significant stenosis."
        },
        { 
          trigger: "Indeterminate Adrenal Nodule", 
          action: "Dedicated Adrenal CT or Chemical Shift MRI.",
          rationale: "Adrenal wash-out (CT) or signal loss on out-of-phase (MRI) confirms intracellular fat, diagnostic of a benign adenoma.",
          script: "I would suggest a chemical-shift MRI; signal loss on out-of-phase imaging would be diagnostic of a benign adrenal adenoma."
        },
        { 
          trigger: "BI-RADS 5 Breast Mass", 
          action: "Urgent Triple Assessment including US-guided core biopsy.",
          rationale: "Likelihood of malignancy is >95%; tissue diagnosis is mandatory before surgical or MDT planning.",
          script: "Given the spiculated appearance, I would recommend urgent triple assessment including an ultrasound-guided core biopsy."
        }
      ]
    }
  ];

  return (
    <>
      {/* Dashboard Mini-Widget */}
      <div 
        onClick={() => setIsExpanded(true)}
        className="group relative cursor-pointer rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">2B Management Formula</h3>
              <p className="text-[11px] text-gray-500 font-medium">4-Phase Gold Standard Framework & High-Yield Scripts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center"><ShieldAlert className="w-3 h-3 text-red-600" /></div>
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"><Binary className="w-3 h-3 text-blue-600" /></div>
              <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center"><Network className="w-3 h-3 text-purple-600" /></div>
              <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"><Microscope className="w-3 h-3 text-emerald-600" /></div>
            </div>
            <div className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 group-hover:text-amber-600 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-6xl h-full max-h-[850px] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 bg-gray-50 border-r border-gray-100 p-6 space-y-2 flex-shrink-0 flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">2B Mastery</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase">Framework</h2>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1">
                {sections.map((section, idx) => {
                  const isActive = activeSection === idx;
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        isActive 
                          ? `${section.bg} ${section.color} border border-current/10 shadow-sm` 
                          : 'text-gray-500 hover:bg-white hover:text-gray-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold uppercase tracking-tight">{section.shortTitle}</p>
                        <p className="text-[10px] opacity-70 truncate">Phase {idx + 1}</p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Master Phrases</p>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 italic text-[10px] text-gray-600 leading-tight">
                    "To increase diagnostic confidence..."
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 italic text-[10px] text-gray-600 leading-tight">
                    "In the first instance..."
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-100 italic text-[10px] text-gray-600 leading-tight">
                    "Subject to MDT discussion..."
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col ${sections[activeSection].bg}/20`}>
              {/* Active Header */}
              <div className="px-8 py-6 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${sections[activeSection].bg} ${sections[activeSection].color} border border-current/10`}>
                    {(() => {
                      const Icon = sections[activeSection].icon;
                      return <Icon className="w-8 h-8" />;
                    })()}
                  </div>
                  <div>
                    <h1 className={`text-2xl font-black ${sections[activeSection].color} tracking-tight`}>
                      {sections[activeSection].title}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{sections[activeSection].subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="hidden lg:flex p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Formula Row */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <StethIcon className="w-4 h-4" />
                    The Action Formula
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sections[activeSection].formula.map((step, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative group hover:border-current/30 transition-colors">
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 ${sections[activeSection].border} ${sections[activeSection].color} flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed mt-2">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High Yield Specials */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                      <Binary className="w-4 h-4" />
                      High-Yield "Gold Standard" Responses
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                      <AlertCircle className="w-3 h-3" />
                      Tested Scenarios
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {sections[activeSection].library.map((item, i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col md:flex-row">
                          <div className={`p-5 md:w-1/3 ${sections[activeSection].bg} border-r border-gray-100`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Scenario Trigger</p>
                            <h4 className="text-sm font-black text-gray-900 leading-tight">{item.trigger}</h4>
                          </div>
                          <div className="p-5 flex-1 space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gold Standard Action</p>
                                <div className={`text-base font-bold italic ${sections[activeSection].color} leading-snug`}>
                                  "{item.action}"
                                </div>
                              </div>
                              <div className="hidden md:block">
                                <div className={`p-2 rounded-xl ${sections[activeSection].bg} ${sections[activeSection].color}`}>
                                  <Zap className="w-4 h-4 fill-current" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                              <div className="flex gap-3">
                                <Info className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Rationale</p>
                                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.rationale}</p>
                                </div>
                              </div>
                              <div className="flex gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                <MessageSquare className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Examiner Script</p>
                                  <p className="text-xs text-gray-800 font-bold leading-relaxed">{item.script}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    Safety
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <Repeat className="w-3.5 h-3.5 text-blue-400" />
                    Confidence
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <Network className="w-3.5 h-3.5 text-purple-400" />
                    MDT
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection((activeSection + 1) % sections.length)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-black transition-colors shadow-lg"
                >
                  <span className="text-xs font-bold uppercase tracking-tight">Next Phase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
