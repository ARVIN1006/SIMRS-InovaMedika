// Precision Tidying and Collision-Free Placement Script for All 8 SIMRS Penpot Boards

function precisionTidyAndVerify() {
  const root = penpot.currentPage.root;
  const boards = root.children.filter(b => b.type === "board");
  let totalFixed = 0;

  for (const board of boards) {
    // Special handling for SIMRS - Pemeriksaan RME
    if (board.name === "SIMRS - Pemeriksaan RME") {
      const toRemove = board.children.filter(c => 
        c.name === "user-avatar" || c.name === "user-initials" || (c.name === "nav-div" && (c.x - board.x) > 1000)
      );
      for (const item of toRemove) item.remove();

      const btnComp = board.children.find(c => c.name === "btn-complete");
      const btnCompTxt = board.children.find(c => c.name === "btn-complete-txt");
      if (btnComp && btnCompTxt) {
        btnComp.x = board.x + 1236;
        btnComp.y = board.y + 14;
        btnCompTxt.x = board.x + 1236 + Math.round((btnComp.width - btnCompTxt.width) / 2);
        btnCompTxt.y = board.y + 24;
      }
      continue;
    }

    // 1. Top Navbar
    const navBg = board.children.find(c => c.name === "navbar-bg");
    if (navBg) {
      const navH = navBg.height;
      const navY = navBg.y;

      const logoBox = board.children.find(c => c.name === "logo-box");
      if (logoBox) {
        logoBox.y = navY + Math.round((navH - logoBox.height) / 2);
        const crossH = board.children.find(c => c.name === "cross-h");
        const crossV = board.children.find(c => c.name === "cross-v");
        if (crossH) {
          crossH.x = Math.round(logoBox.x + (logoBox.width - crossH.width) / 2);
          crossH.y = Math.round(logoBox.y + (logoBox.height - crossH.height) / 2);
        }
        if (crossV) {
          crossV.x = Math.round(logoBox.x + (logoBox.width - crossV.width) / 2);
          crossV.y = Math.round(logoBox.y + (logoBox.height - crossV.height) / 2);
        }
      }

      const brandTitle = board.children.find(c => c.name === "brand-title");
      if (brandTitle) brandTitle.y = navY + Math.round((navH - brandTitle.height) / 2);

      const pageTitle = board.children.find(c => c.name === "nav-page-title" || c.name === "brand-sub");
      if (pageTitle) pageTitle.y = navY + Math.round((navH - pageTitle.height) / 2);

      const searchBox = board.children.find(c => c.name === "search-box");
      if (searchBox) {
        searchBox.y = navY + Math.round((navH - searchBox.height) / 2);
        const searchPlaceholder = board.children.find(c => c.name === "search-placeholder");
        if (searchPlaceholder) {
          searchPlaceholder.x = searchBox.x + 16;
          searchPlaceholder.y = navY + Math.round((navH - searchPlaceholder.height) / 2);
        }
        const kbdTxt = board.children.find(c => c.name === "kbd-txt");
        if (kbdTxt) {
          kbdTxt.x = Math.round(searchBox.x + searchBox.width - kbdTxt.width - 16);
          kbdTxt.y = navY + Math.round((navH - kbdTxt.height) / 2);
        }
      }

      // Safe navbar profile cluster with 65px right-margin (no text clipping)
      const userName = board.children.find(c => c.name === "user-name");
      const userRole = board.children.find(c => c.name === "user-role");
      const userAvatar = board.children.find(c => c.name === "user-avatar");
      const userInitials = board.children.find(c => c.name === "user-initials");
      const navDiv = board.children.find(c => c.name === "nav-div");
      const dateTxt = board.children.find(c => c.name === "date-txt");

      if (userName) {
        userName.x = board.x + 1240;
        userName.y = board.y + 16;
      }
      if (userRole) {
        userRole.x = board.x + 1240;
        userRole.y = board.y + 34;
      }
      if (userAvatar) {
        userAvatar.x = board.x + 1192;
        userAvatar.y = board.y + 14;
      }
      if (userInitials) {
        userInitials.x = board.x + 1202;
        userInitials.y = board.y + 24;
      }
      if (navDiv) {
        navDiv.x = board.x + 1176;
        navDiv.y = board.y + 20;
      }
      if (dateTxt) {
        dateTxt.x = board.x + 1065;
        dateTxt.y = board.y + 24;
      }
    }

    // 2. Buttons & Badges Text Centering
    for (const c of board.children) {
      if (c.type === "rectangle" && (
        c.name.includes("btn") || c.name.includes("badge") || c.name.includes("pill")
      )) {
        const txts = board.children.filter(t => t.type === "text" && (
          t.name.includes(c.name) || (
            t.x >= c.x - 5 && t.x + t.width <= c.x + c.width + 10 &&
            t.y >= c.y - 10 && t.y + t.height <= c.y + c.height + 15
          )
        ));
        if (txts.length === 1) {
          const t = txts[0];
          t.x = Math.round(c.x + (c.width - t.width) / 2);
          t.y = Math.round(c.y + (c.height - t.height) / 2);
          totalFixed++;
        }
      }
    }

    // 3. Pemeriksaan RME Diagnosis & Lab box
    if (board.name === "SIMRS - Pemeriksaan RME") {
      const d1Box = board.children.find(c => c.name === "diag-1-box");
      const d1Code = board.children.find(c => c.name === "diag-1-code");
      const d1Title = board.children.find(c => c.name === "diag-1-title");
      const d1Sub = board.children.find(c => c.name === "diag-1-sub");
      if (d1Box && d1Code && d1Title) {
        d1Code.x = d1Box.x + 16;
        d1Code.y = Math.round(d1Box.y + (d1Box.height - d1Code.height) / 2);
        d1Title.x = d1Code.x + d1Code.width + 12;
        d1Title.y = Math.round(d1Box.y + (d1Box.height - d1Title.height) / 2);
        if (d1Sub) {
          d1Sub.x = Math.round(d1Box.x + d1Box.width - d1Sub.width - 16);
          d1Sub.y = Math.round(d1Box.y + (d1Box.height - d1Sub.height) / 2);
        }
      }

      const d2Box = board.children.find(c => c.name === "diag-2-box");
      const d2Code = board.children.find(c => c.name === "diag-2-code");
      const d2Title = board.children.find(c => c.name === "diag-2-title");
      const d2Sub = board.children.find(c => c.name === "diag-2-sub");
      if (d2Box && d2Code && d2Title) {
        d2Code.x = d2Box.x + 16;
        d2Code.y = Math.round(d2Box.y + (d2Box.height - d2Code.height) / 2);
        d2Title.x = d2Code.x + d2Code.width + 12;
        d2Title.y = Math.round(d2Box.y + (d2Box.height - d2Title.height) / 2);
        if (d2Sub) {
          d2Sub.x = Math.round(d2Box.x + d2Box.width - d2Sub.width - 16);
          d2Sub.y = Math.round(d2Box.y + (d2Box.height - d2Sub.height) / 2);
        }
      }

      const labBox = board.children.find(c => c.name === "lab-box");
      const labName = board.children.find(c => c.name === "lab-name");
      const labStatus = board.children.find(c => c.name === "lab-status");
      if (labBox && labName && labStatus) {
        labName.x = labBox.x + 16;
        labName.y = labBox.y + 10;
        labStatus.x = labBox.x + 16;
        labStatus.y = labBox.y + 30;
      }
    }
  }

  // 4. Verification Scan
  const remainingCollisions = [];
  for (const board of boards) {
    const texts = board.children.filter(c => c.type === "text");
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const t1 = texts[i];
        const t2 = texts[j];
        const overlapX = (t1.x < t2.x + t2.width) && (t1.x + t1.width > t2.x);
        const overlapY = (t1.y < t2.y + t2.height) && (t1.y + t1.height > t2.y);
        if (overlapX && overlapY) {
          remainingCollisions.push({
            board: board.name,
            t1: t1.characters,
            t2: t2.characters
          });
        }
      }
    }
  }

  return {
    success: true,
    totalBoards: boards.length,
    remainingCollisionsCount: remainingCollisions.length,
    remainingCollisions
  };
}
