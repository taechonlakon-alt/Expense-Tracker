ได้เลย ผมจัดให้เป็น **รายละเอียดโปรเจกทั้งหมดแบบครบ** สำหรับเอาไปวางแผน, เขียนรายงาน, หรือเริ่มโค้ดได้เลย โดยจะเป็นเวอร์ชัน **2 หน้า** ตามที่คุณสรุปไว้

# ชื่อโปรเจก

**Simple Income & Expense Tracker**

# ประเภทโปรเจก

เว็บแอปสำหรับบันทึกรายรับและรายจ่ายแบบง่าย โดยเน้นให้ผู้ใช้สามารถเพิ่มรายการได้ทันทีจากหน้าหลัก และดูภาพรวมสรุปทั้งหมดได้ในอีกหน้าหนึ่ง

# แนวคิดของระบบ

ระบบนี้ออกแบบมาเพื่อช่วยให้ผู้ใช้บันทึกรายรับและรายจ่ายได้สะดวก รวดเร็ว และไม่ซับซ้อน โดยลดจำนวนหน้าใช้งานให้เหลือเพียง 2 หน้า ได้แก่

* หน้าหลัก สำหรับเพิ่มรายการและดูรายการล่าสุด
* หน้าสรุป สำหรับดูยอดรวม กราฟ และข้อมูลทั้งหมดในหน้าเดียว

แนวคิดหลักคือ **เข้าแอปมาแล้วบันทึกได้เลย**

---

# วัตถุประสงค์ของโปรเจก

* ช่วยให้ผู้ใช้บันทึกรายรับและรายจ่ายได้ง่าย
* ช่วยให้ผู้ใช้เห็นภาพรวมการเงินของตนเอง
* ช่วยติดตามพฤติกรรมการใช้จ่ายผ่านข้อมูลสรุป
* ลดความยุ่งยากในการจดบันทึกแบบเดิม
* ออกแบบให้ใช้งานง่ายทั้งบนมือถือและคอมพิวเตอร์

---

# กลุ่มเป้าหมาย

* นักศึกษา
* คนทำงานทั่วไป
* ผู้ที่ต้องการติดตามค่าใช้จ่ายส่วนตัว
* ผู้ใช้ที่ต้องการระบบบันทึกการเงินแบบไม่ซับซ้อน

---

# ขอบเขตของระบบ

โปรเจกเวอร์ชันนี้จะมีขอบเขตดังนี้

## หน้าหลัก

* แสดงยอดเงินคงเหลือปัจจุบัน
* แสดงรายรับเดือนนี้
* แสดงรายจ่ายเดือนนี้
* มีปุ่มเพิ่มรายรับ
* มีปุ่มเพิ่มรายจ่าย
* แสดงรายการล่าสุด
* ไปหน้าสรุปได้

## หน้าสรุป

* แสดงรายรับทั้งหมด
* แสดงรายจ่ายทั้งหมด
* แสดงเงินคงเหลือสุทธิ
* เลือกดูข้อมูลแบบวัน / เดือน / ปี
* แสดงกราฟสรุป
* แสดงการเปรียบเทียบตามหมวดหมู่
* แสดงข้อมูลย้อนหลังทั้งหมดในหน้าเดียว

## การจัดการข้อมูล

* เพิ่มรายการได้
* แก้ไขรายการได้
* ลบรายการได้
* กรองข้อมูลตามช่วงเวลาได้

---

# ฟีเจอร์หลักของระบบ

## 1. เพิ่มรายรับ

ผู้ใช้สามารถเพิ่มข้อมูลรายรับ เช่น เงินเดือน เงินพิเศษ ค่าขายของ หรือรายรับอื่น ๆ ได้จากหน้าหลัก

ข้อมูลที่ต้องกรอก

* ประเภท
* จำนวนเงิน
* หมวดหมู่
* วันที่
* หมายเหตุ

## 2. เพิ่มรายจ่าย

ผู้ใช้สามารถเพิ่มข้อมูลรายจ่าย เช่น ค่าอาหาร ค่าเดินทาง ค่าหอ หรือค่าซื้อของได้จากหน้าหลัก

ข้อมูลที่ต้องกรอก

* ประเภท
* จำนวนเงิน
* หมวดหมู่
* วันที่
* หมายเหตุ

## 3. รายการล่าสุด

ระบบแสดงรายการล่าสุดเพื่อให้ผู้ใช้ตรวจสอบได้ว่าเพิ่งบันทึกอะไรไปบ้าง

## 4. สรุปยอด

ระบบคำนวณ

