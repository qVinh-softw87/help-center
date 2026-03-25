import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hash('123456', 10);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: defaultPasswordHash,
      name: 'Admin Demo',
      role: UserRole.ADMIN,
    },
  });

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: 'Bat dau su dung',
        slug: 'getting-started',
        description: 'Cac huong dan co ban cho nguoi moi bat dau',
        iconUrl: 'rocket',
        sortOrder: 1,
        articleCount: 1,
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
        articleCount: 1,
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
        articleCount: 1,
        languageCode: 'vi',
      },
    }),
  ]);

  await prisma.article.createMany({
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
    ],
  });
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
