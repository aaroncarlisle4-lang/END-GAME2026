import { mutation } from "./_generated/server";

const curriculum = [
  // Chest (10)
  { category: "Chest", name: "Solitary pulmonary nodule" },
  { category: "Chest", name: "Cavitating lung lesion" },
  { category: "Chest", name: "Multiple pulmonary nodules" },
  { category: "Chest", name: "Diffuse ground glass opacity" },
  { category: "Chest", name: "Interstitial lung disease pattern" },
  { category: "Chest", name: "Tree-in-bud nodules" },
  { category: "Chest", name: "Mediastinal mass by compartment" },
  { category: "Chest", name: "Pleural disease" },
  { category: "Chest", name: "Apical lung mass (Pancoast)" },
  { category: "Chest", name: "Pulmonary embolism pattern" },
  // Abdomen / GI (12)
  { category: "GI", name: "Liver lesion in cirrhosis" },
  { category: "GI", name: "Hypervascular liver lesion" },
  { category: "GI", name: "Hypovascular liver lesion" },
  { category: "GI", name: "Cystic liver lesion" },
  { category: "GI", name: "Pancreatic mass" },
  { category: "GI", name: "Cystic pancreatic lesion" },
  { category: "GI", name: "Adrenal mass" }, // Sometimes GU, putting under GI per prompt cluster name Abdomen / GI
  { category: "GI", name: "Peritoneal disease" },
  { category: "GI", name: "Bowel wall thickening" },
  { category: "GI", name: "Small bowel obstruction cause" },
  { category: "GI", name: "Mesenteric mass" },
  { category: "GI", name: "GI bleeding / vascular malformation" },
  // Genitourinary (7)
  { category: "GU", name: "Solid renal mass" },
  { category: "GU", name: "Cystic renal lesion (Bosniak)" },
  { category: "GU", name: "Hydronephrosis / obstructive uropathy" },
  { category: "GU", name: "Bladder mass" },
  { category: "GU", name: "Prostate pathology" },
  { category: "GU", name: "Testicular mass" },
  { category: "GU", name: "Retroperitoneal fibrosis / retroperitoneal mass" },
  // Gynaecology (6)
  { category: "Gynae", name: "Adnexal cystic lesion" },
  { category: "Gynae", name: "Adnexal solid mass" },
  { category: "Gynae", name: "Endometrial thickening / mass" },
  { category: "Gynae", name: "Uterine mass (fibroid vs sarcoma)" },
  { category: "Gynae", name: "Ovarian torsion" },
  { category: "Gynae", name: "Pelvic peritoneal disease" },
  // Breast (5)
  { category: "Breast", name: "Spiculated breast mass" },
  { category: "Breast", name: "Circumscribed breast mass" },
  { category: "Breast", name: "Calcification patterns" },
  { category: "Breast", name: "Architectural distortion" },
  { category: "Breast", name: "Post-treatment breast changes" },
  // Paediatrics (6)
  { category: "Paeds", name: "Neonatal bowel obstruction" },
  { category: "Paeds", name: "Intussusception" },
  { category: "Paeds", name: "Paediatric abdominal mass" },
  { category: "Paeds", name: "Paediatric chest infection pattern" },
  { category: "Paeds", name: "Paediatric bone tumour" },
  { category: "Paeds", name: "Developmental hip disorder" },
  // Neuro (8)
  { category: "Neuro", name: "Ring enhancing lesion" },
  { category: "Neuro", name: "Multiple brain lesions" },
  { category: "Neuro", name: "Extra-axial mass" },
  { category: "Neuro", name: "CPA mass" },
  { category: "Neuro", name: "Sellar / suprasellar mass" },
  { category: "Neuro", name: "Pineal region mass" },
  { category: "Neuro", name: "White matter disease" },
  { category: "Neuro", name: "Acute stroke pattern" },
  // MSK (6)
  { category: "MSK", name: "Epiphyseal lytic lesion" },
  { category: "MSK", name: "Metaphyseal lytic lesion" },
  { category: "MSK", name: "Aggressive bone tumour" },
  { category: "MSK", name: "Vertebral marrow replacement" },
  { category: "MSK", name: "Joint space destruction" },
  { category: "MSK", name: "Soft tissue mass" }
];

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const logs: string[] = [];
    
    // Clear existing clusters
    const existing = await ctx.db.query("highYieldClusters").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }

    // Clear existing stubs
    const existingStubs = await ctx.db
      .query("differentialPatterns")
      .filter((q) => q.eq(q.field("section"), "High Yield Cluster"))
      .collect();
    for (const doc of existingStubs) {
      await ctx.db.delete(doc._id);
    }

    const patterns = await ctx.db.query("differentialPatterns").collect();
    const mnemonics = await ctx.db.query("mnemonics").collect();

    let customPatternIdCounter = 1000;
    
    // Create mapping to search easily
    const patternMap = new Map();
    for (const p of patterns) {
      patternMap.set(normalize(p.pattern), p);
    }
    const mnemonicMap = new Map();
    for (const m of mnemonics) {
      mnemonicMap.set(normalize(m.pattern), m);
    }

    // Manual mappings for tricky cases or semantic matches discovered in analysis
    const manualMapping: Record<string, string> = {
      "cavitatinglunglesion": "largecavitatinglesion", 
      "diffusegroundglassopacity": "groundglassopacication",
      "interstitiallungdiseasepattern": "lowerlobeinterstitiallungdiseaseild",
      "mediastinalmassbycompartment": "anteriormediastinalmass", 
      "pleuraldisease": "calciedpleuraldisease",
      "apicallungmasspancoast": "apicallungmasspancoast",
      "pulmonaryembolismpattern": "pulmonaryembolismpattern",
      "liverlesionincirrhosis": "nodularlivercontour", 
      "hypervascularliverlesion": "hypervascularlivermass",
      "hypovascularliverlesion": "solitaryhypodensehypovascularlivermass",
      "cysticliverlesion": "multiplehypoechoiclivermasses",
      "pancreaticmass": "solidpancreaticmass",
      "cysticpancreaticlesion": "cysticpancreaticmass",
      "solidrenalmass": "solidrenalmass",
      "cysticrenallesionbosniak": "cysticrenalmass",
      "bladdermass": "bladderllingdefect",
      "prostatepathology": "prostateenlargement",
      "testicularmass": "extratesticularmass",
      "retroperitonealfibrosisretroperitonealmass": "retroperitonealmass",
      "adnexalcysticlesion": "cysticadnexalmasswithnegativehcg",
      "adnexalsolidmass": "adnexalmasswithincreasedthroughtransmissionandhomogeneouslowlevelechoes",
      "endometrialthickeningmass": "thickenedendometrialstripe",
      "bowelwallthickening": "smallbowelwallthickening",
      "uterinemassfibroidvssarcoma": "enlargedheterogeneousuterus",
      "calcificationpatterns": "benignappearingcalcicationsrimpunctateandroundforms",
      "circumscribedbreastmass": "wellcircumscribedsolidbreastmass",
      "neonatalbowelobstruction": "neonatallowbowelobstruction",
      "paediatricabdominalmass": "largeabdominalmassinchild",
      "ringenhancinglesion": "ringenhancingbrainlesions",
      "multiplebrainlesions": "multiplebrainlesions",
      "extraaxialmass": "intraduralextramedullaryspinalmass", 
      "cpamass": "cerebellopontineanglecpamass",
      "sellarsuprasellarmass": "sellarsuprasellarmassinachild",
      "whitematterdisease": "conuentwhitematterlesionsinanadult",
      "acutestrokepattern": "acutestrokepattern",
      "epiphyseallyticlesion": "epiphyseallucentlesion",
      "metaphyseallyticlesion": "lucentmetaphysealbands",
      "aggressivebonetumour": "aggressivelyticlesioninchild",
      "vertebralmarrowreplacement": "diffusemarrowinfiltrationmri",
      "jointspacedestruction": "densejointeusion",
      "softtissuemass": "softtissuemass"
    };

    let sortOrder = 1;
    for (const item of curriculum) {
      const norm = normalize(item.name);
      const searchKey = manualMapping[norm] || norm;
      
      let patternMatch = patternMap.get(searchKey);
      let mnemonicMatch = mnemonicMap.get(searchKey);

      if (patternMatch) {
        logs.push(`Matched pattern: ${item.name} -> ${patternMatch.pattern}`);
        await ctx.db.insert("highYieldClusters", {
          category: item.category,
          clusterName: item.name,
          sortOrder: sortOrder++,
          sourceType: "pattern",
          patternId: patternMatch._id,
        });
      } else if (mnemonicMatch) {
        logs.push(`Matched mnemonic: ${item.name} -> ${mnemonicMatch.pattern}`);
        await ctx.db.insert("highYieldClusters", {
          category: item.category,
          clusterName: item.name,
          sortOrder: sortOrder++,
          sourceType: "mnemonic",
          mnemonicId: mnemonicMatch._id,
        });
      } else {
        logs.push(`No match for: ${item.name} (key: ${searchKey})`);
        // Create new play card in differentialPatterns
        const newPatternId = await ctx.db.insert("differentialPatterns", {
          obrienCaseNumber: customPatternIdCounter++,
          categoryAbbreviation: item.category,
          section: "High Yield Cluster",
          pattern: item.name,
          diagnosis: "To be determined",
          clinicalPresentation: "Requires refinement.",
          top3: ["Differential 1", "Differential 2", "Differential 3"],
          additional: [],
        });

        await ctx.db.insert("highYieldClusters", {
          category: item.category,
          clusterName: item.name,
          sortOrder: sortOrder++,
          sourceType: "pattern",
          patternId: newPatternId,
        });
      }
    }
    return logs;
  },
});
