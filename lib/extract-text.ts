export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Configure worker for browser environment
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pagePromises: Promise<string>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    pagePromises.push(
      pdf.getPage(i).then(async (page) => {
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        return `--- Page ${i} ---\n${text}`;
      })
    );
  }

  const pagesText = await Promise.all(pagePromises);
  return pagesText.join("\n\n").trim();
}

