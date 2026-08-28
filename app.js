/**
 * Vaani-Setu — Core Application Controller
 * Handles Multilingual Switching, AI Dialogue Processing, Voice (TTS/STT), Checklist Recalculation & Wizard
 */

let currentLang = 'en';
let audioReadoutEnabled = true;

let currentChecklistScheme = 'pm-kisan';
    let activeChecklistItems = [...SCHEME_CHECKLISTS['pm-kisan'].items];

    function switchSchemeChecklist(schemeKey) {
      if (!SCHEME_CHECKLISTS[schemeKey]) return;
      currentChecklistScheme = schemeKey;
      activeChecklistItems = JSON.parse(JSON.stringify(SCHEME_CHECKLISTS[schemeKey].items));
      document.getElementById('checklistSchemeName').textContent = SCHEME_CHECKLISTS[schemeKey].name;
      renderChecklist();
      showToast(`Switched checklist to: ${SCHEME_CHECKLISTS[schemeKey].name.split('—')[0]}`);
    }

    function renderChecklist() {
      const container = document.getElementById('checklistItemsList');
      if (!container) return;

      const total = activeChecklistItems.length;
      const checkedCount = activeChecklistItems.filter(d => d.checked).length;
      const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

      // 1. DYNAMICALLY UPDATE TOP LINE COUNTER BADGE
      const badgeEl = document.getElementById('docProgressBadge');
      if (badgeEl) {
        if (checkedCount === total && total > 0) {
          badgeEl.className = 'doc-counter-badge complete';
          badgeEl.innerHTML = `🎉 <b>${checkedCount} of ${total} ready</b> (100%)`;
        } else {
          badgeEl.className = 'doc-counter-badge';
          badgeEl.innerHTML = `<b>${checkedCount} of ${total} ready</b> (${percent}%)`;
        }
      }

      // 2. DYNAMICALLY ANIMATE THE TOP PROGRESS BAR
      const barEl = document.getElementById('docProgressBar');
      if (barEl) {
        barEl.style.width = `${percent}%`;
        if (percent === 100) {
          barEl.classList.add('complete');
        } else {
          barEl.classList.remove('complete');
        }
      }

      // 3. RENDER THE CHECKBOX ITEMS
      container.innerHTML = activeChecklistItems.map((doc, idx) => `
    <div class="doc-item-row ${doc.checked ? 'checked' : ''}" onclick="handleRowClick(event, ${idx})">
      <div class="doc-item-left">
        <input 
          type="checkbox" 
          class="native-checkbox" 
          id="docCheck_${idx}" 
          ${doc.checked ? 'checked' : ''} 
          onchange="handleCheckboxChange(${idx}, this.checked)"
        />
        <label for="docCheck_${idx}" class="doc-title" style="cursor:pointer;" onclick="event.stopPropagation()">${doc.title}</label>
      </div>
      <div>
        ${doc.checked ? '<span class="badge-ready">Ready ✓</span>' : (doc.essential ? '<span class="badge-essential">Essential</span>' : '<span style="font-size:11px;color:var(--muted);">Pending</span>')}
      </div>
    </div>
  `).join('');
    }

    // Handles clicking directly on the checkbox
    function handleCheckboxChange(index, isChecked) {
      activeChecklistItems[index].checked = isChecked;
      renderChecklist();
      showLiveFeedback();
    }

    // Handles clicking anywhere on the row
    function handleRowClick(event, index) {
      if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'label') return;
      activeChecklistItems[index].checked = !activeChecklistItems[index].checked;
      renderChecklist();
      showLiveFeedback();
    }

    function showLiveFeedback() {
      const total = activeChecklistItems.length;
      const checkedCount = activeChecklistItems.filter(d => d.checked).length;
      if (checkedCount === total) {
        showToast('🎉 All documents ready! You are ready to apply on the official portal.');
      }
    }

    function toggleAllDocs(selectAll) {
      activeChecklistItems.forEach(d => d.checked = selectAll);
      renderChecklist();
      showToast(selectAll ? 'All documents marked as ready!' : 'All documents unchecked.');
    }

    function addCustomDocItem() {
      const input = document.getElementById('newDocInput');
      const title = input.value.trim();
      if (!title) {
        showToast('Please enter a document name');
        return;
      }
      activeChecklistItems.push({
        id: 'custom_' + Date.now(),
        title: title,
        checked: true,
        essential: false
      });
      input.value = '';
      renderChecklist();
      showToast('✓ Custom document added and marked ready!');
    }

    function downloadChecklist() {
      const total = activeChecklistItems.length;
      const checked = activeChecklistItems.filter(d => d.checked);
      const pending = activeChecklistItems.filter(d => !d.checked);

      let content = `=================================================\n`;
      content += `VAANI-SETU (वाणी-सेतु) • DOCUMENT READINESS REPORT\n`;
      content += `Scheme: ${SCHEME_CHECKLISTS[currentChecklistScheme].name}\n`;
      content += `Generated on: ${new Date().toLocaleString()}\n`;
      content += `Readiness Score: ${checked.length} of ${total} Ready (${Math.round((checked.length / total) * 100)}%)\n`;
      content += `=================================================\n\n`;

      content += `[✓] DOCUMENTS READY (${checked.length}):\n`;
      checked.forEach((d, i) => {
        content += `  ${i + 1}. ${d.title} ${d.essential ? '(Essential)' : ''}\n`;
      });

      content += `\n[!] PENDING DOCUMENTS TO ARRANGE (${pending.length}):\n`;
      if (pending.length === 0) {
        content += `  All documents are ready for submission!\n`;
      } else {
        pending.forEach((d, i) => {
          content += `  ${i + 1}. ${d.title} ${d.essential ? '(Essential - Priority)' : ''}\n`;
        });
      }

      content += `\n-------------------------------------------------\n`;
      content += `NEXT STEPS:\n`;
      content += `1. Keep original certificates and 2 self-attested photocopies.\n`;
      content += `2. Submit on official government portal (.gov.in) or nearest CSC.\n`;
      content += `3. Track reference number after submission.\n`;
      content += `=================================================\n`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VaaniSetu_Document_Checklist_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('📥 Checklist downloaded successfully!');
    }

    function saveChecklistLocally() {
      localStorage.setItem('vaani_checklist_' + currentChecklistScheme, JSON.stringify(activeChecklistItems));
      showToast('💾 Saved to your browser storage.');
    }

    /* ==========================================================================
       4. LANGUAGE SWITCHER SYSTEM
       ========================================================================== */
    function changeLanguage(langKey) {
      if (!I18N[langKey]) langKey = 'en';
      currentLang = langKey;

      const select = document.getElementById('langSelect');
      if (select) select.value = langKey;

      document.querySelectorAll('.lang-pill').forEach(pill => {
        const fnStr = pill.getAttribute('onclick') || '';
        if (fnStr.includes(`'${langKey}'`)) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      const t = I18N[langKey] || I18N['en'];
      if (t.subtitle) document.getElementById('logoSubtitle').textContent = t.subtitle;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
          el.innerHTML = t[key];
        }
      });

      if (t.hero_sample_user) document.getElementById('heroSampleUser').textContent = t.hero_sample_user;
      if (t.hero_sample_ai) document.getElementById('heroSampleAi').innerHTML = `<strong>Vaani-Setu AI</strong><br>${t.hero_sample_ai}`;

      const welcome = document.getElementById('chatWelcomeMsg');
      if (welcome && t.chat_welcome) welcome.textContent = t.chat_welcome;

      renderSchemesGrid();
      renderMatchedSchemes();

      showToast(`🌐 Language: ${select.options[select.selectedIndex].text}`);
    }

    /* ==========================================================================
       5. SCHEME DISCOVERY & FILTERING
       ========================================================================== */
    function renderSchemesGrid(filteredList = null) {
      const container = document.getElementById('schemeGrid');
      if (!container) return;
      const list = filteredList || SCHEMES_DATA;

      if (list.length === 0) {
        container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:#fff;border-radius:20px;border:1px solid var(--border);">
        <span style="font-size:40px;">🔍</span>
        <h3 style="margin:10px 0;color:var(--navy);">No schemes matched your filter</h3>
        <p style="color:var(--muted);">Try resetting filters or searching with different keywords like 'Kisan', 'Health', or 'Housing'.</p>
        <button class="btn btn-light" style="margin-top:14px;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
        return;
      }

      container.innerHTML = list.map(s => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px;">
        <span class="badge">${s.cat}</span>
        <div class="match-score">${s.match}%</div>
      </div>
      <h3 style="font-size:18px;line-height:1.3;margin-bottom:4px;">${s.name}</h3>
      <small style="color:var(--muted);font-weight:600;display:block;margin-bottom:10px;">🏛️ ${s.dept}</small>
      <p style="margin-bottom:14px;color:var(--ink-secondary);font-size:13.5px;">${s.benefit}</p>
      
      <div style="background:#f8fafc;padding:10px 12px;border-radius:12px;margin-bottom:16px;font-size:12.5px;color:#475569;">
        <b>Eligibility:</b> ${s.elig}
      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="openModal('${s.id}')">View Details & Docs</button>
      </div>
    </div>
  `).join('');
    }

    function filterSchemes() {
      const query = (document.getElementById('searchSchemeInput').value || '').toLowerCase().trim();
      const state = document.getElementById('filterState').value;
      const cat = document.getElementById('filterCat').value;
      const occ = document.getElementById('filterOcc').value;

      const filtered = SCHEMES_DATA.filter(s => {
        const matchesQuery = !query || s.name.toLowerCase().includes(query) || s.benefit.toLowerCase().includes(query) || s.cat.toLowerCase().includes(query);
        const matchesState = (state === 'all') || (s.state === state) || (s.state === 'Central');
        const matchesCat = (cat === 'all') || (s.cat === cat);
        const matchesOcc = (occ === 'all') || s.targetOcc.includes(occ);
        return matchesQuery && matchesState && matchesCat && matchesOcc;
      });

      renderSchemesGrid(filtered);
    }

    function resetFilters() {
      document.getElementById('searchSchemeInput').value = '';
      document.getElementById('filterState').value = 'all';
      document.getElementById('filterCat').value = 'all';
      document.getElementById('filterOcc').value = 'all';
      renderSchemesGrid();
      showToast('Filters reset.');
    }

    function renderMatchedSchemes(matches = null) {
      const container = document.getElementById('matchList');
      if (!container) return;
      const list = matches || SCHEMES_DATA.slice(0, 3);

      container.innerHTML = list.map(s => `
    <div class="scheme-match-card">
      <div class="scheme-match-top">
        <strong style="font-size:14px;color:#fff;">${s.name.split('(')[0]}</strong>
        <span class="badge-match">${s.match}% Match</span>
      </div>
      <p style="font-size:12.5px;color:#cbd5e1;margin:4px 0 10px;">${s.benefit.slice(0, 85)}...</p>
      <button class="btn btn-light btn-sm" style="width:100%;font-size:12px;padding:5px;" onclick="openModal('${s.id}')">
        Check Requirements →
      </button>
    </div>
  `).join('');
    }

    /* ==========================================================================
       6. INTERACTIVE AI ASSISTANT SIMULATION
       ========================================================================== */
    function appendMessage(boxId, sender, text) {
      const box = document.getElementById(boxId);
      if (!box) return;
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${sender === 'user' ? 'user' : 'ai'}`;

      if (sender === 'ai') {
        bubble.innerHTML = `<strong>Vaani-Setu AI</strong>${text}`;
      } else {
        bubble.textContent = text;
      }

      box.appendChild(bubble);
      box.scrollTop = box.scrollHeight;
    }

    function sendQuickPrompt(text) {
      const input = document.getElementById('chatInput');
      if (input) {
        input.value = text;
        sendChat();
      }
    }

    function detectQueryLanguage(text) {
      const lower = text.toLowerCase();
      // 1. Devanagari Hindi
      if (/[\u0900-\u097F]/.test(text)) return 'hi';
      // 2. Hinglish keywords
      const hinglishMarkers = ['batao', 'chahiye', 'kaise', 'kya', 'karo', 'mujhe', 'humko', 'mera', 'meri', 'kisan', 'fasal', 'paisa', 'paise', 'yojana', 'aavedan', 'ghar', 'makan', 'shramik', 'sarkar', 'milta', 'kaha', 'kisko', 'kab', 'nahi', 'karna', 'kholo', 'dijiye', 'hai', 'hain', 'ho', 'namaste', 'bataiye', 'milega', 'bima', 'dawa', 'aspataal', 'suno', 'bolo'];
      const words = lower.split(/\s+/);
      const isHinglish = words.some(w => hinglishMarkers.includes(w));
      if (isHinglish) return 'hi';
      // 3. Bengali script
      if (/[\u0980-\u09FF]/.test(text)) return 'bn';
      // 4. Telugu script
      if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
      // 5. Tamil script
      if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
      // 6. Gujarati script
      if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
      // 7. Kannada script
      if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
      // 8. Malayalam script
      if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
      // 9. Punjabi script
      if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
      // 10. Odia script
      if (/[\u0B00-\u0B7F]/.test(text)) return 'or';

      return currentLang || 'en';
    }

    function processAiResponse(userText) {
      const lower = userText.toLowerCase().trim();
      let matchedList = [];
      let reply = "";
      let chips = [];

      // A. EXPLICIT LANGUAGE SWITCH REQUESTS
      const wantsHindi = lower.includes('hindi me') || lower.includes('hindi mein') || lower.includes('hindi please') || lower.includes('speak in hindi') || lower.includes('talk in hindi') || lower.includes('हिंदी में') || lower === 'hindi' || lower === 'हिंदी';
      const wantsEnglish = lower.includes('english me') || lower.includes('english mein') || lower.includes('in english') || lower.includes('english please') || lower.includes('speak in english') || lower.includes('talk in english') || lower === 'english';

      if (wantsHindi) {
        changeLanguage('hi');
        reply = "जरूर! अब मैं आपसे **हिन्दी** में बात करूँगा। 🙏<br><br>आप सरकारी योजनाओं, कृषि सहायता, आयुष्मान कार्ड, मकान सब्सिडी, मुद्रा लोन या दस्तावेज़ चेकलिस्ट के बारे में क्या जानना चाहते हैं?";
        chips = [
          { label: '🌾 किसान योजनाएं (PM-KISAN)', text: 'किसान योजना के बारे में बताओ' },
          { label: '🏥 आयुष्मान कार्ड (मुफ्त इलाज)', text: 'आयुष्मान भारत कार्ड कैसे बनेगा' },
          { label: '🏠 पीएम आवास योजना (घर)', text: 'पीएम आवास योजना का लाभ कैसे लें' },
          { label: '💼 मुद्रा लोन (बिजनेस)', text: 'मुद्रा बिजनेस लोन की जानकारी दो' },
          { label: '☀️ पीएम सूर्य घर (सोलर)', text: 'पीएम सूर्य घर मुफ्त बिजली योजना' }
        ];
        matchedList = SCHEMES_DATA.slice(0, 4);
        return formatAndSpeakReply(reply, chips, matchedList, 'hi-IN');
      }

      if (wantsEnglish) {
        changeLanguage('en');
        reply = "Sure! I will now assist you in **English**. 🙏<br><br>What would you like to explore regarding central and state government benefits, eligibility criteria, or document checklists?";
        chips = [
          { label: '🌾 Farmer / PM-KISAN', text: 'I am a farmer with land' },
          { label: '🏥 Ayushman Health Card', text: 'Ayushman Bharat hospital coverage' },
          { label: '🏠 Housing Subsidy (PMAY)', text: 'PM Awas Yojana housing aid' },
          { label: '💼 MUDRA Business Loan', text: 'MUDRA collateral-free business loan' },
          { label: '☀️ PM Surya Ghar (Solar)', text: 'Free solar electricity PM Surya Ghar' }
        ];
        matchedList = SCHEMES_DATA.slice(0, 4);
        return formatAndSpeakReply(reply, chips, matchedList, 'en-IN');
      }

      // Determine response language (prioritize query language, fallback to current selected language)
      const targetLang = detectQueryLanguage(userText);
      const isHi = (targetLang === 'hi' || currentLang === 'hi');

      // B. GREETINGS & INTRODUCTIONS
      const isGreeting = ['hi', 'hello', 'hey', 'hii', 'heyy', 'namaste', 'namaskar', 'pranam', 'pranaam', 'kem cho', 'vanakkam', 'namaskaram', 'sat sri akaal', 'kemon acho', 'kya hai', 'help', 'who are you', 'kaise ho', 'how are you', 'kya kar sakte ho'].some(w => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w));

      // C. INTENT DETECTION
      const isFarmer = ['farm', 'kisan', 'krishi', 'crop', 'land', 'fasal', 'khet', 'जमीन', 'किसान', 'खेती', 'फसल', 'कृषि', 'বীজ', 'কৃষি', 'কৃষক', 'জমি', 'రైతు', 'వ్యవసాయం', 'భూమి', 'शेतकरी', 'शेती', 'जमीन', 'விவசாயி', 'விவசாயம்', 'நிலம்', 'ખેડૂત', 'ખેતી', 'જમીન', 'ರೈತ', 'ಕೃಷಿ', 'ಭೂಮಿ', 'കർഷകൻ', 'കൃഷി', 'ਕਿਸਾਨ', 'ਖੇਤੀ', 'ਜ਼ਮੀਨ', 'କୃଷକ', 'ଚାଷୀ', 'ଜମି', 'মাটি'].some(w => lower.includes(w));
      const isHealth = ['health', 'hospital', 'doctor', 'ill', 'treatment', 'medical', 'medicine', 'ayushman', 'card', 'dawa', 'bimar', 'इलाज', 'बीमार', 'अस्पताल', 'दवा', 'आयुष्मान', 'চিকিৎসা', 'হাসপাতাল', 'অসুস্থ', 'వైద్యం', 'ఆసుపత్రి', 'చికిత్స', 'आरोग्य', 'दवाखाना', 'उपचार', 'மருத்துவம்', 'மருத்துவமனை', 'சிகிச்சை', 'આરોગ્ય', 'હોસ્પિટલ', 'ದವಾಖಾನೆ', 'ಆರೋಗ್ಯ', 'ಆಸ್ಪತ್ರೆ', 'ചികിത്സ', 'ആശുപത്രി', 'ਸਿਹਤ', 'ਹਸਪਤਾਲ', 'ਇਲਾਜ', 'ସ୍ୱାସ୍ଥ୍ୟ', 'ଡାକ୍ତରଖାନା'].some(w => lower.includes(w));
      const isHousing = ['house', 'housing', 'home', 'awas', 'makaan', 'ghar', 'pucca', 'kutcha', 'आवास', 'मकान', 'घर', 'इंदिरा आवास', 'ঘর', 'বাড়ি', 'ఇల్లు', 'గృహ', 'घर', 'வீடு', 'ઘર', 'ಮನೆ', 'വീട്', 'ਘਰ', 'ଘର'].some(w => lower.includes(w));
      const isWomen = ['woman', 'women', 'gas', 'cylinder', 'chulha', 'beti', 'ladli', 'kanya', 'sukanya', 'ujjwala', 'mother', 'female', 'mahila', 'महिला', 'गैस', 'सिलेंडर', 'बेटी', 'कन्या', 'उज्ज्वला', 'লাডলি', 'মহিলা', 'গ্যাস', 'మహిళ', 'స్త్రీ', 'గ్యాస్', 'गॅस', 'பெண்', 'சிலிண்டர்', 'મહિલા', 'ગેસ', 'ಮಹಿಳೆ', 'ಗ್ಯಾಸ್', 'സ്ത്രീ', 'ਔਰਤ', 'ਗੈਸ', 'ମହିଳା', 'ଗ୍ୟାସ୍'].some(w => lower.includes(w));
      const isBusiness = ['business', 'loan', 'mudra', 'shop', 'dukan', 'artisan', 'vendor', 'karobar', 'vyapar', 'artisan', 'vishwakarma', 'svanidhi', 'loan', 'ऋण', 'लोन', 'व्यापार', 'दुकान', 'मुद्रा', 'विश्वकर्मा', 'স্বনির্ভর', 'ব্যবসা', 'రుణం', 'వ్యాపారం', 'कर्ज', 'வியாபாரம்', 'વેપાર', 'ಲೋನ್', 'ലോൺ', 'ਕਰਜ਼ਾ', 'ଋଣ', 'ঋণ'].some(w => lower.includes(w));
      const isStudent = ['student', 'study', 'school', 'scholarship', 'college', 'education', 'exam', 'fees', 'vidyarthi', 'chhatra', 'छात्र', 'शिक्षा', 'पढ़ाई', 'छात्रवृत्ति', 'कॉलेज', 'फीस', 'ছাত্র', 'শিক্ষা', 'বৃত্তি', 'విద్యార్థಿ', 'చదువు', 'స్కాలర్‌షిప్', 'विद्यार्थी', 'शिक्षण', 'மாணவர்', 'கல்வி', 'உதவித்தொகை', 'વિદ્યાર્થી', 'શિક્ષણ', 'શિષ્યવૃત્તિ', 'ವಿದ್ಯಾರ್ಥಿ', 'ಶಿಕ್ಷಣ', 'വിദ്യാർത്ഥി', 'പഠനം', 'ਵਿਦਿਆਰਥੀ', 'ਪੜ੍ਹਾਈ', 'ଛାତ୍ର', 'ଶିକ୍ଷା', 'ছাত্ৰ'].some(w => lower.includes(w));
      const isSolar = ['solar', 'surya', 'bijli', 'electricity', 'power', 'rooftop', 'light', 'सौर', 'बिजली', 'सूर्य घर', 'रूफटॉप', 'সৌর', 'বিদ্যুৎ', 'సౌర', 'విద్యుత్', 'सौर ऊर्जा', 'சூரிய', 'વીજળી', 'ಸೌರ', 'സൗരോർജ്ജം', 'ਬਿਜਲੀ', 'ସୌର'].some(w => lower.includes(w));
      const isPension = ['pension', 'old age', 'senior', 'buzurg', 'widow', 'disability', 'divyang', 'vridha', 'atal', 'पेंशन', 'बुजुर्ग', 'विधवा', 'दिव्यांग', 'वृद्धावस्था', 'ପେନସନ', 'పెన్షన్', 'पेन्शन', 'ஓய்வூதியம்', 'પેન્શન', 'ಪೆನ್ಷನ್', 'പെൻഷൻ', 'ਪੈਨਸ਼ਨ'].some(w => lower.includes(w));
      const isDocs = ['doc', 'document', 'paper', 'kya chahiye', 'praman patra', 'दस्तावेज', 'कागजात', 'प्रमाण पत्र', 'নথি', 'పత్రాలు', 'कागदपत्रे', 'ஆவணங்கள்', 'દસ્તાવેજ', 'ದಾಖಲೆಗಳು', 'രേഖകൾ', 'ਦਸਤਾਵੇਜ਼', 'ଦସ୍ତାବିଜ୍'].some(w => lower.includes(w));

      if (isGreeting) {
        matchedList = SCHEMES_DATA.slice(0, 4);
        if (isHi) {
          reply = "नमस्ते! 🙏 मैं आपका **वाणी-सेतु एआई सहायक** हूँ।<br><br>मैं आपको केंद्र व राज्य सरकार की कल्याणकारी योजनाओं, पात्रता जांच और आवश्यक दस्तावेज़ तैयार करने में मदद करता हूँ।<br><br>👉 <b>आप किस विषय में सहायता चाहते हैं?</b> नीचे किसी विकल्प को चुनें या बोलकर बताएं:";
          chips = [
            { label: '🌾 किसान कल्याण (PM-KISAN)', text: 'मैं एक किसान हूँ मुझे क्या लाभ मिलेगा' },
            { label: '🏥 स्वास्थ्य कार्ड (आयुष्मान भारत)', text: 'आयुष्मान भारत 5 लाख मुफ्त इलाज' },
            { label: '🏠 पक्का मकान (पीएम आवास)', text: 'पीएम आवास योजना मकान सहायता' },
            { label: '💼 बिना गारंटी लोन (MUDRA)', text: 'मुद्रा बिजनेस लोन कैसे लें' },
            { label: '☀️ मुफ्त बिजली (पीएम सूर्य घर)', text: 'पीएम सूर्य घर मुफ्त बिजली योजना' },
            { label: '🎓 छात्रवृत्ति (Scholarship)', text: 'छात्रों के लिए स्कॉलरशिप' }
          ];
        } else {
          reply = "Namaste! 🙏 I am your **Vaani-Setu AI Guide**.<br><br>I help Indian citizens discover government welfare schemes, understand eligibility, and prepare verified document checklists.<br><br>👉 <b>How can I help you today?</b> Choose a topic below or speak in your language:";
          chips = [
            { label: '🌾 Farmer / PM-KISAN', text: 'I am a farmer with land' },
            { label: '🏥 Health / Ayushman Card', text: 'Ayushman Bharat free hospital card' },
            { label: '🏠 PM Awas (Free House)', text: 'PM Awas Yojana housing subsidy' },
            { label: '💼 MUDRA Business Loan', text: 'Business loan without collateral' },
            { label: '☀️ PM Surya Ghar (Solar)', text: 'Free solar electricity PM Surya Ghar' },
            { label: '🎓 Student Scholarships', text: 'Scholarships for students' }
          ];
        }
      } else if (isFarmer) {
        matchedList = SCHEMES_DATA.filter(s => s.cat === 'Agriculture');
        document.getElementById('profileOcc').textContent = isHi ? "किसान / कृषि" : "Farmer / Agriculture";
        document.getElementById('profileIncome').textContent = isHi ? "वार्षिक आय < ₹2.5 लाख" : "Below ₹2.5 Lakh/yr";
        document.getElementById('profileLoc').textContent = isHi ? "ग्रामीण / कृषि भूमि" : "Rural / Agri Land";
        
        switchSchemeChecklist('pm-kisan');

        if (isHi) {
          reply = "🌾 <b>किसान कल्याण के लिए प्रमुख सरकारी योजनाएं:</b><br><br>1. <b>PM-KISAN</b>: प्रति वर्ष <b>₹6,000</b> सीधे बैंक खाते में (3 समान किस्तों में ₹2,000)।<br>2. <b>PM फसल बीमा योजना</b>: सूखा, बाढ़ या बेमौसम बारिश से फसल नुकसान का पूरा मुआवजा।<br>3. <b>किसान क्रेडिट कार्ड (KCC)</b>: 4% की न्यूनतम ब्याज दर पर ₹3 लाख तक का आसान ऋण।<br><br>📌 <b>ज़रूरी दस्तावेज़:</b> आधार कार्ड, आधार लिंक बैंक पासबुक (NPCI DBT), खतियान / भू-स्वामित्व पर्चा।";
          chips = [
            { label: '📋 PM-KISAN चेकलिस्ट देखें', text: 'PM-KISAN चेकलिस्ट' },
            { label: '🔍 PM-KISAN विवरण', onclick: "openModal('pm-kisan')" },
            { label: '💳 किसान क्रेडिट कार्ड (KCC)', text: 'किसान क्रेडिट कार्ड कैसे बनवाएं' },
            { label: '🌐 आधिकारिक पोर्टल', onclick: "window.open('https://pmkisan.gov.in', '_blank')" }
          ];
        } else {
          reply = "🌾 <b>Top Agricultural Benefits for You:</b><br><br>1. <b>PM-KISAN</b>: <b>₹6,000/year</b> direct financial support transferred in 3 equal installments of ₹2,000.<br>2. <b>PM Fasal Bima Yojana</b>: Comprehensive crop insurance coverage against natural calamities.<br>3. <b>Kisan Credit Card (KCC)</b>: Subsidized crop loan up to ₹3 Lakh at just 4% interest rate.<br><br>📌 <b>Key Documents:</b> Aadhaar Card, Aadhaar-seeded Bank Passbook (NPCI), Land Khatiyan / RoR records.";
          chips = [
            { label: '📋 View PM-KISAN Checklist', text: 'PM-KISAN checklist' },
            { label: '🔍 PM-KISAN Details', onclick: "openModal('pm-kisan')" },
            { label: '💳 Kisan Credit Card (KCC)', text: 'Tell me about Kisan Credit Card' },
            { label: '🌐 Official Portal', onclick: "window.open('https://pmkisan.gov.in', '_blank')" }
          ];
        }
      } else if (isHealth) {
        matchedList = SCHEMES_DATA.filter(s => s.cat === 'Healthcare');
        document.getElementById('profileOcc').textContent = isHi ? "नागरिक / परिवार" : "Citizen / Family";
        document.getElementById('profileIncome').textContent = isHi ? "प्राथमिकता / कम आय" : "Priority / Low-Income";
        document.getElementById('profileLoc').textContent = isHi ? "अखिल भारतीय" : "All India";

        switchSchemeChecklist('ayushman');

        if (isHi) {
          reply = "🏥 <b>स्वास्थ्य एवं मुफ्त चिकित्सा योजनाएं:</b><br><br>1. <b>आयुष्मान भारत (PM-JAY गोल्डन कार्ड)</b>: परिवार के लिए प्रति वर्ष <b>₹5,00,000 तक का 100% कैशलेस मुफ्त अस्पताल इलाज</b>।<br>2. <b>PM जन औषधि केंद्र</b>: 80% से 90% कम कीमत पर जेनेरिक दवाएं।<br>3. <b>ABHA डिजिटल हेल्थ कार्ड</b>: देश भर के अस्पतालों में डिजिटल मेडिकल रिकॉर्ड।<br><br>📌 <b>पात्रता:</b> राशन कार्ड (PHH / अंत्योदय) या SECC सूची में नाम।";
          chips = [
            { label: '📋 आयुष्मान चेकलिस्ट देखें', text: 'आयुष्मान भारत चेकलिस्ट' },
            { label: '🏥 अस्पताल व योजना विवरण', onclick: "openModal('ayushman-bharat')" },
            { label: '💊 सस्ती दवाएं (जन औषधि)', text: 'जन औषधि केंद्र से सस्ती दवाएं' },
            { label: '🌐 NHA पोर्टल', onclick: "window.open('https://nha.gov.in/PM-JAY', '_blank')" }
          ];
        } else {
          reply = "🏥 <b>Healthcare & Cashless Treatment Entitlements:</b><br><br>1. <b>Ayushman Bharat PM-JAY</b>: Up to <b>₹5,00,000 per family/year</b> for 100% cashless hospital treatment at empanelled public & private hospitals.<br>2. <b>PM Jan Aushadhi</b>: Quality generic medicines at 80% to 90% cheaper prices.<br>3. <b>ABHA Health ID</b>: Digital health records valid nationwide.<br><br>📌 <b>Key Documents:</b> Aadhaar of all family members, Ration Card (BPL/PHH/Antyodaya).";
          chips = [
            { label: '📋 View Ayushman Checklist', text: 'Ayushman Bharat checklist' },
            { label: '🏥 Find Hospital / Details', onclick: "openModal('ayushman-bharat')" },
            { label: '💊 Jan Aushadhi Generic Drugs', text: 'Where to get cheap medicines' },
            { label: '🌐 Official NHA Portal', onclick: "window.open('https://nha.gov.in/PM-JAY', '_blank')" }
          ];
        }
      } else if (isHousing) {
        matchedList = SCHEMES_DATA.filter(s => s.cat === 'Housing');
        document.getElementById('profileOcc').textContent = isHi ? "कच्चे मकान के निवासी" : "Kutcha House Resident";
        document.getElementById('profileIncome').textContent = isHi ? "EWS / BPL श्रेणी" : "EWS / BPL Category";
        document.getElementById('profileLoc').textContent = isHi ? "ग्रामीण / शहरी" : "Rural / Urban";

        switchSchemeChecklist('pmay');

        if (isHi) {
          reply = "🏠 <b>प्रधानमंत्री आवास योजना (PMAY - ग्रामीण एवं शहरी):</b><br><br>• पक्का मकान बनाने के लिए <b>₹1,20,000 से ₹2,50,000</b> की प्रत्यक्ष बैंक सहायता।<br>• <b>स्वच्छ भारत शौचालय अनुदान</b>: ₹12,000 अतिरिक्त।<br>• ग्रामीण लाभार्थियों को 90-95 दिन का मनरेगा मजदूरी लाभ।<br><br>📌 <b>पात्रता:</b> कच्चे या बेघर परिवार जिनका देश में कहीं पक्का मकान नहीं है।";
          chips = [
            { label: '📋 PMAY चेकलिस्ट देखें', text: 'PMAY चेकलिस्ट' },
            { label: '🔍 PMAY विवरण', onclick: "openModal('pmay')" },
            { label: '🚽 शौचालय अनुदान (₹12,000)', text: 'स्वच्छ भारत शौचालय अनुदान' }
          ];
        } else {
          reply = "🏠 <b>Pradhan Mantri Awas Yojana (PMAY):</b><br><br>• Direct grant of <b>₹1,20,000 to ₹2,50,000</b> directly into your bank account to construct a pucca house.<br>• <b>Swachh Bharat Toilet Grant</b>: Additional ₹12,000.<br>• 90+ days of wage support under MGNREGA.<br><br>📌 <b>Eligibility:</b> Families living in kutcha/temporary shelter without a permanent pucca house.";
          chips = [
            { label: '📋 View PMAY Checklist', text: 'PMAY checklist' },
            { label: '🔍 PMAY Scheme Details', onclick: "openModal('pmay')" },
            { label: '🚽 Toilet Construction Grant', text: 'Swachh Bharat toilet grant' }
          ];
        }
      } else if (isWomen) {
        matchedList = SCHEMES_DATA.filter(s => s.cat === 'Women & Child');
        document.getElementById('profileOcc').textContent = isHi ? "महिला / गृहणी" : "Woman / Homemaker";
        document.getElementById('profileIncome').textContent = isHi ? "प्राथमिकता परिवार" : "Priority Household";
        document.getElementById('profileLoc').textContent = isHi ? "ग्रामीण / अर्ध-शहरी" : "Rural / Semi-Urban";

        switchSchemeChecklist('ujjwala');

        if (isHi) {
          reply = "🌸 <b>महिला एवं बाल कल्याण योजनाएं:</b><br><br>1. <b>PM उज्ज्वला योजना 2.0</b>: मुफ्त गैस कनेक्शन + पहला सिलेंडर और गैस चूल्हा बिल्कुल मुफ्त + ₹300 सब्सिडी।<br>2. <b>सुकन्या समृद्धि योजना</b>: 8.2% की उच्चतम ब्याज दर पर बेटी के लिए सुरक्षित व टैक्स-फ्री बचत।<br>3. <b>PM मातृ वंदना योजना</b>: गर्भवती महिलाओं को ₹5,000 की प्रत्यक्ष पोषण सहायता।";
          chips = [
            { label: '📋 उज्ज्वला चेकलिस्ट', text: 'उज्ज्वला चेकलिस्ट' },
            { label: '👧 सुकन्या समृद्धि खाता', onclick: "openModal('sukanya-samriddhi')" },
            { label: '🔥 उज्ज्वला 2.0 विवरण', onclick: "openModal('pm-ujjwala')" }
          ];
        } else {
          reply = "🌸 <b>Women & Child Welfare Programs:</b><br><br>1. <b>PM Ujjwala Yojana 2.0</b>: Free LPG gas connection with zero-cost first refill and gas stove + ₹300/cylinder subsidy.<br>2. <b>Sukanya Samriddhi Yojana</b>: High guaranteed 8.2% tax-free savings scheme for girl child education & marriage.<br>3. <b>PM Matru Vandana</b>: ₹5,000 direct maternity support for first living child.";
          chips = [
            { label: '📋 View Ujjwala Checklist', text: 'Ujjwala checklist' },
            { label: '👧 Sukanya Samriddhi Account', onclick: "openModal('sukanya-samriddhi')" },
            { label: '🔥 Ujjwala 2.0 Details', onclick: "openModal('pm-ujjwala')" }
          ];
        }
      } else if (isBusiness) {
        matchedList = SCHEMES_DATA.filter(s => s.id === 'pm-mudra' || s.id === 'pm-vishwakarma');
        document.getElementById('profileOcc').textContent = isHi ? "स्वरोजगार / कारीगर / दुकानदार" : "Self-Employed / Artisan / Vendor";
        document.getElementById('profileIncome').textContent = isHi ? "सूक्ष्म उद्यम (< ₹5 लाख)" : "Micro-Enterprise (< ₹5L)";
        document.getElementById('profileLoc').textContent = isHi ? "शहरी / अर्ध-शहरी" : "Semi-Urban / Urban";

        if (isHi) {
          reply = "💼 <b>व्यापार, स्वरोजगार एवं कारीगर ऋण योजनाएं:</b><br><br>1. <b>PM MUDRA लोन</b>: बिना गारंटी <b>₹10 लाख</b> तक का बिजनेस लोन (शिशु ₹50K, किशोर ₹5L, तरुण ₹10L)।<br>2. <b>PM विश्वकर्मा योजना</b>: 18 पारंपरिक कारीगरों (बढ़ई, लोहार, दर्जी, मोची, नाई आदि) को <b>₹15,000 टूलकिट अनुदान</b> और <b>₹3 लाख</b> का आसान ऋण (5% ब्याज)।<br>3. <b>PM स्वनिधि (SVANidhi)</b>: रेहड़ी-पटरी वालों के लिए ₹10,000 से ₹50,000 तक का कार्यशील पूंजी ऋण।";
          chips = [
            { label: '🔍 मुद्रा लोन विवरण', onclick: "openModal('pm-mudra')" },
            { label: '🛠️ विश्वकर्मा योजना लाभ', onclick: "openModal('pm-vishwakarma')" },
            { label: '🏪 रेहड़ी-पटरी स्वनिधि', text: 'पीएम स्वनिधि लोन योजना' }
          ];
        } else {
          reply = "💼 <b>Business, MSME & Artisan Loan Schemes:</b><br><br>1. <b>PM MUDRA Loan</b>: Collateral-free credit up to <b>₹10 Lakhs</b> (Shishu up to ₹50K, Kishore up to ₹5L, Tarun up to ₹10L).<br>2. <b>PM Vishwakarma</b>: ₹15,000 modern toolkit grant + ₹3 Lakh collateral-free loan at 5% interest for 18 artisan trades.<br>3. <b>PM SVANidhi</b>: Working capital micro-loans (₹10K-₹50K) for street vendors and small merchants.";
          chips = [
            { label: '🔍 PM MUDRA Loan Details', onclick: "openModal('pm-mudra')" },
            { label: '🛠️ PM Vishwakarma Benefits', onclick: "openModal('pm-vishwakarma')" },
            { label: '🏪 Street Vendor SVANidhi', text: 'PM SVANidhi loan for street vendors' }
          ];
        }
      } else if (isStudent) {
        matchedList = SCHEMES_DATA.filter(s => s.cat === 'Education');
        document.getElementById('profileOcc').textContent = isHi ? "छात्र / शोधार्थी" : "Student / Youth";
        document.getElementById('profileIncome').textContent = isHi ? "अभिभावक आय < ₹3.5 लाख" : "Parental < ₹3.5 Lakh";
        document.getElementById('profileLoc').textContent = isHi ? "स्कूल / कॉलेज" : "School / College";

        if (isHi) {
          reply = "🎓 <b>छात्रवृत्ति एवं उच्च शिक्षा योजनाएं:</b><br><br>1. <b>National Means-cum-Merit Scholarship (NMMSS)</b>: कक्षा 9वीं से 12वीं तक <b>₹12,000 प्रति वर्ष</b> (₹1,000/माह) सीधी छात्रवृत्ति।<br>2. <b>PM-YASASVI</b>: OBC, EBC और DNT छात्रों के लिए शीर्ष श्रेणी शिक्षा छात्रवृत्ति।<br>3. <b>पोस्ट-मैट्रिक स्कॉलरशिप</b>: कॉलेज एवं तकनीकी पाठ्यक्रमों के लिए फीस प्रतिपूर्ति।";
          chips = [
            { label: '🔍 स्कॉलरशिप पात्रता', onclick: "openModal('nsp-scholarship')" },
            { label: '📋 आवश्यक दस्तावेज़', text: 'छात्रवृत्ति के लिए जरूरी दस्तावेज' },
            { label: '🌐 नेशनल स्कॉलरशिप पोर्टल', onclick: "window.open('https://scholarships.gov.in', '_blank')" }
          ];
        } else {
          reply = "🎓 <b>Student Scholarships & Higher Education Grants:</b><br><br>1. <b>National Means-cum-Merit Scholarship (NMMSS)</b>: <b>₹12,000/year</b> direct scholarship for classes IX to XII students.<br>2. <b>PM-YASASVI Scheme</b>: Top-class school & college scholarship for OBC, EBC, and nomadic students.<br>3. <b>Post-Matric Central Scheme</b>: Tuition fee reimbursement for college & polytechnic courses.";
          chips = [
            { label: '🔍 Scholarship Criteria', onclick: "openModal('nsp-scholarship')" },
            { label: '📋 Required Documents', text: 'Documents for scholarship' },
            { label: '🌐 National Scholarship Portal', onclick: "window.open('https://scholarships.gov.in', '_blank')" }
          ];
        }
      } else if (isSolar) {
        matchedList = SCHEMES_DATA.filter(s => s.id === 'pm-surya-ghar');
        document.getElementById('profileOcc').textContent = isHi ? "घरेलू उपभोक्ता" : "Household / Consumer";
        document.getElementById('profileIncome').textContent = isHi ? "सब्सिडी पात्र" : "Electricity Subsidized";
        document.getElementById('profileLoc').textContent = isHi ? "छत स्वामित्व" : "Residential Rooftop";

        if (isHi) {
          reply = "☀️ <b>पीएम सूर्य घर: मुफ्त बिजली योजना:</b><br><br>• घर की छत पर सोलर पैनल लगवाने पर <b>₹78,000 तक की सीधी सरकारी सब्सिडी</b>।<br>• हर महीने <b>300 यूनिट तक मुफ्त बिजली</b> और बिजली बिल शून्य।<br>• अतिरिक्त बिजली ग्रिड को बेचकर अतिरिक्त कमाई।";
          chips = [
            { label: '🔍 पीएम सूर्य घर विवरण', onclick: "openModal('pm-surya-ghar')" },
            { label: '⚡ पोर्टल पर आवेदन करें', onclick: "window.open('https://pmsuryaghar.gov.in', '_blank')" }
          ];
        } else {
          reply = "☀️ <b>PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar):</b><br><br>• Direct government subsidy up to <b>₹78,000</b> for rooftop solar panel installations.<br>• Get up to <b>300 units of free electricity every month</b>, reducing electricity bills to zero.<br>• Sell surplus generated power back to the grid for additional earnings.";
          chips = [
            { label: '🔍 PM Surya Ghar Details', onclick: "openModal('pm-surya-ghar')" },
            { label: '⚡ Apply on Portal', onclick: "window.open('https://pmsuryaghar.gov.in', '_blank')" }
          ];
        }
      } else if (isPension) {
        matchedList = SCHEMES_DATA.filter(s => s.id === 'atal-pension');
        document.getElementById('profileOcc').textContent = isHi ? "वरिष्ठ नागरिक / पेंशनभोगी" : "Senior Citizen / Pensioner";
        document.getElementById('profileIncome').textContent = isHi ? "सामाजिक सुरक्षा" : "Social Security";

        if (isHi) {
          reply = "👴 <b>पेंशन एवं सामाजिक सुरक्षा योजनाएं:</b><br><br>1. <b>अटल पेंशन योजना (APY)</b>: 60 वर्ष की आयु के बाद <b>₹1,000 से ₹5,000 प्रतिमाह</b> की आजीवन सरकारी गारंटीड पेंशन।<br>2. <b>इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन</b>: बीपीएल वरिष्ठ नागरिकों के लिए मासिक सहायता।<br>3. <b>दिव्यांग एवं विधवा पेंशन</b>: विशेष सामाजिक सुरक्षा पेंशन।";
          chips = [
            { label: '🔍 अटल पेंशन विवरण', onclick: "openModal('atal-pension')" },
            { label: '👵 वृद्धावस्था पेंशन नियम', text: 'वृद्धावस्था पेंशन कैसे मिलेगी' }
          ];
        } else {
          reply = "👴 <b>Pension & Social Security Schemes:</b><br><br>1. <b>Atal Pension Yojana (APY)</b>: Guaranteed monthly pension of <b>₹1,000 to ₹5,000/month</b> after age 60 for unorganized workers.<br>2. <b>National Old Age Pension (IGNOAPS)</b>: Direct monthly assistance for senior citizens.<br>3. <b>Widow & Disability Pension</b>: Monthly financial support for vulnerable citizens.";
          chips = [
            { label: '🔍 Atal Pension Details', onclick: "openModal('atal-pension')" },
            { label: '👵 Old Age Pension Rules', text: 'Old age pension eligibility criteria' }
          ];
        }
      } else if (isDocs) {
        matchedList = SCHEMES_DATA.slice(0, 3);
        if (isHi) {
          reply = "📋 <b>सरकारी योजनाओं के लिए अनिवार्य 4 दस्तावेज़:</b><br><br>1. <b>आधार कार्ड</b> (मोबाइल नंबर लिंक होना चाहिए)<br>2. <b>बैंक पासबुक</b> (Aadhaar/NPCI DBT सीडेड)<br>3. <b>आय / जाति / निवास प्रमाण पत्र</b><br>4. <b>राशन कार्ड या खतियान/जमीन की रसीद</b><br><br>👉 नीचे दिए गए <b>डॉक्यूमेंट चेकलिस्ट</b> सेक्शन में अपने दस्तावेज़ टिक करें और अपनी तैयारी का स्कोर देखें!";
          chips = [
            { label: '📋 किसान चेकलिस्ट खोलें', text: 'PM-KISAN चेकलिस्ट' },
            { label: '🏥 आयुष्मान चेकलिस्ट खोलें', text: 'आयुष्मान भारत चेकलिस्ट' },
            { label: '🏠 आवास चेकलिस्ट खोलें', text: 'PMAY चेकलिस्ट' }
          ];
        } else {
          reply = "📋 <b>Core 4-Document Kit for Government Schemes:</b><br><br>1. <b>Aadhaar Card</b> (Active mobile number linked for OTP verification)<br>2. <b>Bank Passbook</b> (Aadhaar seeded with NPCI for Direct Benefit Transfer)<br>3. <b>Income / Caste / Domicile Certificate</b><br>4. <b>Ration Card or Land Records (Khatiyan)</b><br><br>👉 Scroll down to our interactive <b>Document Checklist</b> to track your readiness score!";
          chips = [
            { label: '📋 Open PM-KISAN Checklist', text: 'PM-KISAN checklist' },
            { label: '🏥 Open Ayushman Checklist', text: 'Ayushman Bharat checklist' },
            { label: '🏠 Open PMAY Checklist', text: 'PMAY checklist' }
          ];
        }
      } else {
        matchedList = SCHEMES_DATA.slice(0, 3);
        if (isHi) {
          reply = "मैंने आपकी जानकारी का विश्लेषण किया है। आपकी स्थिति के अनुसार सबसे उपयुक्त योजनाएं दाईं ओर प्रदर्शित हैं।<br><br>अधिक सटीक जानकारी के लिए आप अपना काम (जैसे: किसान, छात्र, गृहणी, व्यापारी, मजदूर) या मासिक आय बता सकते हैं।";
          chips = [
            { label: '🌾 किसान योजनाएं', text: 'किसान योजनाएं' },
            { label: '🏥 स्वास्थ्य कार्ड', text: 'आयुष्मान भारत' },
            { label: '🏠 मकान सहायता', text: 'पीएम आवास योजना' },
            { label: '💼 बिजनेस लोन', text: 'मुद्रा बिजनेस लोन' }
          ];
        } else {
          reply = "Based on your inputs, I have matched the top government welfare programs shown on the right.<br><br>To get exact match scores and eligibility, you can specify your occupation (e.g. farmer, student, small business, homemaker, labourer) or family income.";
          chips = [
            { label: '🌾 Farmer Schemes', text: 'I am a farmer with land' },
            { label: '🏥 Health Coverage', text: 'Ayushman Bharat hospital card' },
            { label: '🏠 Housing Assistance', text: 'PM Awas Yojana subsidy' },
            { label: '💼 Business Loan', text: 'MUDRA business loan' }
          ];
        }
      }

      return formatAndSpeakReply(reply, chips, matchedList, isHi ? 'hi-IN' : 'en-IN');
    }

    function formatAndSpeakReply(replyText, chips, matchedList, langCode) {
      let finalHtml = replyText;
      if (chips && chips.length > 0) {
        finalHtml += '<div class="chat-chips-wrap">';
        chips.forEach(c => {
          if (c.onclick) {
            finalHtml += `<button class="chat-chip" onclick="${c.onclick}">${c.label}</button>`;
          } else {
            finalHtml += `<button class="chat-chip" onclick="sendQuickPrompt('${c.text.replace(/'/g, "\\'")}')">${c.label}</button>`;
          }
        });
        finalHtml += '</div>';
      }

      renderMatchedSchemes(matchedList);

      if (audioReadoutEnabled && window.speechSynthesis) {
        const cleanTtsText = replyText.replace(/<[^>]*>?/gm, ' ').replace(/\*\*/g, '').replace(/👉/g, '').replace(/📌/g, '').replace(/•/g, '');
        speakText(cleanTtsText, langCode);
      }

      return finalHtml;
    }

    function speakText(text, specificLang = null) {
      try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const langToUse = specificLang || ((I18N[currentLang] && I18N[currentLang].code) ? I18N[currentLang].code : 'hi-IN');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langToUse;
        utterance.rate = 0.98;
        utterance.pitch = 1.0;

        // Try to pick the best Indian voice in browser
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          let selectedVoice = null;
          if (langToUse.startsWith('hi')) {
            selectedVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('Madhur') || v.name.includes('Swara') || v.name.includes('Kavya'));
          } else if (langToUse.startsWith('en')) {
            selectedVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Ravi') || v.name.includes('Heera') || v.name.includes('Neerja')) && !v.name.includes('US'));
          }
          if (selectedVoice) utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('TTS error:', e);
      }
    }

    function sendChat() {
      const input = document.getElementById('chatInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text) {
        showToast('Please type a question or speak.');
        return;
      }

      appendMessage('chatbox', 'user', text);
      input.value = '';

      const typing = document.createElement('div');
      typing.className = 'chat-bubble ai';
      typing.id = 'aiTyping';
      typing.innerHTML = `<strong>Vaani-Setu AI</strong>Analyzing citizen context & eligibility rules...`;
      const chatbox = document.getElementById('chatbox');
      if (chatbox) {
        chatbox.appendChild(typing);
        chatbox.scrollTop = chatbox.scrollHeight;
      }

      setTimeout(() => {
        if (typing && typing.parentNode) typing.remove();
        const reply = processAiResponse(text);
        appendMessage('chatbox', 'ai', reply);
        showToast('✨ Potential scheme matches updated!');
      }, 550);
    }

    function sendHero() {
      const heroInput = document.getElementById('heroInput');
      const val = heroInput ? heroInput.value.trim() : '';
      if (!val) {
        showToast('Please enter or speak your situation.');
        return;
      }
      const chatInput = document.getElementById('chatInput');
      if (chatInput) chatInput.value = val;
      const demoSec = document.querySelector('#demo');
      if (demoSec) demoSec.scrollIntoView({ behavior: 'smooth' });
      setTimeout(sendChat, 450);
    }

    function clearChat() {
      const box = document.getElementById('chatbox');
      if (!box) return;
      box.innerHTML = `
        <div class="chat-bubble ai">
          <strong>Vaani-Setu AI</strong>
          <span id="chatWelcomeMsg">${(I18N[currentLang] && I18N[currentLang].chat_welcome) ? I18N[currentLang].chat_welcome : I18N['en'].chat_welcome}</span>
        </div>
      `;
      showToast('Chat conversation reset.');
    }

    function toggleAudioReadout() {
      audioReadoutEnabled = !audioReadoutEnabled;
      const btn = document.getElementById('audioToggleBtn');
      if (btn) btn.textContent = audioReadoutEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
      showToast(audioReadoutEnabled ? 'Voice readout enabled' : 'Voice readout muted');
    }

    /* ==========================================================================
       7. VOICE RECOGNITION (Web Speech API)
       ========================================================================== */
    function startVoice(source = 'hero') {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        showToast('⚠️ Speech recognition not supported in this browser. Please type your query.');
        return;
      }

      const rec = new SpeechRec();
      rec.lang = (I18N[currentLang] && I18N[currentLang].code) ? I18N[currentLang].code : 'hi-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      const micHero = document.getElementById('micBtn');
      const micDemo = document.getElementById('demoMic');
      const wave = document.getElementById('waveContainer');
      const status = document.getElementById('voiceStatus');

      if (micHero) micHero.classList.add('listening');
      if (micDemo) micDemo.classList.add('listening');
      if (wave) wave.classList.add('active');
      if (status) {
        status.textContent = '● Listening...';
        status.classList.add('recording');
      }

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (source === 'hero') {
          document.getElementById('heroInput').value = transcript;
          sendHero();
        } else {
          document.getElementById('chatInput').value = transcript;
          sendChat();
        }
        showToast(`🎙️ Captured: "${transcript}"`);
      };

      rec.onerror = (e) => {
        showToast('Could not hear clearly. Please try again or type.');
      };

      rec.onend = () => {
        if (micHero) micHero.classList.remove('listening');
        if (micDemo) micDemo.classList.remove('listening');
        if (wave) wave.classList.remove('active');
        if (status) {
          status.textContent = '● Ready';
          status.classList.remove('recording');
        }
      };

      rec.start();
    }

    /* ==========================================================================
       8. INTERACTIVE STEP-BY-STEP ELIGIBILITY WIZARD
       ========================================================================== */
    let currentWizardStep = 1;
    const totalWizardSteps = 6;

    const wizardStepsData = [
      {
        step: 1,
        title: 'Personal Profile',
        html: `
      <div class="form-grid">
        <div class="field-group">
          <label>Age Group</label>
          <select id="wAge">
            <option value="18-25">18 - 25 years (Youth / Student)</option>
            <option value="26-45" selected>26 - 45 years (Working adult)</option>
            <option value="46-60">46 - 60 years</option>
            <option value="60+">60+ years (Senior Citizen)</option>
          </select>
        </div>
        <div class="field-group">
          <label>Gender</label>
          <select id="wGender">
            <option value="Female">Female</option>
            <option value="Male" selected>Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    `
      },
      {
        step: 2,
        title: 'State & Residential Location',
        html: `
      <div class="form-grid">
        <div class="field-group">
          <label>State / UT of Residence</label>
          <select id="wState">
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra" selected>Maharashtra</option>
            <option value="Bihar">Bihar</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Other">Other States</option>
          </select>
        </div>
        <div class="field-group">
          <label>Area Type</label>
          <select id="wArea">
            <option value="Rural" selected>Rural (Village / Gram Panchayat)</option>
            <option value="Semi-Urban">Semi-Urban / Small Town</option>
            <option value="Urban">Urban (Municipal Corporation)</option>
          </select>
        </div>
      </div>
    `
      },
      {
        step: 3,
        title: 'Occupation & Landholding',
        html: `
      <div class="form-grid">
        <div class="field-group">
          <label>Primary Occupation</label>
          <select id="wOcc">
            <option value="Farmer" selected>Farmer (Agricultural Landholder)</option>
            <option value="Worker">Daily Wage Labour / Construction</option>
            <option value="Student">Student / Research Scholar</option>
            <option value="Self-employed">Small Business / Artisan / Self-Employed</option>
            <option value="Homemaker">Homemaker</option>
          </select>
        </div>
        <div class="field-group">
          <label>Agricultural Land Size (if applicable)</label>
          <select id="wLand">
            <option value="marginal" selected>Less than 2.5 Acres (Marginal Farmer)</option>
            <option value="small">2.5 to 5 Acres (Small Farmer)</option>
            <option value="medium">5 to 10 Acres</option>
            <option value="none">No agricultural land</option>
          </select>
        </div>
      </div>
    `
      },
      {
        step: 4,
        title: 'Income & Ration Card Category',
        html: `
      <div class="form-grid">
        <div class="field-group">
          <label>Annual Household Income</label>
          <select id="wIncome">
            <option value="<1L" selected>Below ₹1,00,000 (BPL / Antyodaya)</option>
            <option value="1-3L">₹1,00,000 to ₹3,00,000</option>
            <option value="3-5L">₹3,00,000 to ₹5,00,000</option>
            <option value=">5L">Above ₹5,00,000</option>
          </select>
        </div>
        <div class="field-group">
          <label>Ration Card Type</label>
          <select id="wRation">
            <option value="AAY">Antyodaya (AAY - Yellow Card)</option>
            <option value="PHH" selected>Priority Household (PHH - Pink/Orange)</option>
            <option value="NPHH">Non-Priority (White Card)</option>
            <option value="None">No Ration Card</option>
          </select>
        </div>
      </div>
    `
      },
      {
        step: 5,
        title: 'Family Members & Housing Context',
        html: `
      <div class="form-grid">
        <div class="field-group">
          <label>Total Family Members</label>
          <input type="number" id="wFamily" value="4" min="1" max="15"/>
        </div>
        <div class="field-group">
          <label>Current Housing Type</label>
          <select id="wHouse">
            <option value="Kutcha" selected>Kutcha / Thatched / Tin Roof</option>
            <option value="Rented">Rented House</option>
            <option value="Pucca">Pucca Concrete House</option>
          </select>
        </div>
      </div>
    `
      },
      {
        step: 6,
        title: 'Calculated Matches & Entitlements',
        html: `<div id="finalWizardResultArea">Calculating your tailored matches...</div>`
      }
    ];

    function updateWizardUI() {
      const stepObj = wizardStepsData[currentWizardStep - 1];
      const percent = Math.round((currentWizardStep / totalWizardSteps) * 100);

      document.getElementById('wizardStepHeading').textContent = `Step ${currentWizardStep} of ${totalWizardSteps}: ${stepObj.title}`;
      document.getElementById('wizardStepPercent').textContent = `${percent}%`;
      document.getElementById('wizardProgressBar').style.width = `${percent}%`;

      for (let i = 1; i <= totalWizardSteps; i++) {
        const tab = document.getElementById(`stepTab${i}`);
        if (tab) {
          tab.classList.remove('active', 'completed');
          if (i === currentWizardStep) tab.classList.add('active');
          else if (i < currentWizardStep) tab.classList.add('completed');
        }
      }

      document.getElementById('wizardStepContent').innerHTML = stepObj.html;

      document.getElementById('wizardPrevBtn').style.display = currentWizardStep > 1 ? 'inline-flex' : 'none';
      const nextBtn = document.getElementById('wizardNextBtn');
      if (currentWizardStep === totalWizardSteps) {
        nextBtn.textContent = 'Recalculate Results 🔄';
        calculateWizardEligibility();
      } else {
        nextBtn.textContent = 'Continue Next →';
      }
    }

    function wizardNav(delta) {
      currentWizardStep = Math.min(totalWizardSteps, Math.max(1, currentWizardStep + delta));
      updateWizardUI();
    }

    function jumpToStep(step) {
      currentWizardStep = step;
      updateWizardUI();
    }

    function calculateWizardEligibility() {
      const resultBox = document.getElementById('finalWizardResultArea');
      if (!resultBox) return;

      resultBox.innerHTML = `
    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:18px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="font-size:24px;">🎉</span>
        <strong style="font-size:18px;color:#166534;">High Eligibility Confirmed!</strong>
      </div>
      <p style="color:#14532d;font-size:14px;margin:0;">
        Based on your selected profile, you have high potential eligibility for <b>4 Major Government Welfare Programs</b>.
      </p>
    </div>

    <div style="display:grid;gap:12px;">
      ${SCHEMES_DATA.slice(0, 4).map(s => `
        <div style="border:1px solid var(--border);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:16px;background:#fff;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <strong style="color:var(--navy);font-size:15px;">${s.name}</strong>
              <span class="badge">${s.cat}</span>
            </div>
            <p style="color:var(--muted);font-size:13px;margin:4px 0 0;">${s.benefit}</p>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div class="match-score">${s.match}%</div>
            <button class="btn btn-primary btn-sm" onclick="openModal('${s.id}')" style="margin-top:6px;font-size:12px;">View Details</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
    }

    /* ==========================================================================
       9. MODAL & TOAST
       ========================================================================== */
    let activeModalScheme = null;

    function openModal(schemeId) {
      const scheme = SCHEMES_DATA.find(s => s.id === schemeId || s.name.includes(schemeId));
      if (!scheme) return;

      activeModalScheme = scheme;
      document.getElementById('modalCat').textContent = scheme.cat;
      document.getElementById('modalTitle').textContent = scheme.name;

      document.getElementById('modalBody').innerHTML = `
    <div style="background:#f8fafc;padding:14px;border-radius:14px;margin-bottom:14px;">
      <b style="color:var(--navy);">🏛️ Ministry / Department:</b> ${scheme.dept}<br>
      <b style="color:var(--navy);">🎯 Potential Match:</b> <span style="color:var(--green-dark);font-weight:800;">${scheme.match}% Match</span><br>
      <b style="color:var(--navy);">💰 Key Benefit:</b> ${scheme.benefit}
    </div>

    <div style="margin-bottom:14px;">
      <strong style="color:var(--navy);display:block;margin-bottom:4px;">📋 Eligibility Criteria:</strong>
      <p style="margin:0;font-size:13.5px;">${scheme.elig}</p>
    </div>

    <div>
      <strong style="color:var(--navy);display:block;margin-bottom:6px;">📑 Required Document Checklist:</strong>
      <ul style="padding-left:20px;margin:0;font-size:13.5px;color:var(--ink-secondary);">
        ${scheme.docs.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>
  `;

      document.getElementById('modalBackdrop').classList.add('open');
    }

    function closeModal() {
      document.getElementById('modalBackdrop').classList.remove('open');
    }

    function openOfficialPortal() {
      if (activeModalScheme && activeModalScheme.portalUrl) {
        window.open(activeModalScheme.portalUrl, '_blank');
      } else {
        window.open('https://www.india.gov.in', '_blank');
      }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      const txt = document.getElementById('toastText');
      txt.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    function toggleFaq(btn) {
      const item = btn.parentElement;
      document.querySelectorAll('.faq-item').forEach(el => {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open');
    }

    function toggleMobileMenu() {
      const links = document.getElementById('navLinks');
      if (links.style.display === 'flex') {
        links.style.display = '';
      } else {
        links.style.display = 'flex';
        links.style.position = 'absolute';
        links.style.top = '78px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = '#ffffff';
        links.style.flexDirection = 'column';
        links.style.padding = '20px';
        links.style.borderBottom = '1px solid var(--border)';
        links.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      }
    }

    /* ==========================================================================
       10. INITIALIZATION
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
      renderChecklist();
      renderSchemesGrid();
      renderMatchedSchemes();
      updateWizardUI();
      changeLanguage('en');
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
