console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '6px';
    wrapper.style.marginRight = '8px';

    // Create tone dropdown
    const toneSelect = document.createElement('select');
    toneSelect.className = 'ai-tone-select';
    toneSelect.style.padding = '4px 6px';
    toneSelect.style.borderRadius = '4px';
    toneSelect.style.border = '1px solid #ccc';
    toneSelect.style.fontSize = '12px';
    toneSelect.style.background = '#fff';
    toneSelect.style.cursor = 'pointer';

    ['Professional', 'Friendly', 'Casual'].forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.toLowerCase();
        option.textContent = tone;
        toneSelect.appendChild(option);
    });

    // Create AI Reply button
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.style.backgroundColor = '#1a73e8';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '6px 12px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');

    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1558b0';
    });

    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1a73e8';
    });

    // Add both to wrapper
    wrapper.appendChild(toneSelect);
    wrapper.appendChild(button);
    return wrapper;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton && existingButton.parentElement) {
        existingButton.parentElement.remove();
    }

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const ui = createAIButton();
    const button = ui.querySelector('.ai-reply-button');
    const toneSelect = ui.querySelector('.ai-tone-select');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.style.opacity = '0.6';
            button.style.pointerEvents = 'none';

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert("Unable to detect email content.");
                return;
            }

            const tone = toneSelect.value;

            const response = await fetch('http://localhost:9090/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: tone
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                composeBox.innerHTML = '';
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
        }
    });

    toolbar.insertBefore(ui, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