* รายรับรวม
* รายจ่ายรวม
* คงเหลือสุทธิ

## 5. กราฟสรุป

ระบบแสดงกราฟเพื่อช่วยให้ผู้ใช้มองเห็นภาพรวมการใช้เงินได้ง่ายขึ้น

## 6. เปรียบเทียบตามหมวดหมู่

ระบบสรุปว่าผู้ใช้ใช้จ่ายในหมวดไหนมากที่สุด

## 7. กรองข้อมูล

ผู้ใช้สามารถเลือกดูข้อมูลแบบ

* วัน
* เดือน
* ปี

## 8. แก้ไขและลบรายการ

ผู้ใช้สามารถแก้ไขข้อมูลที่บันทึกผิด หรือ ลบรายการที่ไม่ต้องการออกได้

---

# โครงสร้างหน้าจอ

## หน้า 1: หน้าหลัก

หน้าหลักเป็นหน้าที่ใช้บ่อยที่สุด จึงต้องออกแบบให้เพิ่มรายการได้ทันที

### องค์ประกอบของหน้าหลัก

* Header ชื่อแอป
* เมนูนำทาง
* ข้อมูลยอดเงินคงเหลือปัจจุบัน
* ข้อมูลรายรับเดือนนี้
* ข้อมูลรายจ่ายเดือนนี้
* ปุ่มเพิ่มรายรับ
* ปุ่มเพิ่มรายจ่าย
* ส่วนรายการล่าสุด
* ปุ่มดูทั้งหมดหรือไปหน้าสรุป

### หน้าที่ของหน้าหลัก

* เป็นจุดเริ่มต้นเมื่อเข้าแอป
* ใช้เพิ่มรายรับ/รายจ่ายได้ทันที
* แสดงภาพรวมแบบย่อ
* แสดงรายการล่าสุด

---

## หน้า 2: หน้าสรุป

เป็นหน้าที่รวมข้อมูลทั้งหมดไว้ในหน้าเดียว

### องค์ประกอบของหน้าสรุป

* Header
* ตัวเลือกช่วงเวลา วัน / เดือน / ปี
* ตัวเลือกเดือนหรือปี
* Card รายรับทั้งหมด
* Card รายจ่ายทั้งหมด
* Card เงินคงเหลือสุทธิ
* กราฟเปรียบเทียบ
* ส่วนสรุปตามหมวดหมู่
* ตารางหรือรายการย้อนหลังทั้งหมด
* Bottom navigation

### หน้าที่ของหน้าสรุป

* ดูข้อมูลภาพรวมทั้งหมด
* วิเคราะห์การเงิน
* เปรียบเทียบรายรับ/รายจ่าย
* ตรวจสอบประวัติรายการ

---

# Functional Requirements

## ระบบต้องสามารถ

1. เพิ่มรายการรายรับได้
2. เพิ่มรายการรายจ่ายได้
3. แสดงยอดรายรับรายเดือน
4. แสดงยอดรายจ่ายรายเดือน
5. แสดงยอดคงเหลือปัจจุบัน
6. แสดงรายการล่าสุดได้
7. แสดงข้อมูลสรุปทั้งหมดได้
8. กรองข้อมูลตามวัน เดือน ปีได้
9. แสดงกราฟสรุปได้
10. เปรียบเทียบรายจ่ายตามหมวดหมู่ได้
11. แก้ไขรายการได้
12. ลบรายการได้

---

# Non-Functional Requirements

* ระบบต้องใช้งานง่าย
* ระบบต้องตอบสนองเร็ว
* ระบบต้องรองรับการแสดงผลบนมือถือ
* ระบบต้องมี UI ที่เข้าใจง่าย
* ระบบต้องคำนวณข้อมูลได้ถูกต้อง
* ระบบต้องรองรับข้อมูลจำนวนหนึ่งได้โดยไม่ช้า
* ระบบต้องจัดเก็บข้อมูลอย่างเป็นระเบียบ

---

# ตัวอย่างหมวดหมู่

## รายรับ

* เงินเดือน
* เงินพิเศษ
* โบนัส
* ขายของ
* อื่น ๆ

## รายจ่าย

* อาหาร
* เดินทาง
* ค่าน้ำมัน
* ค่าหอ
* ค่าเรียน
* บันเทิง
* ช้อปปิ้ง
* อื่น ๆ

---

# กฎการทำงานของระบบ

