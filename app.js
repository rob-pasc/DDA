document.addEventListener('DOMContentLoaded', () => {
    // State
    let cluesFound = 0;
    const totalClues = 5; // Domain, Syntax, Link, Logic, Formatting
    let selectedVerdict = null;
    let currentActiveZone = null; // Tracks which zone is currently being investigated via wheel

    // Elements
    const evidenceHeader = document.getElementById('evidence-header');
    const evidenceList = document.getElementById('evidence-list');
    const hintsToggle = document.getElementById('hints-toggle');
    const safeBtn = document.getElementById('btn-safe');
    const scamBtn = document.getElementById('btn-scam');
    const submitBtn = document.getElementById('submit-btn');
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const contextWheel = document.getElementById('context-wheel');
    const wheelCenter = document.querySelector('.wheel-center');
    const wheelBtns = document.querySelectorAll('.wheel-btn');
    
    // Dynamic Score Elements
    const artificialityText = document.getElementById('artificiality-text');
    const artificialityBar = document.getElementById('artificiality-bar');

    // 1. HIGHLIGHTING MECHANIC WITH CONTEXT WHEEL
    const zones = document.querySelectorAll('.suspicious-zone');
    
    zones.forEach(zone => {
        zone.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent closing immediately if clicked

            // If already found, do nothing
            if(this.classList.contains('found')) return;

            // Set this zone as active
            currentActiveZone = this;

            // Open Wheel at Mouse Position
            openWheel(e.clientX, e.clientY);
        });
    });

    // 2. WHEEL LOGIC
    function openWheel(x, y) {
        // Position the wheel centered on mouse click
        contextWheel.style.top = `${y}px`;
        contextWheel.style.left = `${x}px`;
        contextWheel.classList.add('active');
        
        // Reset any previous wrong states
        wheelBtns.forEach(btn => btn.classList.remove('wrong'));
        contextWheel.classList.remove('shake');
    }

    function closeWheel() {
        contextWheel.classList.remove('active');
        currentActiveZone = null;
    }

    // Wheel Button Click Handlers
    wheelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentActiveZone) return;

            const selectedReason = btn.getAttribute('data-reason');
            const correctReason = currentActiveZone.getAttribute('data-id');

            if (selectedReason === correctReason) {
                // CORRECT CHOICE
                handleCorrectChoice();
            } else {
                // WRONG CHOICE
                handleWrongChoice(btn);
            }
        });
    });

    function handleCorrectChoice() {
        // 1. Mark Zone Found
        currentActiveZone.classList.add('found');
        
        // 1b. Auto-hide Tooltip after 5 seconds (Fade Out)
        const tooltip = currentActiveZone.querySelector('.analysis-tooltip');
        if(tooltip) {
            setTimeout(() => {
                tooltip.classList.add('fade-out');
            }, 5000);
        }

        // 2. Update Sidebar
        const dataId = currentActiveZone.getAttribute('data-id');
        const sidebarItem = document.querySelector(`.evidence-item[data-target="${dataId}"]`);
        if(sidebarItem) {
            sidebarItem.classList.add('checked');
        }

        // 3. Update Stats
        cluesFound++;
        evidenceHeader.innerText = `Gesammelte Beweise (${cluesFound}/${totalClues})`;
        
        // Update Artificiality Score
        updateArtificialityScore();

        // 4. Close Wheel
        closeWheel();
    }

    function handleWrongChoice(btnElement) {
        // Visual Feedback for error
        btnElement.classList.add('wrong');
        contextWheel.classList.add('shake');
        
        // Remove shake class after animation so it can trigger again
        setTimeout(() => {
            contextWheel.classList.remove('shake');
            btnElement.classList.remove('wrong');
        }, 400);
    }
    
    function updateArtificialityScore() {
        // Simple logic: Each clue found adds ~20% confidence
        // Cap at 98% because AI is never 100%
        const percentage = Math.min(Math.round((cluesFound / totalClues) * 98), 98);
        artificialityText.innerText = `${percentage}%`;
        artificialityBar.style.width = `${percentage}%`;
        
        // Color transition logic (optional but nice)
        if (percentage > 70) {
            artificialityText.style.color = "var(--accent-danger)";
            artificialityBar.style.background = "var(--accent-danger)";
        } else if (percentage > 40) {
             artificialityText.style.color = "var(--accent-warning)";
             artificialityBar.style.background = "var(--accent-warning)";
        } else {
             artificialityText.style.color = "var(--accent-success)";
             artificialityBar.style.background = "var(--accent-success)";
        }
    }

    // Close wheel on center click or outside click
    wheelCenter.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWheel();
    });

    document.addEventListener('click', (e) => {
        if (contextWheel.classList.contains('active') && !contextWheel.contains(e.target)) {
            closeWheel();
        }
    });

    // 3. HINTS TOGGLE LOGIC
    hintsToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Enable hints: remove class that blurs text
            evidenceList.classList.remove('hints-disabled');
        } else {
            // Disable hints: add class that blurs text
            evidenceList.classList.add('hints-disabled');
        }
    });

    // 4. VERDICT SELECTION
    safeBtn.addEventListener('click', () => {
        selectedVerdict = 'safe';
        safeBtn.classList.add('selected');
        scamBtn.classList.remove('selected');
    });

    scamBtn.addEventListener('click', () => {
        selectedVerdict = 'scam';
        scamBtn.classList.add('selected');
        safeBtn.classList.remove('selected');
    });

    // 5. SUBMIT LOGIC WITH DYNAMIC XP
    submitBtn.addEventListener('click', () => {
        if(!selectedVerdict) {
            alert("Bitte wählen Sie ein Urteil (Legitim oder Schädlich), bevor Sie senden.");
            return;
        }

        modal.classList.add('active');

        if(selectedVerdict === 'scam') {
            modalTitle.innerText = "FALL GELÖST";
            modalTitle.style.color = "var(--accent-success)";
            
            // Dynamic XP Logic
            const BASE_XP = 150;
            const XP_PER_CLUE = 40;
            const totalXP = BASE_XP + (cluesFound * XP_PER_CLUE);

            if(cluesFound === totalClues) {
                modalBody.innerHTML = `Perfekte Punktzahl! Sie haben alle <strong>${totalClues}</strong> Hinweise gefunden.<br><br>
                Basis-Belohnung: +${BASE_XP}<br>
                Hinweis-Bonus: +${cluesFound * XP_PER_CLUE}<br>
                <strong>Gesamt verdient: +${totalXP} XP</strong>`;
            } else {
                modalBody.innerHTML = `Gute Arbeit! Sie haben die Bedrohung erkannt, aber <strong>${totalClues - cluesFound}</strong> Hinweise übersehen.<br><br>
                Basis-Belohnung: +${BASE_XP}<br>
                Hinweis-Bonus: +${cluesFound * XP_PER_CLUE}<br>
                <strong>Gesamt verdient: +${totalXP} XP</strong>`;
            }
        } else {
            modalTitle.innerText = "SICHERHEITSVERLETZUNG";
            modalTitle.style.color = "var(--accent-danger)";
            modalBody.innerHTML = "Sie haben eine bösartige E-Mail als sicher eingestuft. Die Ransomware wurde ausgeführt.<br><br><strong>Verdiente XP: 0</strong>";
        }
    });
});