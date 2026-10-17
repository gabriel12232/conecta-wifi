CREATE TABLE `networks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`ssid` text NOT NULL,
	`place` text NOT NULL,
	`security` text NOT NULL,
	`hidden` integer NOT NULL,
	`secret` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
