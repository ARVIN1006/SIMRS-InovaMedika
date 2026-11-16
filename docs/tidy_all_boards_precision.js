// Comprehensive Precision Tidying Script for all 8 SIMRS Boards in Penpot

function precisionTidyAll() {
  const root = penpot.currentPage.root;
  const boards = root.children.filter(b => b.type === "board");
  let totalAdjusted = 0;

  for (const board of boards) {
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
          kbdTxt.x = searchBox.x + searchBox.width - kbdTxt.width - 16;
          kbdTxt.y = navY + Math.round((navH - kbdTxt.height) / 2);
        }
      }

      const userAvatar = board.children.find(c => c.name === "user-avatar");
      if (userAvatar) {
        userAvatar.y = navY + Math.round((navH - userAvatar.height) / 2);
        const userInitials = board.children.find(c => c.name === "user-initials");
        if (userInitials) {
          userInitials.x = Math.round(userAvatar.x + (userAvatar.width - userInitials.width) / 2);
          userInitials.y = Math.round(userAvatar.y + (userAvatar.height - userInitials.height) / 2);
        }
      }
      const navDiv = board.children.find(c => c.name === "nav-div");
      if (navDiv) navDiv.y = navY + Math.round((navH - navDiv.height) / 2);
      const dateTxt = board.children.find(c => c.name === "date-txt");
      if (dateTxt) dateTxt.y = navY + Math.round((navH - dateTxt.height) / 2);
      const userName = board.children.find(c => c.name === "user-name");
      const userRole = board.children.find(c => c.name === "user-role");
      if (userName && userRole) {
        userName.y = navY + 16;
        userRole.y = navY + 34;
      }
    }

    // 2. Center All Buttons & Badges Text
    for (const c of board.children) {
      if (c.type === "rectangle" && (
        c.name.includes("btn") || c.name.includes("badge") || c.name.includes("pill") || c.name.includes("button")
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
          totalAdjusted++;
        }
      }
    }

    // 3. Inputs & Dropdowns
    for (const c of board.children) {
      if (c.type === "rectangle" && (c.name.includes("box") || c.name.includes("input")) && c.height >= 32 && c.height <= 54) {
        const txts = board.children.filter(t => t.type === "text" && (
          t.name.includes(c.name) || (
            t.x >= c.x - 5 && t.x + t.width <= c.x + c.width + 10 &&
            t.y >= c.y - 10 && t.y + t.height <= c.y + c.height + 15
          )
        ));
        for (const t of txts) {
          if (c.width > 120) {
            t.x = c.x + 14;
            t.y = Math.round(c.y + (c.height - t.height) / 2);
          } else {
            t.x = Math.round(c.x + (c.width - t.width) / 2);
            t.y = Math.round(c.y + (c.height - t.height) / 2);
          }
          totalAdjusted++;
        }
      }
    }
  }

  return { success: true, totalAdjusted };
}
