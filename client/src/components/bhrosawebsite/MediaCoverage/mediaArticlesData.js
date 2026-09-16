// Image assets dynamic import via Vite from client/src/assets/media
const mediaImageModules = import.meta.glob(
  [
    "../../../assets/media/*",
    "/src/assets/media/*"
  ],
  { eager: true, import: "default" }
);

function extractUrl(mod) {
  if (!mod) return "";
  if (typeof mod === "string") return mod;
  if (mod.default && typeof mod.default === "string") return mod.default;
  return String(mod || "");
}

export function resolveMediaImage(filename) {
  if (!filename) return "";

  const cleanName = filename.toLowerCase().trim();
  const baseName = cleanName.split(".")[0];

  // 1. Exact filename match (case-insensitive)
  for (const path in mediaImageModules) {
    const fileInPath = path.split("/").pop().toLowerCase();
    if (fileInPath === cleanName) {
      return extractUrl(mediaImageModules[path]);
    }
  }

  // 2. Base name match (e.g. sunilkumar.png -> sunilkumar.jpeg)
  for (const path in mediaImageModules) {
    const fileInPath = path.split("/").pop().toLowerCase();
    const fileBase = fileInPath.split(".")[0];
    if (fileBase === baseName) {
      return extractUrl(mediaImageModules[path]);
    }
  }

  // 3. Path ends with filename
  for (const path in mediaImageModules) {
    if (
      path.toLowerCase().endsWith("/" + cleanName) ||
      path.toLowerCase().endsWith("\\" + cleanName)
    ) {
      return extractUrl(mediaImageModules[path]);
    }
  }

  // 4. Fallback directly to dev server asset path
  return `/src/assets/media/${cleanName}`;
}

export const mediaArticles = [
  // --- SEPTEMBER 2026 ---
  {
    id: 35,
    filename: "sunilkumar.jpeg",
    date: "2026-09-11",
    displayDate: "11 सितंबर 2026 (शुक्रवार)",
    newspaper: "भरोसा ग्रुप (Official Statement)",
    city: "हेड ऑफिस",
  },
  {
    id: 1,
    filename: "1.jpeg",
    date: "2026-09-10",
    displayDate: "10 सितंबर 2026 (गुरुवार)",
    newspaper: "दैनिक भास्कर",
    city: "फरीदाबाद",
  },
  {
    id: 17,
    filename: "17.jpeg",
    date: "2026-09-08",
    displayDate: "08 सितंबर 2026 (मंगलवार)",
    newspaper: "दैनिक भास्कर",
    city: "फरीदाबाद",
  },

  // --- AUGUST 2026 ---
  {
    id: 15,
    filename: "15.jpeg",
    date: "2026-08-15",
    displayDate: "15 अगस्त 2026 (शनिवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 21,
    filename: "21.jpeg",
    date: "2026-08-15",
    displayDate: "15 अगस्त 2026 (Independence Special)",
    newspaper: "Leaders of Change",
    city: "चंडीगढ़ / नेशनल",
  },
  {
    id: 22,
    filename: "22.jpeg",
    date: "2026-08-15",
    displayDate: "15 अगस्त 2026",
    newspaper: "दैनिक जागरण",
    city: "चंडीगढ़",
  },
  {
    id: 18,
    filename: "18.jpeg",
    date: "2026-08-14",
    displayDate: "14 अगस्त 2026 (UP Launch Coverage)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "लखनऊ / चंडीगढ़",
  },

  // --- JULY 2026 ---
  {
    id: 29,
    filename: "29.jpeg",
    date: "2026-07-25",
    displayDate: "25 जुलाई 2026 (शनिवार)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़",
  },
  {
    id: 12,
    filename: "12.jpeg",
    date: "2026-07-24",
    displayDate: "24 जुलाई 2026 (शुक्रवार)",
    newspaper: "दैनिक भास्कर - पंचकूला भास्कर",
    city: "पंचकूला",
  },
  {
    id: 13,
    filename: "13.jpeg",
    date: "2026-07-24",
    displayDate: "24 जुलाई 2026 (शुक्रवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 14,
    filename: "14.jpeg",
    date: "2026-07-24",
    displayDate: "24 जुलाई 2026 (शुक्रवार)",
    newspaper: "दैनिक भास्कर - जीरकपुर भास्कर",
    city: "जीरकपुर",
  },
  {
    id: 16,
    filename: "16.jpeg",
    date: "2026-07-24",
    displayDate: "24 जुलाई 2026 (शुक्रवार)",
    newspaper: "दैनिक भास्कर - मोहाली भास्कर",
    city: "मोहाली",
  },
  {
    id: 27,
    filename: "27.jpeg",
    date: "2026-07-12",
    displayDate: "12 जुलाई 2026 (रविवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 31,
    filename: "31.jpeg",
    date: "2026-07-12",
    displayDate: "12 जुलाई 2026 (रविवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 28,
    filename: "28.jpeg",
    date: "2026-07-05",
    displayDate: "05 जुलाई 2026 (रविवार)",
    newspaper: "चंडीगढ़ भास्कर",
    city: "चंडीगढ़",
  },
  {
    id: 9,
    filename: "9.jpeg",
    date: "2026-07-05",
    displayDate: "05-07-2026 (रविवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
    description: "सिटी लाइफ के दैनिक भास्कर के 05-07-2026 एडिशन की यह खबर जरूर पढ़ें।",
    link: "https://dainik.bhaskar.com/2D76u2QDv4b",
    linkText: "दैनिक भास्कर ई-पेपर पढ़ने के लिए यहां क्लिक करके ऐप इंस्टॉल करें",
  },
  {
    id: 20,
    filename: "20.jpeg",
    date: "2026-07-04",
    displayDate: "04 जुलाई 2026 (शनिवार)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़ / ट्राईसिटी",
  },
  {
    id: 25,
    filename: "25.jpeg",
    date: "2026-07-02",
    displayDate: "02 जुलाई 2026 (वीरवार)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़",
  },

  // --- JUNE 2026 ---
  {
    id: 23,
    filename: "23.jpeg",
    date: "2026-06-30",
    displayDate: "30 जून 2026 (मंगलवार)",
    newspaper: "दैनिक भास्कर",
    city: "नई दिल्ली",
  },
  {
    id: 24,
    filename: "24.jpeg",
    date: "2026-06-05",
    displayDate: "05 जून 2026 (शुक्रवार)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़",
  },

  // --- MAY 2026 ---
  {
    id: 8,
    filename: "8.jpeg",
    date: "2026-05-31",
    displayDate: "31 मई 2026 (रविवार)",
    newspaper: "दैनिक भास्कर",
    city: "नई दिल्ली",
  },
  {
    id: 34,
    filename: "34.jpeg",
    date: "2026-05-31",
    displayDate: "31 मई 2026 (रविवार)",
    newspaper: "दैनिक भास्कर",
    city: "नई दिल्ली",
  },
  {
    id: 26,
    filename: "26.jpeg",
    date: "2026-05-28",
    displayDate: "28 मई 2026 (Emerging Startup Award)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "नई दिल्ली / चंडीगढ़",
  },

  // --- MARCH 2026 ---
  {
    id: 33,
    filename: "33.jpeg",
    date: "2026-03-04",
    displayDate: "04 मार्च 2026 (होली मिलन समारोह)",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़ / ट्राईसिटी",
  },

  // --- FEBRUARY 2026 ---
  {
    id: 7,
    filename: "7.jpeg",
    date: "2026-02-28",
    displayDate: "28 फरवरी 2026 (शनिवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 30,
    filename: "30.jpeg",
    date: "2026-02-28",
    displayDate: "28 फरवरी 2026 (शनिवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 11,
    filename: "11.jpeg",
    date: "2026-02-20",
    displayDate: "20 फरवरी 2026",
    newspaper: "चंडीगढ़ दिनभर",
    city: "चंडीगढ़",
  },
  {
    id: 32,
    filename: "32.jpeg",
    date: "2026-02-15",
    displayDate: "फरवरी 2026 (Multi-City Ad)",
    newspaper: "AdOnMo Media",
    city: "चंडीगढ़, दिल्ली, मुंबई, जयपुर",
  },

  // --- NOVEMBER 2025 ---
  {
    id: 2,
    filename: "2.jpeg",
    date: "2025-11-16",
    displayDate: "16 नवंबर 2025 (रविवार)",
    newspaper: "दैनिक भास्कर - सिटी लाइफ",
    city: "चंडीगढ़",
  },
  {
    id: 3,
    filename: "3.jpeg",
    date: "2025-11-16",
    displayDate: "16 नवंबर 2025 (रविवार)",
    newspaper: "दैनिक भास्कर - जीरकपुर भास्कर",
    city: "जीरकपुर",
  },
  {
    id: 6,
    filename: "6.jpeg",
    date: "2025-11-16",
    displayDate: "16 नवंबर 2025 (रविवार)",
    newspaper: "दैनिक भास्कर - पंचकूला भास्कर",
    city: "पंचकूला",
  },
  {
    id: 10,
    filename: "10.jpeg",
    date: "2025-11-15",
    displayDate: "15 नवंबर 2025 (शनिवार)",
    newspaper: "दैनिक भास्कर",
    city: "नई दिल्ली",
  },
];

