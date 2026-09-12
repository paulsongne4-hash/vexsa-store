CREATE TABLE `appAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`assetType` enum('apk','screenshot','banner') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`sizeBytes` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `appAssets_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`badge` varchar(80),
	`badgeTone` varchar(20) NOT NULL DEFAULT 'blue',
	`action` varchar(80) NOT NULL DEFAULT 'Découvrir',
	`icon` varchar(40) NOT NULL DEFAULT 'briefcase',
	`accent` varchar(80) NOT NULL DEFAULT 'bg-[#155eef]',
	`rating` varchar(10) NOT NULL DEFAULT '4.8',
	`downloads` varchar(40) NOT NULL DEFAULT '—',
	`version` varchar(40) NOT NULL DEFAULT 'v1.0.0',
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apps_id` PRIMARY KEY(`id`),
	CONSTRAINT `apps_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
