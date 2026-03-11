-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRAINER', 'STUDENT');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "session_type" "SessionType" NOT NULL DEFAULT 'ONLINE',
    "duration_minutes" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_registrations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_method" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_codes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_registrations_session_id_student_id_key" ON "session_registrations"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_session_id_student_id_key" ON "attendances"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_logs_student_id_session_id_key" ON "study_logs"("student_id", "session_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_registrations" ADD CONSTRAINT "session_registrations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_registrations" ADD CONSTRAINT "session_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_codes" ADD CONSTRAINT "attendance_codes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_logs" ADD CONSTRAINT "study_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_logs" ADD CONSTRAINT "study_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
