import { toggle_display } from "../main.js";

function createModal(content) {
    toggle_display(modalbg);
    modal.innerHTML = `
        <div>
            ${content}
        </div>
        <small id="version" class="block text-center">v.1.0.0</small>
    `;
    
    window.onclick = function(e) {
        if (e.target === modalbg) {
            closeModal();
        }
    }
    lucide.createIcons();
}

function closeModal() {
    toggle_display(modalbg);
    modal.innerHTML = "";
}

function toggle_password() {
    if (password.type === "password") {
        password.type = "text";
        toggle_display(eye);
        toggle_display(lock);
    } else {
        password.type = "password";
        toggle_display(eye);
        toggle_display(lock);
    }
}

async function saveFile(fileName) {
    if ("showSaveFilePicker" in window) {
        try {
            const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'All Files',
                    }],
                });
                
            const writable = await handle.createWritable();
                
            await writable.write(mode === "encryption" ? encrypted_buffer : decrypted_buffer);
            await writable.close();
        } catch(e) {
            console.error(e)
        }
    }
}

export { createModal, closeModal, toggle_password, saveFile };