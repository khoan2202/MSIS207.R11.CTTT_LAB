# TASK DECOMPOSITION

## WEB APPLICATION DEVELOPMENT – LAB 1
### Tên bài:
Developer Portfolio & Resilient Web Components
### Mục tiêu:
Xây dựng một website Portfolio có cấu trúc HTML ngữ nghĩa,
giao diện Responsive, hỗ trợ Light/Dark Mode và một Component
có khả năng xử lý các trạng thái Loading, Live Data, Empty và Error.
---

# 1. QUY TRÌNH THỰC HIỆN
Bài tập được chia thành nhiều task nhỏ để có thể:

1. Xây dựng từng phần riêng biệt.
2. Kiểm tra từng phần sau khi hoàn thành.
3. Sửa lỗi trước khi chuyển sang task tiếp theo.
4. Tạo Git commit riêng cho từng phần.
5. Không xây dựng toàn bộ website trong một lần.

Quy trình thực hiện:

T-01
↓
Kiểm tra HTML
↓
Commit

T-02A
↓
Kiểm tra CSS nền tảng
↓
Commit

T-02B
↓
Kiểm tra Responsive
↓
Commit

T-02C
↓
Kiểm tra Dark/Light Mode
↓
Commit

T-03A
↓
Kiểm tra Loading
↓
Commit

T-03B
↓
Kiểm tra Live Data
↓
Commit

T-03C
↓
Kiểm tra Empty/Error/Retry
↓
Commit

Cuối cùng:
Kiểm tra toàn bộ website
↓
Kiểm tra Accessibility
↓
Kiểm tra Responsive
↓
Kiểm tra Console
↓
Kiểm tra Git History

---

# 2. T-01 – SEMANTIC DOM & ACCESSIBILITY
## 2.1. Mục tiêu
Xây dựng cấu trúc HTML đầu tiên của website bằng các thẻ
HTML có ý nghĩa.
Ở bước này chỉ tập trung vào cấu trúc HTML.
Chưa tập trung vào giao diện CSS.
Chưa triển khai JavaScript.
---
## 2.2. Công việc
Tạo file:
index.html
Xây dựng các thành phần:
- Skip Link
- Header
- Navigation
- Main
- Section
- Article
- Contact Form
- Footer
---

## 2.3. Yêu cầu kỹ thuật
- Sử dụng HTML5 Semantic Elements.
- Có đúng một thẻ `<h1>`.
- Có cấu trúc Heading hợp lý.
- Có Skip Link.
- Có `id="main-content"` cho nội dung chính.
- Navigation có thể sử dụng bằng bàn phím.
- Không sử dụng `<div>` không cần thiết.
---

## 2.4. Cấu trúc dự kiến

HTML
│
├── Skip Link
│
├── Header
│   └── H1
│
├── Navigation
│
├── Main
│   │
│   ├── About Section
│   │
│   ├── Skills Section
│   │
│   ├── Projects Section
│   │   └── Article
│   │
│   └── Contact Section
│       └── Form
│
└── Footer
---

## 2.5. Kiểm tra
Sau khi hoàn thành:

* Kiểm tra có đúng 1 `<h1>`.
* Tìm `<div>` và kiểm tra các thẻ không cần thiết.
* Kiểm tra Skip Link.
* Kiểm tra Navigation.
* Kiểm tra cấu trúc Landmark bằng Chrome DevTools.
* Kiểm tra điều hướng bằng phím Tab.
---

## 2.6. Kết qua cần đạt
HTML phải chạy được trên trình duyệt.
Cấu trúc phải rõ ràng và có ý nghĩa ngay cả khi chưa có CSS.
---

## 2.7. Git Commit
```bash
git add index.html
git commit -m "feat(html): xây dựng cấu trúc landmark ngữ nghĩa"
```
---

# 3. T-02A – CSS TOKENS & RESET
## 3.1. Mục tiêu
Sau khi hoàn thành HTML, bắt đầu xây dựng nền tảng CSS.

Ở bước này tập trung vào:
* CSS Variables
* Reset
* Box Model
* Typography cơ bản
---

## 3.2. Công việc
Tạo file:
style.css
Khai báo các CSS Custom Properties.
Ví dụ:
```css
:root {
    --bg-primary: ...;
    --bg-secondary: ...;
    --text-primary: ...;
    --text-secondary: ...;
    --accent: ...;
    --accent-hover: ...;
    --card-bg: ...;
    --border-color: ...;
}
```
---

