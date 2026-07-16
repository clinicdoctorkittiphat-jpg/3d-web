'use strict';

const CLINIC = {
  lineOA: '@drkittiphat',
  phone: '081-148-1780',
};

document.getElementById('telShow').textContent = CLINIC.phone;
const SLOT_ANY = 'ช่วงไหนก็ได้ (ให้เจ้าหน้าที่เลือกให้)';
let pickedSlot = null;

function slotsFor(dstr) {
  const day = new Date(dstr + 'T00:00:00').getDay();
  if (day === 0) return null;
  if (day === 6) return [
    { t: '09:00–09:45', d: 'ช่วงเช้า' },
    { t: '10:00–10:50', d: 'ช่วงสาย' },
    { t: '11:00–11:40', d: 'ก่อนเที่ยง' },
    { t: SLOT_ANY, d: '' },
  ];
  return [
    { t: '17:00–17:45', d: 'หัวค่ำ' },
    { t: '18:00–18:50', d: 'ช่วงกลาง' },
    { t: '19:10–19:40', d: 'ช่วงท้าย' },
    { t: SLOT_ANY, d: '' },
  ];
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function thDate(dstr) {
  return new Date(dstr + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function renderSlots() {
  const d = document.getElementById('d').value;
  const box = document.getElementById('slots');
  const closed = document.getElementById('closedMsg');
  const stepTime = document.getElementById('stepTime');
  pickedSlot = null;
  box.replaceChildren();
  if (!d) {
    closed.style.display = 'none';
    return;
  }
  const slots = slotsFor(d);
  if (!slots) {
    closed.style.display = 'block';
    stepTime.style.display = 'none';
    return;
  }
  closed.style.display = 'none';
  stepTime.style.display = 'block';
  slots.forEach((slot, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot';
    button.dataset.index = String(index);
    button.append(document.createTextNode(slot.t));
    const detail = document.createElement('small');
    detail.textContent = slot.d || '\u00a0';
    button.append(detail);
    button.addEventListener('click', () => pick(index));
    box.append(button);
  });
}

function pick(index) {
  const d = document.getElementById('d').value;
  pickedSlot = slotsFor(d)[index].t;
  document.querySelectorAll('.slot').forEach((button, buttonIndex) => {
    button.classList.toggle('on', buttonIndex === index);
  });
}

function buildMsg() {
  const d = document.getElementById('d').value;
  const nm = document.getElementById('nm').value.trim();
  const ph = document.getElementById('ph').value.trim();
  const tp = document.getElementById('tp').value;
  const sym = document.getElementById('sym').value.trim();
  const err = document.getElementById('err');
  err.classList.remove('show');
  if (!d) { err.textContent = 'กรุณาเลือกวันที่ค่ะ'; err.classList.add('show'); return null; }
  if (!slotsFor(d)) { err.textContent = 'วันอาทิตย์คลินิกปิดค่ะ กรุณาเลือกวันอื่นนะคะ'; err.classList.add('show'); return null; }
  if (d < todayStr()) { err.textContent = 'กรุณาเลือกวันที่ยังมาไม่ถึงค่ะ'; err.classList.add('show'); return null; }
  if (!pickedSlot) { err.textContent = 'กรุณาเลือกช่วงเวลาค่ะ (เลือก "ช่วงไหนก็ได้" ก็ได้นะคะ)'; err.classList.add('show'); return null; }
  if (!nm) { err.textContent = 'กรุณากรอกชื่อค่ะ'; err.classList.add('show'); return null; }
  if (!/^0\d[\d\s-]{7,}$/.test(ph)) { err.textContent = 'กรุณากรอกเบอร์โทรที่ติดต่อได้ค่ะ (ขึ้นต้นด้วย 0)'; err.classList.add('show'); return null; }
  return `ขอจองคิวค่ะ/ครับ 🙏
ชื่อ: ${nm}
เบอร์: ${ph}
วันที่สะดวก: ${thDate(d)}
ช่วงเวลา: ${pickedSlot}
มาเรื่อง: ${tp}${sym ? `
อาการ: ${sym}` : ''}
(จองผ่านหน้าเว็บ)`;
}

function showPreview(message) {
  document.getElementById('pvTxt').textContent = message;
  document.getElementById('pv').classList.add('show');
}

async function copyMessage(message, successMessage) {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(message);
    toast(successMessage);
    return true;
  } catch {
    return false;
  }
}

async function sendLine() {
  const message = buildMsg();
  if (!message) return;
  showPreview(message);
  const copied = await copyMessage(message, 'คัดลอกข้อความแล้ว — กำลังเปิด LINE ให้วางและส่งค่ะ');
  if (!copied) {
    toast('คัดลอกอัตโนมัติไม่ได้ — กดค้างที่ข้อความด้านล่างเพื่อคัดลอกเองนะคะ');
    return;
  }
  if (!CLINIC.lineOA) return;
  const oa = CLINIC.lineOA.startsWith('@') ? CLINIC.lineOA : '@' + CLINIC.lineOA;
  const chatUrl = 'https://line.me/R/oaMessage/' + encodeURIComponent(oa);
  setTimeout(() => { location.href = chatUrl; }, 450);
}

async function copyReq() {
  const message = buildMsg();
  if (!message) return;
  showPreview(message);
  const copied = await copyMessage(message, 'คัดลอกแล้ว — วางส่งใน LINE คลินิก หรือโทร ' + CLINIC.phone + ' ค่ะ');
  if (!copied) toast('คัดลอกอัตโนมัติไม่ได้ — กดค้างที่ข้อความด้านล่างเพื่อคัดลอกเองนะคะ');
}

const dateInput = document.getElementById('d');
dateInput.min = todayStr();
dateInput.addEventListener('change', renderSlots);
document.getElementById('goBtn').addEventListener('click', sendLine);
document.getElementById('copyBtn').addEventListener('click', copyReq);
renderSlots();

