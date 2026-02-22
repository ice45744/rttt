import { db, auth, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js';

const APP_ID = 'ST_DIGITAL_SYSTEM_v1';
const WEBHOOK_ADMIN = "https://discord.com/api/webhooks/1334464104085164052/9S-v_X4X4X4X4X4X4X4X4X4X4X4X4X4X4X4";
const WEBHOOK_DEED = "https://discord.com/api/webhooks/1467136460506271863/McED-tyn4MGH53q1smhHqDf2phVOL9xK3KYUU6IGVeMPvvF6skpIEAt5Y9qPbhkbYHiy";
const WEBHOOK_REPORT = "https://discord.com/api/webhooks/1467136460506271863/McED-tyn4MGH53q1smhHqDf2phVOL9xK3KYUU6IGVeMPvvF6skpIEAt5Y9qPbhkbYHiy";

let currentUser = null;
let userData = null;
let scannerObj = null;
let allStudents = [];
let lastAutoPopupId = null;

// --- Utilities ---
const showLoading = (msg = 'กำลังโหลด...') => {
    Swal.fire({
        title: msg,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { container: 'z-[10001]' }
    });
};

const hideLoading = () => Swal.close();

const showToast = (msg, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        customClass: { container: 'z-[10002]' }
    });
    Toast.fire({ icon, title: msg });
};

async function sendDiscordNotification(url, title, message) {
    if(!url) return;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "@website",
                embeds: [{
                    title: title,
                    description: message,
                    color: 3447003,
                    timestamp: new Date().toISOString()
                }]
            })
        });
    } catch (e) { console.error("Discord error", e); }
}

// --- Persistence ---
function saveToLocal(key, data) {
    localStorage.setItem(`${APP_ID}_${key}`, JSON.stringify(data));
}
function getFromLocal(key) {
    const data = localStorage.getItem(`${APP_ID}_${key}`);
    return data ? JSON.parse(data) : null;
}

// --- Auth ---
window.handleLogin = async () => {
    const studentId = document.getElementById('login-student-id').value.trim();
    const password = document.getElementById('login-password').value;
    if(!studentId || !password) return showToast('กรุณากรอกข้อมูล', 'warning');
    
    try {
        showLoading();
        const lastLogin = localStorage.getItem('last_login_attempt');
        if (lastLogin && Date.now() - parseInt(lastLogin) < 2000) {
            throw new Error('กรุณารอสักครู่ก่อนลองใหม่อีกครั้ง');
        }
        localStorage.setItem('last_login_attempt', Date.now());

        const email = `${studentId}@student.local`;
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        hideLoading();
        Swal.fire('ผิดพลาด', error.message || 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
};

window.handleRegister = async () => {
    const name = document.getElementById('reg-name').value;
    const studentId = document.getElementById('reg-student-id').value.trim();
    const password = document.getElementById('reg-password').value;
    const secret = document.getElementById('reg-secret').value.replace(/\s+/g, '');

    if(!name || !studentId || !password) return showToast('ข้อมูลไม่ครบ', 'warning');
    const email = `${studentId}@student.local`;

    try {
        showLoading();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isAdmin = secret === "ADMIN1234";

        const profileData = {
            uid: user.uid, name: name, studentId: studentId, email: email,
            role: isAdmin ? 'admin' : 'student',
            goodPoints: 0, wastePoints: 0
        };
        
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'users', user.uid), profileData);
        saveToLocal('user_data', profileData);
        hideLoading();
        Swal.fire('สำเร็จ', 'ลงทะเบียนเรียบร้อย', 'success');
    } catch (error) {
        hideLoading();
        Swal.fire('ผิดพลาด', error.message, 'error');
    }
};

window.handleLogout = () => {
    localStorage.removeItem(`${APP_ID}_user_data`);
    signOut(auth);
};

window.toggleAuthMode = () => {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
};

