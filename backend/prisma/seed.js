import prisma from "../src/lib/prisma.js";
import bcryptjs from "bcryptjs";

async function main() {
  const email    = process.env.ADMIN_EMAIL    || "admin@dams.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";

  const hashed = await bcryptjs.hash(password, 10);

  await prisma.admin.upsert({
    where:  { email },
    update: {},
    create: {
      email,
      password:  hashed,
      firstName: "Admin",
      lastName:  "User",
    },
  });

  console.log(`✅ Admin seeded → ${email}`);  
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
