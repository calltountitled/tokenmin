# TokenMin — website scaffold (bản dựng thử)

> Trạng thái: **scaffold dựng thử cho kỹ thuật**, KHÔNG phải website đã công bố. Mọi nội dung là placeholder.

## Vì sao là scaffold, không phải nội dung hoàn chỉnh

Brief yêu cầu "phát triển nội dung website + SEO cho tokenmin". Tại 2026-11-23, brief sản phẩm chưa đủ để viết nội dung bán hàng trung thực. Bằng chứng công khai (không đăng nhập) kiểm cùng ngày:

| Hạng mục | Trạng thái | Nguồn |
|---|---|---|
| Repo `calltountitled/tokenmin` | chỉ có `README.md` rỗng (0 byte) | GitHub API |
| Tên "tokenmin" | trùng >=8 chủ thể khác | DuckDuckGo HTML |
| Google Xu hướng VN "tokenmin" | không đủ dữ liệu | Google Trends |
| Tên/domain, danh mục, giá, use case | chưa có | brief thiếu |

Repo này vì vậy chứa **khung nội dung trung tính + SEO + build demo**. Chỗ chưa chốt để ở dạng `{{...}}` hoặc gắn nhãn "chưa xác minh". Không bịa số liệu, giá hay tuyên bố sản phẩm.

## Cấu trúc

```
src/site.config.json      # cấu hình site (tên, baseUrl, locale) - có nhãn placeholder
src/data/pages.json       # nội dung trang
src/data/keywords.json    # khung cụm từ khoá có điều kiện (giả thuyết)
src/templates/layout.html # layout dùng chung
scripts/build.mjs         # dựng tĩnh -> dist/
scripts/verify.mjs        # test tập trung trên dist/
static/                   # css, robots.txt
reports/                  # nhật ký build/verify
```

## Lệnh

```bash
node scripts/build.mjs    # -> dist/
node scripts/verify.mjs   # test: title/meta/canonical/h1/sitemap/liên kết nội bộ
```

Node >=18, không cần dependency ngoài (chỉ module chuẩn).

## Giới hạn cần chốt trước khi công bố

1. Tên/domain chính thức + quyền dùng tên "tokenmin".
2. Danh mục sản phẩm và mô hình thương mại.
3. 3-5 use case có số liệu.
4. Xác nhận sản phẩm KHÔNG bán lại quyền truy cập subscription dưới dạng API key (rủi ro vi phạm ToS nhà cung cấp cấp trên).