## 3.3. CSS Reset
Thiết lập:
```css
*,
*::before,
*::after {
    box-sizing: border-box;
}
```
Đồng thời thiết lập các thuộc tính cơ bản cho:
* body
* heading
* paragraph
* links
* buttons
* lists
---

## 3.4. Kiểm tra
* Website vẫn hiển thị bình thường.
* CSS được tải thành công.
* CSS Variables hoạt động.
* `box-sizing` hoạt động.
* Không xuất hiện lỗi Console.
---

## 3.5. Git Commit
```bash
git add style.css
git commit -m "feat(css): thêm design tokens và reset"
```
---

# 4. T-02B – RESPONSIVE GRID
## 4.1. Mục tiêu
Xây dựng bố cục Responsive bằng CSS Grid.
---

## 4.2. Công việc
Áp dụng CSS Grid cho:
* Skill
* Projects
* Data Cards

Sử dụng cấu trúc:
```css
grid-template-columns:
    repeat(auto-fit, minmax(280px, 1fr));
```
---

## 4.3. Responsive Requirement
Phải kiểm tra ít nhất:
```text
375px
768px
1024px
1440px
```
---

## 4.4. Kiểm tra
Tại kích thước 375px:
* Không có thanh cuộn ngang.
* Nội dung không bị tràn.
* Card tự động xuống dòng.
* Text vẫn đọc được.
* Button vẫn sử dụng được.
---

## 4.5. Kiểm tra bằng Chrome DevTools
Mở:
```text
F12
→ Toggle Device Toolbar
```
Kiểm tra viewport:
```text
375px
```
---

## 4.6. Git Commit
```bash
git add style.css
git commit -m "feat(css): xây dựng bố cục grid responsive"
```
---

# 5. T-02C – LIGHT / DARK THEME
## 5.1. Mục tiêu
Thêm chức năng chuyển đổi giữa:
* Light Mode
* Dark Mode
---

## 5.2. Công việc
Thêm một nút chuyển đổi Theme.
Nút phải có:
```html
aria-pressed
```
---

## 5.3. Lưu trạng thái
Sử dụng:
```javascript
localStorage
```
Key:
```text
theme
```
Giá trị có thể là:
```text
light
dark
```
---

## 5.4. Hành vi mong muốn
Khi người dùng bấm nút:
```text
Light
↓
Dark
```
hoặc:
```text
Dark
↓
Light
```
Sau khi Reload:

```text
Reload
↓
Đọc localStorage
↓
Khôi phục theme trước đó
```

---

## 5.5. Kiểm tra

1. Mở website.
2. Bấm nút Theme.
3. Kiểm tra giao diện.
4. Reload trang.
5. Kiểm tra Theme vẫn được giữ.
6. Kiểm tra `localStorage`.
7. Kiểm tra Console.

---

## 5.6. Git Commit

```bash
git add index.html style.css script.js
git commit -m "feat(js): triển khai bộ chuyển đổi giao diện"
```

---

# 6. T-03A – LOADING STATE

## 6.1. Mục tiêu

Tạo trạng thái Loading trước khi dữ liệu được hiển thị.

---

## 6.2. Công việc

Tạo Skeleton Loading bằng CSS.

Skeleton cần có:

* kích thước rõ ràng
* border-radius
* animation

Tạo hiệu ứng Shimmer.

---

## 6.3. Luồng hoạt động

```text
Mở Component
      ↓
Loading
      ↓
Chờ dữ liệu
```

---

## 6.4. Kiểm tra

Khi Component bắt đầu chạy:

```text
Loading Skeleton
```

phải xuất hiện trước dữ liệu.

---

## 6.5. Git Commit

```bash
git add resilient.html style.css
git commit -m "feat(css): thêm loading skeleton"
```

---

# 7. T-03B – LIVE DATA STATE

## 7.1. Mục tiêu

Hiển thị dữ liệu Project bằng JavaScript.

---

## 7.2. Dữ liệu

Mỗi Project gồm:

```text
name
technology
description
```

Ví dụ:

```javascript
{
    name: "Portfolio Website",
    technology: "HTML + CSS",
    description: "Responsive developer portfolio."
}
```

---

## 7.3. Công việc

JavaScript sẽ:

1. Nhận dữ liệu.
2. Tạo các phần tử DOM.
3. Đưa dữ liệu vào phần tử.
4. Hiển thị danh sách.

---

## 7.4. Yêu cầu bảo mật

Không chèn dữ liệu động bằng cách không an toàn.

