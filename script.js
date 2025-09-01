// =======================================================
//                   WOMBAT STUDIOS SCRIPT (FINAL TEAM POSTER VERSION)
// =======================================================

// --- ЧАСТИНА 1: ЗНАХОДИМО ЕЛЕМЕНТИ НА СТОРІНЦІ ---
const faceUpload = document.getElementById('faceUpload');
const storyDescription = document.getElementById('storyDescription');
const genreSelector = document.getElementById('genreSelector');
const customGenre = document.getElementById('customGenre');
const generatePosterBtn = document.getElementById('generatePosterBtn');
const loading = document.getElementById('loading');
const theatricalReleaseDiv = document.getElementById('theatrical-release');
const directorCutBtn = document.getElementById('directorCutBtn');
const directorRoomDiv = document.getElementById('director-room');
const currentPosterView = document.getElementById('current-poster-view');
const chatWindow = document.getElementById('chat-window');
const directorInput = document.getElementById('directorInput');
const sendDirectorCommandBtn = document.getElementById('sendDirectorCommand');
const finishCutBtn = document.getElementById('finishCutBtn');
const finalCutDiv = document.getElementById('final-cut');

// --- ЧАСТИНА 2: ВАШІ НАЛАШТУВАННЯ ---
const MY_API_KEY = "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";
const userAvatarUrl = "https://i.imgur.com/7D322gh.png";
const wombatAvatarUrl = "https://i.imgur.com/kBg8u2s.png";

const wombatScript = {
    approval: [{ phrase: "О, а це вже цікаво. Продовжуйте в тому ж дусі, і, можливо, щось вийде.", meme: "Це база." }, { phrase: "Хм. Непогано. Навіть я здивований.", meme: "Пацани, вапщєта кайфую!" }, { phrase: "Так, оце вже схоже на кіно. Чотко!", meme: "Чотко!" }],
    disapproval: [{ phrase: "Ні, ні і ще раз ні. Це не мистецтво, це халтура.", meme: "Це фіаско, братан." }, { phrase: "Режисере, ви взагалі читали сценарій?", meme: "Трошки текст по-дєбільному написаний." }, { phrase: "О Боже, мої очі... Що це таке?", meme: "Боже, яке кончене!" }, { phrase: "Все, досить. У вас лице скучне, і постер такий самий.", meme: "Міша, всьо переписуєм, у тебе скучноє ліцо." }],
    confusion: [{ phrase: "Що-що? Ви серйозно? Я такого ще не бачив.", meme: "Це шо, прикол?" }, { phrase: "Цікавий хід... Дуже сміливий. Можливо, навіть занадто.", meme: "А так можна було?" }, { phrase: "Я не впевнений, що зрозумів ваш геніальний задум.", meme: "Ти що, дурний?" }],
    action: [{ phrase: "Гаразд, не подобається. Робимо все з нуля. Не сперечайтесь.", meme: "Давай по новій, Міша, все хуйня!" }, { phrase: "Так, мені потрібен чіткий план. Що робимо далі?", meme: "Маєте якусь стратегію?" }, { phrase: "Добре, я вас почув. Починаємо.", meme: "Нам своє робить!" }],
    neutral: [{ phrase: "Ну, подивимось...", meme: "Та ти шо!" }, { phrase: "Продовжуйте, я уважно слухаю.", meme: "Юля!" }, { phrase: "Так, хвилинку, мені треба подумати... і кави.", meme: "Йдемо по каву." }, { phrase: "Цікаво, до чого це нас приведе.", meme: "Ну все, приїхали." }]
};

let userImagesBase64 = [];
let currentPosterUrl = null;
let theatricalPosterUrl = null;
let chatHistory = [];

