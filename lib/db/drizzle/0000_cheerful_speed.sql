CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'pending',
	`priority` text DEFAULT 'medium',
	`category` text,
	`due_date` text,
	`created_at` text DEFAULT '2026-05-19T19:07:34.693Z',
	`updated_at` text DEFAULT '2026-05-19T19:07:34.693Z',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT '2026-05-19T19:07:34.689Z',
	`updated_at` text DEFAULT '2026-05-19T19:07:34.689Z'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);