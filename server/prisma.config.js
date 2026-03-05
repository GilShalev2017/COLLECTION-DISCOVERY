import 'dotenv/config'; // loads .env file
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
    schema: './prisma/schema.prisma', // path relative to project root
    datasource: {
        url: env('DATABASE_URL'), // reads from .env
        directUrl: env("DIRECT_URL")
    },
    // Optional but useful for future migrations
    migrations: {
        path: 'prisma/migrations',
    },
});
//# sourceMappingURL=prisma.config.js.map