function getWombatReaction(userCommand, isError = false) {
    if (isError) {
        const errorMemes = [ { phrase: "Це фіаско, братан. Знову щось пішло не так.", meme: "Це фіаско, братан." }];
        return errorMemes[0];
    }
    const command = userCommand.toLowerCase();
    const keywords = {
        disapproval: ['погано', 'не подобається', 'жахливо', 'прибери', 'видали', 'гівно', 'хуйня', 'скучно', 'кончене'],
        approval: ['супер', 'клас', 'чудово', 'ідеально', 'залишай', 'круто', 'краще', 'добре'],
        confusion: ['чому', 'навіщо', 'а що якщо', 'дивний', 'зрозумій', 'а може'],
        action: ['додай', 'зроби', 'зміни', 'перероби', 'давай', 'хочу']
    };
    for (const category in keywords) { for (const keyword of keywords[category]) { if (command.includes(keyword)) { const reactions = wombatScript[category]; return reactions[Math.floor(Math.random() * reactions.length)]; } } }
    const neutralReactions = wombatScript.neutral;
    return neutralReactions[Math.floor(Math.random() * neutralReactions.length)];
}

function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    const avatarImg = document.createElement('img');
    avatarImg.classList.add('avatar');
    avatarImg.src = (sender === 'wombat') ? wombatAvatarUrl : userAvatarUrl;
    avatarImg.alt = `${sender} Avatar`;
    const textP = document.createElement('p');
    textP.innerHTML = text.replace(/\n/g, '<br>');
    if (sender === 'user') { messageDiv.appendChild(textP); messageDiv.appendChild(avatarImg); } else { messageDiv.appendChild(avatarImg); messageDiv.appendChild(textP); }
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

faceUpload.addEventListener('change', (event) => {
    userImagesBase64 = [];
    const files = event.target.files;
    if (!files.length) return;
    let filesProcessed = 0;
    for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = () => {
            userImagesBase64.push(reader.result);
            filesProcessed++;
            if (filesProcessed === files.length) {
                console.log(`Завантажено ${userImagesBase64.length} фото.`);
            }
        };
        reader.readAsDataURL(file);
    }
});

async function makeApiCall(messages) {
    if (MY_API_KEY.trim().includes("сюди-вставте-ваш") || MY_API_KEY.trim() === "") {
        throw new Error("API ключ не вставлено у код!");
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${MY_API_KEY.trim()}` },
        body: JSON.stringify({ model: "google/gemini-2.5-flash-image-preview", messages: messages })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка API: ${errorData.error.message || response.statusText}`);
    }
    return await response.json();
}

generatePosterBtn.addEventListener('click', async () => {
    if (!storyDescription.value) { alert("Опишіть ідею фільму!"); return; }
    if (userImagesBase64.length === 0) { alert("Хто гратиме головні ролі? Завантажте хоча б одне фото!"); return; }
    loading.classList.remove('hidden');
    generatePosterBtn.disabled = true;

    try {
        const finalGenre = customGenre.value.trim() ? customGenre.value.trim() : genreSelector.value;
        const userStory = storyDescription.value;

        // ===== ФІНАЛЬНИЙ ОНОВЛЕНИЙ ПРОМПТ =====
        const userPrompt = `Generate an image. The image MUST be a high-quality, epic movie poster. Do not write any description or text in your response, only return the image URL.
        **Genre:** The poster's entire mood MUST be in the style of a "${finalGenre}" film.
        **Story Concept:** A creative interpretation of this story: "${userStory}".
        **Main Characters:** The poster must feature ${userImagesBase64.length} separate and distinct main characters. For each character, take inspiration from one of the provided photographs (it can be a person, an animal, etc.). Create an original character for each photo, capturing the likeness and essence of the subject in the artistic style of the poster. Arrange all characters in a compelling ensemble composition. Do not merge them into one being.
        **Studio Signature (MANDATORY):** A small, clever wombat MUST be included somewhere in the image.
        **Text Elements:** Add a relevant short title and a witty, one-sentence "critic's review" at the bottom.`;

        const contentParts = [{ type: "text", text: userPrompt }];
        userImagesBase64.forEach(base64Image => {
            contentParts.push({ type: "image_url", image_url: { url: base64Image } });
        });

        const messages = [{ role: "user", content: contentParts }];
        const data = await makeApiCall(messages);

        if (data.choices[0].finish_reason === "content_filter") {
            throw new Error("Запит було заблоковано фільтром безпеки. Спробуйте інший, більш нейтральний опис або інші фото.");
        }

        if (!data.choices[0].message.images || !data.choices[0].message.images[0]) {
            throw new Error("AI не повернув зображення. Спробуйте ще раз.");
        }

        currentPosterUrl = data.choices[0].message.images[0].image_url.url;
        theatricalPosterUrl = currentPosterUrl;
        theatricalReleaseDiv.innerHTML = '<h3>Перший дубль: "Театральна Версія"</h3>';
        const posterImage = document.createElement('img');
        posterImage.src = currentPosterUrl;
        theatricalReleaseDiv.appendChild(posterImage);
        theatricalReleaseDiv.classList.remove('hidden');
        directorCutBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Продакшн провалився:", error);
        alert(`Не вдалося згенерувати постер:\n\n${error.message}`);
    } finally {
        loading.classList.add('hidden');
        generatePosterBtn.disabled = false;
    }
});

