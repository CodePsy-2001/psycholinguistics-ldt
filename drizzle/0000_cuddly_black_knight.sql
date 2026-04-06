CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_code` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_external_code_unique` ON `participants` (`external_code`);--> statement-breakpoint
CREATE TABLE `session_trials` (
	`session_id` integer NOT NULL,
	`trial_index` integer NOT NULL,
	`stimulus` text NOT NULL,
	PRIMARY KEY(`session_id`, `trial_index`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stimulus`) REFERENCES `stimuli`(`text`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_trials_session_id_idx` ON `session_trials` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_trials_stimulus_id_idx` ON `session_trials` (`stimulus`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`started_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`completed_at` integer,
	`status` text DEFAULT 'IN_PROGRESS' NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_participant_id_idx` ON `sessions` (`participant_id`);--> statement-breakpoint
CREATE TABLE `stimuli` (
	`text` text PRIMARY KEY NOT NULL,
	`lexicality` integer NOT NULL,
	`emotion` integer,
	`origin` text,
	`log_freq` integer,
	`orth_n` integer NOT NULL,
	`phon_n` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `stimuli_lexicality_idx` ON `stimuli` (`lexicality`);--> statement-breakpoint
CREATE INDEX `stimuli_emotion_idx` ON `stimuli` (`emotion`);--> statement-breakpoint
CREATE TABLE `trial_results` (
	`session_id` integer NOT NULL,
	`trial_index` integer NOT NULL,
	`presented_at` integer,
	`response_lexicality` integer,
	`rt_ms` integer,
	`is_correct` integer NOT NULL,
	`timed_out` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`session_id`, `trial_index`),
	FOREIGN KEY (`session_id`,`trial_index`) REFERENCES `session_trials`(`session_id`,`trial_index`) ON UPDATE no action ON DELETE no action
);
