document.addEventListener("DOMContentLoaded", function () {
    const menuItems = document.querySelectorAll(".menu-item");
    const contentTitle = document.getElementById("content-title");
    const contentArea = document.getElementById("content-area");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    // State tracking for navigation
    let currentSection = "knowledge-base"; // Default section 
    let currentPage = null; // Current page URL if a box was clicked
    let initialLoad = true; // Flag to identify initial page load
    
    // History tracking
    const navigationStack = [];
    const forwardStack = [];
    
    // Track if user is going back/forward using browser buttons
    let isBackForwardNavigation = false;
    
    // We need to track direction of browser navigation
    // Remove unused variable
    
    // Function to add to history
    function addToHistory(state) {
        // Only add to stack if this isn't a browser back/forward action
        if (!isBackForwardNavigation) {
            navigationStack.push(state);
            // Clear forward stack on new navigation
            while (forwardStack.length > 0) {
                forwardStack.pop();
            }
            console.log('Navigation stack:', navigationStack.length, 'Forward stack:', forwardStack.length);
        }
    }
    
    // Function to go back
    function goBack() {
        if (navigationStack.length <= 1) {
            return false;
        }
        
        isBackForwardNavigation = true;
        
        // Remove current state and add to forward stack
        const currentState = navigationStack.pop();
        forwardStack.push(currentState);
        
        // Get previous state
        const prevState = navigationStack[navigationStack.length - 1];
        
        // Apply previous state
        applyState(prevState);
        
        isBackForwardNavigation = false;
        return true;
    }
    
    // Function to go forward
    function goForward() {
        if (forwardStack.length === 0) {
            return false;
        }
        
        isBackForwardNavigation = true;
        
        // Get next state from forward stack
        const nextState = forwardStack.pop();
        navigationStack.push(nextState);
        
        // Apply the state
        applyState(nextState);
        
        isBackForwardNavigation = false;
        return true;
    }
    
    // Apply a history state
    function applyState(state) {
        if (state.type === 'section') {
            // Go to section
            menuItems.forEach((el) => el.classList.remove("active"));
            document.querySelector(`.menu-item[data-content="${state.section}"]`).classList.add("active");
            
            currentSection = state.section;
            currentPage = null;
            
            updateContent(state.section, true);
        } else if (state.type === 'page') {
            // Go to page
            menuItems.forEach((el) => el.classList.remove("active"));
            document.querySelector(`.menu-item[data-content="${state.section}"]`).classList.add("active");
            
            currentSection = state.section;
            currentPage = state.page;
            
            loadContent(state.page, true);
        }
    }
    
    // Monitor browser navigation
    window.addEventListener('popstate', function(event) {
        // Can we determine direction?
        console.log("Popstate triggered", event.state);
        
        if (event.state) {
            const state = event.state;
            
            if (state.type === 'section') {
                // Go to section
                menuItems.forEach((el) => el.classList.remove("active"));
                document.querySelector(`.menu-item[data-content="${state.section}"]`).classList.add("active");
                
                currentSection = state.section;
                currentPage = null;
                
                updateContent(state.section, true);
            } else if (state.type === 'page') {
                // Go to page
                menuItems.forEach((el) => el.classList.remove("active"));
                document.querySelector(`.menu-item[data-content="${state.section}"]`).classList.add("active");
                
                currentSection = state.section;
                currentPage = state.page;
                
                loadContent(state.page, true);
            }
        } else {
            // Default behavior - go to Knowledge Base
            menuItems.forEach((el) => el.classList.remove("active"));
            document.querySelector(`.menu-item[data-content="knowledge-base"]`).classList.add("active");
            currentSection = "knowledge-base";
            currentPage = null;
            updateContent("knowledge-base", true);
        }
    });
    
    // Expose navigation methods globally for testing
    window.debugHistory = {
        back: goBack,
        forward: goForward,
        getStacks: function() {
            return {
                navStack: navigationStack.length,
                fwdStack: forwardStack.length
            };
        }
    };

    // Global back function
    window.goBackCustom = function() {
        goBack();
    };
    
    // Global forward function
    window.goForwardCustom = function() {
        goForward();
    };

    // Add click event handler for metric boxes
    const metricBoxes = document.querySelectorAll(".metric-box");
    metricBoxes.forEach(box => {
        box.addEventListener("click", (event) => {
            const pageUrl = box.getAttribute("data-page");
            const isExternal = box.hasAttribute("data-external");

            if (isExternal) {
                // Open external links in the same tab
                event.preventDefault();
                
                console.log("Opening external URL in same tab:", pageUrl);
                
                // Handle Medium redirect URLs
                if (pageUrl.includes('medium.com/m/global-identity') || pageUrl.includes('blog.innoventestech.com')) {
                    const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
                    const redirectUrl = urlParams.get('redirectUrl');
                    if (redirectUrl) {
                        window.location.href = decodeURIComponent(redirectUrl);
                    } else {
                        // Navigate to the URL in the same tab
                        window.location.href = pageUrl;
                    }
                } else {
                    // For all other external URLs
                    window.location.href = pageUrl;
                }
            } else {
                // Open internal links in same tab with history state
                event.preventDefault();
                
                // Skip if already on this page
                if (pageUrl === currentPage) {
                    return;
                }
                
                // Create state object
                const newState = {
                    type: 'page',
                    page: pageUrl,
                    section: currentSection
                };
                
                // Add to history
                addToHistory(newState);
                
                // Update state
                currentPage = pageUrl;
                
                // Load content
                loadContent(pageUrl, true);
                
                // Update browser history
                const pageName = pageUrl.split('/').pop().split('.')[0];
                history.pushState({
                    type: 'page',
                    page: pageUrl,
                    section: currentSection,
                    navDirection: 'normal'
                }, '', `#${currentSection}/${pageName}`);
            }
        });
    });

    // Mobile menu functionality
    function toggleMobileMenu() {
        sidebar.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
        document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "";
    }

    menuToggle.addEventListener("click", toggleMobileMenu);
    sidebarOverlay.addEventListener("click", toggleMobileMenu);

    // Close mobile menu when clicking a menu item
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu();
            }
        });
    });

    // Content for each section
    const contentData = {
        "content-strategy": { 
            title: "Content Strategy", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Content Strategy/FAQs/Document-Extras-FAQs-Troubleshooting-Tips-and-Glossary.htm">
                        <div class="metric-image">
                            <img src="./images/Content/FAQs & Troubleshooting.avif" alt="FAQs & Troubleshooting">
                        </div>
                        <h3>FAQs, Troubleshooting Tips and Glossary</h3>
                        <div class="metric-content">
                            <p>Product docs include guides, specs, FAQs, and onboarding content to support both users and internal teams</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/User Manual/Product Requirements Specifications/Product-Requirements-Specifications.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Product Requirements.avif" alt="Product Requirements">
                        </div>
                        <h3>Product Requirements Specifications</h3>
                        <div class="metric-content">
                            <p>Documents like product specs, SOPs, and roadmaps to clearly define requirements, user flows, and criteria for successful project execution</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/User Manual/Product documents – User manuals and Use cases/Product-documents-User-manuals-and-Use-cases.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Product Documents.avif" alt="Product Document">
                        </div>
                        <h3>User manuals</h3>
                        <div class="metric-content">
                            <p>User manuals help customers confidently use a product by explaining its features, interface, and functions in a clear, comprehensive manner</p>
                        </div>
                    </div>
                </div>`
        },
        "docs-saas": { 
            title: "Docs for SaaS Products", 
            text: `
                <div class="metrics-container">
                </div>`
        },
        "sdlc": { 
            title: "Software Development Life Cycle", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Software Development Life Cycle/SmartServe/SmartServe.htm">
                        <div class="metric-image">
                            <img src="./images/Content/smartserve.avif" alt="Business Requirements">
                        </div>
                        <h3>Business Requirements</h3>
                        <div class="metric-content">
                            <p>The requirements to develop a shipping plugin for eCommerce platforms to streamline merchant order fulfillment</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Software Development Life Cycle/TrakShield/TrakShield.htm">
                        <div class="metric-image">
                            <img src="./images/Content/system architecture.avif" alt="System Architecture">
                        </div>
                        <h3>System Architecture</h3>
                        <div class="metric-content">
                            <p>The System Architecture module automates sliding door movement, controls speed and position, and ensures safety by detecting obstructions</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Software Development Life Cycle/THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT/THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT.html">
                        <div class="metric-image">
                            <img src="./images/Content/Leadership approach.avif" alt="Product Development Approach">
                        </div>
                        <h3>Product Development Approach</h3>
                        <div class="metric-content">
                            <p>Thought leadership approach on product development</p>
                        </div>
                    </div>
                </div>`
        },
        "knowledge-base": { 
            title: "Knowledge Base", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Knowledge Base/12. Secuvy - sample/12.Secuvysample.html">
                        <div class="metric-image">
                            <img src="./images/Content/Sample 1.avif" alt="Knowledge Base using Zendesk">
                        </div>
                        <h3>Knowledge Base using Zendesk</h3>
                        <div class="metric-content">
                            <p>A sample of Zendesk</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Knowledge Base/10. Confidential _ Using Document 360 as a Knowledgebase/10.ConfidentialUsingDocument360asaKnowledgeba.html">
                        <div class="metric-image">
                            <img src="./images/Content/Sample 2.avif" alt="Knowledge Base using Document360">
                        </div>
                        <h3>Knowledge Base using Document360</h3>
                        <div class="metric-content">
                            <p>A sample of Document360</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Knowledge Base/Docusaurus/Docusaurus POC.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Sample 3.avif" alt="Knowledge Base using Docusaurus">
                        </div>
                        <h3>Knowledge Base using Docusaurus</h3>
                        <div class="metric-content">
                            <p>A sample of Docusaurus</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Explainer Videos/13. Secuvy Portal - walkthrough.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/How to walkthrough.avif" alt="Walkthrough">
                        </div>
                        <h3>Video Walkthrough of Zendesk Knowledge Base</h3>
                        <div class="metric-content">
                            <p>Video tour of the features and functionality of a Zendesk knowledge Base</p>
                        </div>
                    </div>
                </div>`
        },
        "product-tour": { 
            title: "Product Tour/ User Onboarding", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="https://chippersageblr.s3.ap-south-1.amazonaws.com/ChippersageS3_data/Learner+-+Demo-+build/start.html" data-external="true">
                        <div class="metric-image">
                            <img src="./images/Content/flow of english.jpg" alt="Flow of English">
                        </div>
                        <h3>Flow of English</h3>
                        <div class="metric-content">
                            <p>Learner Platform</p>
                        </div>
                    </div>
                </div>`
        },
        "product-videos": { 
            title: "Product Video", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Product Tour/Approvals - How to access approvals.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/Approvals Access.avif" alt="Approvals Access">
                        </div>
                        <h3>Approvals Access</h3>
                        <div class="metric-content">
                            <p>How to Access Approvals</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Tour/Apply Leave - How to Apply Leave.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/Apply Leave.avif" alt="Apply Leave">
                        </div>
                        <h3>Apply Leave</h3>
                        <div class="metric-content">
                            <p>How to Apply Leave</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Tour/Apply Comp Off - How to apply for Compensatory Off.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/compensatory off.avif" alt="Compensatory Off">
                        </div>
                        <h3>Compensatory Off</h3>
                        <div class="metric-content">
                            <p>How to Apply for Compensatory Off</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Explainer Videos/04. Confidential _ Video - Amagi Now_Navigating Media Library.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/navigation media tech plate.avif" alt="Navigation Media Tech Plate">
                        </div>
                        <h3>Navigating Media Library</h3>
                        <div class="metric-content">
                            <p>Video Tutorial on Navigating Media Library</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Explainer Videos/05. Confidential _ Video - Amagi_Flexible Duration.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/adjusting flexible duration.avif" alt="Adjusting Flexible Duration">
                        </div>
                        <h3>Adjusting Flexible Duration</h3>
                        <div class="metric-content">
                            <p>Video Tutorial on Adjusting Flexible Duration</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Explainer Videos/14. Secuvy-updateSEO.mp4" data-video="true">
                        <div class="metric-image">
                            <img src="./images/Content/how to update seo.avif" alt="How to Update SEO">
                        </div>
                        <h3>How to Update SEO</h3>
                        <div class="metric-content">
                            <p>Video Tutorial on How to Update SEO</p>
                        </div>
                    </div>
                </div>`
        },
        "api-docs": { 
            title: "API Docs", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/API Docs/Communication Coach Bot Workflow Builder & API Document/Communication Coach Bot Workflow Builder & API Document.htm">
                        <div class="metric-image">
                            <img src="./images/Content/communication coach bot.avif" alt="Communication Coach Bot">
                        </div>
                        <h3>Communication Coach Bot</h3>
                        <div class="metric-content">
                            <p>A no-code SaaS platform that enables businesses to share learning content via customized workflows using videos, images, or text across channels like WhatsApp, SMS, and email</p>
                        </div>
                    </div>
                </div>`
        },
        "sops": { 
            title: "SOP", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/SOP/Talent Acquisition SOP v1/Talent Acquisition SOP v1.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Talent Acquisition SOP.avif" alt="Talent Acquisition SOP">
                        </div>
                        <h3>SOP for the Talent Acquisition</h3>
                        <div class="metric-content">
                            <p>Outlines the end-to-end hiring process, from request to onboarding, including year-round sourcing and checklist-based consistency</p>
                        </div>
                    </div>
                </div>`
        },
        "training-content": { 
            title: "Training Content", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="https://tcwvideos.s3.ap-south-1.amazonaws.com/Articulate360/Scenario-COB/index.html">
                        <div class="metric-image">
                            <img src="./images/Content/health insurance cost-of-care scenarios.avif" alt="Health Insurance Cost-of-Care Scenarios">
                        </div>
                        <h3>Health Insurance Cost-of-Care Scenarios</h3>
                        <div class="metric-content">
                            <p>Interactive training scenarios for health insurance cost-of-care calculations</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="https://tcwvideos.s3.ap-south-1.amazonaws.com/Articulate360/Simulation+167/index.html">
                        <div class="metric-image">
                            <img src="./images/Content/denial code co 197.avif" alt="Denial Code CO 197">
                        </div>
                        <h3>Denial Code CO 197</h3>
                        <div class="metric-content">
                            <p>Training simulation for handling denial code CO 197</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="https://chippersageblr.s3.ap-south-1.amazonaws.com/TEFD+L1+Videos+with+CS+Logo/Revise-Questions-Why+are+they+important/Why+are+questions+important.mp4">
                        <div class="metric-image">
                            <img src="./images/Content/why are questions important.avif" alt="Why Are Questions Important?">
                        </div>
                        <h3>Why Are Questions Important?</h3>
                        <div class="metric-content">
                            <p>Interactive module on the importance of effective questioning</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Final - July 17, 2023 -  Unisol Sales Objection Handling/FinalJuly172023UnisolSalesObjectionHandling.html">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving Objection Handling.avif" alt="Unisol Sales Objection Handling">
                        </div>
                        <h3>Unisol Sales Objection Handling</h3>
                        <div class="metric-content">
                            <p>Comprehensive guide for handling sales objections and closing deals effectively with Unisol products</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Bethliving Sales Success/Bethliving Sales Success.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving Sales Success.jpg" alt="Bethliving Sales Success">
                        </div>
                        <h3>Bethliving Sales Success Guide</h3>
                        <div class="metric-content">
                            <p>Comprehensive training guide for sales teams to effectively sell Bethliving products and services</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Bethliving - Objection handling v2/Bethliving - Objection handling v2.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving Objection Handling guide.avif" alt="Bethliving Objection Handling">
                        </div>
                        <h3>Bethliving Objection Handling Guide</h3>
                        <div class="metric-content">
                            <p>Strategies and scripts for effectively addressing common objections when selling Bethliving products</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Bethliving USP 9/Bethliving USP 9.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving USP.avif" alt="Bethliving USP">
                        </div>
                        <h3>Bethliving 9 USPs Guide</h3>
                        <div class="metric-content">
                            <p>Detailed training on the 9 key unique selling propositions of Bethliving products and services</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Bethliving Storytelling for sales/Bethliving Storytelling for sales.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving Storytelling.avif" alt="Bethliving Storytelling">
                        </div>
                        <h3>Bethliving Storytelling for Sales</h3>
                        <div class="metric-content">
                            <p>Techniques and frameworks for using storytelling to effectively engage customers and boost sales conversion</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Bethliving CRM/Bethliving CRM.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Bethliving CRM.avif" alt="Bethliving CRM">
                        </div>
                        <h3>Bethliving CRM Training Guide</h3>
                        <div class="metric-content">
                            <p>Training manual for effectively using the Bethliving CRM system to manage customer relationships</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Training Content/Streamlining Post sales journey/Streamlining Post sales journey.htm">
                        <div class="metric-image">
                            <img src="./images/Content/Post Sales Journey.avif" alt="Post Sales Journey">
                        </div>
                        <h3>Streamlining Post Sales Journey</h3>
                        <div class="metric-content">
                            <p>Best practices and processes for improving customer experience and efficiency in the post-sales phase</p>
                        </div>
                    </div>
                </div>`
        },
        "product-marketing": { 
            title: "Product Marketing", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Product Marketing/Automation in Temperature - Case Study/Automation in Temperature - Case Study.htm">
                        <div class="metric-image">
                            <img src="./images/Content/temperature automation.avif" alt="Temperature Automation">
                        </div>
                        <h3>Temperature Automation</h3>
                        <div class="metric-content">
                            <p>Case Study: Automation in Temperature Control</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Product Marketing/The Elpis Platform - Product Overview/The Elpis Platform - Product Overview.htm">
                        <div class="metric-image">
                            <img src="./images/Content/elpis platform.avif" alt="Elpis Platform">
                        </div>
                        <h3>Elpis Platform</h3>
                        <div class="metric-content">
                            <p>The Elpis Platform - Product Overview</p>
                        </div>
                    </div>
                </div>`
        },
        "white-paper": { 
            title: "Blogs/ White Paper", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Blog & White Paper/Flipped class and Micro learning/Flipped class and Micro learning.htm">
                        <div class="metric-image">
                            <img src="./images/Content/flipped learning.avif" alt="Flipped Learning">
                        </div>
                        <h3>Flipped Class and Microlearning</h3>
                        <div class="metric-content">
                            <p>Flipped class allows students to study material individually, freeing classroom time for practical tasks. Microlearning delivers short, focused lessons to suit modern learners' needs</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Blog & White Paper/Concept Note - Project BEAM/Concept Note - Project BEAM.htm">
                        <div class="metric-image">
                            <img src="./images/Content/project BEAM.avif" alt="Project BEAM">
                        </div>
                        <h3>Khan Academy Project BEAM</h3>
                        <div class="metric-content">
                            <p>Project BEAM aims to upskill blue-collar workers in basic Math and English through micro-lessons on WhatsApp, using interactive videos and quizzes for practical learning</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Blog & White Paper/The Future of Manufacturing - How Elpis is Empowering MSMEs to Go Smart/The Future of Manufacturing - How Elpis is Empowering MSMEs to Go Smart.htm">
                        <div class="metric-image">
                            <img src="./images/Content/elpis platform.avif" alt="Elpis Platform">
                        </div>
                        <h3>Elpis Empowering MSMEs for Smart Manufacturing</h3>
                        <div class="metric-content">
                            <p>Elpis Smart Manufacturing Platform helps MSMEs transition to Industry 4.0 with plug-and-play solutions, real-time monitoring, and predictive analytics, improving efficiency and reducing costs</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Blog & White Paper/Digital Transformation to make Customer the King/Digital Transformation to make Customer the King.htm">
                        <div class="metric-image">
                            <img src="./images/Content/digital transformation.avif" alt="Digital Transformation">
                        </div>
                        <h3>Digital Transformation for Customer-Centric Experiences</h3>
                        <div class="metric-content">
                            <p>Digital transformation enables businesses to personalize customer experiences, meeting rising expectations for tailored products and services, driving loyalty, and boosting sales</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="https://blog.innoventestech.com/maypole-dance-with-manageddevops-731aab33da3a" data-external="true">
                        <div class="metric-image">
                            <img src="./images/Content/maypole.webp" alt="Maypole Dance with ManagedDevOps">
                        </div>
                        <h3>Maypole Dance with ManagedDevOps</h3>
                        <div class="metric-content">
                            <p>Exploring the benefits of ManagedDevOps</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="https://blog.innoventestech.com/deliberate-and-decide-with-data-f27911d14c90" data-external="true">
                        <div class="metric-image">
                            <img src="./images/Content/data-analytics.webp" alt="Deliberate and Decide with Data">
                        </div>
                        <h3>Deliberate and Decide with Data</h3>
                        <div class="metric-content">
                            <p>Making informed decisions through data analytics</p>
                        </div>
                    </div>
                </div>`
        },
        "user-manual": {
            title: "User Manual",
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/User Manual/Globocast Live/GlobocastLive.html">
                        <div class="metric-image">
                            <img src="./images/Content/GloboCast Live.avif" alt="GloboCast Live">
                        </div>
                        <h3>GloboCast Live</h3>
                        <div class="metric-content">
                            <p>This cloud-based live orchestration platform enables instant channel setup, multi-source content ingestion, and real-time control of live broadcasts from anywhere</p>
                        </div>
                    </div>
                </div>`
        },
        "consulting": { 
            title: "Consulting", 
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/Consulting/Solutioning - Bethliving training needs report/SolutioningBethlivingtrainingneedsreportv4.html">
                        <div class="metric-image">
                            <img src="content/Consulting/Solutioning - Bethliving training needs report/SolutioningBethlivingtrainingneedsreportv4_files/image001.jpg" alt="Bethliving Training Needs">
                        </div>
                        <h3>Training Needs Analysis - Bethliving</h3>
                        <div class="metric-content">
                            <p>Comprehensive analysis of training requirements and recommendations for Bethliving.</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Consulting/Solutioning - Unisol Report 1.0 -Feb 2023 HTML/SolutioningUnisolReport1.0Feb2023.html">
                        <div class="metric-image">
                            <img src="content/Consulting/Solutioning - Unisol Report 1.0 -Feb 2023 HTML/SolutioningUnisolReport1.0Feb2023_files/image001.jpg" alt="Unisol Report">
                        </div>
                        <h3>Training Needs Report - Unisol</h3>
                        <div class="metric-content">
                            <p>In-depth analysis and strategic recommendations for Unisol implementation.</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/Consulting/Hudini Training Needs Report/HudiniTrainingNeedsReport.html">
                        <div class="metric-image">
                            <img src="content/Consulting/Hudini Training Needs Report/HudiniTrainingNeedsReport_files/image001.jpg" alt="Hudini Training Needs">
                        </div>
                        <h3>Training Needs Analysis - Hudini</h3>
                        <div class="metric-content">
                            <p>Strategic training recommendations and implementation plan for Hudini platform users.</p>
                        </div>
                    </div>
                </div>`
        },
        "case-studies": {
            title: "Case Studies",
            text: `
                <div class="metrics-container">
                    <div class="metric-box" data-page="content/case-studies/Case study_ Creating a Digital Twin to Explain Use Cases.pdf">
                        <div class="metric-image">
                            <img src="./content/case-studies/img/digital-twin.jpg" alt="Digital Twin Case Study">
                        </div>
                        <h3>Digital Twin Case Study</h3>
                        <div class="metric-content">
                            <p>Creating a Digital Twin to Explain Complex Use Cases and Enhance Understanding</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/case-studies/Case study_ Self-Service Knowledge Base for Increased Product Adoption.pdf">
                        <div class="metric-image">
                            <img src="./content/case-studies/img/self-service.jpg" alt="Self-Service Knowledge Base">
                        </div>
                        <h3>Self-Service Knowledge Base</h3>
                        <div class="metric-content">
                            <p>Implementing a Self-Service Knowledge Base to Drive Product Adoption</p>
                        </div>
                    </div>
                    <div class="metric-box" data-page="content/case-studies/Case study_ System Architecture Document for Embedded Systems.pdf">
                        <div class="metric-image">
                            <img src="./content/case-studies/img/system-architecture.jpg" alt="System Architecture">
                        </div>
                        <h3>System Architecture Document</h3>
                        <div class="metric-content">
                            <p>Documenting System Architecture for Complex Embedded Systems</p>
                        </div>
                    </div>
                </div>`
        },
        // Function to load and render PDF
        loadPDF(url, container) {
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
        },
    };

    async function loadContent(pageUrl) {
        try {
            // Get the clicked box's heading
            const clickedBox = document.querySelector('.metric-box[data-page="' + pageUrl + '"]');
            const boxHeading = clickedBox ? clickedBox.querySelector('h3').textContent : '';
            
            // Get the current section title from the active menu item
            const activeMenuItem = document.querySelector('.menu-item.active');
            const sectionTitle = activeMenuItem ? activeMenuItem.querySelector('span').textContent : '';
            
            // Update the content title with both section and box heading
            const contentTitle = document.getElementById('content-title');
            contentTitle.textContent = `${sectionTitle} - ${boxHeading}`;

            // Check if this is a PDF file
            if (pageUrl.endsWith('.pdf')) {
                // Create a wrapper for the PDF content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'content-page pdf-page';
                
                // Create PDF container
                const pdfContainer = document.createElement('div');
                pdfContainer.id = 'pdf-content';
                pdfContainer.className = 'pdf-container';
                contentWrapper.appendChild(pdfContainer);

                // Add PDF.js script if not already loaded
                if (!window.pdfjsLib) {
                    const pdfScript = document.createElement('script');
                    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
                    document.head.appendChild(pdfScript);
                    
                    pdfScript.onload = () => {
                        loadPDF(pageUrl, pdfContainer);
                    };
                } else {
                    loadPDF(pageUrl, pdfContainer);
                }

                // Replace content area with the new wrapper
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = '';
                contentArea.appendChild(contentWrapper);

                // Add PDF-specific styles
                const pdfStyles = document.createElement('style');
                pdfStyles.textContent = `
                    .pdf-container {
                        padding: 5px;
                        min-height: 500px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;
                    }
                    .pdf-container canvas {
                        max-width: 100%;
                        background: white;
                    }
                `;
                document.head.appendChild(pdfStyles);
                return;
            }
            
            // Check if this is a PDF file
            if (pageUrl.endsWith('.pdf')) {
                // Create a wrapper for the PDF content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'content-page pdf-page';
                
                // Create PDF container
                const pdfContainer = document.createElement('div');
                pdfContainer.id = 'pdf-content';
                pdfContainer.className = 'pdf-container';
                contentWrapper.appendChild(pdfContainer);

                // Add PDF.js script if not already loaded
                if (!window.pdfjsLib) {
                    const pdfScript = document.createElement('script');
                    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
                    document.head.appendChild(pdfScript);
                    
                    pdfScript.onload = () => {
                        // Initialize PDF.js
                        pdfjsLib.getDocument(pageUrl).promise.then(pdf => {
                            for (let i = 1; i <= pdf.numPages; i++) {
                                pdf.getPage(i).then(page => {
                                    const viewport = page.getViewport({ scale: 1.5 });
                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    canvas.height = viewport.height;
                                    canvas.width = viewport.width;

                                    pdfContainer.appendChild(canvas);
                                    page.render({ canvasContext: context, viewport: viewport });
                                });
                            }
                        }).catch(error => {
                            console.error('Error loading PDF:', error);
                            pdfContainer.innerHTML = '<p>Error loading PDF. Please try again later.</p>';
                        });
                    };
                } else {
                    // PDF.js already loaded
                    pdfjsLib.getDocument(pageUrl).promise.then(pdf => {
                        for (let i = 1; i <= pdf.numPages; i++) {
                            pdf.getPage(i).then(page => {
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                pdfContainer.appendChild(canvas);
                                page.render({ canvasContext: context, viewport: viewport });
                            });
                        }
                    }).catch(error => {
                        console.error('Error loading PDF:', error);
                        pdfContainer.innerHTML = '<p>Error loading PDF. Please try again later.</p>';
                    });
                }

                // Add PDF-specific styles
                const pdfStyles = document.createElement('style');
                pdfStyles.textContent = `
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
                    }
                `;
                document.head.appendChild(pdfStyles);

                // Replace content area with the new wrapper
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = '';
                contentArea.appendChild(contentWrapper);
                return;
            }

            // Check if this is a PDF file
            if (pageUrl.endsWith('.pdf')) {
                handlePDFViewing(pageUrl);
                return;
            }
            
            // Check if this is a video file
            if (pageUrl.endsWith('.mp4')) {
                // Create a wrapper for the video content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'content-page video-page';
                
                // Create a video player container
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-container';
                
                // Create the video element
                const video = document.createElement('video');
                video.controls = true;
                video.autoplay = true;
                video.muted = true;
                video.className = 'video-player';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'contain';
                
                // Set the video source
                const source = document.createElement('source');
                source.src = pageUrl;
                source.type = 'video/mp4';
                video.appendChild(source);
                
                // Add the video to the container
                videoContainer.appendChild(video);
                contentWrapper.appendChild(videoContainer);
                
                // Add video-specific styles
                const videoStyles = document.createElement('style');
                videoStyles.textContent = `
                    .video-page {
                        padding: 0;
                        max-width: 100%;
                        height: 100vh;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #000;
                    }
                    .video-container {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .video-player {
                        width: 100%;
                        height: 100%;
                        max-height: 100vh;
                        object-fit: contain;
                        background: #000;
                    }
                    video::-webkit-media-controls-timeline {
                        margin-bottom: -10px;
                    }
                    video::-webkit-media-controls-panel {
                        background: transparent !important;
                        opacity: 0.7;
                        transition: opacity 0.2s;
                    }
                    video::-webkit-media-controls-panel:hover {
                        opacity: 1;
                    }
                    video::-webkit-media-controls-overlay-play-button {
                        background: transparent !important;
                    }
                    video::-webkit-media-controls-play-button {
                        background: transparent !important;
                    }
                    video::-webkit-media-controls-current-time-display,
                    video::-webkit-media-controls-time-remaining-display {
                        color: white;
                    }
                    @media (max-width: 768px) {
                        .video-page {
                            height: 100vh;
                        }
                    }
                `;
                document.head.appendChild(videoStyles);
                
                // Replace only the content area, not the entire page
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = '';
                contentArea.appendChild(contentWrapper);
                return;
            }
            
            // Check if this is an external URL
            if (pageUrl.startsWith('http')) {
                // Create a wrapper for the iframe content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'content-page iframe-page';
                
                // Create an iframe container
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframe-container';
                
                // Create the iframe
                const iframe = document.createElement('iframe');
                iframe.src = pageUrl;
                iframe.className = 'embedded-content';
                iframe.allowFullscreen = true;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                
                // Add the iframe to the container
                iframeContainer.appendChild(iframe);
                contentWrapper.appendChild(iframeContainer);
                
                // Add styles for iframe content
                const styleElement = document.createElement('style');
                styleElement.textContent = `
                    .iframe-page {
                        padding: 0;
                        max-width: 100%;
                        margin: 0;
                        background: #fff;
                        overflow: hidden;
                    }
                    .iframe-container {
                        position: relative;
                        width: 100%;
                        height: 100vh;
                        overflow: hidden;
                        border-radius: 0;
                    }
                    .embedded-content {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        background: #fff;
                    }
                    @media (max-width: 768px) {
                        .iframe-page {
                            padding: 0;
                        }
                        .iframe-container {
                            height: 100vh;
                        }
                    }
                `;
                document.head.appendChild(styleElement);
                
                // Replace only the content area, not the entire page
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = '';
                contentArea.appendChild(contentWrapper);
                return;
            }
            
            // Handle local HTML content loading with fallback for direct file access
            let content;
            try {
                // Try using fetch first (works with Live Server)
                const response = await fetch(pageUrl);
                if (response.ok) {
                    content = await response.text();
                } else {
                    throw new Error('Fetch failed');
                }
            } catch (error) {
                // If fetch fails (when opening directly from filesystem), use iframe as fallback
                console.log('Fetch failed, using iframe fallback for: ' + pageUrl);
                
                // Create iframe for local HTML files
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'content-page iframe-page';
                
                // Create an iframe container
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframe-container';
                
                // Create the iframe
                const iframe = document.createElement('iframe');
                iframe.src = pageUrl;
                iframe.className = 'embedded-content';
                iframe.allowFullscreen = true;
                
                // Add the iframe to the container
                iframeContainer.appendChild(iframe);
                contentWrapper.appendChild(iframeContainer);
                
                // Replace only the content area, not the entire page
                const contentArea = document.getElementById('content-area');
                contentArea.innerHTML = '';
                contentArea.appendChild(contentWrapper);
                return;
            }
            
            // If we got content via fetch, process it as before
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-page';
            
            // Create a container for the HTML content
            const htmlContainer = document.createElement('div');
            htmlContainer.className = 'html-content';
            htmlContainer.innerHTML = content;
            
            // Fix relative image paths
            const basePath = pageUrl.substring(0, pageUrl.lastIndexOf('/') + 1);
            
            // Handle images for different content types
            const images = htmlContainer.getElementsByTagName('img');
            Array.from(images).forEach(img => {
                const src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('/')) {
                    // Extract the image filename
                    const imgName = src.split('/').pop();
                    
                    // Special case for SmartServe HTML file
                    if (pageUrl.includes('SmartServe.htm')) {
                        const smartServeImagesFolder = basePath + 'SmartServe_files/';
                        img.src = smartServeImagesFolder + imgName;
                    }
                    // Special case for TrakShield HTML file
                    else if (pageUrl.includes('TrakShield.htm')) {
                        const trakShieldImagesFolder = basePath + 'TrakShield_files/';
                        img.src = trakShieldImagesFolder + imgName;
                    }
                    // Special case for Communication Coach Bot HTML file
                    else if (pageUrl.includes('Communication Coach Bot Workflow Builder & API Document.htm')) {
                        const coachBotImagesFolder = basePath + 'Communication Coach Bot Workflow Builder & API Document_files/';
                        img.src = coachBotImagesFolder + imgName;
                    }
                    // Special case for FAQs HTML file
                    else if (pageUrl.includes('Document-Extras-FAQs-Troubleshooting-Tips-and-Glossary.htm')) {
                        const faqsImagesFolder = basePath + 'Document-Extras-FAQs-Troubleshooting-Tips-and-Glossary_files/';
                        img.src = faqsImagesFolder + imgName;
                    }
                    // Special case for Product Requirements HTML file
                    else if (pageUrl.includes('Product-Requirements-Specifications.htm')) {
                        const reqSpecImagesFolder = basePath + 'Product-Requirements-Specifications_files/';
                        img.src = reqSpecImagesFolder + imgName;
                    }
                    // Special case for Product Documents HTML file
                    else if (pageUrl.includes('Product-documents-User-manuals-and-Use-cases.htm')) {
                        const prodDocsImagesFolder = basePath + 'Product-documents-User-manuals-and-Use-cases_files/';
                        img.src = prodDocsImagesFolder + imgName;
                    }
                    // Special case for Thought Leadership HTML file
                    else if (pageUrl.includes('THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT.html')) {
                        const thoughtLeadershipImagesFolder = basePath + 'THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT_files/';
                        img.src = thoughtLeadershipImagesFolder + imgName;
                    }
                    // Special case for Temperature Automation HTML file
                    else if (pageUrl.includes('Automation in Temperature - Case Study.htm')) {
                        const tempAutomationImagesFolder = basePath + 'Automation in Temperature - Case Study_files/';
                        img.src = tempAutomationImagesFolder + imgName;
                    }
                    // Special case for Elpis Platform HTML file
                    else if (pageUrl.includes('The Elpis Platform - Product Overview.htm')) {
                        const elpisPlatformImagesFolder = basePath + 'The Elpis Platform - Product Overview_files/';
                        img.src = elpisPlatformImagesFolder + imgName;
                    }
                    // Special case for Flipped Learning HTML file
                    else if (pageUrl.includes('Flipped class and Micro learning.htm')) {
                        const flippedLearningImagesFolder = basePath + 'Flipped class and Micro learning_files/';
                        img.src = flippedLearningImagesFolder + imgName;
                    }
                    // Special case for Project BEAM HTML file
                    else if (pageUrl.includes('Concept Note - Project BEAM.htm')) {
                        const projectBeamImagesFolder = basePath + 'Concept Note - Project BEAM_files/';
                        img.src = projectBeamImagesFolder + imgName;
                    }
                    // Special case for Future of Manufacturing HTML file
                    else if (pageUrl.includes('The Future of Manufacturing - How Elpis is Empowering MSMEs to Go Smart.htm')) {
                        const manufacturingImagesFolder = basePath + 'The Future of Manufacturing - How Elpis is Empowering MSMEs to Go Smart_files/';
                        img.src = manufacturingImagesFolder + imgName;
                    }
                    // Special case for Digital Transformation HTML file
                    else if (pageUrl.includes('Digital Transformation to make Customer the King.htm')) {
                        const digitalTransformationImagesFolder = basePath + 'Digital Transformation to make Customer the King_files/';
                        img.src = digitalTransformationImagesFolder + imgName;
                    }
                    // Special case for Docusaurus HTML file
                    else if (pageUrl.includes('Docusaurus POC.htm')) {
                        const docusaurusImagesFolder = basePath + 'Docusaurus POC_files/';
                        img.src = docusaurusImagesFolder + imgName;
                    }
                    // Special case for SOP HTML files
                    else if (pageUrl.includes('Talent Acquisition SOP v1.htm')) {
                        const sopImagesFolder = basePath + 'Talent Acquisition SOP v1_files/';
                        img.src = sopImagesFolder + imgName;
                    }
                    else if (pageUrl.includes('SoP for Talent Acquisition team - Innoventes V2.htm')) {
                        const sopImagesFolder = basePath + 'SoP for Talent Acquisition team - Innoventes V2_files/';
                        img.src = sopImagesFolder + imgName;
                    }
                    // Special case for Bethliving HTML file
                    else if (pageUrl.includes('SolutioningBethlivingtrainingneedsreportv4.html')) {
                        const bethlivingImagesFolder = basePath + 'SolutioningBethlivingtrainingneedsreportv4_files/';
                        img.src = bethlivingImagesFolder + imgName;
                    }
                    // Special case for Unisol Report HTML file
                    else if (pageUrl.includes('SolutioningUnisolReport1.0Feb2023.html')) {
                        const unisolImagesFolder = basePath + 'SolutioningUnisolReport1.0Feb2023_files/';
                        img.src = unisolImagesFolder + imgName;
                    }
                    // Special case for Hudini Training Needs Report HTML file
                    else if (pageUrl.includes('HudiniTrainingNeedsReport.html')) {
                        const hudiniImagesFolder = basePath + 'HudiniTrainingNeedsReport_files/';
                        img.src = hudiniImagesFolder + imgName;
                    }
                    // Special case for Bethliving Sales Success HTML file
                    else if (pageUrl.includes('Bethliving Sales Success.htm')) {
                        const bethlivingSalesImagesFolder = basePath + 'Bethliving Sales Success_files/';
                        img.src = bethlivingSalesImagesFolder + imgName;
                    }
                    // Special case for Bethliving Objection Handling HTML file
                    else if (pageUrl.includes('Bethliving - Objection handling v2.htm')) {
                        const bethlivingObjectionImagesFolder = basePath + 'Bethliving - Objection handling v2_files/';
                        img.src = bethlivingObjectionImagesFolder + imgName;
                    }
                    // Special case for Bethliving USP 9 HTML file
                    else if (pageUrl.includes('Bethliving USP 9.htm')) {
                        const bethlivingUSPImagesFolder = basePath + 'Bethliving USP 9_files/';
                        img.src = bethlivingUSPImagesFolder + imgName;
                    }
                    // Special case for Bethliving Storytelling for sales HTML file
                    else if (pageUrl.includes('Bethliving Storytelling for sales.htm')) {
                        const bethlivingStorytellingImagesFolder = basePath + 'Bethliving Storytelling for sales_files/';
                        img.src = bethlivingStorytellingImagesFolder + imgName;
                    }
                    // Special case for Bethliving CRM HTML file
                    else if (pageUrl.includes('Bethliving CRM.htm')) {
                        const bethlivingCRMImagesFolder = basePath + 'Bethliving CRM_files/';
                        img.src = bethlivingCRMImagesFolder + imgName;
                    }
                    // Special case for Streamlining Post Sales Journey HTML file
                    else if (pageUrl.includes('Streamlining Post sales journey.htm')) {
                        const postSalesJourneyImagesFolder = basePath + 'Streamlining Post sales journey_files/';
                        img.src = postSalesJourneyImagesFolder + imgName;
                    }
                    // Special case for GlobocastLive HTML file
                    else if (pageUrl.includes('GlobocastLive.html')) {
                        const globocastLiveImagesFolder = basePath + 'GlobocastLive_files/';
                        img.src = globocastLiveImagesFolder + imgName;
                    }
                    else {
                        // Determine the correct images folder based on the content type
                        let imagesFolder = basePath;
                        if (pageUrl.includes('_files/')) {
                            imagesFolder = basePath + pageUrl.split('/').pop().replace('.htm', '_files/');
                        } else {
                            imagesFolder = basePath + 'images/';
                        }
                    img.src = imagesFolder + imgName;
                    }
                    
                    // Add consistent image styling
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.margin = '20px auto';
                    img.style.display = 'block';
                    img.style.borderRadius = '4px';
                    img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
            });
            
            // Add styles for consistent content display
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .content-page {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    overflow: hidden !important;
                    position: relative;
                    left: 0;
                    right: 0;
                }
                .html-content {
                    line-height: 1.6;
                    font-size: 16px;
                    color: #333;
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden !important;
                    padding: 0 20px;
                    box-sizing: border-box;
                }
                .html-content h1, .html-content h2, .html-content h3 {
                    color: #002f6c;
                    margin: 20px 0 15px;
                }
                .html-content p {
                    margin: 15px 0;
                }
                .html-content img {
                    max-width: 100%;
                    height: auto;
                    margin: 20px auto;
                    display: block;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .html-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .html-content th, .html-content td {
                    padding: 12px;
                    border: 1px solid #ddd;
                }
                .html-content th {
                    background-color: #f5f5f5;
                }
                /* Special styles for SmartServe content */
                .html-content[data-page*="SmartServe"] {
                    padding: 20px;
                    margin: 0;
                    overflow: auto !important;
                    height: auto;
                    max-height: none;
                }
                .html-content[data-page*="SmartServe"] * {
                    overflow: visible !important;
                }
                /* Special styles for Leadership Approach content */
                .html-content[data-page*="THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT"] {
                    padding: 20px;
                    margin: 0;
                    overflow: auto !important;
                    height: auto;
                    max-height: none;
                }
                .html-content[data-page*="THOUGHT LEADERSHIP APPROACH ON PRODUCT DEVELOPMENT"] * {
                    overflow: visible !important;
                }
                /* Special styles for TrakShield content */
                .html-content[data-page*="TrakShield"] {
                    padding: 0 20px;
                    margin: 0;
                    overflow: hidden !important;
                    height: 100vh;
                    max-height: 100vh;
                }
                .html-content[data-page*="TrakShield"] * {
                    overflow: hidden !important;
                }
                .html-content[data-page*="TrakShield"]::-webkit-scrollbar,
                .content-page::-webkit-scrollbar,
                body::-webkit-scrollbar {
                    width: 0 !important;
                    display: none !important;
                }
                .html-content[data-page*="TrakShield"],
                .content-page,
                body {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
                #content-area {
                    overflow: hidden !important;
                }
                /* Special styles for SOP content */
                .html-content[data-page*="Talent Acquisition SOP"] {
                        padding: 20px;
                    margin: 0;
                    overflow: auto !important;
                    height: auto;
                    max-height: none;
                }
                .html-content[data-page*="Talent Acquisition SOP"] * {
                    overflow: visible !important;
                }
                /* Rest of your existing styles... */
            `;
            document.head.appendChild(styleElement);
            
            // Add the HTML content to the wrapper
            contentWrapper.appendChild(htmlContainer);
            
            // Replace only the content area, not the entire page
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = '';
            contentArea.appendChild(contentWrapper);
            
            // Scroll to top after content load
            window.scrollTo(0, 0);
            
        } catch (error) {
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Content</h2>
                    <p>Sorry, the requested page could not be loaded. Please try again later.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
        }
    }

    function updateContent(key) {
        // Clear any existing content and styles
        const contentArea = document.getElementById('content-area');
        const contentTitle = document.getElementById('content-title');
        contentArea.innerHTML = '';
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent.includes('.content-page')) {
                style.remove();
            }
        });
        
        // Update the content title with the section name
        contentTitle.textContent = contentData[key].title;
        
        // Update the content area
        contentArea.innerHTML = contentData[key].text;
        
        // If this is the first load, initialize our history stack
        if (initialLoad) {
            addToHistory({
                type: 'section',
                section: key
            });
            initialLoad = false;
        }
        
        // Add click event listeners to the boxes
        const boxes = contentArea.querySelectorAll('.metric-box');
        boxes.forEach(box => {
            if (!box.classList.contains('empty')) {
                box.addEventListener('click', function(event) {
                    const pageUrl = this.getAttribute('data-page');
                    const isExternal = this.hasAttribute('data-external');
                    
                    if (isExternal) {
                        // Handle external links
                        console.log("Clicked external URL in updateContent:", pageUrl);
                        
                        // Open external links in the same tab
                        event.preventDefault();
                        
                        // Handle Medium and blog URLs
                        if (pageUrl.includes('medium.com/m/global-identity') || pageUrl.includes('blog.innoventestech.com')) {
                            const urlParams = new URLSearchParams(pageUrl.split('?')[1]);
                            const redirectUrl = urlParams.get('redirectUrl');
                            if (redirectUrl) {
                                window.location.href = decodeURIComponent(redirectUrl);
                            } else {
                                // Navigate to the URL in the same tab
                                window.location.href = pageUrl;
                            }
                        } else {
                            window.location.href = pageUrl;
                        }
                        return;
                    }
                    
                    // Regular internal page handling below
                    
                    // Skip if we're already on this page
                    if (pageUrl === currentPage) {
                        return;
                    }
                    
                    // Create state object
                    const newState = {
                        type: 'page',
                        page: pageUrl,
                        section: key
                    };
                    
                    // Add to history
                    addToHistory(newState);
                    
                    // Update URL
                    const pageName = pageUrl.split('/').pop().split('.')[0];
                    history.pushState({
                        type: 'page',
                        page: pageUrl,
                        section: key,
                        navDirection: 'normal'
                    }, '', `#${key}/${pageName}`);
                    
                    // Update state and load content
                    currentSection = key;
                    currentPage = pageUrl;
                    loadContent(pageUrl, true);
                    
                    // Keep the current menu item active
                    const currentMenuItem = document.querySelector('.menu-item.active');
                    if (currentMenuItem) {
                        currentMenuItem.classList.add('active');
                    }
                });
            }
        });
    }

    // Function to load and render PDF
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

    // Handle window resize
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            sidebarOverlay.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
    
    // Handle initial URL hash for direct links
    function handleInitialState() {
        const hash = window.location.hash.substring(1); // Remove the # character
        
        if (hash) {
            // Check if hash contains a section and page
            const parts = hash.split('/');
            const section = parts[0];
            const page = parts.length > 1 ? parts[1] : null;
            
            // First check if section exists
            const sectionMenu = document.querySelector(`.menu-item[data-content="${section}"]`);
            
            if (sectionMenu) {
                // Valid section found
                menuItems.forEach((el) => el.classList.remove("active"));
                sectionMenu.classList.add("active");
                currentSection = section;
                
                // Add to navigation history
                addToHistory({
                    type: 'section',
                    section: section
                });
                
                // Load the section first
                updateContent(section, true);
                
                // If there's a page part, try to find and load it
                if (page) {
                    // Find the matching box
                    setTimeout(() => {
                        const boxes = document.querySelectorAll('.metric-box');
                        let pageFound = false;
                        
                        boxes.forEach((box) => {
                            const boxUrl = box.getAttribute('data-page');
                            if (boxUrl && boxUrl.includes(page)) {
                                // Found the matching box, load its content
                                currentPage = boxUrl;
                                
                                // Add to history
                                addToHistory({
                                    type: 'page',
                                    page: boxUrl,
                                    section: section
                                });
                                
                                loadContent(boxUrl, true);
                                
                                // Store state in browser history
                                history.replaceState({
                                    type: 'page',
                                    page: boxUrl,
                                    section: section
                                }, '', `#${section}/${page}`);
                                
                                pageFound = true;
                            }
                        });
                        
                        // If no matching page found, stay at the section level
                        if (!pageFound) {
                            console.log('Page not found in section: ' + page);
                            // Store section state
                            history.replaceState({
                                type: 'section',
                                section: section
                            }, '', `#${section}`);
                        }
                    }, 100); // Small delay to ensure section content is loaded first
                } else {
                    // Store section state
                    history.replaceState({
                        type: 'section',
                        section: section
                    }, '', `#${section}`);
                }
                
                return; // Successfully handled hash
            }
        }
        
        // Default: load knowledge-base
        menuItems.forEach((el) => el.classList.remove("active"));
        document.querySelector('.menu-item[data-content="knowledge-base"]').classList.add("active");
        currentSection = "knowledge-base";
        currentPage = null;
        
        // Initial history stack entry
        addToHistory({
            type: 'section',
            section: 'knowledge-base'
        });
        
        // Load the content
        updateContent("knowledge-base", true);
        
        // Update URL with state
        history.replaceState({
            type: 'section',
            section: 'knowledge-base'
        }, '', '#knowledge-base');
    }
    
    // Set up the back/forward navigation
    window.addEventListener('load', function() {
        // Set up history states to enable forward/back detection
        window.history.replaceState({action: 'init', index: 0}, '', location.href);
        
        // Track navigation direction
        let historyIndex = 0;
        
        window.addEventListener('popstate', function(event) {
            if (event.state) {
                // Determine if we're going forward or backward
                if (event.state.index > historyIndex) {
                    // Going forward
                    historyIndex = event.state.index;
                    goForward();
                } else if (event.state.index < historyIndex) {
                    // Going backward
                    historyIndex = event.state.index;
                    goBack();
                }
            } else {
                // Fallback if no state is available
                goBack();
            }
        });
        
        // Enhance pushState/replaceState to include direction tracking
        const originalPushState = history.pushState;
        history.pushState = function(state, title, url) {
            historyIndex++;
            if (!state) state = {};
            state.index = historyIndex;
            return originalPushState.call(this, state, title, url);
        };
        
        const originalReplaceState = history.replaceState;
        history.replaceState = function(state, title, url) {
            if (!state) state = {};
            state.index = historyIndex;
            return originalReplaceState.call(this, state, title, url);
        };
    });
    
    // Initialize by handling the initial state
    handleInitialState();
    
    // Handle menu item clicks
    menuItems.forEach((item) => {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            const sectionKey = this.getAttribute("data-content");
            
            // Don't do anything if clicking the current active item
            if (this.classList.contains("active") && currentPage === null) {
                return;
            }
            
            menuItems.forEach((el) => el.classList.remove("active"));
            this.classList.add("active");
            
            // Create state object
            const newState = {
                type: 'section',
                section: sectionKey
            };
            
            // Add to history
            addToHistory(newState);
            
            // Update navigation state
            currentSection = sectionKey;
            currentPage = null;
            
            // Update browser URL with history entry
            history.pushState({
                type: 'section',
                section: sectionKey,
                navDirection: 'normal'
            }, '', `#${sectionKey}`);
            
            // Update content
            updateContent(sectionKey, true);
        });
    });

    // Manual navigation for testing from console
    // @ts-ignore
    window.navigationDebug = {
        forward: function() {
            history.forward();
            return "Moving forward";
        },
        back: function() {
            history.back();
            return "Moving back";
        },
        status: function() {
            return {
                navStack: navigationStack.map(s => s.type + ":" + (s.section || '') + (s.page ? '/' + s.page.split('/').pop() : '')),
                fwdStack: forwardStack.map(s => s.type + ":" + (s.section || '') + (s.page ? '/' + s.page.split('/').pop() : '')),
                current: currentPage ? `page:${currentSection}/${currentPage.split('/').pop()}` : `section:${currentSection}`
            };
        }
    };
});
