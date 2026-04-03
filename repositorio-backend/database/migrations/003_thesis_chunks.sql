-- Fragmentos de texto extraídos de PDFs (RAG). Ejecutar en bases ya existentes.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `thesis_chunks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thesis_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `embedding` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `thesis_chunks_thesis_id` (`thesis_id`),
  CONSTRAINT `thesis_chunks_thesis_fk` FOREIGN KEY (`thesis_id`) REFERENCES `thesis` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
