/**
 * Gurdwara Map Update Button Component
 * Add this to your existing map application
 */

// CSS for the floating update button
const updateButtonStyles = `
.gurdwara-update-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
}

.gurdwara-update-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.gurdwara-update-btn:active {
    transform: translateY(-1px);
}

.gurdwara-update-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.gurdwara-update-modal.active {
    display: flex;
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
    .gurdwara-update-btn {
        bottom: 20px;
        right: 20px;
        padding: 14px 20px;
        font-size: 14px;
    }
}
`;

// HTML for the update button
const updateButtonHTML = `
<button class="gurdwara-update-btn" id="openUpdateForm">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
    </svg>
    Update Map
</button>

<div class="gurdwara-update-modal" id="updateModal">
    <div class="modal-content">
        <iframe src="update_gurdwara_form.html" style="width: 100%; height: 600px; border: none;"></iframe>
        <button onclick="closeUpdateModal()" style="margin-top: 20px; width: 100%; padding: 12px; background: #e2e8f0; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Close</button>
    </div>
</div>
`;

// JavaScript for the update button functionality
function initGurdwaraUpdateButton() {
    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = updateButtonStyles;
    document.head.appendChild(styleSheet);

    // Add button HTML
    document.body.insertAdjacentHTML('beforeend', updateButtonHTML);

    // Add event listeners
    document.getElementById('openUpdateForm').addEventListener('click', () => {
        document.getElementById('updateModal').classList.add('active');
    });

    window.closeUpdateModal = () => {
        document.getElementById('updateModal').classList.remove('active');
    };

    // Close modal when clicking outside
    document.getElementById('updateModal').addEventListener('click', (e) => {
        if (e.target.id === 'updateModal') {
            closeUpdateModal();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGurdwaraUpdateButton);
} else {
    initGurdwaraUpdateButton();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGurdwaraUpdateButton };
}
