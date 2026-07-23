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
        name: "Bat dau su dung",
        slug: "getting-started",
        description: "Cac huong dan co ban cho nguoi moi bat dau",
        iconUrl: "rocket",
        sortOrder: 1,
        articleCount: 1,
        languageCode: "vi",
      },
    }),
    prisma.category.create({
      data: {
        name: "Quan ly don hang",
        slug: "order-management",
        description: "Quy trinh xu ly don hang va van chuyen",
        iconUrl: "shopping-bag",
        sortOrder: 2,
        articleCount: 1,
        languageCode: "vi",
      },
    })
  ]);

  const enCategories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Getting Started",
        slug: "getting-started-en",
        description: "Basic guides for new users",
        iconUrl: "rocket",
        sortOrder: 1,
        articleCount: 1,
        languageCode: "en",
      },
    }),
    prisma.category.create({
      data: {
        name: "Order Management",
        slug: "order-management-en",
        description: "Order processing and shipping workflows",
        iconUrl: "shopping-bag",
        sortOrder: 2,
        articleCount: 1,
        languageCode: "en",
      },
    })
  ]);

  const articles = await prisma.article.createManyAndReturn({
    data: [
      {
        categoryId: categories[0].id,
        type: "USER_MANUAL",
        status: "PUBLISHED",
        title: "Tao tai khoan nhan vien moi",
        slug: "tao-tai-khoan-nhan-vien",
        summary: "Huong dan phan quyen va tao tai khoan cho nhan vien ban hang.",
        content: "# Tao tai khoan nhan vien moi",
        contentType: "markdown",
        tags: ["nhan vien", "phan quyen"],
        contextPaths: ["/staff"],
        viewCount: 210,
        helpfulCount: 45,
        notHelpfulCount: 2,
        isFeatured: true,
        isPinned: false,
        publishedAt: new Date("2025-01-10T09:30:00Z"),
        languageCode: "vi",
      },
      {
        categoryId: categories[1].id,
        type: "BUSINESS_PLAYBOOK",
        status: "PUBLISHED",
        title: "Quy trinh xu ly don hang hoan",
        slug: "quy-trinh-xu-ly-don-hoan",
        summary: "Cach xu ly don hang bi hoan",
        content: "# Quy trinh xu ly don hang hoan\nChi tiet...",
        contentType: "markdown",
        tags: ["don hang", "hoan tra"],
        requiredPackages: ["PRO"],
        contextPaths: ["/orders"],
        viewCount: 89,
        helpfulCount: 20,
        notHelpfulCount: 0,
        isFeatured: false,
        isPinned: true,
        publishedAt: new Date("2025-01-12T08:00:00Z"),
        languageCode: "vi",
      }
    ],
  });

  await prisma.feedback.createMany({
    data: [
      {
        articleId: articles[0].id,
        userId: adminUser.id,
        type: "HELPFUL",
        comment: "Noi dung ro rang, de thao tac.",
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
