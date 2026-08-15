// upload file - enter pwd - encrypt 
// upload file - enter pwd - decrypt

import { createModal, closeModal, toggle_password, saveFile } from "./lib/ui.js";

let encrypted_buffer;
let decrypted_buffer;
let mode = "encryption";

const FILE_PARAMS = {
    name: undefined,
    type: undefined,
    size: undefined
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

function display_file_contents(f) {
    const url = URL.createObjectURL(f)
    if (f.type.startsWith('image')) {
        file_preview.innerHTML += `<img id="img" src="${url}" alt="Preview" class="w-40 h-auto m-auto block object-fit rounded-md"/>`;
        
        img.onload = function() {
            URL.revokeObjectURL(url);
        }
    } else if(mode === "decryption") {
        file_preview.innerHTML = "<p class='text-center text-lg'>Files cannot be previewed in decryption mode</p>"
    } else {
        file_preview.innerHTML += `<embed id="embed" src="${url}" type="${f.type}" class="w-75 m-auto"/>`;
        
        embed.onload = function() {
            URL.revokeObjectURL(url);
        }
    }
}

function get_file_details(f) {
    FILE_PARAMS.name = f.name;
    FILE_PARAMS.type = (f.type === "" && mode === "decryption") ? "Encrypted File" : f.type;
    FILE_PARAMS.size = f.size;
    
    console.log(FILE_PARAMS)
    
    const keys = Object.keys(FILE_PARAMS);
    file_details.innerHTML += "<br/><h3>File Properties</h3>";
    
    for (var key of keys) {
        file_details.innerHTML += `
            <p class='p-2 rounded-sm my-1 ${keys.indexOf(key) % 2 !== 0 ? 'bg-[#CCC7]' : ''} flex justify-between items-center'>
                <span class='p-1 block w-[50%]'>${key}</span>
                <span class='p-1 block w-[50%] overflow-auto text-right break-keep'>${FILE_PARAMS[key]} ${key === 'size' ? 'bytes' : ''}</span>
            </p>
        `;
    }
}

async function scrambleFile(file, password) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const passBytes = new TextEncoder().encode(password);
    //console.log(file, buffer, passBytes)

    const result = buffer.map((byte, i) => byte ^ passBytes[i % passBytes.length]);
    
    const blob = new Blob([result], {type: file.type});
    //blob.bytes().then( x => console.log(x));

    return blob.bytes().then(x => x);
}

file.oninput = function(f) {
    const file = f.target.files[0];
    
    if (mode === "decryption" && !file.name.includes(".enc")) {
        createModal("Please upload a file encrypted with this tool");
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
            
            /*raw.value = intArray.map(i => String.fromCodePoint(i)).join('');
            if (mode === "encryption") encoded.value = encrypted_buffer;
            if (mode === "decryption") decoded.value = decrypted_buffer;*/
            save_message.innerHTML = `${FILE_PARAMS.name} has been ${mode === "encryption" ? "encrypted" : "decrypted"}. Click the button below to save the file.`;
            toggle_display(save_btn_wrap);
        }
        
        fileReader.readAsArrayBuffer(file);
        
        //toggle_display(file_details);
        toggle_display(pwd_wrap);
        //toggle_display(output);
    }
}

save_btn.onclick = async function() {
    await saveFile(`${mode === "encryption" ? `${FILE_PARAMS.name}.enc` : FILE_PARAMS.name.replace(".enc", "")}`);
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
    }
}

dec_file_mode.oninput = function(e) {
    if (e.target.checked) {
        mode = "decryption";
    }
}

toggler.onclick = function() {
    toggle_password();
}

export { toggle_display }