/// <reference types = "node"/>

import 'dotenv/config';
import { defineConfig} from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: { url: process.env.TEST_DATABASE_URL}
});