directorCutBtn.addEventListener('click', () => {
    theatricalReleaseDiv.classList.add('hidden');
    directorCutBtn.classList.add('hidden');
    directorRoomDiv.classList.remove('hidden');
    currentPosterView.innerHTML = '';
    const currentPosterImg = document.createElement('img');
    currentPosterImg.src = currentPosterUrl;
    currentPosterView.appendChild(currentPosterImg);
    chatWindow.innerHTML = '';
    addMessageToChat("Так, режисере, сідайте. У нас є матеріал, але він 'сирий'.\nЩо будемо міняти, щоб зробити з цього цукерочку?", 'wombat');
    chatHistory = [ { role: "model", content: "Починаємо сесію редагування." }];
});

sendDirectorCommandBtn.addEventListener('click', async () => {
    const userCommand = directorInput.value.trim();
    if (!userCommand) return;
    addMessageToChat(userCommand, 'user');
    directorInput.value = '';
    sendDirectorCommandBtn.disabled = true;

    const wombatReaction = getWombatReaction(userCommand);
    addMessageToChat(`${wombatReaction.phrase}\n\n- ${wombatReaction.meme}`, 'wombat');

    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    chatWindow.appendChild(spinner);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const editPrompt = `Generate a new image by editing the provided one based on the user's latest command: "${userCommand}". Do not write any text description, only return the new image URL. Keep all the separate characters on the poster, preserving their likeness to the original photos.`;
    const messages = [ { role: "user", content: [{ type: "text", text: editPrompt }, { type: "image_url", image_url: { url: currentPosterUrl } }] }];

    try {
        const data = await makeApiCall(messages);
        if (data.choices[0].finish_reason === "content_filter") { 
            throw new Error("Запит було заблоковано фільтром безпеки. Спробуйте іншу команду."); 
        }
        if (!data.choices[0].message.images || !data.choices[0].message.images[0]) { throw new Error("AI не повернув зображення. Спробуйте ще раз."); }

        const newImageUrl = data.choices[0].message.images[0].image_url.url;
        currentPosterView.querySelector('img').src = newImageUrl;
        currentPosterUrl = newImageUrl;

    } catch (error) {
        console.error("Помилка редагування:", error);
        const errorReaction = getWombatReaction("error", true);
        addMessageToChat(`${errorReaction.phrase}\n\n- ${errorReaction.meme}`, 'wombat');
    } finally {
        spinner.remove();
        sendDirectorCommandBtn.disabled = false;
    }
});

finishCutBtn.addEventListener('click', () => {
    directorRoomDiv.classList.add('hidden');
    finalCutDiv.classList.remove('hidden');
    finalCutDiv.innerHTML = `<h3>Фінальний монтаж: "Director's Cut"</h3>
        <div class="comparison-view">
            <div><h4>ДО (Театральна Версія)</h4><img src="${theatricalPosterUrl}"></div>
            <div><h4>ПІСЛЯ (Режисерська Версія)</h4><img src="${currentPosterUrl}"></div>
        </div>`;
});
