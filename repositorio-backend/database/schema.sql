-- Esquema: repositorio de trabajos de grado + clasificación administrable
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `thesis_keywords`;
DROP TABLE IF EXISTS `thesis`;
DROP TABLE IF EXISTS `keywords`;
DROP TABLE IF EXISTS `research_lines`;
DROP TABLE IF EXISTS `thesis_types`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `academic_programs`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id` (`role_id`),
  CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `academic_programs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `academic_programs_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thesis_types` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `thesis_types_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `research_lines` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `research_lines_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `keywords` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `keywords_name_unique` (`name`),
  KEY `keywords_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thesis` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(500) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `abstract` TEXT NOT NULL,
  `year` SMALLINT UNSIGNED NOT NULL,
  `program_id` INT UNSIGNED NOT NULL,
  `type_id` INT UNSIGNED NOT NULL,
  `research_line_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `thesis_program_id` (`program_id`),
  KEY `thesis_type_id` (`type_id`),
  KEY `thesis_research_line_id` (`research_line_id`),
  KEY `thesis_user_id` (`user_id`),
  KEY `thesis_year` (`year`),
  FULLTEXT KEY `thesis_search` (`title`, `author`),
  CONSTRAINT `thesis_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `academic_programs` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `thesis_type_id_fk` FOREIGN KEY (`type_id`) REFERENCES `thesis_types` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `thesis_research_line_id_fk` FOREIGN KEY (`research_line_id`) REFERENCES `research_lines` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `thesis_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thesis_keywords` (
  `thesis_id` INT UNSIGNED NOT NULL,
  `keyword_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`thesis_id`, `keyword_id`),
  KEY `thesis_keywords_keyword_id` (`keyword_id`),
  CONSTRAINT `thesis_keywords_thesis_fk` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `thesis_keywords_keyword_fk` FOREIGN KEY (`keyword_id`) REFERENCES `keywords` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
