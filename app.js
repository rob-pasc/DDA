document.addEventListener('DOMContentLoaded', () => {
    // State
    let cluesFound = 0;
    const totalClues = 4; // Domain, Syntax, Link, Logic
    let selectedVerdict = null;
    let currentActiveZone = null; // Tracks which zone is currently being investigated via wheel

    // Elements
    const evidenceHeader = document.getElementById('evidence-header');
    const safeBtn = document.getElementById('btn-safe');
    const scamBtn = document.getElementById('btn-scam');
    const submitBtn = document.getElementById('submit-btn');
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const contextWheel = document.getElementById('context-wheel');
    const wheelCenter = document.querySelector('.wheel-center');
    const wheelBtns = document.querySelectorAll('.wheel-btn');

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
        
        // 2. Update Sidebar
        const dataId = currentActiveZone.getAttribute('data-id');
        const sidebarItem = document.querySelector(`.evidence-item[data-target="${dataId}"]`);
        if(sidebarItem) {
            sidebarItem.classList.add('checked');
        }

        // 3. Update Stats
        cluesFound++;
        evidenceHeader.innerText = `Collected Evidence (${cluesFound}/${totalClues})`;

        // 4. Close Wheel
        closeWheel();

        // 5. Optional SFX could go here
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


    // 3. VERDICT SELECTION (Existing Logic)
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

    // 4. SUBMIT LOGIC (Existing Logic)
    submitBtn.addEventListener('click', () => {
        if(!selectedVerdict) {
            alert("Please select a verdict (Legitimate or Malicious) before submitting.");
            return;
        }

        modal.classList.add('active');

        if(selectedVerdict === 'scam') {
            modalTitle.innerText = "CASE SOLVED";
            modalTitle.style.color = "var(--accent-success)";
            
            if(cluesFound === totalClues) {
                modalBody.innerText = `Perfect Score! You found all ${totalClues} clues and correctly identified the threat. +500 XP`;
            } else {
                modalBody.innerText = `Good work! You identified the threat, but missed ${totalClues - cluesFound} clues. Keep your eyes open. +350 XP`;
            }
        } else {
            modalTitle.innerText = "BREACH DETECTED";
            modalTitle.style.color = "var(--accent-danger)";
            modalBody.innerText = "You marked a malicious email as safe. The ransomware has been deployed. Review the evidence and try again.";
        }
    });
});