export const monthNames = {
  "01": "जनवरी (January)",
  "02": "फरवरी (February)",
  "03": "मार्च (March)",
  "04": "अप्रैल (April)",
  "05": "मई (May)",
  "06": "जून (June)",
  "07": "जुलाई (July)",
  "08": "अगस्त (August)",
  "09": "सितंबर (September)",
  "10": "अक्टूबर (October)",
  "11": "नवंबर (November)",
  "12": "दिसंबर (December)",
};

export function getMonthYearGroup(dateInput) {
  if (!dateInput) return "Other Coverage";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const parts = String(dateInput).split("-");
    const year = parts[0];
    const month = parts[1];
    return `${monthNames[month] || month} ${year}`;
  }
  const year = d.getFullYear();
  const monthKey = String(d.getMonth() + 1).padStart(2, "0");
  return `${monthNames[monthKey] || monthKey} ${year}`;
}

export function formatDisplayDate(dateInput, explicitDisplayDate) {
  if (explicitDisplayDate && String(explicitDisplayDate).trim()) {
    return explicitDisplayDate;
  }
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const monthKey = String(d.getMonth() + 1).padStart(2, "0");
  const hindiMonths = {
    "01": "सितंबर" === "09" ? "सितंबर" : "सितंबर",
    "01": "जनवरी",
    "02": "फरवरी",
    "03": "मार्च",
    "04": "अप्रैल",
    "05": "मई",
    "06": "जून",
    "07": "जुलाई",
    "08": "अगस्त",
    "09": "सितंबर",
    "10": "अक्टूबर",
    "11": "नवंबर",
    "12": "दिसंबर",
  };
  const days = [
    "रविवार",
    "सोमवार",
    "मंगलवार",
    "बुधवार",
    "गुरुवार",
    "शुक्रवार",
    "शनिवार",
  ];
  const dayName = days[d.getDay()];
  return `${day} ${hindiMonths[monthKey] || monthKey} ${d.getFullYear()} (${dayName})`;
}
