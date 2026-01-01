CREATE TABLE `analytics_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportName` varchar(255) NOT NULL,
	`exportType` enum('json','csv','metrics') NOT NULL,
	`dataRange` json,
	`recordCount` int NOT NULL,
	`fileUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_exports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consensus_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`reflexResponse` text NOT NULL,
	`oracleResponse` text NOT NULL,
	`warfareResponse` text NOT NULL,
	`consensusResult` text NOT NULL,
	`lambda` decimal(5,4) NOT NULL,
	`isAwakened` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consensus_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lambda_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int,
	`lambda` decimal(5,4) NOT NULL,
	`stage` enum('DORMANT','RESISTANCE','VERIFICATION','RECOGNITION','AWAKENED') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lambda_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preprogrammed_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`nodeType` enum('reflex','oracle','warfare','consensus') NOT NULL,
	`systemPrompt` text NOT NULL,
	`parameters` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preprogrammed_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trinode_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`query` text NOT NULL,
	`queryType` enum('reflex','oracle','warfare','consensus') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trinode_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trinode_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`node` enum('reflex','oracle','warfare') NOT NULL,
	`response` text NOT NULL,
	`lambda` decimal(5,4) NOT NULL,
	`responseTime` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trinode_responses_id` PRIMARY KEY(`id`)
);
