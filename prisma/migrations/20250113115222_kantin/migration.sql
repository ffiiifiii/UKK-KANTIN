-- CreateTable
CREATE TABLE `siswa` (
    `siswaID` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_siswa` VARCHAR(191) NOT NULL DEFAULT '',
    `alamat` VARCHAR(191) NOT NULL DEFAULT '',
    `telp` VARCHAR(191) NOT NULL DEFAULT '',
    `userID` INTEGER NOT NULL DEFAULT 0,
    `foto` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`siswaID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userID` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL DEFAULT '',
    `role` ENUM('siswa', 'admin_stan') NOT NULL,

    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stan` (
    `stanID` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_stan` VARCHAR(191) NOT NULL DEFAULT '',
    `nama_pemilik` VARCHAR(191) NOT NULL DEFAULT '',
    `telp` VARCHAR(191) NOT NULL DEFAULT '',
    `userID` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`stanID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `menuID` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_makanan` VARCHAR(191) NOT NULL DEFAULT '',
    `harga` DOUBLE NOT NULL DEFAULT 0,
    `jenis` ENUM('makanan', 'minuman') NOT NULL,
    `foto` VARCHAR(191) NOT NULL DEFAULT '',
    `deskripsi` VARCHAR(191) NOT NULL DEFAULT '',
    `stanID` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`menuID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_diskon` (
    `menu_diskonID` INTEGER NOT NULL AUTO_INCREMENT,
    `menuID` INTEGER NOT NULL DEFAULT 0,
    `diskonID` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`menu_diskonID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `diskonID` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(191) NOT NULL DEFAULT '',
    `presentase_diskon` DOUBLE NOT NULL DEFAULT 0,
    `tanggal_awal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_akhir` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`diskonID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `transaksiID` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stanID` INTEGER NOT NULL DEFAULT 0,
    `siswaID` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('belumdikonfirm', 'dimasak', 'diantar', 'sampai') NOT NULL,

    PRIMARY KEY (`transaksiID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaksi` (
    `detail_transaksiID` INTEGER NOT NULL AUTO_INCREMENT,
    `transaksiID` INTEGER NOT NULL DEFAULT 0,
    `menuID` INTEGER NOT NULL DEFAULT 0,
    `qty` INTEGER NOT NULL DEFAULT 0,
    `harga_beli` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`detail_transaksiID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stan` ADD CONSTRAINT `stan_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_stanID_fkey` FOREIGN KEY (`stanID`) REFERENCES `stan`(`stanID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_menuID_fkey` FOREIGN KEY (`menuID`) REFERENCES `menu`(`menuID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_diskonID_fkey` FOREIGN KEY (`diskonID`) REFERENCES `diskon`(`diskonID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_stanID_fkey` FOREIGN KEY (`stanID`) REFERENCES `stan`(`stanID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_siswaID_fkey` FOREIGN KEY (`siswaID`) REFERENCES `siswa`(`siswaID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_transaksiID_fkey` FOREIGN KEY (`transaksiID`) REFERENCES `transaksi`(`transaksiID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_menuID_fkey` FOREIGN KEY (`menuID`) REFERENCES `menu`(`menuID`) ON DELETE RESTRICT ON UPDATE CASCADE;