Ưu tiên:

```javascript
textContent
```

thay vì:

```javascript
innerHTML
```

đối với dữ liệu có thể đến từ nguồn bên ngoài.

---

## 7.5. Kiểm tra

* Dữ liệu xuất hiện.
* Nội dung đúng.
* Không có lỗi Console.
* Không tạo HTML không cần thiết.
* Không xảy ra lỗi khi dữ liệu thay đổi.

---

## 7.6. Git Commit

```bash
git add resilient.js
git commit -m "feat(js): hiển thị dữ liệu project"
```

---

# 8. T-03C – EMPTY / ERROR / RETRY

## 8.1. Mục tiêu

Component phải xử lý được nhiều trạng thái khác nhau.

---

## 8.2. Các trạng thái

```text
Loading
   ↓
Live Data
```

Hoặc:

```text
Loading
   ↓
Empty
```

Hoặc:

```text
Loading
   ↓
Error
   ↓
Retry
   ↓
Loading
```

---

# 9. EMPTY STATE

## 9.1. Điều kiện

Nếu danh sách dữ liệu không có phần tử:

```javascript
[]
```

thì hiển thị Empty State.

---

## 9.2. Nội dung

Ví dụ:

```text
Không tìm thấy dự án
```

Có nút:

```text
Thử lại
```

---

## 9.3. Kiểm tra

* Dữ liệu rỗng.
* Empty State xuất hiện.
* Nút Retry có thể sử dụng.
* Có thể thực hiện lại quá trình tải.

---

# 10. ERROR STATE

## 10.1. Điều kiện

Nếu quá trình lấy dữ liệu xảy ra lỗi:

```text
Error
```

thì hiển thị Error State.

---

## 10.2. Nội dung

Ví dụ:

```text
Đã xảy ra lỗi
Không thể tải dữ liệu.
```

Có nút:

```text
Thử lại
```

---

## 10.3. Kiểm tra

* Error State xuất hiện.
* Retry hoạt động.
* Không có lỗi JavaScript không được xử lý.
* Người dùng biết phải làm gì tiếp theo.

---

## 10.4. Git Commit

```bash
git add resilient.html resilient.js
git commit -m "feat(js): xử lý trạng thái empty error và retry"
```

---

# 11. KIỂM TRA ACCESSIBILITY

## 11.1. Skip Link

Dùng:

```text
Tab
```

để kiểm tra Skip Link.

---

## 11.2. Navigation

Kiểm tra:

```text
Tab
Shift + Tab
Enter
```

---

## 11.3. Form

Kiểm tra:

* Label.
* Input.
* Email.
* Textarea.
* Button.
* Native validation.

---

## 11.4. Theme Button

Kiểm tra:

```html
aria-pressed
```

Giá trị phải thay đổi phù hợp với trạng thái.

---

# 12. KIỂM TRA RESPONSIVE

Kiểm tra ít nhất:

```text
375px
768px
1024px
1440px
```

Đặc biệt tại:

```text
375px
```

phải đảm bảo:

* Không có horizontal scroll.
* Nội dung không bị cắt.
* Card không vượt khỏi màn hình.
* Navigation vẫn sử dụng được.
* Form không bị tràn.

---

# 13. KIỂM TRA CONSOLE

Mở:

```text
F12
→ Console
```

Kiểm tra:

```text
Không có JavaScript Error
Không có lỗi không tìm thấy phần tử
Không có lỗi localStorage
```

---

# 14. KIỂM TRA GIT

Sau khi hoàn thành từng task:

```bash
git status
```

Kiểm tra thay đổi.

Sau đó:

```bash
git diff
```

Xem chính xác phần code vừa thay đổi.

Chỉ sau khi kiểm tra mới commit.

---

# 15. LỊCH SỬ COMMIT DỰ KIẾN

Lịch sử Git cần thể hiện quá trình phát triển từng bước.

Ví dụ:

```text
1. docs(spec): phân rã yêu cầu bài tập
2. feat(html): xây dựng cấu trúc landmark ngữ nghĩa
3. feat(css): thêm design tokens và reset
4. feat(css): xây dựng bố cục grid responsive
5. feat(js): triển khai bộ chuyển đổi giao diện
6. feat(css): thêm loading skeleton
7. feat(js): hiển thị dữ liệu project
8. feat(js): xử lý trạng thái empty error và retry
9. fix(a11y): sửa lỗi accessibility
10. fix(responsive): sửa lỗi giao diện 375px
```

