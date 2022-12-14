DROP DATABASE IF EXISTS epitechmoulibot;
CREATE DATABASE epitechmoulibot;
USE epitechmoulibot;

CREATE TABLE `user` (
    `id` INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `user_id` VARCHAR(30) NOT NULL DEFAULT "0",
    `channel_id` VARCHAR(30) NOT NULL DEFAULT "0",
    `last_testRunId` INT unsigned NOT NULL DEFAULT 0,
    `cookies_status` ENUM('new', 'ok', 'expired', 'wait') NOT NULL DEFAULT 'new',
    `discord_status` BOOLEAN NOT NULL DEFAULT 0,
    `cookies` LONGTEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
