import { createModal, closeModal, toggle_password, saveFile, toggle_display } from "./lib/ui.js";

let encrypted_buffer;
let decrypted_buffer;
let mode = "encryption";

const FILE_PARAMS = {
    name: undefined,
    type: undefined,
    size: undefined
}

function display_file_contents(f) {
    const url = URL.createObjectURL(f)
    if (f.type.startsWith('image')) {
        file_preview.innerHTML += `<img id="img" src="${url}" alt="Preview" class="w-40 h-auto m-auto block object-fit rounded-md"/>`;
        
        img.onload = function() {
            URL.revokeObjectURL(url);
        }
    } else if(mode === "decryption" && !FILE_PARAMS.type) {
        file_preview.innerHTML = "<p class='text-center text-lg backdrop-blur-md' id='no_preview'>Files cannot be previewed in decryption mode</p>"
    } else {
        file_preview.innerHTML += `<embed id="embed" src="${url}" type="${f.type}" class="w-75 m-auto"/>`;
        
        embed.onload = function() {
            URL.revokeObjectURL(url);
        }
    }
}

function get_file_details(f) {
    FILE_PARAMS.name = f.name;
    FILE_PARAMS.type = f.type;
    FILE_PARAMS.size = f.size;
    
    const keys = Object.keys(FILE_PARAMS);
    file_details.innerHTML += "<br/><h3>File Properties</h3>";
    
    for (var key of keys) {
        file_details.innerHTML += `
            <p class='p-2 rounded-sm my-1 ${keys.indexOf(key) % 2 !== 0 ? 'bg-[#CCC7]' : ''} flex justify-between items-center'>
                <span class='p-1 block w-[50%]'>${key}</span>
                <span id='file_${key}' class='p-1 block w-[50%] overflow-auto text-right break-keep'>${FILE_PARAMS[key]} ${key === 'size' ? 'bytes' : ''}</span>
            </p>
        `;
    }
}

async function scrambleFile(file, password) {
    let blob;
    let result;
    const passBytes = new TextEncoder().encode(password);
    
    if (mode === "encryption") {
        const header = {
            app: "Medusa",
            v: 1,
            original_name: file.name,
            mime: file.type
        };
        const headerBytes = new TextEncoder().encode(JSON.stringify(header));
        const headerLength = new Uint32Array([headerBytes.length]);
        const buffer = new Uint8Array(await file.arrayBuffer());
    
        result = buffer.map((byte, i) => byte ^ passBytes[i % passBytes.length]);
        
        blob = new Blob([headerLength.buffer, headerBytes, result], {type: file.type});
    } else {
        const buf = await file.arrayBuffer();
        const view = new DataView(buf);
        const headerLength = view.getUint32(0, true);
        
        if (headerLength > 2048 || headerLength < 2 || 4 + headerLength > buf.byteLength) {
            createModal("Please upload a <code>.medusa</code> file that was encrypted with this tool. Reloading page...");
            return false;
        }
        
        const headerBytes = new Uint8Array(buf, 4, headerLength);
        const header = JSON.parse(new TextDecoder().decode(headerBytes));
        const buffer = new Uint8Array(buf, 4 + headerLength);
        
        FILE_PARAMS.type = header.mime;
        FILE_PARAMS.name = header.original_name;
        file_name.textContent = header.original_name;
        file_type.textContent = header.mime;
        createModal(`File type detected: ${header.mime}`);
        
        result = buffer.map((byte, i) => byte ^ passBytes[i % passBytes.length]);

        file_preview.removeChild(no_preview);
        display_file_contents(new File([result], header.original_name, {type: header.mime}));
        
        blob = new Blob([result], { type: header.mime });
    }
    
    return blob.bytes().then(x => x);
}

file.oninput = function(f) {
    toggle_display(desc);
    const file = f.target.files[0];
    
    if (mode === "decryption" && !file.name.endsWith(".medusa")) {
        createModal("Please upload a file encrypted with this tool");
        return;
    }
    if (mode === "encryption" && file.name.endsWith(".medusa")) {
        createModal("Seems like this file has been encrypted.");
        return;
    }
    
    toggle_display(file_label);
    toggle_display(file_details);
    toggle_display(pwd_wrap);
    toggle_display(mode_picker);
    get_file_details(file);
    display_file_contents(file);
    
    pwd_wrap.scrollIntoView();
    pwd_wrap.querySelector("h3").textContent = mode === "encryption" ? "Encrypt File" : "Decrypt File";
    if (mode === "decryption") toggle_display(enc_msg);
    encrypt_btn.textContent = mode === "encryption" ? "Encrypt" : "Decrypt";

    encrypt_btn.onclick = async function() {
        let pwd;
        const fileReader = new FileReader();
        
        if (password.value.trim().length === 0) {
            createModal("Invalid password");
            return;
        } else {
            pwd = password.value.trim(); // checks
        }
        
        fileReader.onload = async function(e) {
            const intArray = Array.from(new Uint8Array((e.target.result)))
            ;
            if (mode === "encryption") encrypted_buffer = await scrambleFile(file, pwd);
            if (mode === "decryption") decrypted_buffer = await scrambleFile(file, pwd);
            
            if (decrypted_buffer === false) {
                setTimeout(() => history.go(0), 1500)
                return;
            }
            
            save_message.innerHTML = `<i>${FILE_PARAMS.name}</i> has been ${mode === "encryption" ? "encrypted" : "decrypted"}. Click the button below to save the file.`;
            toggle_display(save_btn_wrap);
        }
        
        fileReader.readAsArrayBuffer(file);
        
        toggle_display(pwd_wrap);
    }
}

save_btn.onclick = async function() {
    await saveFile(`${mode === "encryption" ? `${FILE_PARAMS.name}.medusa` : FILE_PARAMS.name.replace(".medusa", "")}`, mode === "encryption" ? encrypted_buffer : decrypted_buffer);
}

password.oninput = function(e) {
    if (e.target.value.trim().length === 0) {
        encrypt_btn.disabled = true;
    } else {
        encrypt_btn.disabled = false;
    }
}

enc_file_mode.oninput = function(e) {
    if (e.target.checked) {
        mode = "encryption";
        file.removeAttribute("accept");
    }
}

dec_file_mode.oninput = function(e) {
    if (e.target.checked) {
        mode = "decryption";
        file.setAttribute("accept", ".medusa");
    }
}

toggler.onclick = function() {
    toggle_password();
}