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
        name: "Thiết bị phần cứng",
        slug: "hardware",
        description: "Hướng dẫn cài đặt máy in, máy quét mã vạch và ngăn kéo đựng tiền",
        iconUrl: "monitor",
        sortOrder: 1,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bán hàng & Đơn hàng",
        slug: "sales",
        description: "Quy trình bán hàng, thanh toán và xử lý đơn hàng",
        iconUrl: "shopping-cart",
        sortOrder: 2,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Quản lý kho",
        slug: "inventory",
        description: "Hướng dẫn nhập kho, kiểm kho và quản lý hàng hoá",
        iconUrl: "package",
        sortOrder: 3,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Tài khoản & Phân quyền",
        slug: "accounts",
        description: "Quản lý nhân viên, bảo mật và phân quyền hệ thống",
        iconUrl: "users",
        sortOrder: 4,
        articleCount: 1,
        languageCode: "vi",
      },
    })
  ]);

  const enCategories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Hardware Setup",
        slug: "hardware-en",
        description: "Guide to installing printers, scanners, and cash drawers",
        iconUrl: "monitor",
        sortOrder: 1,
        articleCount: 1,
        languageCode: "en",
      },
    })
  ]);

  const mdPrinter = `
# Hướng dẫn Kết nối Máy in Hoá đơn với CataPos

Máy in hoá đơn (Receipt Printer) là thiết bị không thể thiếu tại quầy thu ngân. Bài viết này sẽ hướng dẫn bạn cách kết nối máy in với hệ thống CataPos một cách chi tiết nhất.

## 1. Kết nối qua cổng USB (Phổ biến nhất)
Đây là cách kết nối ổn định và dễ cài đặt nhất dành cho các cửa hàng vừa và nhỏ.

**Các bước thực hiện:**
1. Cắm một đầu cáp USB vào máy in, đầu còn lại cắm vào máy tính thu ngân.
2. Cắm nguồn điện cho máy in và bật công tắc (Nút nguồn thường nằm bên hông hoặc phía sau).
3. Mở phần mềm CataPos, truy cập **Cài đặt > Thiết bị phần cứng > Máy in**.
4. Chọn **Thêm máy in mới**, hệ thống sẽ tự động quét cổng USB và nhận diện máy in của bạn (ví dụ: *Xprinter XP-N160I*).
5. Bấm **Lưu** và tiến hành in thử.

## 2. Kết nối qua mạng LAN (Ethernet)
Phù hợp cho nhà hàng/quán cafe cần in phiếu bếp hoặc máy in đặt xa máy chủ.

**Các bước thực hiện:**
1. Cắm dây mạng LAN từ Router/Switch trực tiếp vào cổng LAN của máy in.
2. Tắt máy in, giữ nút **FEED** trên máy in đồng thời bật nguồn. Giữ nút FEED thêm 3 giây rồi thả ra để máy in in ra tờ **Test Page**.
3. Xem địa chỉ **IP Address** trên tờ Test Page (Ví dụ: \`192.168.1.100\`).
4. Truy cập **Cài đặt > Máy in** trong CataPos, chọn loại kết nối là **Mạng LAN / IP**.
5. Nhập địa chỉ IP vừa lấy được và bấm **Lưu**.

> **Lưu ý quan trọng:** Hãy đảm bảo máy tính thu ngân và máy in đang dùng chung một mạng Wi-Fi/LAN (chung lớp mạng \`192.168.1.x\`).

## Xử lý sự cố thường gặp
- **In ra giấy trắng:** Kiểm tra lại cuộn giấy in nhiệt, đảm bảo mặt cảm nhiệt (mặt láng) ngửa lên trên tiếp xúc với đầu in.
- **Không tìm thấy máy in:** Đảm bảo dây cáp không bị lỏng và máy tính đã nhận Driver.
`;

  const mdOrder = `
# Quy trình Tạo Đơn Hàng và Thanh Toán

CataPos được tối ưu hóa để giúp thu ngân thao tác nhanh nhất có thể trong giờ cao điểm. Hãy làm quen với các thao tác sau:

## Tạo đơn hàng mới
1. Tại màn hình chính (Bán hàng), sử dụng súng quét mã vạch để quét sản phẩm, hoặc gõ tên sản phẩm vào thanh tìm kiếm.
2. Bạn có thể bấm thẳng vào hình ảnh sản phẩm trên lưới màn hình nếu đang sử dụng màn hình cảm ứng.
3. Để tăng số lượng, bấm nút \`+\` hoặc quét lại mã vạch sản phẩm đó thêm lần nữa.

## Áp dụng giảm giá (Chiết khấu)
Hệ thống cho phép giảm giá theo % hoặc số tiền mặt.
- Bấm vào mục **Giảm giá** ở góc phải màn hình.
- Nhập mã voucher hoặc chọn **Giảm %** (Ví dụ: 10%).

## Thanh toán
CataPos hỗ trợ đa phương thức thanh toán trên cùng một hoá đơn:
1. Bấm phím tắt \`F12\` hoặc nút **Thanh toán**.
2. Chọn phương thức thanh toán: **Tiền mặt**, **Thẻ tín dụng**, hoặc **Chuyển khoản (VietQR)**.
3. Nếu khách đưa tiền mặt, hệ thống sẽ tự tính số tiền thối lại (Tiền thừa).
4. Bấm **Hoàn tất**. Máy in sẽ tự động đẩy ngăn kéo đựng tiền và in hoá đơn cho khách.
`;

  const mdInventory = `
# Hướng dẫn Quản lý Kho hàng

Việc kiểm soát tồn kho chặt chẽ giúp bạn tránh thất thoát và biết được mặt hàng nào sắp hết để nhập thêm.

### Nhập kho (Mua hàng)
1. Truy cập **Quản lý Kho > Phiếu nhập kho**.
2. Chọn Nhà cung cấp và Thêm sản phẩm cần nhập.
3. Điền **Số lượng** và **Đơn giá nhập**.
4. Bấm **Duyệt phiếu**. Tồn kho thực tế sẽ tự động cộng thêm số lượng tương ứng.

### Cảnh báo tồn kho thấp
Hệ thống tự động thông báo khi có hàng hóa sắp hết.
- Bạn cần cài đặt mức **Tồn kho tối thiểu** cho từng sản phẩm trong mục *Danh mục hàng hoá*.
- Báo cáo *Hàng sắp hết* sẽ liệt kê toàn bộ các sản phẩm dưới định mức này để bạn lên kế hoạch mua hàng.
`;

  const mdStaff = `
# Thiết lập Phân quyền cho Nhân viên

Để đảm bảo bảo mật và tính minh bạch, mỗi nhân viên nên có một tài khoản CataPos riêng biệt với các quyền hạn khác nhau.

### Các vai trò (Roles) mặc định
- **Quản trị viên (Admin):** Toàn quyền truy cập, xem báo cáo doanh thu, chỉnh sửa sản phẩm, xem giá vốn.
- **Quản lý (Manager):** Có quyền duyệt phiếu xuất/nhập kho, xem báo cáo, chỉnh sửa thông tin khách hàng.
- **Thu ngân (Cashier):** Chỉ có quyền tạo đơn hàng, thanh toán và xem danh sách sản phẩm. Không xem được giá vốn và báo cáo lãi lỗ.

### Cách tạo tài khoản
1. Truy cập **Cài đặt > Nhân viên**.
2. Bấm **+ Thêm nhân viên**.
3. Nhập Tên, Email, Mật khẩu.
4. Ở mục *Phân quyền*, chọn vai trò tương ứng và bấm Lưu.
`;

  const articles = await prisma.article.createManyAndReturn({
    data: [
      {
        categoryId: categories[0].id, // Hardware
        type: "USER_MANUAL",
        status: "PUBLISHED",
        title: "Hướng dẫn kết nối máy in hoá đơn chi tiết",
        slug: "ket-noi-may-in-hoa-don",
        summary: "Hướng dẫn cài đặt máy in qua cổng USB và mạng LAN (Ethernet), các lỗi thường gặp.",
        content: mdPrinter,
        contentType: "markdown",
        tags: ["máy in", "phần cứng", "usb", "lan"],
        contextPaths: ["/settings/hardware"],
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
        categoryId: categories[1].id, // Sales
        type: "BUSINESS_PLAYBOOK",
        status: "PUBLISHED",
        title: "Quy trình tạo đơn hàng và thanh toán nhanh",
        slug: "tao-don-hang-va-thanh-toan",
        summary: "Cách tạo đơn hàng bằng mã vạch, áp dụng chiết khấu và in bill.",
        content: mdOrder,
        contentType: "markdown",
        tags: ["đơn hàng", "thanh toán", "bán hàng"],
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
        categoryId: categories[2].id, // Inventory
        type: "USER_MANUAL",
        status: "PUBLISHED",
        title: "Kiểm soát hàng hoá và nhập kho",
        slug: "kiem-soat-hang-hoa-nhap-kho",
        summary: "Cách lập phiếu nhập kho, theo dõi tồn kho và cảnh báo hàng sắp hết.",
        content: mdInventory,
        contentType: "markdown",
        tags: ["kho", "nhập hàng", "tồn kho"],
        contextPaths: ["/inventory"],
        viewCount: 650,
        helpfulCount: 89,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: false,
        authorId: adminUser.id,
        publishedAt: new Date("2025-02-01T10:00:00Z"),
        languageCode: "vi",
      },
      {
        categoryId: categories[3].id, // Staff
        type: "BUSINESS_PLAYBOOK",
        status: "PUBLISHED",
        title: "Quản lý nhân viên và phân quyền",
        slug: "quan-ly-nhan-vien-phan-quyen",
        summary: "Thiết lập quyền truy cập cho Thu ngân, Quản lý để bảo mật dữ liệu.",
        content: mdStaff,
        contentType: "markdown",
        tags: ["nhân viên", "phân quyền", "bảo mật"],
        contextPaths: ["/settings/users"],
        viewCount: 410,
        helpfulCount: 45,
        notHelpfulCount: 1,
        isFeatured: false,
        isPinned: false,
        authorId: adminUser.id,
        publishedAt: new Date("2025-02-10T08:15:00Z"),
        languageCode: "vi",
      }
    ],
  });

  await prisma.feedback.createMany({
    data: [
      {
        articleId: articles[0].id,
        userId: staffUser.id,
        type: "HELPFUL",
        comment: "Bài viết rất chi tiết, tôi đã cài được máy in LAN thành công.",
      }
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Users:");
  console.log("- admin@example.com / 123456");
  console.log("- staff@example.com / 123456");
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
