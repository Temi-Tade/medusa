function createModal(content) {
    toggle_display(modalbg);
    modal.innerHTML = `
        <div class='text-center p-2'>
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

async function saveFile(fileName, buffer) {
    if ("showSaveFilePicker" in window) {
        try {
            const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'All Files',
                    }],
                });
                
            const writable = await handle.createWritable();
                
            await writable.write(buffer);
            await writable.close();
        } catch(e) {
            console.error(e)
        }
    }
}

function toggle_display(element) {
    const element_class = Array.from(element.classList).join(" ")
    if (element_class.includes("hidden")) {
        const new_class = element_class.replace("hidden", "")
        element.setAttribute("class", new_class);
    } else {
        const new_class = `hidden ${element_class}`;
        element.setAttribute("class", new_class);
    }
}

export { createModal, closeModal, toggle_password, saveFile, toggle_display };