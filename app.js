document.addEventListener('DOMContentLoaded', () => {
    // State
    let cluesFound = 0;
    const totalClues = 4; // Domain, Syntax, Link, Logic
    let selectedVerdict = null;

    // Elements
    const evidenceHeader = document.getElementById('evidence-header');
    const safeBtn = document.getElementById('btn-safe');
    const scamBtn = document.getElementById('btn-scam');
    const submitBtn = document.getElementById('submit-btn');
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // 1. HIGHLIGHTING MECHANIC
    // We attach event listeners to all suspicion zones
    const zones = document.querySelectorAll('.suspicious-zone');
    
    zones.forEach(zone => {
        zone.addEventListener('click', function() {
            // If already found, do nothing
            if(this.classList.contains('found')) return;

            // 1. Visual Reveal
            this.classList.add('found');
            
            // 2. Play Sound (Optional placeholder)
            // new Audio('click.mp3').play().catch(e=>{});

            // 3. Update Sidebar
            const dataId = this.getAttribute('data-id');
            const sidebarItem = document.querySelector(`.evidence-item[data-target="${dataId}"]`);
            
            if(sidebarItem) {
                sidebarItem.classList.add('checked');
            }

            // 4. Update Stats
            cluesFound++;
            evidenceHeader.innerText = `Collected Evidence (${cluesFound}/${totalClues})`;
        });
    });

    // 2. VERDICT SELECTION
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

    // 3. SUBMIT LOGIC
    submitBtn.addEventListener('click', () => {
        if(!selectedVerdict) {
            alert("Please select a verdict (Legitimate or Malicious) before submitting.");
            return;
        }

        // Show Modal
        modal.classList.add('active');

        // Determine Win/Loss
        if(selectedVerdict === 'scam') {
            // Correct Verdict
            modalTitle.innerText = "CASE SOLVED";
            modalTitle.style.color = "var(--accent-success)";
            
            if(cluesFound === totalClues) {
                modalBody.innerText = `Perfect Score! You found all ${totalClues} clues and correctly identified the threat. +500 XP`;
            } else {
                modalBody.innerText = `Good work! You identified the threat, but missed ${totalClues - cluesFound} clues. Keep your eyes open. +350 XP`;
            }
        } else {
            // Wrong Verdict
            modalTitle.innerText = "BREACH DETECTED";
            modalTitle.style.color = "var(--accent-danger)";
            modalBody.innerText = "You marked a malicious email as safe. The ransomware has been deployed. Review the evidence and try again.";
        }
    });
});