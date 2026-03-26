import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hash('123456', 10);

  const [adminUser, staffUser] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: defaultPasswordHash,
        name: 'Admin Demo',
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff@example.com',
        password: defaultPasswordHash,
        name: 'Staff Demo',
        role: UserRole.STAFF,
      },
    }),
  ]);

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: 'Bat dau su dung',
        slug: 'getting-started',
        description: 'Cac huong dan co ban cho nguoi moi bat dau',
        iconUrl: 'rocket',
        sortOrder: 1,
        articleCount: 2,
        languageCode: 'vi',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Quan ly don hang',
        slug: 'order-management',
        description: 'Quy trinh xu ly don hang va van chuyen',
        iconUrl: 'shopping-bag',
        sortOrder: 2,
        articleCount: 2,
        languageCode: 'vi',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Thiet lap cua hang',
        slug: 'store-settings',
        description: 'Cau hinh may in, thue va nhan vien',
        iconUrl: 'settings',
        sortOrder: 3,
        articleCount: 3,
        languageCode: 'vi',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tai lieu ky thuat',
        slug: 'api-docs',
        description: 'Tai lieu API va tich hop ky thuat cho lap trinh vien',
        iconUrl: 'code',
        sortOrder: 4,
        articleCount: 2,
        languageCode: 'vi',
      },
    }),
  ]);

  const articles = await prisma.article.createManyAndReturn({
    data: [
      {
        categoryId: categories[2].id,
        type: 'USER_MANUAL',
        status: 'PUBLISHED',
        title: 'Huong dan ket noi may in nhiet K80',
        slug: 'huong-dan-ket-noi-may-in-nhiet-k80',
        summary:
          'Huong dan chi tiet cach ket noi va cau hinh may in nhiet K80 qua mang LAN va USB.',
        content: [
          '# Huong dan ket noi may in nhiet K80',
          '',
          '## 1. Chuan bi',
          '- May in K80 (LAN hoac USB)',
          '- Giay in kho 80mm',
          '',
          '## 2. Cac buoc thuc hien',
          '1. Cam nguon va ket noi may in.',
          '2. Truy cap Cau hinh > May in.',
          '3. Nhap dia chi IP may in va luu.',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['may in', 'k80', 'phan cung'],
        contextPaths: ['/settings/print'],
        viewCount: 150,
        helpfulCount: 12,
        notHelpfulCount: 1,
        isFeatured: true,
        isPinned: false,
        publishedAt: new Date('2025-01-15T10:00:00Z'),
        languageCode: 'vi',
        metadata: {
          videoUrl: 'https://example.com/videos/may-in-k80',
        },
      },
      {
        categoryId: categories[2].id,
        type: 'USER_MANUAL',
        status: 'PUBLISHED',
        title: 'Cau hinh thue VAT cho cua hang',
        slug: 'cau-hinh-thue-vat-cho-cua-hang',
        summary: 'Huong dan thiet lap thue, phi dich vu va mau hoa don.',
        content: [
          '# Cau hinh thue VAT cho cua hang',
          '',
          '## Muc tieu',
          'Dam bao hoa don va bao cao su dung dung muc thue.',
          '',
          '## Cac buoc',
          '1. Vao Cau hinh > Thue va phi.',
          '2. Tao muc thue VAT 8% hoac 10%.',
          '3. Gan muc thue cho nhom san pham tuong ung.',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['thue', 'vat', 'hoa don'],
        contextPaths: ['/settings/tax'],
        viewCount: 94,
        helpfulCount: 18,
        notHelpfulCount: 1,
        isFeatured: false,
        isPinned: false,
        publishedAt: new Date('2025-01-18T09:00:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[2].id,
        type: 'CHANGELOG',
        status: 'PUBLISHED',
        title: 'Cap nhat bo loc bao cao theo ca lam viec',
        slug: 'cap-nhat-bo-loc-bao-cao-theo-ca-lam-viec',
        summary: 'Ban cap nhat bo sung bo loc bao cao theo ca va nhan vien.',
        content: [
          '# Cap nhat bo loc bao cao theo ca lam viec',
          '',
          '- Them bo loc theo ca lam viec.',
          '- Them bo loc theo nhan vien.',
          '- Cai thien toc do tai bao cao tong hop.',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['changelog', 'bao cao'],
        contextPaths: ['/reports'],
        viewCount: 55,
        helpfulCount: 9,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: true,
        publishedAt: new Date('2025-01-22T04:00:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[1].id,
        type: 'BUSINESS_PLAYBOOK',
        status: 'PUBLISHED',
        title: 'Quy trinh xu ly don hang hoan',
        slug: 'quy-trinh-xu-ly-don-hoan',
        summary:
          'Cach xu ly don hang bi bom, hoan tra kho va cap nhat ton kho tu dong.',
        content: '# Quy trinh xu ly don hang hoan',
        contentType: 'markdown',
        tags: ['don hang', 'hoan tra'],
        requiredPackage: 'PRO',
        requiredPackages: ['PRO'],
        contextPaths: ['/orders'],
        viewCount: 89,
        helpfulCount: 20,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: true,
        publishedAt: new Date('2025-01-12T08:00:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[1].id,
        type: 'USER_MANUAL',
        status: 'PUBLISHED',
        title: 'Cach theo doi don giao that bai',
        slug: 'cach-theo-doi-don-giao-that-bai',
        summary: 'Huong dan loc don giao that bai va tao lich su cham soc khach hang.',
        content: [
          '# Cach theo doi don giao that bai',
          '',
          '1. Vao Don hang > Van chuyen.',
          '2. Loc theo trang thai giao that bai.',
          '3. Tiep tuc tao ghi chu va hen lich goi lai cho khach.',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['giao hang', 'van chuyen', 'don hang'],
        contextPaths: ['/orders/shipping'],
        viewCount: 77,
        helpfulCount: 14,
        notHelpfulCount: 2,
        isFeatured: false,
        isPinned: false,
        publishedAt: new Date('2025-01-17T07:00:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[0].id,
        type: 'USER_MANUAL',
        status: 'PUBLISHED',
        title: 'Tao tai khoan nhan vien moi',
        slug: 'tao-tai-khoan-nhan-vien',
        summary: 'Huong dan phan quyen va tao tai khoan cho nhan vien ban hang.',
        content: '# Tao tai khoan nhan vien moi',
        contentType: 'markdown',
        tags: ['nhan vien', 'phan quyen'],
        contextPaths: ['/staff'],
        viewCount: 210,
        helpfulCount: 45,
        notHelpfulCount: 2,
        isFeatured: true,
        isPinned: false,
        publishedAt: new Date('2025-01-10T09:30:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[0].id,
        type: 'USER_MANUAL',
        status: 'PUBLISHED',
        title: 'Lam quen giao dien quan tri',
        slug: 'lam-quen-giao-dien-quan-tri',
        summary: 'Gioi thieu nhanh cac khu vuc chinh trong dashboard va menu.',
        content: [
          '# Lam quen giao dien quan tri',
          '',
          '- Tong quan doanh thu',
          '- Don hang gan day',
          '- Khu vuc cau hinh nhanh',
          '- Thanh tim kiem va thong bao',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['dashboard', 'bat dau'],
        contextPaths: ['/dashboard'],
        viewCount: 180,
        helpfulCount: 31,
        notHelpfulCount: 1,
        isFeatured: true,
        isPinned: false,
        publishedAt: new Date('2025-01-08T06:30:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[3].id,
        type: 'API_DOCS',
        status: 'PUBLISHED',
        title: 'Huong dan xac thuc API bang Bearer token',
        slug: 'huong-dan-xac-thuc-api-bang-bearer-token',
        summary: 'Mo ta cach dang nhap, lay access token va gui header Authorization.',
        content: [
          '# Huong dan xac thuc API bang Bearer token',
          '',
          '## Dang nhap',
          'POST /api/auth/login',
          '',
          '## Header can gui',
          'Authorization: Bearer <access_token>',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['api', 'auth', 'jwt'],
        contextPaths: ['/developers/auth'],
        viewCount: 133,
        helpfulCount: 26,
        notHelpfulCount: 1,
        isFeatured: true,
        isPinned: true,
        publishedAt: new Date('2025-01-20T10:00:00Z'),
        languageCode: 'vi',
      },
      {
        categoryId: categories[3].id,
        type: 'API_DOCS',
        status: 'PUBLISHED',
        title: 'Tai lieu endpoint lay danh sach bai viet',
        slug: 'tai-lieu-endpoint-lay-danh-sach-bai-viet',
        summary: 'Mo ta query params, phan trang va bo loc cho API danh sach bai viet.',
        content: [
          '# Tai lieu endpoint lay danh sach bai viet',
          '',
          'GET /api/help-center/articles',
          '',
          '## Query params',
          '- page',
          '- limit',
          '- categoryId',
          '- type',
          '- searchQuery',
        ].join('\n'),
        contentType: 'markdown',
        tags: ['api', 'articles', 'pagination'],
        contextPaths: ['/developers/help-center'],
        viewCount: 98,
        helpfulCount: 17,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: false,
        publishedAt: new Date('2025-01-21T11:00:00Z'),
        languageCode: 'vi',
      },
    ],
  });

  await prisma.feedback.createMany({
    data: [
      {
        articleId: articles[0].id,
        userId: adminUser.id,
        type: 'HELPFUL',
        comment: 'Noi dung ro rang, de thao tac.',
      },
      {
        articleId: articles[0].id,
        userId: staffUser.id,
        type: 'NOT_HELPFUL',
        comment: 'Can them hinh anh minh hoa.',
      },
      {
        articleId: articles[6].id,
        userId: adminUser.id,
        type: 'HELPFUL',
        comment: 'Tai lieu auth de doc va test.',
      },
    ],
  });

  console.log('Seed completed successfully.');
  console.log('Users:');
  console.log('- admin@example.com / 123456');
  console.log('- staff@example.com / 123456');
  console.log(`Categories: ${categories.length}`);
  console.log(`Articles: ${articles.length}`);
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
