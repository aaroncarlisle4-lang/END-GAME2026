import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const GOLD_STANDARD_BATCH_2 = [
  {
    pattern: "CONDITIONS INVOLVING SKIN AND BONE",
    itemNumber: "1.6",
    problemCluster: "skin and bone",
    seriousAlternatives: ["Malignant MPNST (NF1)", "Anaphylaxis (Mastocytosis)", "Renal Failure (Scleroderma)"],
    differentials: [
      {
        diagnosis: "Neurofibromatosis Type 1 (von Recklinghausen)",
        dominantImagingFinding: "Skeletal dysplasias: RIBBON-LIKE RIBS (thinned/twisted), TIBIAL PSEUDARTHROSIS (100% specific when present), and sphenoid wing dysplasia.",
        distributionLocation: "Generalized. Characteristically involves the spine (POSTERIOR SCALLOPING) and skull.",
        demographicsClinicalContext: "AD inheritance. Diagnostic criteria: >6 CAFÉ-AU-LAIT spots, axillary freckling (Lisch nodules), and cutaneous neurofibromas.",
        discriminatingKeyFeature: "CUTANEOUS NEUROFIBROMAS (plexiform) and DUMBBELL-SHAPED spinal masses. Absence of intracranial tubers (unlike TSC).",
        associatedFindings: "Optic pathway gliomas, phaeochromocytoma, and renal artery stenosis.",
        complicationsSeriousAlternatives: "Malignant Peripheral Nerve Sheath Tumor (MPNST) transformation in plexiform lesions.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Tuberous Sclerosis (Bourneville Disease)",
        dominantImagingFinding: "Multiple dense bone islands (osteopoikilosis-like) and calvarial thickening. No focal bone enlargement.",
        distributionLocation: "Skull, Spine, and Pelvis.",
        demographicsClinicalContext: "Vogt Triad (25%): Seizures, mental retardation, and ADENOMA SEBACEUM (facial angiofibromas). ASH-LEAF spots.",
        discriminatingKeyFeature: "SUBEPENDYMAL CALCIFIED NODULES ('Candle-guttering') and cortical tubers in the brain. Renal Angiomyolipomas (AMLs).",
        associatedFindings: "Cardiac rhabdomyomas, pulmonary LAM (identical to LAM in females), and periungual fibromas.",
        complicationsSeriousAlternatives: "Renal haemorrhage from massive AMLs and intractable epilepsy.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Systemic Sclerosis (Scleroderma)",
        dominantImagingFinding: "ACRO-OSTEOLYSIS (resorption of the distal phalangeal tufts) and massive, sheet-like soft tissue CALCINOSIS CUTIS.",
        distributionLocation: "Hands, wrists, and pressure points (elbows/knees). Symmetrical.",
        demographicsClinicalContext: "Middle-aged females. RAYNAUD'S phenomenon (95%). Thick, tight, shiny skin (Sclerodactyly).",
        discriminatingKeyFeature: "TAPERED FINGERTIPS with dense amorphous calcification. Preserved joint spaces (unlike RA or Psoriasis).",
        associatedFindings: "Oesophageal dysmotility (dilated/atonic), interstitial lung disease (NSIP pattern), and 'Hide-bound' small bowel.",
        complicationsSeriousAlternatives: "Pulmonary Hypertension and Scleroderma Renal Crisis.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Mastocytosis",
        dominantImagingFinding: "Diffuse patchy or uniform OSTEOSCLEROSIS involving the axial skeleton. Areas of focal lucency interspersed.",
        distributionLocation: "Red-marrow bearing skeleton (Spine, Pelvis, Proximal femora/humeri).",
        demographicsClinicalContext: "URTICARIA PIGMENTOSA (brownish-red skin macules that hive when rubbed - Darier Sign). Flushing and tachycardia.",
        discriminatingKeyFeature: "SKIN RASH that releases histamine. Sclerosis lacks the bone expansion of Paget's or the pedicle destruction of Mets.",
        associatedFindings: "Hepatosplenomegaly and peptic ulcer disease (histamine-driven gastric hypersecretion).",
        complicationsSeriousAlternatives: "Systemic anaphylactic shock.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "U NILATERAL PULMONARY OEDEMA",
    itemNumber: "4.13",
    problemCluster: "unilateral lung density",
    seriousAlternatives: ["Acute Severe Pneumonia", "Pulmonary Haemorrhage", "Aspiration"],
    differentials: [
      {
        diagnosis: "Dependent Oedema (Postural)",
        dominantImagingFinding: "Unilateral consolidation or ground-glass opacity restricted to the side the patient has been lying on.",
        distributionLocation: "Strictly unilateral (dependent side).",
        demographicsClinicalContext: "Immobile or unconscious patients. Most common cause of unilateral oedema.",
        discriminatingKeyFeature: "RAPID MIGRATION or resolution when the patient's position is changed. Gravity-dependent.",
        associatedFindings: "Ipsilateral pleural effusion.",
        complicationsSeriousAlternatives: "Progressive hypoxia if not repositioned.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Mitral Regurgitation (Jet Effect)",
        dominantImagingFinding: "Focal oedema characteristically involving the RIGHT UPPER LOBE (RUL).",
        distributionLocation: "Right Upper Lobe predominance.",
        demographicsClinicalContext: "Acute mitral valve prolapse or papillary muscle rupture (post-MI). New pansystolic murmur.",
        discriminatingKeyFeature: "RUL PREDOMINANCE: The regurgitant jet is directed toward the right superior pulmonary vein orifice, locally increasing pressure.",
        associatedFindings: "Left atrial enlargement and cardiomegaly.",
        complicationsSeriousAlternatives: "Flash pulmonary oedema and cardiogenic shock.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Rapid Re-expansion Oedema",
        dominantImagingFinding: "Unilateral consolidation appearing within hours of an intervention.",
        distributionLocation: "Ipsilateral to the treated side.",
        demographicsClinicalContext: "Follows rapid evacuation of a LARGE pleural effusion or a LARGE pneumothorax (>1.5L).",
        discriminatingKeyFeature: "TEMPORAL RELATION to procedure. Occurs when a chronically collapsed lung is suddenly re-inflated.",
        associatedFindings: "Visible thoracocentesis track or intercostal drain in situ.",
        complicationsSeriousAlternatives: "Severe ARDS-like reaction and death (high mortality if bilateral spread).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Unilateral Pulmonary Venous Obstruction",
        dominantImagingFinding: "Localised interstitial and alveolar oedema with Kerley B lines.",
        distributionLocation: "Unilateral, restricted to the drainage territory of the obstructed vein.",
        demographicsClinicalContext: "Compression by an extrinsic mass (Lung Cancer, Mediastinal Fibrosis).",
        discriminatingKeyFeature: "ABSENCE OF RESPONSE to diuretics. Persistent unilateral pattern despite medical therapy.",
        associatedFindings: "Hilar or mediastinal mass on CT.",
        complicationsSeriousAlternatives: "Infarction of the lung segment.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "S MALL BOWEL MURAL THICKENING",
    itemNumber: "6.18",
    problemCluster: "thickened bowel wall",
    seriousAlternatives: ["Mesenteric Ischaemia (URGENT)", "Small Bowel Lymphoma", "Perforated Crohn's"],
    differentials: [
      {
        diagnosis: "Crohn's Disease (Active)",
        dominantImagingFinding: "Transmural thickening (>5-10mm) with the COMB SIGN (engorged vasa recta) and mucosal hyperenhancement (Target Sign).",
        distributionLocation: "TERMINAL ILEUM (95%) with characteristic SKIP LESIONS (asymmetric involvement).",
        demographicsClinicalContext: "Young adults (15-30y). Diarrhoea, weight loss, and raised faecal calprotectin.",
        discriminatingKeyFeature: "CREEPING FAT (fibrofatty proliferation) and FISTULAE. Separation of bowel loops due to mesenteric inflammation.",
        associatedFindings: "Cobblestone mucosa on fluoroscopy. Sacroiliitis or Gallstones (extra-intestinal).",
        complicationsSeriousAlternatives: "Strictures leading to SBO, or intra-abdominal abscesses.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Small Bowel Lymphoma (NHL)",
        dominantImagingFinding: "Massive mural thickening (often >2cm) with ANEURYSMAL DILATATION of the lumen. Poorly enhancing mass.",
        distributionLocation: "Distal ileum is the most common site. Can involve long segments.",
        demographicsClinicalContext: "Adults 50-60y. Often asymptomatic despite massive wall thickening. No fever (unless high-grade).",
        discriminatingKeyFeature: "ANEURYSMAL DILATATION: Unlike Crohn's or Cancer, lymphoma destroys the myenteric plexus, causing the lumen to WIDEN rather than narrow.",
        associatedFindings: "Bulky mesenteric lymphadenopathy ('Sandwich Sign' encasing the vessels).",
        complicationsSeriousAlternatives: "Perforation (especially during chemotherapy) and intussusception.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Acute Mesenteric Ischaemia",
        dominantImagingFinding: "Mural thickening with diminished enhancement (Ischaemic) or target-like enhancement (Reperfusion).",
        distributionLocation: "Segmental or diffuse. Often involves the 'watershed' areas (Splenic flexure).",
        demographicsClinicalContext: "Elderly with AF, vascular disease, or sudden 'pain out of proportion' to clinical signs.",
        discriminatingKeyFeature: "PNEUMATOSIS INTESTINALIS (gas in the bowel wall) and gas in the portal/mesenteric veins (Highly URGENT).",
        associatedFindings: "Mesenteric arterial thrombus or venous occlusion on CT Angio. Ascites.",
        complicationsSeriousAlternatives: "Full-thickness gangrene and perforation.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Radiation Enteritis",
        dominantImagingFinding: "Fixed, thickened, featureless bowel loops with abnormal mesenteric enhancement.",
        distributionLocation: "Limited strictly to the pelvic RADIATION PORTAL (typically distal ileum).",
        demographicsClinicalContext: "History of Pelvic RT (Cervical, Prostate, Bladder CA) 6-24 months prior.",
        discriminatingKeyFeature: "STRICT CONFINEMENT to the radiation field. Loops appear 'stuck' together and lack normal peristalsis.",
        associatedFindings: "Thickened bladder wall or rectal wall (Radiation Cystitis/Proctitis).",
        complicationsSeriousAlternatives: "Fixed mechanical obstruction and chronic malabsorption.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "C ONGENITAL RENAL ANOMALIES",
    itemNumber: "7.1",
    problemCluster: "renal developmental variants",
    seriousAlternatives: ["Scarred Kidney (Reflux)", "Renal Artery Stenosis", "Mayer-Rokitansky-Kuster-Hauser Syndrome"],
    differentials: [
      {
        diagnosis: "Horseshoe Kidney",
        dominantImagingFinding: "Fusion of the lower poles (90%) by a functional isthmus. MALROTATION (renal pelvis facing anteriorly).",
        distributionLocation: "Lower poles fused across the midline at the level of L3-L4.",
        demographicsClinicalContext: "Most common fusion anomaly (1 in 400). Increased incidence in Turner Syndrome (15%).",
        discriminatingKeyFeature: "LOW POSITION: The isthmus is trapped below the INFERIOR MESENTERIC ARTERY (IMA). Ureters course anterior to the isthmus.",
        associatedFindings: "Increased risk of nephrolithiasis (due to stasis) and Wilms tumor.",
        complicationsSeriousAlternatives: "Pelvi-ureteric junction (PUJ) obstruction.",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Renal Agenesis (Unilateral)",
        dominantImagingFinding: "Absolute absence of one kidney and the ipsilateral renal artery. The remaining kidney shows COMPENSATORY HYPERTROPHY.",
        distributionLocation: "Empty renal fossa. Adrenal gland may show 'Lying-down' sign (elongated).",
        demographicsClinicalContext: "Common (1 in 1000). Often found incidentally. High association with genital anomalies.",
        discriminatingKeyFeature: "COMPENSATORY HYPERTROPHY: The solitary kidney is large but architecturally normal. If the small kidney is scarred, it is NOT agenesis.",
        associatedFindings: "Vesicoureteral reflux (VUR) in the solitary kidney. Seminal vesicle cysts or bicornuate uterus.",
        complicationsSeriousAlternatives: "Accelerated renal failure in the remaining kidney if hypertensive.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Renal Hypoplasia (Miniature Kidney)",
        dominantImagingFinding: "A kidney that is small in size but has a NORMAL overall shape and a reduced number of normal calyces.",
        distributionLocation: "Unilateral or bilateral.",
        demographicsClinicalContext: "Congenital. Must be distinguished from a scarred kidney.",
        discriminatingKeyFeature: "SMOOTH OUTLINE: Unlike an atrophic/scarred kidney, the hypoplastic kidney has a smooth surface and normal calyceal architecture.",
        associatedFindings: "Normal renal artery, but small in calibre.",
        complicationsSeriousAlternatives: "Secondary hypertension (Ask-Upmark kidney).",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Pelvic Ectopia",
        dominantImagingFinding: "A kidney located in the bony pelvis. Usually small and malrotated.",
        distributionLocation: "Pelvis, often adjacent to the bladder.",
        demographicsClinicalContext: "Developmental failure of ascent. Short ureter.",
        discriminatingKeyFeature: "SHORT URETER: In nephroptosis (dropped kidney), the ureter is of normal length and is kinked. In ectopia, the ureter is congenitally short.",
        associatedFindings: "Anomalous blood supply from the iliac vessels.",
        complicationsSeriousAlternatives: "Mistaken for a pelvic mass or malignancy pre-operatively.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  },
  {
    pattern: "I NTRACRANIAL CALCIFICATION",
    itemNumber: "10.1",
    problemCluster: "brain calcification",
    seriousAlternatives: ["Sturge-Weber Syndrome", "Congenital CMV", "Hypoparathyroidism"],
    differentials: [
      {
        diagnosis: "Physiological Calcification",
        dominantImagingFinding: "Small, discrete, highly dense foci. PINEAL >6mm or displacement >3mm is suspicious for tumor.",
        distributionLocation: "Pineal gland, Choroid plexus (Atria of lateral ventricles), Falx cerebri, and Habenula.",
        demographicsClinicalContext: "Incidental finding. Pineal calcification rare before age 6; Choroid rare before age 10.",
        discriminatingKeyFeature: "SPECIFIC ANATOMIC LOCATIONS and absence of parenchymal oedema or mass effect.",
        associatedFindings: "Basal ganglia calcification (incidental in >65y).",
        complicationsSeriousAlternatives: "Pineoblastoma (if pineal calc is 'exploded' or massive).",
        isCorrectDiagnosis: true,
        sortOrder: 0
      },
      {
        diagnosis: "Fahr Disease (Idiopathic Ferrocalcinosis)",
        dominantImagingFinding: "Extensive, coarse, and SYMMETRIC calcification of the basal ganglia and dentate nuclei.",
        distributionLocation: "Basal Ganglia (Globus pallidus), Thalamus, Dentate Nucleus (Cerebellum), and Centrum semiovale.",
        demographicsClinicalContext: "Young to middle-aged adults. Movement disorders (Parkinsonism) and cognitive decline.",
        discriminatingKeyFeature: "SYMMETRY and density. Must exclude endocrine causes (PTH) before diagnosing Fahr.",
        associatedFindings: "Subcortical white matter calcification.",
        complicationsSeriousAlternatives: "Severe neuropsychiatric symptoms.",
        isCorrectDiagnosis: false,
        sortOrder: 1
      },
      {
        diagnosis: "Congenital Infections (TORCH)",
        dominantImagingFinding: "Parenchymal calcification associated with microcephaly and hydrocephalus ex-vacuo.",
        distributionLocation: "CMV: PERIVENTRICULAR (Subependymal). Toxoplasmosis: DIFFUSE parenchymal (Basal ganglia/Cortex).",
        demographicsClinicalContext: "Neonates with intrauterine growth restriction and jaundice.",
        discriminatingKeyFeature: "PERIVENTRICULAR distribution is pathognomonic for CMV. Random/Diffuse is more common in Toxoplasmosis.",
        associatedFindings: "Cortical dysplasia and polymicrogyria.",
        complicationsSeriousAlternatives: "Profound sensorineural hearing loss and developmental delay.",
        isCorrectDiagnosis: false,
        sortOrder: 2
      },
      {
        diagnosis: "Sturge-Weber Syndrome",
        dominantImagingFinding: "TRAM-TRACK CORTICAL CALCIFICATION (gyriform). Underlying brain atrophy.",
        distributionLocation: "Unilateral (80%), typically Occipital and Parietal lobes.",
        demographicsClinicalContext: "Port-wine stain (facial capillary malformation in V1/V2 distribution). Seizures.",
        discriminatingKeyFeature: "GYRIFORM CALCIFICATION: Follows the contour of the gyri. Associated with ipsilateral pial angiomatosis.",
        associatedFindings: "Enlarged, enhancing choroid plexus and calvarial thickening (compensatory).",
        complicationsSeriousAlternatives: "Intractable epilepsy and hemiparesis.",
        isCorrectDiagnosis: false,
        sortOrder: 3
      }
    ]
  }
];

async function main() {
  console.log("Authoring distinction-quality GOLD STANDARD Batch 2...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const entry of GOLD_STANDARD_BATCH_2) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === entry.pattern.toLowerCase().trim()
    );
    
    if (matches.length > 0) {
      console.log(`Updating ${entry.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: entry.differentials,
        problemCluster: entry.problemCluster,
        seriousAlternatives: entry.seriousAlternatives
      });
    } else {
      console.log(`Creating ${entry.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: entry.pattern,
        differentials: entry.differentials,
        problemCluster: entry.problemCluster,
        seriousAlternatives: entry.seriousAlternatives
      });
    }
  }
  console.log("Batch 2 Complete!");
}

main().catch(console.error);