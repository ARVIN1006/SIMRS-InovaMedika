// Prototype Wiring for all 8 SIMRS Boards in Penpot

function wireAllInteractions() {
  const root = penpot.currentPage.root;
  const boards = {};
  for (const b of root.children) {
    if (b.type === "board") {
      boards[b.name] = b;
    }
  }

  const bDash = boards["SIMRS - Dashboard Pelayanan"];
  const bEmr = boards["SIMRS - Pemeriksaan RME"];
  const bReg = boards["SIMRS - Pendaftaran Pasien"];
  const bPat = boards["SIMRS - Data Pasien & RM"];
  const bPharm = boards["SIMRS - Farmasi & Resep"];
  const bLab = boards["SIMRS - Laboratorium LIS"];
  const bCash = boards["SIMRS - Kasir & Pembayaran"];
  const bMaster = boards["SIMRS - Master Data & Tarif"];

  const boardList = [bDash, bEmr, bReg, bPat, bPharm, bLab, bCash, bMaster].filter(Boolean);
  if (boardList.length < 8) {
    return { error: "Some boards not found", found: boardList.map(b => b.name) };
  }

  // Clear existing flows & set up starting flow
  for (const f of [...penpot.currentPage.flows]) {
    f.remove();
  }
  const flow = penpot.currentPage.createFlow("Alur Pelayanan SIMRS", bDash);

  let wiredCount = 0;

  function addNav(shape, destination) {
    if (!shape || !destination) return;
    try {
      // Remove any existing interactions
      for (const i of [...(shape.interactions || [])]) {
        i.remove();
      }
      shape.addInteraction("click", {
        type: "navigate-to",
        destination: destination
      });
      wiredCount++;
    } catch (e) {
      // ignore
    }
  }

  // 1. GLOBAL SIDEBAR NAVIGATION FOR ALL BOARDS
  for (const b of boardList) {
    // Map text or buttons inside board
    for (const child of b.children) {
      // Check nav items
      const name = child.name || "";
      if (name.includes("nav-dash") || name === "nav-item-0") {
        addNav(child, bDash);
      } else if (name.includes("nav-queue") || name === "nav-item-1" || name.includes("nav-reg")) {
        // If sidebar says "Pendaftaran Pasien" or "Antrean Pasien"
        if (name === "nav-item-1") addNav(child, bReg);
        else addNav(child, bDash);
      } else if (name.includes("nav-rme") || name === "nav-item-2") {
        addNav(child, bEmr);
      } else if (name.includes("nav-pat") || name === "nav-item-3") {
        addNav(child, bPat);
      } else if (name.includes("nav-pharmacy") || name === "nav-item-4") {
        addNav(child, bPharm);
      } else if (name.includes("nav-lab") || name === "nav-item-5") {
        addNav(child, bLab);
      } else if (name.includes("nav-cashier") || name === "nav-item-6") {
        addNav(child, bCash);
      } else if (name.includes("nav-master") || name === "nav-item-7") {
        addNav(child, bMaster);
      }
    }
  }

  // 2. SPECIFIC OPERATIONAL BUTTONS
  // On Dashboard:
  const btnNewPatient = bDash.children.find(c => c.name === "btn-new" || c.name === "btn-new-txt");
  if (btnNewPatient) addNav(btnNewPatient, bReg);
  const btnRmeRow1 = bDash.children.find(c => c.name === "row-btn-box" || c.name === "row-btn-txt");
  if (btnRmeRow1) addNav(btnRmeRow1, bEmr);

  // On Pemeriksaan RME:
  const btnBackEmr = bEmr.children.find(c => c.name === "btn-back" || c.name === "btn-back-txt");
  if (btnBackEmr) addNav(btnBackEmr, bDash);
  const btnCompleteEmr = bEmr.children.find(c => c.name === "btn-complete" || c.name === "btn-complete-txt");
  if (btnCompleteEmr) addNav(btnCompleteEmr, bPharm);
  const btnLabEmr = bEmr.children.find(c => c.name === "lab-box" || c.name === "lab-name");
  if (btnLabEmr) addNav(btnLabEmr, bLab);
  const btnBillEmr = bEmr.children.find(c => c.name === "bill-box" || c.name === "bill-val");
  if (btnBillEmr) addNav(btnBillEmr, bCash);

  // On Pendaftaran Pasien:
  const btnSubmitReg = bReg.children.find(c => c.name === "f-btn-submit" || c.name === "f-btn-txt");
  if (btnSubmitReg) addNav(btnSubmitReg, bDash);

  // On Data Pasien & RM:
  const btnNewFromPat = bPat.children.find(c => c.name === "btn-new-p" || c.name === "btn-new-p-txt");
  if (btnNewFromPat) addNav(btnNewFromPat, bReg);
  const btnViewRm = bPat.children.find(c => c.name === "pr-btn-rm" || c.name === "pr-btn-rm-t");
  if (btnViewRm) addNav(btnViewRm, bEmr);

  // On Farmasi & Resep:
  const btnDispenseDone = bPharm.children.find(c => c.name === "ph-btn-done" || c.name === "ph-btn-done-t");
  if (btnDispenseDone) addNav(btnDispenseDone, bCash);
  const btnDispensePrep = bPharm.children.find(c => c.name === "ph-btn-prep" || c.name === "ph-btn-prep-t");
  if (btnDispensePrep) addNav(btnDispensePrep, bPharm);

  // On Laboratorium LIS:
  const btnLabSend = bLab.children.find(c => c.name === "lab-btn-send" || c.name === "lab-btn-txt");
  if (btnLabSend) addNav(btnLabSend, bEmr);

  // On Kasir & Pembayaran:
  const btnPayDone = bCash.children.find(c => c.name === "cas-btn-pay" || c.name === "cas-btn-pay-t");
  if (btnPayDone) addNav(btnPayDone, bDash);

  return {
    success: true,
    flow: flow.name,
    startingBoard: flow.startingBoard.name,
    totalInteractionsWired: wiredCount
  };
}