* จำนวนเงินต้องมากกว่า 0
* ผู้ใช้ต้องเลือกประเภทก่อนบันทึก
* ผู้ใช้ต้องเลือกหมวดหมู่
* ผู้ใช้ต้องระบุวันที่
* หมายเหตุสามารถเว้นว่างได้
* เมื่อบันทึกรายการสำเร็จ ระบบต้องอัปเดตยอดรวมทันที
* เมื่อแก้ไขหรือลบรายการ ระบบต้องอัปเดตข้อมูลสรุปทันที

---

# โครงสร้างฐานข้อมูล

## ตาราง transactions

สำหรับเวอร์ชันเริ่มต้น ถ้าทำ user เดียวหรือยังไม่ทำ login สามารถใช้ตารางหลักเดียวก่อน

```sql
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## ถ้าต้องการขยายระบบในอนาคต

สามารถแยกเป็น 3 ตาราง

### users

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### categories

```sql
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL
);
```

### transactions

```sql
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    note VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);
```

---

# Text Stack / Tech Stack

## Frontend

* **Next.js**
  ใช้พัฒนาเว็บแอปหลัก รองรับการทำหน้าเว็บและ API ในโปรเจกต์เดียว

* **React**
  ใช้สร้าง UI แบบ component ทำให้แบ่งส่วนหน้าจอได้ชัด เช่น card, list, form, chart

* **TypeScript**
  ช่วยกำหนด type ของข้อมูล เช่น transaction, summary, filter ทำให้โค้ดปลอดภัยและแก้บั๊กง่ายขึ้น

* **Tailwind CSS**
  ใช้จัดสไตล์ UI ให้พัฒนาเร็ว เหมาะกับงานที่มีการออกแบบหน้าตาชัดเจนจาก Figma

* **shadcn/ui**
  ใช้เป็นชุด component สำเร็จรูป เช่น button, dialog, input, card, tabs ช่วยลดเวลาทำ UI

## Backend

* **Next.js Route Handlers / API Routes**
  ใช้สร้าง API สำหรับเพิ่ม ดึง แก้ไข ลบรายการ

## Database

* **MySQL**
  เหมาะกับงานโปรเจกต์ทั่วไป ใช้ง่ายและเป็นที่นิยม

หรือ

* **PostgreSQL**
  ถ้าอยากได้ระบบที่ขยายต่อได้ดีและทำงานร่วมกับ Prisma ได้ดีมาก

## ORM

* **Prisma**
  ใช้เชื่อมฐานข้อมูลกับแอป ช่วยให้ query ข้อมูลง่ายขึ้นและลดความผิดพลาดจาก SQL ดิบ

## Chart Library

* **Recharts**
  ใช้ทำกราฟในหน้าสรุป เช่น bar chart และ pie chart โดยทำงานร่วมกับ React ได้ดี

## State Management

* **React useState / useMemo / useEffect**
  สำหรับโปรเจกต์นี้ยังไม่จำเป็นต้องใช้ state management ใหญ่ ๆ

## Validation

* **Zod**
  ใช้ตรวจสอบข้อมูลจาก form เช่น amount ต้องมากกว่า 0, category ต้องไม่ว่าง

## Date Utility

* **dayjs**
  ใช้จัดการวัน เดือน ปี เช่น filter แบบวัน/เดือน/ปี และ format วันที่

## Notification

* **sonner**
  ใช้แสดง toast เช่น “บันทึกสำเร็จ”, “ลบรายการสำเร็จ”

---

# สรุป Tech Stack ที่แนะนำที่สุด

ถ้าจะเอาแบบสมดุล ใช้ง่าย และเหมาะกับโปรเจกต์นี้ ผมแนะนำชุดนี้:

```text
Frontend: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui
Backend: Next.js API Routes / Route Handlers
Database: MySQL
ORM: Prisma
Charts: Recharts
Validation: Zod
Date Library: dayjs
Toast/Notification: sonner
```

---

# โครงสร้างไฟล์ที่แนะนำ

```text
src/
  app/
    page.tsx
    summary/
      page.tsx
    api/
      transactions/
        route.ts
      summary/
        route.ts

  components/
    home/
      BalanceSection.tsx
      IncomeExpenseCard.tsx
      QuickActionButtons.tsx
      TransactionFormModal.tsx
      RecentTransactionList.tsx

    summary/
      SummaryHeader.tsx
      SummaryCards.tsx
      SummaryFilter.tsx
      SummaryChart.tsx
      CategoryComparison.tsx
      FullTransactionList.tsx

    shared/
      Navbar.tsx
      BottomNav.tsx
      EmptyState.tsx

  lib/
    prisma.ts
    utils.ts
    format.ts
    summary.ts

  types/
    transaction.ts
    summary.ts

  data/
    mock-transactions.ts
