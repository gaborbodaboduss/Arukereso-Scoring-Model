/*
 * Árukereső-inspired Merchant Opportunity Scoring Studio
 * Independent educational prototype. Rules reproduce the original case-study scoring workbook.
 * No services, APIs, accounts, telemetry, or third-party dependencies are used.
 */
"use strict";
const DEFAULT_BENCHMARKS = Object.freeze({ ppc: 4000, revenue: 300000 });
const WEIGHTS = Object.freeze({
  ppc: 35,
  activity: 25,
  price: 15,
  revenue: 10,
  competition: 10,
  category: 5,
});
const ACTIVITY_BASE = Object.freeze({
  new: 11,
  feed: 14,
  free: 12,
  active: 12,
  low: 17,
});
const ACTIVITY_LABEL = Object.freeze({
  new: "Not on Heureka",
  feed: "Feed submitted",
  free: "FREE",
  active: "Active PPC",
  low: "Active PPC – low spend",
});
const PRICE_FRACTIONS = Object.freeze({
  cheap: 1,
  average: 0.6,
  expensive: 2 / 15,
});
const COMPETITION_FRACTIONS = Object.freeze({
  high: 1,
  medium: 2 / 3,
  low: 1 / 3,
});
const OCM_BONUS = Object.freeze({ none: 0, implemented: 1, reliable: 3 });
const SAMPLE_MERCHANTS = [
  {
    id: 1,
    name: "FitZonePro",
    category: "Sports Equipment",
    revenue: 180000,
    budget: 2500,
    activity: "new",
    competition: "high",
    price: "cheap",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 68.875,
  },
  {
    id: 2,
    name: "BabyNest CZ",
    category: "Baby & Kids",
    revenue: 35000,
    budget: 600,
    activity: "feed",
    competition: "medium",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 42.08333,
  },
  {
    id: 3,
    name: "SmartLights24",
    category: "Home",
    revenue: 95000,
    budget: 1500,
    activity: "active",
    competition: "high",
    price: "cheap",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "reliable",
    blocked: false,
    expected: 61.29167,
  },
  {
    id: 4,
    name: "EcoGardenPoint",
    category: "Garden",
    revenue: 28000,
    budget: 400,
    activity: "free",
    competition: "low",
    price: "expensive",
    bidding: false,
    marketplace: false,
    vbc: true,
    ocm: "none",
    blocked: false,
    expected: 27.76667,
  },
  {
    id: 5,
    name: "TrendyShoes",
    category: "Fashion",
    revenue: 160000,
    budget: 2200,
    activity: "active",
    competition: "high",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: true,
    expected: 48.58333,
  },
  {
    id: 6,
    name: "CyclePro Shop",
    category: "Cycling",
    revenue: 210000,
    budget: 3000,
    activity: "active",
    competition: "medium",
    price: "cheap",
    bidding: true,
    marketplace: false,
    vbc: false,
    ocm: "reliable",
    blocked: false,
    expected: 76.91667,
  },
  {
    id: 7,
    name: "HomeTechMaster",
    category: "Electronics (small)",
    revenue: 58000,
    budget: 900,
    activity: "new",
    competition: "high",
    price: "cheap",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 50.80833,
  },
  {
    id: 8,
    name: "PetWorldPlus",
    category: "Pet Supplies",
    revenue: 44000,
    budget: 700,
    activity: "feed",
    competition: "medium",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "implemented",
    blocked: false,
    expected: 44.25833,
  },
  {
    id: 9,
    name: "ArtCraft Boutique",
    category: "Hobby / DIY",
    revenue: 18000,
    budget: 200,
    activity: "free",
    competition: "low",
    price: "expensive",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 24.68333,
  },
  {
    id: 10,
    name: "Office365Shop",
    category: "Office Supplies",
    revenue: 22000,
    budget: 300,
    activity: "active",
    competition: "medium",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: true,
    ocm: "none",
    blocked: false,
    expected: 37.025,
  },
  {
    id: 11,
    name: "BeautyEssentials",
    category: "Beauty",
    revenue: 52000,
    budget: 800,
    activity: "active",
    competition: "high",
    price: "cheap",
    bidding: true,
    marketplace: false,
    vbc: false,
    ocm: "implemented",
    blocked: false,
    expected: 53.73333,
  },
  {
    id: 12,
    name: "ProToolsDirect",
    category: "Tools",
    revenue: 130000,
    budget: 2500,
    activity: "active",
    competition: "medium",
    price: "cheap",
    bidding: false,
    marketplace: true,
    vbc: false,
    ocm: "reliable",
    blocked: false,
    expected: 69.875,
  },
  {
    id: 13,
    name: "ModernLivingStore",
    category: "Furniture",
    revenue: 90000,
    budget: 1200,
    activity: "active",
    competition: "low",
    price: "expensive",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "reliable",
    blocked: false,
    expected: 38.83333,
  },
  {
    id: 14,
    name: "FreshAir Appliances",
    category: "Air Conditioning",
    revenue: 240000,
    budget: 3500,
    activity: "feed",
    competition: "high",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 77.625,
  },
  {
    id: 15,
    name: "WellnessCorner",
    category: "Health & Wellness",
    revenue: 36000,
    budget: 500,
    activity: "free",
    competition: "medium",
    price: "cheap",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "implemented",
    blocked: false,
    expected: 45.24167,
  },
  {
    id: 16,
    name: "GameZoneHub",
    category: "Gaming",
    revenue: 82000,
    budget: 1200,
    activity: "low",
    competition: "high",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: true,
    ocm: "none",
    blocked: false,
    expected: 53.23333,
  },
  {
    id: 17,
    name: "AutoPartsMetro",
    category: "Auto Parts",
    revenue: 120000,
    budget: 1800,
    activity: "active",
    competition: "medium",
    price: "cheap",
    bidding: false,
    marketplace: true,
    vbc: false,
    ocm: "implemented",
    blocked: false,
    expected: 61.41667,
  },
  {
    id: 18,
    name: "CoffeeLovers CZ",
    category: "Food & Beverages",
    revenue: 26000,
    budget: 350,
    activity: "new",
    competition: "low",
    price: "expensive",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 25.2625,
  },
  {
    id: 19,
    name: "SmartHomeX",
    category: "Electronics (big)",
    revenue: 300000,
    budget: 4000,
    activity: "active",
    competition: "high",
    price: "cheap",
    bidding: true,
    marketplace: false,
    vbc: true,
    ocm: "reliable",
    blocked: false,
    expected: 93,
  },
  {
    id: 20,
    name: "OutdoorProGear",
    category: "Outdoor",
    revenue: 68000,
    budget: 1000,
    activity: "active",
    competition: "medium",
    price: "average",
    bidding: false,
    marketplace: false,
    vbc: false,
    ocm: "none",
    blocked: false,
    expected: 43.68333,
  },
];
const MAX_FINITE = 1e12;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? clamp(n, 0, MAX_FINITE) : fallback;
};
const fmt = (v, d = 0) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  }).format(v);
const euros = (v) => "€" + fmt(v, 0);
const scoreFmt = (v) => fmt(v, 2);
function normalizeMerchant(raw = {}) {
  const activity = Object.hasOwn(ACTIVITY_BASE, raw.activity)
    ? raw.activity
    : "new";
  const isPaid = activity === "active" || activity === "low";
  const blocked = Boolean(raw.blocked);
  return {
    name: String(raw.name || "Unnamed merchant")
      .trim()
      .slice(0, 120),
    category: String(raw.category || "Not specified")
      .trim()
      .slice(0, 120),
    budget: safeNumber(raw.budget),
    revenue: safeNumber(raw.revenue),
    activity,
    price: Object.hasOwn(PRICE_FRACTIONS, raw.price) ? raw.price : "average",
    competition: Object.hasOwn(COMPETITION_FRACTIONS, raw.competition)
      ? raw.competition
      : "medium",
    bidding: isPaid && Boolean(raw.bidding),
    marketplace: isPaid && Boolean(raw.marketplace),
    vbc: Boolean(raw.vbc),
    ocm: Object.hasOwn(OCM_BONUS, raw.ocm) ? raw.ocm : "none",
    blocked,
  };
}
function calculateScore(raw, reference = DEFAULT_BENCHMARKS) {
  const m = normalizeMerchant(raw);
  const bp = Math.max(1, safeNumber(reference.ppc, 4000));
  const br = Math.max(1, safeNumber(reference.revenue, 300000));
  const base = m.blocked ? 0 : ACTIVITY_BASE[m.activity];
  const bonuses = m.blocked
    ? { feed: 0, bidding: 0, marketplace: 0, vbc: 0, ocm: 0 }
    : {
        feed: m.activity === "feed" ? 1 : 0,
        bidding: m.bidding ? 2 : 0,
        marketplace: m.marketplace ? 2 : 0,
        vbc: m.vbc ? 1 : 0,
        ocm: OCM_BONUS[m.ocm],
      };
  const activity = clamp(
    base + Object.values(bonuses).reduce((s, n) => s + n, 0),
    0,
    WEIGHTS.activity
  );
  const scores = {
    ppc: WEIGHTS.ppc * Math.min(m.budget / bp, 1),
    activity,
    price: WEIGHTS.price * PRICE_FRACTIONS[m.price],
    revenue: WEIGHTS.revenue * Math.min(m.revenue / br, 1),
    competition: WEIGHTS.competition * COMPETITION_FRACTIONS[m.competition],
    category: WEIGHTS.category,
  };
  const total = Object.values(scores).reduce((s, n) => s + n, 0);
  return {
    merchant: m,
    scores,
    total,
    base,
    bonuses,
    eligible: !m.blocked,
    benchmarks: { ppc: bp, revenue: br },
  };
}

