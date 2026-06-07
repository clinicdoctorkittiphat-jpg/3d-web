document.querySelector("#app").innerHTML = `
  <main class="page-shell">
    <section class="hero" aria-labelledby="clinic-title">
      <div class="hero-copy">
        <p class="eyebrow">Orthopedic Clinic · Phuket</p>
        <h1 id="clinic-title">คลินิกกระดูกและข้อหมอกิตติพัฐ</h1>
        <p class="lead">
          ดูแลอาการปวดกระดูก ข้อ กล้ามเนื้อ และการเคลื่อนไหว ด้วยแนวทางที่เข้าใจง่าย
          เหมาะกับผู้ป่วยทุกวัย ตั้งแต่คนทำงาน นักกีฬา ไปจนถึงผู้สูงอายุ
        </p>
        <div class="hero-actions" aria-label="ช่องทางติดต่อ">
          <a class="button primary" href="https://www.facebook.com/p/%E0%B8%84%E0%B8%A5%E0%B8%B4%E0%B8%99%E0%B8%B4%E0%B8%81%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B9%E0%B8%81%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B8%81%E0%B8%B4%E0%B8%95%E0%B8%95%E0%B8%B4%E0%B8%9E%E0%B8%B1%E0%B8%90-61574564440969/" target="_blank" rel="noreferrer">เปิด Facebook</a>
          <a class="button secondary" href="#services">ดูบริการ</a>
        </div>
      </div>

      <div class="motion-stage" aria-label="ภาพเคลื่อนไหวสามมิติโครงสร้างข้อ">
        <div class="joint-model">
          <span class="orb orb-a"></span>
          <span class="orb orb-b"></span>
          <span class="orb orb-c"></span>
          <span class="bone bone-one"></span>
          <span class="bone bone-two"></span>
          <span class="bone bone-three"></span>
          <span class="pulse-ring"></span>
        </div>
      </div>
    </section>

    <section class="info-band" id="services" aria-label="บริการหลัก">
      <article>
        <span class="number">01</span>
        <h2>ตรวจอาการปวดข้อ</h2>
        <p>ปวดเข่า ปวดไหล่ ข้อฝืด ข้อเสื่อม หรืออาการบาดเจ็บจากการใช้งานซ้ำ</p>
      </article>
      <article>
        <span class="number">02</span>
        <h2>กระดูกสันหลังและกล้ามเนื้อ</h2>
        <p>ปวดคอ ปวดหลัง ชาร้าวลงแขนหรือขา และอาการจากท่าทางการทำงาน</p>
      </article>
      <article>
        <span class="number">03</span>
        <h2>ฟื้นฟูการเคลื่อนไหว</h2>
        <p>วางแผนดูแลหลังบาดเจ็บ ช่วยให้กลับไปใช้ชีวิตประจำวันได้มั่นใจขึ้น</p>
      </article>
    </section>

    <section class="contact-strip" aria-label="ข้อมูลติดต่อ">
      <div>
        <p class="eyebrow">Contact</p>
        <h2>นัดตรวจหรือสอบถามข้อมูลเพิ่มเติม</h2>
      </div>
      <a class="button primary" href="https://www.facebook.com/p/%E0%B8%84%E0%B8%A5%E0%B8%B4%E0%B8%99%E0%B8%B4%E0%B8%81%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B9%E0%B8%81%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B8%81%E0%B8%B4%E0%B8%95%E0%B8%95%E0%B8%B4%E0%B8%9E%E0%B8%B1%E0%B8%90-61574564440969/" target="_blank" rel="noreferrer">ติดต่อทางเพจ</a>
    </section>
  </main>
`;
