import prisma from "../src/lib/prisma.js";  // ← reuse your adapter-based client
import bcrypt from "bcryptjs";

async function main() {
  const hashed = await bcrypt.hash("Admin@1234", 10);

  await prisma.admin.upsert({
    where:  { email: "admin@dams.com" },
    update: {},
    create: {
      email:     "admin@dams.com",
      password:  hashed,
      firstName: "Admin",
      lastName:  "User",
    },
  });

  console.log("✅ Admin seeded → admin@dams.com / Admin@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());