import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hash("123456", 10);

  const [adminUser, staffUser] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "admin@example.com",
        password: defaultPasswordHash,
        name: "Admin Demo",
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: "staff@example.com",
        password: defaultPasswordHash,
        name: "Staff Demo",
        role: UserRole.STAFF,
      },
    }),
  ]);

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Bắt đầu sử dụng",
        slug: "getting-started",
        description: "Các hướng dẫn cơ bản cho người mới bắt đầu",
        iconUrl: "rocket",
        sortOrder: 1,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Quản lý đơn hàng",
        slug: "order-management",
        description: "Quy trình xử lý đơn hàng và vận chuyển",
        iconUrl: "shopping-bag",
        sortOrder: 2,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Thiết bị phần cứng",
        slug: "hardware",
        description: "Kết nối máy in, máy quét",
        iconUrl: "monitor",
        sortOrder: 3,
        articleCount: 1,
        languageCode: "vi",
      },
    })
  ]);

  const mdLogin = `
# Hướng dẫn Đăng nhập và Khởi tạo Hệ thống

Chào mừng bạn đến với hệ thống CataPos. Bài viết này sẽ hướng dẫn bạn cách đăng nhập lần đầu và làm quen với giao diện chính.

## 1. Đăng nhập vào hệ thống
1. Mở trình duyệt web (Google Chrome hoặc Safari).
2. Truy cập vào đường dẫn trang quản trị mà bạn được cấp.
3. Nhập **Email** và **Mật khẩu** của bạn.
4. Bấm nút **Đăng nhập**.

Nếu bạn quên mật khẩu, hãy bấm vào nút "Quên mật khẩu" và làm theo hướng dẫn gửi về email.

## 2. Giới thiệu Giao diện chính
Sau khi đăng nhập thành công, bạn sẽ thấy các mục:
- **Tổng quan (Dashboard):** Hiển thị doanh thu, số lượng đơn hàng trong ngày.
- **Bán hàng (POS):** Nơi nhân viên thu ngân tạo đơn hàng và thanh toán.
- **Sản phẩm:** Quản lý danh sách hàng hoá, giá bán.
- **Báo cáo:** Thống kê chi tiết doanh thu theo ngày/tháng.
`;

  const mdOrder = `
# Quy trình xử lý Đơn hàng cơ bản

Hướng dẫn nhân viên thu ngân cách tạo đơn hàng và thanh toán nhanh chóng.

## Tạo đơn hàng mới
1. Chọn mục **Bán hàng** trên menu.
2. Tìm sản phẩm bằng cách quét mã vạch hoặc gõ tên.
3. Chọn khách hàng (nếu có) hoặc để mặc định là *Khách lẻ*.
4. Bấm **Thanh toán**.

## Xử lý hoàn trả
Nếu khách hàng muốn trả lại hàng:
1. Vào mục **Lịch sử đơn hàng**.
2. Tìm đơn hàng cần hoàn.
3. Bấm nút **Hoàn trả** và chọn lý do.
`;

  const mdPrinter = `
# Hướng dẫn Kết nối Máy in Hoá đơn

## 1. Cắm cáp
Cắm cáp USB từ máy in vào máy tính thu ngân. Bật công tắc nguồn máy in.

## 2. Cài đặt trên phần mềm
1. Vào mục **Cài đặt > Máy in**.
2. Bấm **Thêm máy in**, hệ thống sẽ tự quét cổng USB.
3. In thử một hoá đơn để kiểm tra.
`;

  const articles = await prisma.article.createManyAndReturn({
    data: [
      {
        categoryId: categories[0].id, // Bat dau su dung
        type: "USER_MANUAL",
        status: "PUBLISHED",
        title: "Hướng dẫn Đăng nhập và Khởi tạo Hệ thống",
        slug: "huong-dan-dang-nhap",
        summary: "Cách đăng nhập lần đầu và làm quen giao diện.",
        content: mdLogin,
        contentType: "markdown",
        tags: ["đăng nhập", "cơ bản"],
        contextPaths: ["/login"],
        viewCount: 1542,
        helpfulCount: 320,
        notHelpfulCount: 5,
        isFeatured: true,
        isPinned: true,
        authorId: adminUser.id,
        publishedAt: new Date("2025-01-10T09:30:00Z"),
        languageCode: "vi",
      },
      {
        categoryId: categories[1].id, // Quan ly don hang
        type: "BUSINESS_PLAYBOOK",
        status: "PUBLISHED",
        title: "Quy trình xử lý Đơn hàng cơ bản",
        slug: "xu-ly-don-hang",
        summary: "Cách tạo đơn hàng bằng mã vạch và in bill.",
        content: mdOrder,
        contentType: "markdown",
        tags: ["đơn hàng", "bán hàng"],
        contextPaths: ["/sales"],
        viewCount: 890,
        helpfulCount: 150,
        notHelpfulCount: 2,
        isFeatured: true,
        isPinned: false,
        authorId: adminUser.id,
        publishedAt: new Date("2025-01-15T14:20:00Z"),
        languageCode: "vi",
      },
      {
        categoryId: categories[2].id, // Thiet bi phan cung
        type: "USER_MANUAL",
        status: "PUBLISHED",
        title: "Hướng dẫn kết nối máy in hoá đơn",
        slug: "ket-noi-may-in-hoa-don",
        summary: "Cách cài đặt máy in qua cổng USB.",
        content: mdPrinter,
        contentType: "markdown",
        tags: ["máy in", "phần cứng"],
        contextPaths: ["/settings"],
        viewCount: 650,
        helpfulCount: 89,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: false,
        authorId: adminUser.id,
        publishedAt: new Date("2025-02-01T10:00:00Z"),
        languageCode: "vi",
      }
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