// --- Initialization ---
onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    if (user) {
        initApp(user);
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        window.navTo('home');
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
    loadingScreen.classList.add('opacity-0');
    setTimeout(() => loadingScreen.classList.add('hidden'), 500);
});

function initApp(user) {
    currentUser = user;
    const localData = getFromLocal('user_data');
    if(localData) {
        userData = localData;
        renderProfile(userData);
        renderStampCard(userData.wastePoints || 0);
    }

    onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
            userData = docSnap.data();
            saveToLocal('user_data', userData);
            renderProfile(userData);
            if (userData.role === 'admin') {
                document.getElementById('admin-badge').classList.remove('hidden');
                document.getElementById('admin-panel').classList.remove('hidden');
                document.getElementById('admin-post-box').classList.remove('hidden');
                document.getElementById('admin-waste-search').classList.remove('hidden');
                loadAdminTasks();
                loadAdminReports();
                loadAllStudentsForAutocomplete();
                setupStudentAutocomplete();
                loadAdminScoreboard();
                loadAdminRewards();
            }
            renderStampCard(userData.wastePoints || 0);
        }
    });
    loadAnnouncements();
    loadMyGoodDeeds();
    loadRewards();
}

// --- Navigation ---
window.navTo = (t) => {
    document.querySelectorAll('.page-content').forEach(e=>e.classList.add('hidden'));
    document.getElementById('page-'+t).classList.remove('hidden');
    document.getElementById('header-title').innerText = {'home':'ประกาศ','activity':'กิจกรรม','report':'แจ้งปัญหา','profile':'โปรไฟล์'}[t];
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active-nav','text-blue-600'));
    const btn = document.querySelector(`[data-target="${t}"]`);
    if(btn) btn.classList.add('active-nav','text-blue-600');
};

// --- Profile ---
function renderProfile(data) {
    document.getElementById('user-greeting').innerText = data.name;
    document.getElementById('profile-name').innerText = data.name;
    document.getElementById('profile-id').innerText = `ID: ${data.studentId}`;
    
    const avatarEl = document.getElementById('profile-avatar');
    if (data.avatar) {
        avatarEl.innerHTML = `<img src="${data.avatar}" class="w-full h-full object-cover rounded-full">`;
        avatarEl.classList.remove('bg-gradient-to-tr', 'from-cyan-400', 'to-blue-500', 'flex', 'items-center', 'justify-center', 'text-white', 'text-3xl');
    } else {
        avatarEl.innerText = data.name[0];
        avatarEl.classList.add('bg-gradient-to-tr', 'from-cyan-400', 'to-blue-500', 'flex', 'items-center', 'justify-center', 'text-white', 'text-3xl');
    }
    
    document.getElementById('profile-good-points').innerText = data.goodPoints || 0;
    document.getElementById('profile-waste-points').innerText = data.wastePoints || 0;
}

function renderStampCard(p) {
    const stamps = Math.floor(p/10);
    const cur = stamps%10;
    const g = document.getElementById('stamp-grid');
    document.getElementById('card-total-stamps').innerText = stamps;
    g.innerHTML = '';
    for(let i=1; i<=10; i++) g.innerHTML += `<div class="aspect-square rounded-full flex items-center justify-center ${i<=cur?'stamp-active':'stamp-inactive'}">${i<=cur?'<i class="fa-solid fa-check"></i>':i}</div>`;
}

// --- Admin Autocomplete ---
async function loadAllStudentsForAutocomplete() {
    const snapshot = await getDocs(collection(db, 'artifacts', APP_ID, 'public', 'data', 'users'));
    allStudents = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.studentId && data.name) {
            allStudents.push({ studentId: data.studentId, name: data.name });
        }
    });
}

