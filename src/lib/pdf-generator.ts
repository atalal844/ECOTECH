/**
 * Pure TypeScript PDF 1.4 Generator for ECOTECH Product Datasheets,
 * Category Catalogs, and Corporate Profile PDFs.
 * Generates standards-compliant downloadable PDF documents dynamically from live DB content.
 */

function escapePdfText(input: string): string {
  // Strip non-ASCII fallback safely for standard Type1 Helvetica stream, preserving readable ASCII
  const ascii = input.replace(/[^\x20-\x7E]/g, " ");
  return ascii
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export interface PdfSection {
  heading: string;
  lines: string[];
}

export function buildEcotechPdf(params: {
  title: string;
  subtitle: string;
  metaCode: string;
  sections: PdfSection[];
  footerNote?: string;
}): Buffer {
  const objects: string[] = [];

  const pageWidth = 595; // A4
  const pageHeight = 842;

  // Build content stream per page (paginate automatically)
  const pagesContent: string[] = [];
  let streamLines: string[] = [];
  let cursorY = 760;

  const startNewPage = (isFirst: boolean) => {
    if (!isFirst && streamLines.length > 0) {
      pagesContent.push(streamLines.join("\n"));
    }
    streamLines = [];
    // Header bar (ECOTECH Brand Deep Indigo #250C52 & Accent Orange #F08B22)
    streamLines.push("0.145 0.047 0.322 rg");
    streamLines.push(`0 ${pageHeight - 58} ${pageWidth} 58 re f`);
    streamLines.push("0.941 0.545 0.133 rg");
    streamLines.push(`0 ${pageHeight - 62} ${pageWidth} 4 re f`);

    // Brand Wordmark
    streamLines.push("BT /F2 18 Tf 1 1 1 rg 40 804 Td (ECOTECH) Tj ET");
    streamLines.push(
      "BT /F1 9 Tf 0.941 0.545 0.133 rg 130 806 Td (NETWORKING INFRASTRUCTURE & SMART POWER SOLUTIONS) Tj ET"
    );
    streamLines.push(
      `BT /F1 8 Tf 0.85 0.85 0.90 rg 420 806 Td (${escapePdfText(params.metaCode)}) Tj ET`
    );

    if (isFirst) {
      streamLines.push(
        `BT /F2 18 Tf 0.12 0.10 0.20 rg 40 748 Td (${escapePdfText(params.title.slice(0, 72))}) Tj ET`
      );
      streamLines.push(
        `BT /F1 10 Tf 0.38 0.40 0.45 rg 40 730 Td (${escapePdfText(params.subtitle.slice(0, 95))}) Tj ET`
      );
      streamLines.push("0.88 0.89 0.92 RG 1 w 40 718 m 555 718 l S");
      cursorY = 696;
    } else {
      cursorY = 752;
    }

    // Footer
    streamLines.push("0.88 0.89 0.92 RG 0.8 w 40 42 m 555 42 l S");
    const footer =
      params.footerNote ||
      "ECOTECH Industrial Networking Infrastructure | Generated directly from ECOTECH Product Engineering Database";
    streamLines.push(
      `BT /F1 8 Tf 0.45 0.47 0.52 rg 40 28 Td (${escapePdfText(footer.slice(0, 105))}) Tj ET`
    );
  };

  startNewPage(true);

  const wrapText = (text: string, maxChars = 88): string[] => {
    const words = text.split(/\s+/);
    const out: string[] = [];
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length > maxChars) {
        if (current) out.push(current.trim());
        current = w;
      } else {
        current = (current + " " + w).trim();
      }
    }
    if (current) out.push(current.trim());
    return out.length ? out : [""];
  };

  for (const sec of params.sections) {
    if (cursorY < 110) startNewPage(false);

    // Section heading badge
    streamLines.push("0.96 0.96 0.98 rg");
    streamLines.push(`40 ${cursorY - 6} 515 20 re f`);
    streamLines.push("0.145 0.047 0.322 rg");
    streamLines.push(`40 ${cursorY - 6} 4 20 re f`);
    streamLines.push(
      `BT /F2 11 Tf 0.145 0.047 0.322 rg 52 ${cursorY} Td (${escapePdfText(sec.heading.slice(0, 75))}) Tj ET`
    );
    cursorY -= 26;

    for (const rawLine of sec.lines) {
      const wrapped = wrapText(rawLine, 88);
      for (const line of wrapped) {
        if (cursorY < 68) {
          startNewPage(false);
        }
        streamLines.push(
          `BT /F1 9.5 Tf 0.18 0.20 0.24 rg 46 ${cursorY} Td (${escapePdfText(line)}) Tj ET`
        );
        cursorY -= 14;
      }
    }
    cursorY -= 10;
  }

  if (streamLines.length > 0) {
    pagesContent.push(streamLines.join("\n"));
  }

  // Assemble PDF objects
  // 1: Catalog, 2: Pages, 3: Font F1 (Helvetica), 4: Font F2 (Helvetica-Bold)
  const pageCount = pagesContent.length;
  const pageObjNums: number[] = [];
  let nextObj = 5;

  for (let i = 0; i < pageCount; i++) {
    pageObjNums.push(nextObj);
    nextObj += 2; // page obj + content stream obj
  }

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageCount} >>\nendobj`
  );
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj"
  );

  for (let i = 0; i < pageCount; i++) {
    const pageObjId = pageObjNums[i];
    const contentObjId = pageObjId + 1;
    const stream = pagesContent[i];
    const byteLen = Buffer.byteLength(stream, "utf8");

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${byteLen} >>\nstream\n${stream}\nendstream\nendobj`
    );
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
