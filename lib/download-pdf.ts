export async function downloadAsPdf(
  elementId: string,
  filename: string,
  options?: { landscape?: boolean; singlePage?: boolean }
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  const { default: jsPDF } = await import('jspdf')

  const element = document.getElementById(elementId)
  if (!element) throw new Error(`Element #${elementId} not found`)

  const hideEls = Array.from(element.querySelectorAll('[data-pdf-hide]')) as HTMLElement[]
  const showEls = Array.from(element.querySelectorAll('[data-pdf-show]')) as HTMLElement[]

  const savedHide = hideEls.map(el => el.style.display)
  const savedShow = showEls.map(el => el.style.display)

  hideEls.forEach(el => { el.style.display = 'none' })
  showEls.forEach(el => { el.style.display = 'block' })

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const cw = canvas.width
    const ch = canvas.height

    const isLandscape = options?.landscape ?? (cw > ch * 1.2)

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pw = pdf.internal.pageSize.getWidth()
    const ph = pdf.internal.pageSize.getHeight()
    const imgW = pw
    const imgH = (ch / cw) * pw

    if (imgH <= ph) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH)
    } else if (options?.singlePage) {
      const scale = ph / imgH
      const scaledW = imgW * scale
      const offsetX = (pw - scaledW) / 2
      pdf.addImage(imgData, 'JPEG', offsetX, 0, scaledW, ph)
    } else {
      const pages = Math.ceil(imgH / ph)
      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -(i * ph), imgW, imgH)
      }
    }

    pdf.save(filename)
  } finally {
    hideEls.forEach((el, i) => { el.style.display = savedHide[i] })
    showEls.forEach((el, i) => { el.style.display = savedShow[i] })
  }
}
