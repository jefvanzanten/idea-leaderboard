PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ideas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category_id` integer,
	`thumb_url` text,
	`sort_index` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ideas`("id", "title", "description", "category_id", "thumb_url", "sort_index", "created_at")
SELECT
	`i`.`id`,
	`i`.`title`,
	`i`.`description`,
	`i`.`category_id`,
	`i`.`thumb_url`,
	(
		SELECT COUNT(*)
		FROM `ideas` `j`
		WHERE `j`.`created_at` < `i`.`created_at`
			OR (`j`.`created_at` = `i`.`created_at` AND `j`.`id` <= `i`.`id`)
	) - 1 AS `sort_index`,
	`i`.`created_at`
FROM `ideas` `i`;--> statement-breakpoint
DROP TABLE `ideas`;--> statement-breakpoint
ALTER TABLE `__new_ideas` RENAME TO `ideas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
