-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 12, 2025 at 04:30 PM
-- Server version: 8.0.39
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `todo_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `due_date` date NOT NULL,
  `due_time` time DEFAULT NULL,
  `is_done` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `notes`, `due_date`, `due_time`, `is_done`, `created_at`, `updated_at`) VALUES
(1, 2, 'เรียน js.', 'ให้ได้50% ของคลิป', '2025-08-13', '11:05:00', 1, '2025-08-12 14:00:40', '2025-08-12 16:18:37'),
(3, 2, 'ด', NULL, '2025-07-12', NULL, 0, '2025-08-12 14:28:09', NULL),
(28, 2, 'เรียน', 'python', '2025-08-12', '22:10:00', 1, '2025-08-12 15:28:18', '2025-08-12 15:28:49'),
(29, 2, 'เรียน', 'js', '2025-08-12', '23:28:00', 0, '2025-08-12 15:28:38', '2025-08-12 15:33:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `display_name`, `created_at`) VALUES
(2, 'pongsakorn.loyk@gmail.com', '$2b$10$7GsbOBpwbWmGAK8eZOzmxe0NmyJiDg0OUGItjWW3BQRzCpJ0Wm0be', 'Mick', '2025-08-12 13:56:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_user_date` (`user_id`,`due_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
