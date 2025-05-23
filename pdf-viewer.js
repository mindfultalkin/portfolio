// PDF viewing functionality
function handlePDFViewing(url) {
    // Create a wrapper for the PDF content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-page pdf-page';
    
    // Create PDF container
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-content';
    pdfContainer.className = 'pdf-container';
    pdfContainer.style.opacity = '0';
    pdfContainer.style.transition = 'opacity 0.3s ease';
    contentWrapper.appendChild(pdfContainer);

    // Add PDF-specific styles
    const pdfStyles = document.createElement('style');
    pdfStyles.textContent = `
        .pdf-container {
            padding: 0;
            background: #fff;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
        }
        .pdf-page-canvas {
            display: block;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .content-page.pdf-page {
            background: #fff;
            padding: 0;
            overflow-y: auto;
            height: calc(100vh - 60px);
        }
    `;
    document.head.appendChild(pdfStyles);

    // Replace content area with the new wrapper
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';
    contentArea.appendChild(contentWrapper);

    // Load the PDF
    pdfjsLib.getDocument(url).promise.then(pdf => {
        const totalPages = pdf.numPages;
        let loadedPages = 0;

        // Load each page
        for (let i = 1; i <= totalPages; i++) {
            pdf.getPage(i).then(page => {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                pdfContainer.appendChild(canvas);

                page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise.then(() => {
                    loadedPages++;
                    if (loadedPages === totalPages) {
                        // All pages loaded
                        pdfContainer.style.opacity = '1';
                    }
                });
            });
        }
    }).catch(error => {
        console.error('Error loading PDF:', error);
        pdfContainer.innerHTML = '<p>Error loading PDF. Please try again later.</p>';
    });
}
