// PDF handler functions
function initializePDFViewer(url, container) {
    // Create a wrapper for the PDF content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-page pdf-page';
    
    // Create PDF container
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-content';
    pdfContainer.className = 'pdf-container';
    pdfContainer.style.opacity = '0';
    pdfContainer.style.transition = 'opacity 0.3s ease';
    // Load PDF.js if not already loaded
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        document.head.appendChild(pdfScript);
        
        pdfScript.onload = () => {
            loadPDF(url, pdfContainer);
        };
    } else {
        loadPDF(url, pdfContainer);
    }
}

function loadPDF(url, container) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
        for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(page => {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                container.appendChild(canvas);
                page.render({ canvasContext: context, viewport: viewport });
            });
        }
    }).catch(error => {
        console.error('Error loading PDF:', error);
        container.innerHTML = '<p>Error loading PDF. Please try again later.</p>';
    });
}

// Add PDF viewer styles
function addPDFStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .pdf-container {
            padding: 20px;
            background: #f5f5f5;
            min-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            overflow-y: auto;
            max-height: calc(100vh - 100px);
        }
        .pdf-container canvas {
            max-width: 100%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            background: white;
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(styleElement);
}

// Handle PDF viewing
function handlePDFViewing(pageUrl) {
    // Create wrapper for PDF content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-page pdf-page';
    
    // Create PDF container
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-content';
    pdfContainer.className = 'pdf-container';
    contentWrapper.appendChild(pdfContainer);

    // Add styles
    addPDFStyles();

    // Initialize PDF viewer
    initializePDFViewer(pageUrl, pdfContainer);

    // Replace content area with the new wrapper
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';
    contentArea.appendChild(contentWrapper);
}
