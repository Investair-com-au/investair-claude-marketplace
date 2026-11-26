/* Investair-branded .docx builder: Markdown → WordprocessingML, zipped with JSZip. */
function iaBuildDocx(JSZip, mdText, title, logoBytes, meta) {
  const NAVY = "0A2342", AMBER = "E8760A", BODY = "4A5568", MUTED = "64748B";
  const x = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const runs = (text, base) => {
    base = base || "";
    const out = [];
    const parts = String(text).replace(/`([^`]+)`/g, "$1").split(/(\*\*[^*]+\*\*)/g);
    for (const p of parts) {
      if (!p) continue;
      const bold = /^\*\*[^*]+\*\*$/.test(p);
      const t = bold ? p.slice(2, -2) : p.replace(/(^|[^*])\*([^*]+)\*/g, "$1$2");
      out.push(`<w:r><w:rPr>${base}${bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${x(t)}</w:t></w:r>`);
    }
    return out.join("");
  };
  // Parse markdown into blocks
  const lines = mdText.replace(/\r/g, "").split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length;) {
    const l = lines[i];
    if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const cells = r => r.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      const rows = [cells(l)]; i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      blocks.push({ t: "table", rows }); continue;
    }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { blocks.push({ t: "h", lvl: Math.min(m[1].length, 3), text: m[2] }); i++; continue; }
    if ((m = l.match(/^\s*([-*]|\d+\.)\s+(.*)/))) { blocks.push({ t: "li", ord: /\d/.test(m[1]), text: m[2] }); i++; continue; }
    if (/^\s*(---|\*\*\*)\s*$/.test(l)) { blocks.push({ t: "hr" }); i++; continue; }
    if (l.trim()) {
      const p = [l]; i++;
      while (i < lines.length && lines[i].trim() && !/^(#|\s*[-*|]\s|\s*\d+\.\s|\s*(---|\*\*\*)\s*$)/.test(lines[i])) { p.push(lines[i]); i++; }
      blocks.push({ t: "p", text: p.join(" ") }); continue;
    }
    i++;
  }
  // Body XML
  const body = [];
  if (logoBytes) {
    const cx = 1737360, cy = Math.round(1737360 * 130 / 480);
    body.push(`<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="1" name="Investair logo" descr="Investair — Capital Markets Intelligence"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`);
  }
  body.push(`<w:p><w:pPr><w:pStyle w:val="Eyebrow"/></w:pPr>${runs((meta && meta.eyebrow) || "Investair research desk")}</w:p>`);
  body.push(`<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr>${runs(title)}</w:p>`);
  if (meta && meta.sub) body.push(`<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr>${runs(meta.sub)}</w:p>`);
  let skippedFirstH1 = false;
  for (const b of blocks) {
    if (b.t === "h") {
      if (b.lvl === 1 && !skippedFirstH1) { skippedFirstH1 = true; continue; }
      body.push(`<w:p><w:pPr><w:pStyle w:val="Heading${b.lvl}"/></w:pPr>${runs(b.text)}</w:p>`);
    } else if (b.t === "p") {
      body.push(`<w:p>${runs(b.text)}</w:p>`);
    } else if (b.t === "li") {
      body.push(`<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="${b.ord ? 2 : 1}"/></w:numPr></w:pPr>${runs(b.text)}</w:p>`);
    } else if (b.t === "hr") {
      body.push(`<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="${AMBER}"/></w:pBdr></w:pPr></w:p>`);
    } else if (b.t === "table") {
      const n = Math.max(...b.rows.map(r => r.length));
      const w = Math.floor(9360 / n);
      const tr = (r, head) => `<w:tr>${head ? "<w:trPr><w:tblHeader/></w:trPr>" : ""}${Array.from({ length: n }, (_, k) =>
        `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${head ? `<w:shd w:val="clear" w:color="auto" w:fill="${NAVY}"/>` : ""}</w:tcPr><w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>${runs(r[k] || "", head ? `<w:b/><w:color w:val="FFFFFF"/><w:sz w:val="17"/>` : `<w:sz w:val="18"/>`)}</w:p></w:tc>`).join("")}</w:tr>`;
      body.push(`<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:bottom w:val="single" w:sz="4" w:color="E2E8F0"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${Array.from({ length: n }, () => `<w:gridCol w:w="${w}"/>`).join("")}</w:tblGrid>${b.rows.map((r, k) => tr(r, k === 0)).join("")}</w:tbl><w:p/>`);
    }
  }
  body.push(`<w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="8" w:space="6" w:color="${AMBER}"/></w:pBdr><w:spacing w:before="240"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="${NAVY}"/></w:rPr><w:t xml:space="preserve">INVESTAIR</w:t></w:r><w:r><w:rPr><w:color w:val="${MUTED}"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve"> · Capital markets intelligence for ASX-listed companies · investair.com.au. General information only, not financial advice.</w:t></w:r></w:p>`);

  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body.join("")}<w:sectPr><w:footerReference w:type="default" r:id="rIdFooter"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;

  const font = (f) => `<w:rFonts w:ascii="${f}" w:hAnsi="${f}" w:cs="${f}"/>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>${font("Inter")}<w:color w:val="${BODY}"/><w:sz w:val="21"/><w:lang w:val="en-AU"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr>${font("Montserrat")}<w:b/><w:color w:val="${NAVY}"/><w:sz w:val="44"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="${AMBER}"/></w:pBdr><w:spacing w:after="240"/></w:pPr><w:rPr><w:color w:val="${MUTED}"/><w:sz w:val="19"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Eyebrow"><w:name w:val="Eyebrow"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="40"/></w:pPr><w:rPr><w:b/><w:caps/><w:color w:val="${AMBER}"/><w:spacing w:val="20"/><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr>${font("Montserrat")}<w:b/><w:color w:val="${NAVY}"/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:pBdr><w:left w:val="single" w:sz="24" w:space="6" w:color="${AMBER}"/></w:pBdr><w:spacing w:before="280" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr>${font("Montserrat")}<w:b/><w:color w:val="${NAVY}"/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr>${font("Montserrat")}<w:b/><w:color w:val="${NAVY}"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/><w:ind w:left="360"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="${MUTED}"/><w:sz w:val="16"/></w:rPr></w:style>
</w:styles>`;

  const numbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="260"/></w:pPr><w:rPr><w:color w:val="${AMBER}"/></w:rPr></w:lvl></w:abstractNum>
<w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="300"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

  const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pStyle w:val="Footer"/><w:tabs><w:tab w:val="right" w:pos="9638"/></w:tabs></w:pPr><w:r><w:rPr><w:b/><w:color w:val="${NAVY}"/></w:rPr><w:t xml:space="preserve">INVESTAIR</w:t></w:r><w:r><w:t xml:space="preserve"> · Capital Markets Intelligence · ${x((meta && meta.footer) || "")}</w:t></w:r><w:r><w:tab/><w:t xml:space="preserve">Page </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file("docProps/core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(title)}</dc:title><dc:creator>Investair</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${logoBytes ? `<Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/investair-logo.png"/>` : ""}</Relationships>`);
  zip.file("word/document.xml", doc);
  zip.file("word/styles.xml", styles);
  zip.file("word/numbering.xml", numbering);
  zip.file("word/footer1.xml", footer);
  if (logoBytes) zip.file("word/media/investair-logo.png", logoBytes);
  return zip.generateAsync({ type: "uint8array", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}
if (typeof module !== "undefined") module.exports = { iaBuildDocx };