```

---

# ประเภทข้อมูลที่ต้องใช้

## Transaction

```ts
type TransactionType = "income" | "expense"

type Transaction = {
  id: number
  type: TransactionType
  amount: number
  category: string
  note?: string
  transactionDate: string
  createdAt: string
}
```

## Summary

```ts
type Summary = {
  totalIncome: number
  totalExpense: number
  balance: number
}
```

---

# API ที่ควรมี

## เพิ่มรายการ

`POST /api/transactions`

## ดึงรายการทั้งหมด

`GET /api/transactions`

## แก้ไขรายการ

`PUT /api/transactions/:id`

## ลบรายการ

`DELETE /api/transactions/:id`

## ดึงข้อมูลสรุป

`GET /api/summary`

---

# ลำดับการพัฒนาโปรเจก

## Phase 1: Setup

* สร้างโปรเจกต์ Next.js
* ติดตั้ง Tailwind
* ติดตั้ง shadcn/ui
* สร้าง folder structure
* เตรียม mock data

## Phase 2: UI

* ทำหน้าหลักให้ตรงกับดีไซน์
* ทำหน้าสรุปให้ตรงกับดีไซน์
* ทำ navigation ระหว่าง 2 หน้า

## Phase 3: Logic

* เขียน function คำนวณรายรับ/รายจ่าย/คงเหลือ
* เขียน filter วัน/เดือน/ปี
* เตรียมข้อมูลสำหรับกราฟ

## Phase 4: Form

* ทำ modal หรือ dialog เพิ่มรายการ
* validate ข้อมูล
* เพิ่ม toast แจ้งผล

## Phase 5: Database

* สร้าง schema Prisma
* migrate database
* เชื่อม CRUD กับ API

## Phase 6: Summary

* ดึงข้อมูลจริงมาแสดง
* ทำกราฟ
* แสดง compare by category

## Phase 7: Polish

* empty state
* loading state
* responsive
* animation เบา ๆ

---

# ตัวอย่าง Flow การทำงาน 1 เคส

## เคส: ผู้ใช้เพิ่มรายจ่ายค่าอาหารจากหน้าหลัก

### เงื่อนไขก่อนเริ่ม

* ผู้ใช้อยู่หน้าหลัก
* ระบบพร้อมรับข้อมูล

### ขั้นตอน

1. ผู้ใช้กดปุ่ม “เพิ่มรายจ่าย”
2. ระบบเปิดฟอร์มเพิ่มรายการ
3. ผู้ใช้กรอกจำนวนเงิน 120 บาท
4. ผู้ใช้เลือกหมวดหมู่ “อาหาร”
5. ผู้ใช้เลือกวันที่
6. ผู้ใช้ใส่หมายเหตุ “ข้าวกลางวัน”
7. ผู้ใช้กดบันทึก
8. ระบบตรวจสอบข้อมูล
9. ระบบบันทึกข้อมูลลงฐานข้อมูล
10. ระบบอัปเดตรายการล่าสุด
11. ระบบคำนวณยอดรายจ่ายใหม่
12. ระบบคำนวณคงเหลือใหม่
13. ระบบแสดงข้อความ “บันทึกสำเร็จ”

### ผลลัพธ์

* มีรายการใหม่ในระบบ
* หน้าหลักอัปเดตทันที
* หน้าสรุปดึงข้อมูลใหม่ไปแสดงได้

---

# จุดเด่นของโปรเจกนี้

* โครงสร้างไม่ใหญ่เกินไป
* ตรงกับ UI ที่คุณออกแบบ
* เหมาะกับการทำเป็นโปรเจกต์นักศึกษา
* เขียนโค้ดเป็นขั้นตอนได้ง่าย
* ขยายต่อในอนาคตได้ เช่น login, budget, export

---

# เวอร์ชันแรกที่แนะนำให้ทำก่อน

ให้เริ่มจากเวอร์ชันนี้ก่อน

* 2 หน้า
* เพิ่มรายการ
* ลบรายการ
* แสดงรายการล่าสุด
* แสดง summary
* แสดง bar chart
* filter วัน/เดือน/ปี

ยังไม่ต้องทำ

* หลาย user
* login/register
* export PDF
* แจ้งเตือนงบเกิน

---

ถ้าคุณต้องการ ผมช่วยต่อให้เป็น **Prisma schema**, **โครงสร้าง DB แบบพร้อมใช้**, หรือ **roadmap ลงมือทำทีละไฟล์ใน Next.js** ได้ทันที
