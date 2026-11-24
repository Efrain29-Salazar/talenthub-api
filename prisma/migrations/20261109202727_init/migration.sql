-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "experience_years" DECIMAL(5,2) NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);