function setupStudentAutocomplete() {
    const input = document.getElementById('search-student-id');
    const suggestionsDiv = document.getElementById('student-suggestions');
    if(!input || !suggestionsDiv) return;
    
    input.addEventListener('input', () => {
        const value = input.value.toLowerCase().trim();
        if (value.length < 1) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        const filtered = allStudents.filter(s => 
            s.studentId.toLowerCase().includes(value) || 
            s.name.toLowerCase().includes(value)
        ).slice(0, 10);
        
        if (filtered.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        suggestionsDiv.innerHTML = filtered.map(s => `
            <div class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition" onclick="selectStudent('${s.studentId}')">
                <div class="font-bold text-sm text-slate-700">${s.name}</div>
                <div class="text-xs text-slate-400">${s.studentId}</div>
            </div>
        `).join('');
        suggestionsDiv.classList.remove('hidden');
    });
    
    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 1) {
            input.dispatchEvent(new Event('input'));
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.add('hidden');
        }
    });
}

window.selectStudent = (studentId) => {
    document.getElementById('search-student-id').value = studentId;
    document.getElementById('student-suggestions').classList.add('hidden');
};

// --- Announcements ---
window.createAnnouncement = async () => {
    const t = document.getElementById('post-title').value;
    const c = document.getElementById('post-content').value;
    const img = document.getElementById('post-image').value;
    const isHighlighted = document.getElementById('post-highlighted').checked;

    if(t) {
        if (isHighlighted) {
            const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'announcements'), where("isHighlighted", "==", true));
            const snapshot = await getDocs(q);
            const batch = [];
            snapshot.forEach(d => batch.push(updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'announcements', d.id), { isHighlighted: false })));
            await Promise.all(batch);
        }

        await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'announcements'), {
            title: t, content: c, date: Date.now(), author: userData.name, imageLink: img || '', isHighlighted: isHighlighted
        });
    }
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    document.getElementById('post-highlighted').checked = false;
};

function loadAnnouncements() {
    onSnapshot(query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'announcements'), orderBy('date', 'desc')), (snap) => {
        const list = document.getElementById('announcements-list');
        list.innerHTML = '';
        if(snap.empty) list.innerHTML = '<p class="text-center text-slate-400 py-4">ยังไม่มีประกาศ</p>';
        
        let highlightedPost = null;
        snap.forEach(d => {
            const data = d.data();
            if (data.isHighlighted) highlightedPost = { id: d.id, ...data };
            
            const date = new Date(data.date).toLocaleDateString('th-TH');
            const imgHtml = data.imageLink ? `<div class="w-full overflow-hidden rounded-lg mt-2 mb-2 bg-slate-50 flex items-center justify-center"><img src="${data.imageLink}" class="max-w-full max-h-64 object-contain" onerror="this.parentElement.style.display='none'"></div>` : '';
            const highlightBadge = data.isHighlighted ? `<span class="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 border border-red-100">สำคัญ</span>` : '';
            const deleteBtn = userData && userData.role === 'admin' ? `<button onclick="deleteAnnouncement('${d.id}')" class="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors z-10 p-1"><i class="fa-solid fa-trash-can"></i></button>` : '';
            list.innerHTML += `
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-300 group" onclick="showHighlight('${d.id}')">
                    ${deleteBtn}
                    <div class="mb-3">
                        <div class="flex items-center gap-1 mb-1">
                            ${highlightBadge}
                            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">${date}</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">${data.title}</h3>
                    </div>
                    ${imgHtml}
                    <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">${data.content}</p>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100 uppercase">${data.author[0]}</div>
                            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">${data.author}</span>
                        </div>
                        <div class="flex items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            <span>อ่านต่อ</span>
                            <i class="fa-solid fa-arrow-right-long ml-2"></i>
                        </div>
                    </div>
                </div>`;
        });

        if (highlightedPost && highlightedPost.id !== lastAutoPopupId) {
            lastAutoPopupId = highlightedPost.id;
            if (highlightedPost.imageLink) {
                window.showAutoPopupImage(highlightedPost.imageLink);
            }
        }
    });
}

// ... Additional functions like loadMyGoodDeeds, loadRewards, etc. would go here ...

// Exporting to window
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.APP_ID = APP_ID;
