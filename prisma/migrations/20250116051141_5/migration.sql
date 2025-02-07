/*
  Warnings:

  - Made the column `deskripsi` on table `menu` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `deskripsi` VARCHAR(191) NOT NULL DEFAULT '';
