// AXR Rapid Shells — ~50 shells grouped by DDx problem type
// Case numbers start at 501
export const axrShells = [
  // ============================================================
  // PACKET 1: Obstruction, Emergency & Bowel
  // ============================================================

  // --- Subsection: Small bowel obstruction ---
  { caseNumber: 501, title: "SBO — dilated small bowel with valvulae conniventes", modality: "AXR supine", diagnosis: "Small bowel obstruction — dilated loops with valvulae conniventes, no gas in colon", difficulty: "core", subsection: "Small bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 1 },
  { caseNumber: 502, title: "SBO — transition point with decompressed distal bowel", modality: "AXR supine", diagnosis: "Small bowel obstruction with identifiable transition point", difficulty: "core", subsection: "Small bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 2 },
  { caseNumber: 503, title: "Gallstone ileus — Rigler triad", modality: "AXR supine", diagnosis: "Gallstone ileus — SBO + pneumobilia + ectopic gallstone (Rigler triad)", difficulty: "advanced", subsection: "Small bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 3 },
  { caseNumber: 504, title: "Closed-loop obstruction", modality: "AXR supine", diagnosis: "Closed-loop small bowel obstruction — single dilated C-shaped loop (coffee bean sign)", difficulty: "advanced", subsection: "Small bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 4 },

  // --- Subsection: Large bowel obstruction ---
  { caseNumber: 505, title: "LBO — dilated colon with haustra", modality: "AXR supine", diagnosis: "Large bowel obstruction — dilated colon (>6cm) with haustral markings to transition point", difficulty: "core", subsection: "Large bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 5 },
  { caseNumber: 506, title: "Sigmoid volvulus — coffee bean sign", modality: "AXR supine", diagnosis: "Sigmoid volvulus — massively dilated ahaustral sigmoid loop (coffee bean sign)", difficulty: "core", subsection: "Large bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 6 },
  { caseNumber: 507, title: "Caecal volvulus — dilated caecum in LUQ", modality: "AXR supine", diagnosis: "Caecal volvulus — dilated caecum displaced to left upper quadrant with single air-fluid level", difficulty: "intermediate", subsection: "Large bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 7 },
  { caseNumber: 508, title: "Pseudo-obstruction (Ogilvie syndrome)", modality: "AXR supine", diagnosis: "Acute colonic pseudo-obstruction (Ogilvie syndrome) — dilated colon without mechanical obstruction", difficulty: "intermediate", subsection: "Large bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 8 },
  { caseNumber: 509, title: "Obstructing colonic carcinoma — apple-core on AXR", modality: "AXR supine", diagnosis: "Large bowel obstruction — transition at splenic flexure (colonic carcinoma)", difficulty: "intermediate", subsection: "Large bowel obstruction", parentGroup: "Bowel obstruction", packet: 1, packetOrder: 9 },

  // --- Subsection: Pneumoperitoneum ---
  { caseNumber: 510, title: "Free air — Rigler sign on supine AXR", modality: "AXR supine", diagnosis: "Pneumoperitoneum — Rigler sign (gas on both sides of bowel wall)", difficulty: "core", subsection: "Pneumoperitoneum", parentGroup: "Free air", packet: 1, packetOrder: 10 },
  { caseNumber: 511, title: "Free air — erect CXR subdiaphragmatic", modality: "Erect CXR", diagnosis: "Free subdiaphragmatic gas — perforated viscus", difficulty: "core", subsection: "Pneumoperitoneum", parentGroup: "Free air", packet: 1, packetOrder: 11 },
  { caseNumber: 512, title: "Free air — falciform ligament sign", modality: "AXR supine", diagnosis: "Pneumoperitoneum — outlining of falciform ligament on supine film", difficulty: "intermediate", subsection: "Pneumoperitoneum", parentGroup: "Free air", packet: 1, packetOrder: 12 },
  { caseNumber: 513, title: "Retroperitoneal free air", modality: "AXR supine", diagnosis: "Retroperitoneal air — outlining psoas margin and kidney (duodenal perforation)", difficulty: "advanced", subsection: "Pneumoperitoneum", parentGroup: "Free air", packet: 1, packetOrder: 13 },

  // --- Subsection: Toxic megacolon ---
  { caseNumber: 514, title: "Toxic megacolon — colitis with dilatation", modality: "AXR supine", diagnosis: "Toxic megacolon — transverse colon >6cm with mucosal irregularity (thumbprinting)", difficulty: "intermediate", subsection: "Toxic megacolon", parentGroup: "Inflammatory", packet: 1, packetOrder: 14 },
  { caseNumber: 515, title: "Ulcerative colitis — lead pipe colon", modality: "AXR supine", diagnosis: "Ulcerative colitis — featureless lead-pipe colon with loss of haustration", difficulty: "intermediate", subsection: "Toxic megacolon", parentGroup: "Inflammatory", packet: 1, packetOrder: 15 },
  { caseNumber: 516, title: "Thumbprinting — ischaemic colitis", modality: "AXR supine", diagnosis: "Ischaemic colitis — mural thumbprinting of splenic flexure region", difficulty: "intermediate", subsection: "Toxic megacolon", parentGroup: "Inflammatory", packet: 1, packetOrder: 16 },

  // ============================================================
  // PACKET 2: Calcification, Neonatal, Foreign Body, Misc
  // ============================================================

  // --- Subsection: Calcification patterns ---
  { caseNumber: 517, title: "Renal calculi — bilateral staghorn", modality: "AXR supine", diagnosis: "Bilateral staghorn calculi", difficulty: "core", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 1 },
  { caseNumber: 518, title: "Ureteric calculus — right VUJ", modality: "AXR supine", diagnosis: "Right vesicoureteric junction calculus", difficulty: "core", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 2 },
  { caseNumber: 519, title: "Pancreatic calcification — chronic pancreatitis", modality: "AXR supine", diagnosis: "Chronic pancreatitis — diffuse pancreatic calcification across epigastrium", difficulty: "intermediate", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 3 },
  { caseNumber: 520, title: "AAA calcification — abdominal aortic aneurysm", modality: "AXR supine", diagnosis: "Calcified abdominal aortic aneurysm (>3cm) — curvilinear calcification", difficulty: "intermediate", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 4 },
  { caseNumber: 521, title: "Gallstones — calcified in RUQ", modality: "AXR supine", diagnosis: "Calcified gallstones — only 10% are radio-opaque", difficulty: "core", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 5 },
  { caseNumber: 522, title: "Appendicolith", modality: "AXR supine", diagnosis: "Calcified appendicolith in right iliac fossa — clinical correlation for appendicitis", difficulty: "intermediate", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 6 },
  { caseNumber: 523, title: "Pelvic phleboliths vs ureteric calculus", modality: "AXR supine", diagnosis: "Pelvic phleboliths — round calcification with lucent centre (distinguish from ureteric stone)", difficulty: "core", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 7 },
  { caseNumber: 524, title: "Uterine fibroid calcification", modality: "AXR supine", diagnosis: "Calcified uterine fibroids — popcorn calcification in pelvis", difficulty: "core", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 8 },
  { caseNumber: 525, title: "Adrenal calcification — bilateral", modality: "AXR supine", diagnosis: "Bilateral adrenal calcification — prior TB/haemorrhage (Addison disease)", difficulty: "advanced", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 9 },
  { caseNumber: 526, title: "Porcelain gallbladder", modality: "AXR supine", diagnosis: "Porcelain gallbladder — rim calcification of gallbladder wall", difficulty: "intermediate", subsection: "Calcification pattern", parentGroup: "Calcification", packet: 2, packetOrder: 10 },

  // --- Subsection: Neonatal bowel ---
  { caseNumber: 527, title: "Duodenal atresia — double bubble", modality: "Neonatal AXR supine", diagnosis: "Duodenal atresia — double bubble sign with absent distal bowel gas", difficulty: "core", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 11 },
  { caseNumber: 528, title: "NEC — pneumatosis intestinalis", modality: "Neonatal AXR supine", diagnosis: "Necrotising enterocolitis — pneumatosis intestinalis with portal venous gas", difficulty: "intermediate", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 12 },
  { caseNumber: 529, title: "Meconium ileus — soap bubble appearance", modality: "Neonatal AXR supine", diagnosis: "Meconium ileus — dilated ileum with soap-bubble (Neuhauser) sign, no air-fluid levels", difficulty: "intermediate", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 13 },
  { caseNumber: 530, title: "Hirschsprung disease — dilated proximal colon", modality: "AXR supine (neonate)", diagnosis: "Hirschsprung disease — dilated proximal colon with absence of rectal gas", difficulty: "intermediate", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 14 },
  { caseNumber: 531, title: "Malrotation with midgut volvulus", modality: "AXR supine (neonate)", diagnosis: "Malrotation — paucity of distal gas with double bubble variant (bilious vomiting = surgical emergency)", difficulty: "advanced", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 15 },
  { caseNumber: 532, title: "Jejunal atresia — triple bubble", modality: "Neonatal AXR supine", diagnosis: "Jejunal atresia — triple bubble sign with dilated stomach, duodenum and proximal jejunum", difficulty: "intermediate", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 16 },
  { caseNumber: 533, title: "Meconium peritonitis — calcification", modality: "Neonatal AXR supine", diagnosis: "Meconium peritonitis — scattered intra-abdominal calcification from antenatal perforation", difficulty: "advanced", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 17 },
  { caseNumber: 534, title: "Intussusception — soft tissue mass RUQ", modality: "AXR supine (child)", diagnosis: "Ileocolic intussusception — soft tissue mass in RUQ with paucity of right colonic gas", difficulty: "intermediate", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 18 },
  { caseNumber: 535, title: "Pyloric stenosis — distended stomach", modality: "AXR supine (infant)", diagnosis: "Hypertrophic pyloric stenosis — massively distended stomach with distal gas paucity", difficulty: "core", subsection: "Neonatal bowel", parentGroup: "Neonatal abdomen", packet: 2, packetOrder: 19 },

  // --- Subsection: Foreign body / iatrogenic ---
  { caseNumber: 536, title: "Ingested coin — oesophageal", modality: "CXR and AXR", diagnosis: "Ingested coin in oesophagus — round opacity en face on AP (coronal orientation)", difficulty: "core", subsection: "Foreign body / iatrogenic", parentGroup: "Foreign body", packet: 2, packetOrder: 20 },
  { caseNumber: 537, title: "Button battery — oesophageal", modality: "CXR AP and lateral", diagnosis: "Ingested button battery in oesophagus — double-ring sign, EMERGENCY", difficulty: "core", subsection: "Foreign body / iatrogenic", parentGroup: "Foreign body", packet: 2, packetOrder: 21 },
  { caseNumber: 538, title: "Magnet ingestion — multiple", modality: "AXR supine", diagnosis: "Multiple magnet ingestion — risk of bowel-to-bowel fistula/perforation", difficulty: "intermediate", subsection: "Foreign body / iatrogenic", parentGroup: "Foreign body", packet: 2, packetOrder: 22 },
  { caseNumber: 539, title: "Retained surgical swab", modality: "AXR supine", diagnosis: "Retained surgical swab — radio-opaque marker in abdomen (gossypiboma)", difficulty: "intermediate", subsection: "Foreign body / iatrogenic", parentGroup: "Foreign body", packet: 2, packetOrder: 23 },
  { caseNumber: 540, title: "Body packing — drug packets", modality: "AXR supine", diagnosis: "Body packing — multiple well-defined ovoid opacities in bowel lumen", difficulty: "intermediate", subsection: "Foreign body / iatrogenic", parentGroup: "Foreign body", packet: 2, packetOrder: 24 },

  // --- Subsection: Abdominal wall / hernia ---
  { caseNumber: 541, title: "Inguinal hernia — bowel loops in scrotum", modality: "AXR supine", diagnosis: "Right inguinal hernia — gas-containing bowel loops extending into inguinal canal/scrotum", difficulty: "core", subsection: "Abdominal wall / hernia", parentGroup: "Abdominal wall", packet: 2, packetOrder: 25 },
  { caseNumber: 542, title: "Obturator hernia — Howship-Romberg sign", modality: "AXR supine", diagnosis: "Obturator hernia — gas shadow between inferior pubic ramus and obturator foramen", difficulty: "advanced", subsection: "Abdominal wall / hernia", parentGroup: "Abdominal wall", packet: 2, packetOrder: 26 },

  // --- Subsection: Pneumatosis / portal gas ---
  { caseNumber: 543, title: "Pneumatosis intestinalis — adult", modality: "AXR supine", diagnosis: "Pneumatosis intestinalis — intramural gas in small bowel wall (ischaemia vs benign)", difficulty: "intermediate", subsection: "Pneumatosis / portal gas", parentGroup: "Bowel wall", packet: 2, packetOrder: 27 },
  { caseNumber: 544, title: "Portal venous gas — adult", modality: "AXR supine", diagnosis: "Portal venous gas — branching gas pattern overlying liver periphery", difficulty: "intermediate", subsection: "Pneumatosis / portal gas", parentGroup: "Bowel wall", packet: 2, packetOrder: 28 },

  // --- Subsection: Post-surgical abdomen ---
  { caseNumber: 545, title: "Post-laparotomy — ileus", modality: "AXR supine", diagnosis: "Post-operative ileus — generalised bowel dilatation without transition point", difficulty: "core", subsection: "Post-surgical abdomen", parentGroup: "Post-surgical", packet: 2, packetOrder: 29 },
  { caseNumber: 546, title: "Anastomotic leak — pneumoperitoneum post-op", modality: "AXR and erect CXR", diagnosis: "Post-operative free air — if >7 days post-op, suspect anastomotic leak", difficulty: "intermediate", subsection: "Post-surgical abdomen", parentGroup: "Post-surgical", packet: 2, packetOrder: 30 },
  { caseNumber: 547, title: "Biliary stent in situ", modality: "AXR supine", diagnosis: "Biliary stent — tubular radio-opaque structure in RUQ across common bile duct", difficulty: "core", subsection: "Post-surgical abdomen", parentGroup: "Post-surgical", packet: 2, packetOrder: 31 },
  { caseNumber: 548, title: "DJ stent — ureteric", modality: "AXR supine", diagnosis: "Bilateral JJ (double-J) ureteric stents in situ", difficulty: "core", subsection: "Post-surgical abdomen", parentGroup: "Post-surgical", packet: 2, packetOrder: 32 },

  // --- Subsection: Miscellaneous AXR ---
  { caseNumber: 549, title: "Ascites — ground glass with central bowel", modality: "AXR supine", diagnosis: "Large-volume ascites — diffuse ground-glass opacity with centralised bowel loops", difficulty: "core", subsection: "Miscellaneous AXR", parentGroup: "Miscellaneous", packet: 2, packetOrder: 33 },
  { caseNumber: 550, title: "Splenomegaly — displacing splenic flexure", modality: "AXR supine", diagnosis: "Massive splenomegaly — soft tissue mass displacing splenic flexure and bowel inferiorly", difficulty: "intermediate", subsection: "Miscellaneous AXR", parentGroup: "Miscellaneous", packet: 2, packetOrder: 34 },
  { caseNumber: 551, title: "Hepatomegaly — displacing bowel", modality: "AXR supine", diagnosis: "Hepatomegaly — liver shadow extending below right iliac crest", difficulty: "core", subsection: "Miscellaneous AXR", parentGroup: "Miscellaneous", packet: 2, packetOrder: 35 },
];