Mỗi commit chỉ nên tập trung vào một nhóm thay đổi liên quan.

---

# 16. CÁCH LÀM VIỆC VỚI AI

Trong quá trình thực hiện, không yêu cầu AI tạo toàn bộ project trong một lần.

Quy trình sử dụng AI:

```text
Đọc yêu cầu
    ↓
Chia thành Task
    ↓
Hỏi AI về Task hiện tại
    ↓
Hiểu code
    ↓
Tự đưa code vào project
    ↓
Chạy thử
    ↓
Phát hiện lỗi
    ↓
Hỏi AI sửa lỗi cụ thể
    ↓
Kiểm tra lại
    ↓
Commit
    ↓
Task tiếp theo
```

Không sử dụng quy trình:

```text
Đưa toàn bộ đề
    ↓
Yêu cầu AI tạo toàn bộ source
    ↓
Copy toàn bộ
    ↓
Commit một lần
```

---

# 17. BẰNG CHỨNG QUÁ TRÌNH

Để chứng minh quá trình phát triển, có thể lưu lại:

* `TASK_DECOMPOSITION.md`
* Git commit history
* Git diff
* Chrome DevTools
* Accessibility kiểm tra
* Responsive kiểm tra
* Console kiểm tra

Các bằng chứng này giúp thể hiện rằng website được xây dựng và kiểm tra theo từng task.

---

# 18. CHECKLIST CUỐI CÙNG

## HTML

* [ ] Có DOCTYPE
* [ ] Có `lang`
* [ ] Có `meta charset`
* [ ] Có viewport
* [ ] Có một H1
* [ ] Có Header
* [ ] Có Navigation
* [ ] Có Main
* [ ] Có Section
* [ ] Có Article
* [ ] Có Footer
* [ ] Có Skip Link

## CSS

* [ ] Có CSS Variables
* [ ] Có Reset
* [ ] Có box-sizing
* [ ] Có CSS Grid
* [ ] Có Responsive Layout
* [ ] Kiểm tra 375px
* [ ] Không có horizontal scroll

## JavaScript

* [ ] Theme Switcher
* [ ] aria-pressed
* [ ] localStorage
* [ ] Loading State
* [ ] Live Data
* [ ] Empty State
* [ ] Error State
* [ ] Retry

## Accessibility

* [ ] Skip Link hoạt động
* [ ] Navigation bằng Tab
* [ ] Navigation bằng Enter
* [ ] Form có Label
* [ ] Button có thể Focus
* [ ] Kiểm tra Accessibility Tree

## Kiểm tra cuối

* [ ] Không có Console Error
* [ ] Không có lỗi JavaScript
* [ ] Responsive tại 375px
* [ ] Dark Mode hoạt động
* [ ] Theme vẫn giữ sau Reload
* [ ] Retry hoạt động
* [ ] Git History có nhiều commit

---

# 19. TRẠNG THÁI HOÀN THÀNH

Bài được xem là hoàn thành sau khi:

```text
TASK DECOMPOSITION
        ↓
T-01 HTML
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-02A CSS
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-02B Responsive
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-02C Theme
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-03A Loading
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-03B Live Data
        ↓
Kiểm tra
        ↓
Commit
        ↓
T-03C Empty/Error/Retry
        ↓
Kiểm tra
        ↓
Commit
        ↓
Accessibility Audit
        ↓
Responsive Audit
        ↓
Console Audit
        ↓
Hoàn thành
```

---

# KẾT LUẬN

Mục tiêu của việc phân rã công việc là chia bài tập lớn thành
các task nhỏ có thể thực hiện, kiểm tra và commit độc lập.

Mỗi task được hoàn thành theo chu trình:

Yêu cầu
→ Triển khai
→ Kiểm tra
→ Sửa lỗi
→ Commit

Không triển khai toàn bộ website trong một lần.

```
### Quan trọng
File trên giúp **thể hiện quy trình phát triển từng phần**, nhưng đừng cố tạo bằng chứng giả rằng bạn đã làm những bước mà thực tế chưa làm. Cách chắc nhất để thầy thấy quá trình là từ **bây giờ mình làm đúng từng bước**:

**T-01 → test → commit → T-02A → test → commit → T-02B...**

Và khi đến từng bước, mình sẽ chỉ đưa cho bạn **phần code của bước đó**, giải thích bằng tiếng Việt, rồi cho bạn test trước khi sang bước tiếp theo. Điều này cũng phù hợp với yêu cầu atomic commit trong đề.