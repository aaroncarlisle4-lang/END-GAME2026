import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const client = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

const ACE_UPDATES = [
  {
    pattern: "PNEUMOPERITONEUM",
    problemCluster: "free gas",
    differentials: [
      { 
        diagnosis: "Perforated Viscus (Peptic Ulcer)", 
        dominantImagingFinding: "Free gas under the diaphragm (erect CXR) or Rigler's double-wall sign (supine AXR).", 
        distributionLocation: "Subdiaphragmatic or anterior abdomen.", 
        demographicsClinicalContext: "Acute severe abdominal pain with rigid abdomen. History of NSAID use.", 
        discriminatingKeyFeature: "LARGE VOLUME free gas and focal defect in gastroduodenal wall on CT.", 
        associatedFindings: "Fluid in Morrison's pouch.", 
        complicationsSeriousAlternatives: "Peritonitis and septic shock.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Post-Operative (Normal)", 
        dominantImagingFinding: "Free gas resolving over time.", 
        distributionLocation: "Anterior.", 
        demographicsClinicalContext: "Recent laparotomy or laparoscopy (within 7-10 days).", 
        discriminatingKeyFeature: "PROGRESSIVE DECREASE in volume on serial imaging without signs of peritonitis.", 
        associatedFindings: "Surgical clips.", 
        complicationsSeriousAlternatives: "Anastomotic leak (if gas increases).", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Perforated Diverticulitis", 
        dominantImagingFinding: "Extraluminal gas adjacent to the sigmoid colon, may track into retroperitoneum or true peritoneum.", 
        distributionLocation: "Left lower quadrant / pelvis.", 
        demographicsClinicalContext: "Older adults. LIF pain and fever.", 
        discriminatingKeyFeature: "FOCAL gas bubbles associated with thick-walled colon and diverticula.", 
        associatedFindings: "Pelvic abscess.", 
        complicationsSeriousAlternatives: "Faecal peritonitis.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "G ASLESS ABDOMEN",
    problemCluster: "absent bowel gas",
    differentials: [
      { 
        diagnosis: "High Small Bowel Obstruction", 
        dominantImagingFinding: "Absent or minimal gas in the distal bowel. Dilated proximal duodenum/stomach.", 
        distributionLocation: "Proximal to the ligament of Treitz.", 
        demographicsClinicalContext: "Profuse non-bilious or bilious vomiting. No abdominal distension.", 
        discriminatingKeyFeature: "DOUBLE BUBBLE sign (in neonates) or isolated gastric distension.", 
        associatedFindings: "Fluid-filled loops.", 
        complicationsSeriousAlternatives: "Dehydration.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Acute Pancreatitis", 
        dominantImagingFinding: "Generalised lack of gas due to fluid replacement ('ground-glass' abdomen) or focal ileus.", 
        distributionLocation: "Epigastric region may show a sentinel loop.", 
        demographicsClinicalContext: "Alcohol abuse or gallstones. Epigastric pain radiating to back.", 
        discriminatingKeyFeature: "PANCREATIC SWELLING and peripancreatic fluid on CT.", 
        associatedFindings: "Colon cut-off sign.", 
        complicationsSeriousAlternatives: "Necrotising pancreatitis.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Massive Ascites", 
        dominantImagingFinding: "Central clustering of gas-containing loops surrounded by homogeneous density.", 
        distributionLocation: "Flanks and pelvis.", 
        demographicsClinicalContext: "Cirrhosis, heart failure, or malignancy.", 
        discriminatingKeyFeature: "BULGING FLANKS and medial displacement of the colon/small bowel.", 
        associatedFindings: "Loss of psoas shadow.", 
        complicationsSeriousAlternatives: "Spontaneous bacterial peritonitis.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "OESOPHAGEAL ULCERATION",
    problemCluster: "oesophageal ulcers",
    differentials: [
      { 
        diagnosis: "Cytomegalovirus (CMV) Oesophagitis", 
        dominantImagingFinding: "Large, flat, superficial, linear or ovoid ulcers.", 
        distributionLocation: "Mid-to-distal oesophagus.", 
        demographicsClinicalContext: "Immunocompromised (HIV, post-transplant). Odynophagia.", 
        discriminatingKeyFeature: "GIANT, shallow ulcers in an otherwise normal-appearing mucosa.", 
        associatedFindings: "CMV colitis.", 
        complicationsSeriousAlternatives: "Perforation or massive bleeding.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Herpes Simplex Virus (HSV) Oesophagitis", 
        dominantImagingFinding: "Multiple small, discrete, punched-out superficial ulcers with a radiolucent halo (volcano ulcers).", 
        distributionLocation: "Scattered throughout.", 
        demographicsClinicalContext: "Immunocompromised.", 
        discriminatingKeyFeature: "MULTIPLE SMALL PUNCHED-OUT ULCERS on a normal background.", 
        associatedFindings: "Concurrent oral herpes.", 
        complicationsSeriousAlternatives: "Disseminated HSV.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Candida Oesophagitis", 
        dominantImagingFinding: "Shaggy, irregular mucosa with numerous longitudinal plaques and tiny ulcers.", 
        distributionLocation: "Diffuse, linear pattern.", 
        demographicsClinicalContext: "HIV (CD4 <200) or inhaled steroids.", 
        discriminatingKeyFeature: "SHAGGY MUCOSA (cobblestone appearance) with confluent pseudo-membranes.", 
        associatedFindings: "Oral thrush.", 
        complicationsSeriousAlternatives: "Stricture formation.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Reflux Oesophagitis", 
        dominantImagingFinding: "Continuous fine mucosal granularity or deep ulceration leading to stricture.", 
        distributionLocation: "Distal third (above GOJ).", 
        demographicsClinicalContext: "Chronic GORD symptoms.", 
        discriminatingKeyFeature: "CONTIGUOUS FROM GOJ upwards. Presence of a hiatus hernia.", 
        associatedFindings: "Barrett's oesophagus (reticular pattern).", 
        complicationsSeriousAlternatives: "Adenocarcinoma.", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "D ILATED SMALL BOWEL",
    problemCluster: "dilated small bowel",
    differentials: [
      { 
        diagnosis: "Mechanical Small Bowel Obstruction (SBO)", 
        dominantImagingFinding: "Dilated loops (>3cm) with multiple air-fluid levels and collapsed distal bowel.", 
        distributionLocation: "Central abdomen.", 
        demographicsClinicalContext: "Colicky pain, vomiting, absolute constipation.", 
        discriminatingKeyFeature: "TRANSITION POINT on CT (dilated proximally, collapsed distally).", 
        associatedFindings: "String of pearls sign (fluid-filled loops with trapped air bubbles).", 
        complicationsSeriousAlternatives: "Strangulation and ischaemia.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Paralytic Ileus", 
        dominantImagingFinding: "Dilatation of both small AND large bowel. Gas reaches the rectum.", 
        distributionLocation: "Generalised.", 
        demographicsClinicalContext: "Post-operative, hypokalaemia, sepsis.", 
        discriminatingKeyFeature: "PROPORTIONATE DILATATION of small and large bowel without a discrete transition point.", 
        associatedFindings: "Long air-fluid levels.", 
        complicationsSeriousAlternatives: "Underlying sepsis.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Sprue (Coeliac Disease)", 
        dominantImagingFinding: "Dilated loops with hypersecretion (flocculation of barium) and fold reversal.", 
        distributionLocation: "Jejunum and ileum.", 
        demographicsClinicalContext: "Malabsorption, steatorrhoea.", 
        discriminatingKeyFeature: "MOULAGE SIGN (clumping of barium) and reversal of the normal fold pattern (jejunisation of ileum).", 
        associatedFindings: "Cavitating mesenteric lymph node syndrome.", 
        complicationsSeriousAlternatives: "Enteropathy-associated T-cell lymphoma (EATL).", 
        isCorrectDiagnosis: false 
      }
    ]
  },
  {
    pattern: "S TRICTURES IN THE SMALL BOWEL",
    problemCluster: "small bowel strictures",
    differentials: [
      { 
        diagnosis: "Crohn's Disease", 
        dominantImagingFinding: "Long-segment, irregular strictures with 'string sign' and skip lesions.", 
        distributionLocation: "Terminal ileum is classic.", 
        demographicsClinicalContext: "Young adults. Chronic diarrhea, weight loss.", 
        discriminatingKeyFeature: "COBBLESTONE MUCOSA, deep fissuring ulcers, and asymmetric involvement.", 
        associatedFindings: "Creeping fat (fibrofatty proliferation) and fistulae.", 
        complicationsSeriousAlternatives: "Bowel obstruction or abscess.", 
        isCorrectDiagnosis: true 
      },
      { 
        diagnosis: "Ischaemic Stricture", 
        dominantImagingFinding: "Smooth, concentric, tapered stricture with loss of mucosal folds.", 
        distributionLocation: "Watershed areas or site of prior vascular insult.", 
        demographicsClinicalContext: "Older adults with atherosclerotic disease. History of severe acute abdominal pain weeks prior.", 
        discriminatingKeyFeature: "TUBULAR SMOOTH NARROWING lacking the deep ulceration or nodularity of Crohn's.", 
        associatedFindings: "Calcified mesenteric vessels.", 
        complicationsSeriousAlternatives: "Recurrent ischaemia or complete occlusion.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Adenocarcinoma", 
        dominantImagingFinding: "Short-segment, sharply demarcated 'apple-core' stricture with mucosal destruction.", 
        distributionLocation: "Duodenum or proximal jejunum.", 
        demographicsClinicalContext: "Older adults, occult bleeding.", 
        discriminatingKeyFeature: "SHOULDERED MARGINS and very short segment (<5cm) compared to inflammatory strictures.", 
        associatedFindings: "Regional lymphadenopathy.", 
        complicationsSeriousAlternatives: "Metastatic disease.", 
        isCorrectDiagnosis: false 
      },
      { 
        diagnosis: "Radiation Enteritis", 
        dominantImagingFinding: "Fixed, narrowed, featureless loops (tube-like).", 
        distributionLocation: "Pelvic loops (distal ileum).", 
        demographicsClinicalContext: "History of pelvic radiotherapy (e.g. cervical or prostate CA).", 
        discriminatingKeyFeature: "STRICT CONFINEMENT TO THE RADIATION PORTAL. Loops appear matted and fixed.", 
        associatedFindings: "Thickened bladder or rectal walls.", 
        complicationsSeriousAlternatives: "Fistula formation.", 
        isCorrectDiagnosis: false 
      }
    ]
  }
];

async function main() {
  console.log("Seeding ACE Differentials (Chapman) Batch 4...");
  const discriminators = await client.query(api.discriminators.list as any, {});
  
  for (const update of ACE_UPDATES) {
    const matches = discriminators.filter((d: any) => 
      d.pattern.toLowerCase().trim() === update.pattern.toLowerCase().trim()
    );
    
    const differentialsWithSort = update.differentials.map((d, idx) => ({
      ...d,
      sortOrder: idx
    }));
    
    if (matches.length > 0) {
      console.log(`Updating ${update.pattern}`);
      await client.mutation(api.discriminators.update as any, {
        id: matches[0]._id,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    } else {
      console.log(`Creating ${update.pattern}`);
      await client.mutation(api.discriminators.create as any, {
        pattern: update.pattern,
        differentials: differentialsWithSort,
        problemCluster: update.problemCluster,
      });
    }
  }
  console.log("ACE Batch 4 complete!");
}

main().catch(console.error);