// For offline automated regression checks (Node.js). Browser execution is unaffected.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateScore,
    normalizeMerchant,
    SAMPLE_MERCHANTS,
    DEFAULT_BENCHMARKS,
    WEIGHTS,
  };
}
if (typeof document !== "undefined")
  document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  const $ = (id) => document.getElementById(id);
  const KEYS = {
    ranking: "arukereso-demo-ranking-v1",
    benchmarks: "arukereso-demo-benchmarks-v1",
  };
  const storeRead = (key, fallback) => {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  };
  const storeSave = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* Browser storage can be disabled; in-memory state still works. */
    }
  };
  let benchmarks = storeRead(KEYS.benchmarks, { ...DEFAULT_BENCHMARKS });
  if (
    !Number.isFinite(Number(benchmarks.ppc)) ||
    Number(benchmarks.ppc) <= 0 ||
    !Number.isFinite(Number(benchmarks.revenue)) ||
    Number(benchmarks.revenue) <= 0
  )
    benchmarks = { ...DEFAULT_BENCHMARKS };
  let ranking = (
    Array.isArray(storeRead(KEYS.ranking, []))
      ? storeRead(KEYS.ranking, [])
      : []
  ).map(normalizeMerchant);
  let currentPage = "calculator";
  const inputIds = [
    "merchant-name",
    "merchant-category",
    "merchant-budget",
    "merchant-revenue",
    "merchant-price",
    "merchant-competition",
    "merchant-activity",
    "feature-bidding",
    "feature-marketplace",
    "feature-vbc",
    "feature-ocm",
    "merchant-blocked",
  ];
  const toast = (message) => {
    const el = $("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.add("hidden"), 3300);
  };

  function readForm() {
    return normalizeMerchant({
      name: $("merchant-name").value,
      category: $("merchant-category").value,
      budget: $("merchant-budget").value,
      revenue: $("merchant-revenue").value,
      price: $("merchant-price").value,
      competition: $("merchant-competition").value,
      activity: $("merchant-activity").value,
      bidding: $("feature-bidding").checked,
      marketplace: $("feature-marketplace").checked,
      vbc: $("feature-vbc").checked,
      ocm: $("feature-ocm").value,
      blocked: $("merchant-blocked").checked,
    });
  }
  function writeForm(raw) {
    const m = normalizeMerchant(raw);
    $("merchant-name").value = m.name;
    $("merchant-category").value = m.category;
    $("merchant-budget").value = m.budget;
    $("merchant-revenue").value = m.revenue;
    $("merchant-price").value = m.price;
    $("merchant-competition").value = m.competition;
    $("merchant-activity").value = m.activity;
    $("feature-bidding").checked = m.bidding;
    $("feature-marketplace").checked = m.marketplace;
    $("feature-vbc").checked = m.vbc;
    $("feature-ocm").value = m.ocm;
    $("merchant-blocked").checked = m.blocked;
    render();
  }
  function microExplanation(result) {
    let labels = [
      ACTIVITY_LABEL[result.merchant.activity] + " +" + result.base,
    ];
    const b = result.bonuses;
    if (b.feed) labels.push("Feed prepared +1");
    if (b.bidding) labels.push("Bidding +2");
    if (b.marketplace) labels.push("Marketplace +2");
    if (b.vbc) labels.push("VBC +1");
    if (b.ocm)
      labels.push(
        (result.merchant.ocm === "reliable" ? "OCM OK" : "OCM implemented") +
          " +" +
          b.ocm
      );
    if (result.merchant.blocked)
      return "Blocked: activity status receives zero points; not eligible for immediate outreach.";
    return labels.join(" · ");
  }
  function recommendedText(result) {
    const m = result.merchant;
    if (m.blocked)
      return "This merchant is blocked and excluded from immediate outreach, regardless of its calculated opportunity score.";
    let context =
      m.price === "cheap"
        ? "Competitive pricing"
        : m.price === "expensive"
        ? "Higher price position"
        : "Average pricing";
    context +=
      " · " +
      (m.competition === "high"
        ? "high"
        : m.competition === "medium"
        ? "medium"
        : "low") +
      " competition.";
    const action =
      m.activity === "new"
        ? " New acquisition prospect."
        : m.activity === "feed"
        ? " Prepared feed; activation opportunity."
        : m.activity === "free"
        ? " Opportunity to assess paid activation."
        : m.activity === "low"
        ? " Potential paid-spend expansion."
        : " Existing paid account; optimization opportunity.";
    return context + action;
  }
  const breakdownMeta = [
    ["ppc", "PPC Budget Potential", "blue"],
    ["activity", "Current Activity Status", "orange"],
    ["price", "Price Index Position", "deep"],
    ["revenue", "Estimated Monthly Revenue", "soft"],
    ["competition", "Competition Presence", "teal"],
    ["category", "Product Category", "gray"],
  ];
  function render() {
    const result = calculateScore(readForm(), benchmarks);
    const m = result.merchant;
    $("score-value").textContent = fmt(result.total, 1);
    $("score-ring").style.setProperty(
      "--score-angle",
      (result.total / 100) * 360 + "deg"
    );
    $("score-merchant").textContent = m.name;
    $("score-summary").textContent = recommendedText(result);
    $("score-category").textContent = m.category;
    $("score-lifecycle").textContent = ACTIVITY_LABEL[m.activity];
    $("eligibility-tag").className =
      "eligibility " + (result.eligible ? "eligible" : "excluded");
    $("eligibility-tag").innerHTML = result.eligible
      ? '<span class="status-dot"></span> ELIGIBLE FOR OUTREACH'
      : '<span class="status-dot"></span> OUTREACH EXCLUDED';
    $("ppc-benchmark-label").textContent = euros(benchmarks.ppc);
    $("revenue-benchmark-label").textContent = euros(benchmarks.revenue);
    $("breakdown-list").innerHTML = breakdownMeta
      .map(
        ([k, name, color]) =>
          `<div class="breakdown-row"><div class="breakdown-head"><span>${name}</span><strong>${scoreFmt(
            result.scores[k]
          )} <small>/ ${
            WEIGHTS[k]
          }</small></strong></div><div class="track"><div class="track-fill ${color}" style="width:${
            (100 * result.scores[k]) / WEIGHTS[k]
          }%"></div></div></div>`
      )
      .join("");
    $("micro-value").textContent = scoreFmt(result.scores.activity) + " / 25";
    $("micro-detail").textContent = microExplanation(result);
    const paid = m.activity === "active" || m.activity === "low";
    $("feature-warning").classList.toggle(
      "hidden",
      paid || (!m.bidding && !m.marketplace)
    );
    if (!paid && (m.bidding || m.marketplace))
      $("feature-warning").textContent =
        "Bidding and Marketplace require a paid PPC lifecycle. Switch to Active PPC to use them.";
  }
  function goTo(page) {
    currentPage = page;
    for (const p of ["calculator", "ranking", "methodology"])
      $("page-" + p).classList.toggle("hidden", p !== page);
    document
      .querySelectorAll(".nav-item")
      .forEach((b) => b.classList.toggle("active", b.dataset.page === page));
    if (page === "ranking") renderRanking();
    if (page === "methodology") {
      $("benchmark-ppc").value = benchmarks.ppc;
      $("benchmark-revenue").value = benchmarks.revenue;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  document
    .querySelectorAll("[data-page]")
    .forEach((el) => el.addEventListener("click", () => goTo(el.dataset.page)));
  document.querySelectorAll("[data-nav]").forEach((el) =>
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      goTo(el.dataset.nav);
    })
  );
  $("edit-benchmarks").addEventListener("click", () => goTo("methodology"));
  for (const id of inputIds) {
    $(id).addEventListener("input", render);
    $(id).addEventListener("change", render);
  }
  $("merchant-form").addEventListener("submit", (e) => e.preventDefault());
  $("merchant-activity").addEventListener("change", () => {
    if (!["active", "low"].includes($("merchant-activity").value)) {
      $("feature-bidding").checked = false;
      $("feature-marketplace").checked = false;
    }
    render();
  });
  ["feature-bidding", "feature-marketplace"].forEach((id) =>
    $(id).addEventListener("change", () => {
      if (
        $(id).checked &&
        !["active", "low"].includes($("merchant-activity").value)
      ) {
        $("merchant-activity").value = "active";
        toast("Changed status to Active PPC to enable this feature.");
      }
      render();
    })
  );
  $("load-demo").addEventListener("click", () => {
    writeForm(SAMPLE_MERCHANTS.find((m) => m.name === "SmartHomeX"));
    toast("SmartHomeX loaded · Expected score 93.00 / 100");
  });
  $("clear-form").addEventListener("click", () => {
    writeForm({
      name: "New merchant",
      category: "Not specified",
      budget: 0,
      revenue: 0,
      price: "average",
      competition: "medium",
      activity: "new",
      bidding: false,
      marketplace: false,
      vbc: false,
      ocm: "none",
      blocked: false,
    });
    toast("Inputs reset.");
  });
  $("save-merchant").addEventListener("click", () => {
    const m = readForm();
    if (!m.name || m.name === "Unnamed merchant") {
      toast("Enter a merchant name before saving.");
      return;
    }
    const ix = ranking.findIndex(
      (x) => x.name.toLowerCase() === m.name.toLowerCase()
    );
    if (ix >= 0) {
      ranking[ix] = m;
      toast("Merchant updated in ranking.");
    } else {
      ranking.push(m);
      toast("Merchant added to ranking.");
    }
    storeSave(KEYS.ranking, ranking);
    updateRankCount();
  });
  const escaped = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  function updateRankCount() {
    $("saved-count").textContent = ranking.length;
  }
  function renderRanking() {
    updateRankCount();
    const sorted = ranking
      .map((m, i) => ({ m, i, r: calculateScore(m, benchmarks) }))
      .sort(
        (a, b) =>
          Number(b.r.eligible) - Number(a.r.eligible) ||
          b.r.total - a.r.total ||
          a.i - b.i
      );
    $("ranking-summary").textContent = `${ranking.length} merchant${
      ranking.length === 1 ? "" : "s"
    } · ${ranking.filter((m) => !m.blocked).length} eligible · ${
      ranking.filter((m) => m.blocked).length
    } excluded`;
    $("ranking-empty").classList.toggle("hidden", sorted.length > 0);
    $("ranking-wrap").classList.toggle("hidden", sorted.length === 0);
    let rank = 0;
    $("ranking-body").innerHTML = sorted
      .map(({ m, r }, rowIndex) => {
        const place = r.eligible ? ++rank : null;
        const code = ranking.indexOf(m);
        return `<tr><td>${
          place
            ? `<span class="rank-number ${
                place === 1 ? "first" : ""
              }">${place}</span>`
            : '<span class="rank-number">—</span>'
        }</td><td><span class="merchant-name-cell">${escaped(
          m.name
        )}</span><span class="merchant-sub">${escaped(
          m.category
        )}</span></td><td><span class="table-score">${scoreFmt(
          r.total
        )}</span> / 100<div class="score-tiny"><div style="width:${
          r.total
        }%"></div></div></td><td>${euros(m.budget)}</td><td>${euros(
          m.revenue
        )}</td><td><span class="table-badge ${m.blocked ? "bad" : ""}">${
          m.blocked ? "Excluded" : escaped(ACTIVITY_LABEL[m.activity])
        }</span></td><td><button class="table-action" data-action="edit" data-row="${code}" type="button">Edit</button><button class="table-action remove" data-action="remove" data-row="${code}" type="button">Remove</button></td></tr>`;
      })
      .join("");
  }
  $("ranking-body").addEventListener("click", (event) => {
    const b = event.target.closest("button[data-action]");
    if (!b) return;
    const ix = Number(b.dataset.row);
    if (ix < 0 || ix >= ranking.length) return;
    if (b.dataset.action === "edit") {
      writeForm(ranking[ix]);
      goTo("calculator");
      toast("Loaded " + ranking[ix].name + " for editing.");
    } else if (b.dataset.action === "remove") {
      const name = ranking[ix].name;
      ranking.splice(ix, 1);
      storeSave(KEYS.ranking, ranking);
      renderRanking();
      toast(name + " removed.");
    }
  });
  function loadSamples() {
    if (
      ranking.length &&
      !confirm(
        "Replace the current ranking with the original 20 fictional merchants?"
      )
    )
      return;
    ranking = SAMPLE_MERCHANTS.map(normalizeMerchant);
    storeSave(KEYS.ranking, ranking);
    renderRanking();
    toast("Loaded 20 fictional merchants from the scoring workbook.");
  }
  $("load-20").addEventListener("click", loadSamples);
  $("empty-load-20").addEventListener("click", loadSamples);
  $("clear-ranking").addEventListener("click", () => {
    if (!ranking.length) return;
    if (!confirm("Clear all saved merchants from this browser?")) return;
    ranking = [];
    storeSave(KEYS.ranking, ranking);
    renderRanking();
    toast("Ranking cleared.");
  });
  $("export-csv").addEventListener("click", () => {
    if (!ranking.length) {
      toast("Nothing to export yet.");
      return;
    }
    const sorted = ranking
      .map((m, i) => ({ m, i, r: calculateScore(m, benchmarks) }))
      .sort(
        (a, b) =>
          Number(b.r.eligible) - Number(a.r.eligible) ||
          b.r.total - a.r.total ||
          a.i - b.i
      );
    let counter = 0;
    const rows = [
      [
        "Rank",
        "Merchant",
        "Category",
        "PPC potential EUR",
        "Monthly revenue EUR",
        "Activity",
        "Competition",
        "Price",
        "Bidding",
        "Marketplace",
        "VBC",
        "OCM",
        "Blocked",
        "PPC /35",
        "Activity /25",
        "Price /15",
        "Revenue /10",
        "Competition /10",
        "Category /5",
        "Total /100",
      ],
    ];
    for (const { m, r } of sorted) {
      rows.push([
        r.eligible ? ++counter : "Excluded",
        m.name,
        m.category,
        m.budget,
        m.revenue,
        ACTIVITY_LABEL[m.activity],
        m.competition,
        m.price,
        m.bidding,
        m.marketplace,
        m.vbc,
        m.ocm,
        m.blocked,
        r.scores.ppc,
        r.scores.activity,
        r.scores.price,
        r.scores.revenue,
        r.scores.competition,
        r.scores.category,
        r.total,
      ]);
    }
    const contents =
      "\ufeff" +
      rows
        .map((row) =>
          row.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")
        )
        .join("\r\n");
    const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "merchant-opportunity-ranking.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("CSV exported.");
  });
  $("save-benchmarks").addEventListener("click", () => {
    const p = Number($("benchmark-ppc").value),
      r = Number($("benchmark-revenue").value);
    if (!Number.isFinite(p) || !Number.isFinite(r) || p <= 0 || r <= 0) {
      toast("Enter positive benchmark amounts.");
      return;
    }
    benchmarks = { ppc: p, revenue: r };
    storeSave(KEYS.benchmarks, benchmarks);
    render();
    toast("Benchmarks saved. All merchants now use these thresholds.");
  });
  $("reset-benchmarks").addEventListener("click", () => {
    benchmarks = { ...DEFAULT_BENCHMARKS };
    storeSave(KEYS.benchmarks, benchmarks);
    $("benchmark-ppc").value = benchmarks.ppc;
    $("benchmark-revenue").value = benchmarks.revenue;
    render();
    toast("Original case-study benchmark values restored.");
  });
  updateRankCount();
  render();
}
