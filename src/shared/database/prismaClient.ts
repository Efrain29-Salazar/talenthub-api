import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";
import { Prisma } from "../../generated/prisma/browser";

export const createPrismaClient = (connectionString: string): PrismaClient =>
    new PrismaClient({adapter: new PrismaPg({connectionString})});

