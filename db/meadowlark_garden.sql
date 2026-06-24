-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2026 at 09:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `meadowlark_garden`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `postal_code` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL DEFAULT 'US',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` enum('select','color','text') NOT NULL DEFAULT 'select',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `slug`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Color', 'color', 'color', 1, '2026-06-24 10:47:32', '2026-06-24 10:47:32'),
(2, 'Size', 'size', 'select', 1, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(3, 'Flower Type', 'flower-type', 'select', 1, '2026-06-24 10:47:34', '2026-06-24 10:47:34');

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(255) NOT NULL,
  `color_code` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `attribute_id`, `value`, `color_code`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Red', '#DC2626', 0, '2026-06-24 10:47:32', '2026-06-24 10:47:32'),
(2, 1, 'Pink', '#EC4899', 1, '2026-06-24 10:47:32', '2026-06-24 10:47:32'),
(3, 1, 'Purple', '#9333EA', 2, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(4, 1, 'White', '#F9FAFB', 3, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(5, 1, 'Yellow', '#EAB308', 4, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(6, 2, 'Small (1 gal)', NULL, 0, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(7, 2, 'Medium (3 gal)', NULL, 1, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(8, 2, 'Large (5 gal)', NULL, 2, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(9, 2, 'Extra Large (7 gal)', NULL, 3, '2026-06-24 10:47:33', '2026-06-24 10:47:33'),
(10, 3, 'Perennial', NULL, 0, '2026-06-24 10:47:34', '2026-06-24 10:47:34'),
(11, 3, 'Annual', NULL, 1, '2026-06-24 10:47:34', '2026-06-24 10:47:34'),
(12, 3, 'Bulb', NULL, 2, '2026-06-24 10:47:34', '2026-06-24 10:47:34'),
(13, 3, 'Shrub', NULL, 3, '2026-06-24 10:47:34', '2026-06-24 10:47:34'),
(14, 3, 'Tree', NULL, 4, '2026-06-24 10:47:34', '2026-06-24 10:47:34');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, NULL, 'order.created', 'App\\Models\\Order', 2, NULL, '{\"total\":\"91.65\"}', '127.0.0.1', '2026-06-24 12:49:15', '2026-06-24 12:49:15'),
(2, 2, 'order.created', 'App\\Models\\Order', 3, NULL, '{\"total\":\"163.88\"}', '127.0.0.1', '2026-06-24 13:37:51', '2026-06-24 13:37:51'),
(3, 2, 'order.created', 'App\\Models\\Order', 4, NULL, '{\"total\":\"230.95\"}', '127.0.0.1', '2026-06-24 13:38:21', '2026-06-24 13:38:21');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `meta_title`, `meta_description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Meadowlark Native', 'meadowlark-native', NULL, 'Our signature native plant collection.', NULL, NULL, 1, '2026-06-24 10:34:22', '2026-06-24 10:34:22'),
(2, 'Southern Heritage', 'southern-heritage', NULL, 'Classic Southern garden favorites.', NULL, NULL, 1, '2026-06-24 10:34:22', '2026-06-24 10:34:22'),
(3, 'Pollinator Paradise', 'pollinator-paradise', NULL, 'Plants that attract bees, butterflies, and hummingbirds.', NULL, NULL, 1, '2026-06-24 10:34:22', '2026-06-24 10:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-setting.bank_transfer_enabled', 's:4:\"true\";', 1782330785),
('laravel-cache-setting.business_hours_sunday', 's:0:\"\";', 1782330690),
('laravel-cache-setting.business_hours_weekday', 's:0:\"\";', 1782330690),
('laravel-cache-setting.cod_enabled', 's:4:\"true\";', 1782330785),
('laravel-cache-setting.contact_address', 's:0:\"\";', 1782330690),
('laravel-cache-setting.contact_email_note', 's:0:\"\";', 1782330690),
('laravel-cache-setting.contact_page_subtitle', 's:0:\"\";', 1782330689),
('laravel-cache-setting.contact_phone_note', 's:0:\"\";', 1782330690),
('laravel-cache-setting.favicon', 'N;', 1782330849),
('laravel-cache-setting.footer_description', 's:0:\"\";', 1782330690),
('laravel-cache-setting.footer_logo', 'N;', 1782330849),
('laravel-cache-setting.header_logo', 'N;', 1782330849),
('laravel-cache-setting.paypal_client_id', 'N;', 1782330878),
('laravel-cache-setting.paypal_enabled', 's:5:\"false\";', 1782330785),
('laravel-cache-setting.shop_avatar', 'N;', 1782328337),
('laravel-cache-setting.shop_location', 's:24:\"Tennessee, United States\";', 1782328264),
('laravel-cache-setting.shop_members', 's:10:\"Tracy,John\";', 1782328264),
('laravel-cache-setting.shop_name', 's:19:\"MeadowlarkGardensTN\";', 1782328263),
('laravel-cache-setting.shop_owner', 's:10:\"John Moser\";', 1782328264),
('laravel-cache-setting.shop_response_time', 's:37:\"Typically responds within a few hours\";', 1782328264),
('laravel-cache-setting.shop_years_active', 's:1:\"6\";', 1782328264),
('laravel-cache-setting.site_email', 's:26:\"info@meadowlarkgardens.com\";', 1782330689),
('laravel-cache-setting.site_name', 's:18:\"Meadowlark Gardens\";', 1782330689),
('laravel-cache-setting.site_phone', 's:14:\"(615) 555-0100\";', 1782330689),
('laravel-cache-setting.smtp_host', 's:0:\"\";', 1782326955),
('laravel-cache-setting.social_facebook', 's:20:\"https://facebook.com\";', 1782330690),
('laravel-cache-setting.social_instagram', 's:0:\"\";', 1782330690),
('laravel-cache-setting.social_pinterest', 's:0:\"\";', 1782330690),
('laravel-cache-setting.social_twitter', 's:0:\"\";', 1782330690),
('laravel-cache-setting.social_youtube', 's:0:\"\";', 1782330690),
('laravel-cache-setting.stripe_enabled', 's:5:\"false\";', 1782330785),
('laravel-cache-setting.stripe_key', 's:0:\"\";', 1782330785);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image`, `meta_title`, `meta_description`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(3, NULL, 'Perennials', 'perennials', 'Shop our selection of Perennials.', NULL, NULL, NULL, 1, 1, '2026-06-24 10:34:23', '2026-06-24 10:59:43'),
(6, NULL, 'Flowering Trees', 'flowering-trees', 'Shop our selection of Flowering Trees.', NULL, NULL, NULL, 1, 2, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(7, NULL, 'Flowering Shrubs', 'flowering-shrubs', 'Shop our selection of Flowering Shrubs.', NULL, NULL, NULL, 1, 3, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(8, NULL, 'Shade Perennials', 'shade-perennials', 'Shop our selection of Shade Perennials.', NULL, NULL, NULL, 1, 4, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(9, NULL, 'Roses', 'roses', 'Shop our selection of Roses.', NULL, NULL, NULL, 1, 5, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(10, NULL, 'Hydrangeas', 'hydrangeas', 'Shop our selection of Hydrangeas.', NULL, NULL, NULL, 1, 6, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(11, NULL, 'Fruit Trees & Shrubs', 'fruit-trees-shrubs', 'Shop our selection of Fruit Trees & Shrubs.', NULL, NULL, NULL, 1, 7, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(12, NULL, 'Willows', 'willows', 'Shop our selection of Willows.', NULL, NULL, NULL, 1, 8, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(13, NULL, 'Ornamental Shrub', 'ornamental-shrub', 'Shop our selection of Ornamental Shrub.', NULL, NULL, NULL, 1, 9, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(14, NULL, 'Japanese Maples', 'japanese-maples', 'Shop our selection of Japanese Maples.', NULL, NULL, NULL, 1, 10, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(15, NULL, 'Evergreen Shrubs', 'evergreen-shrubs', 'Shop our selection of Evergreen Shrubs.', NULL, NULL, NULL, 1, 11, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(16, NULL, 'Specialty Evergreens', 'specialty-evergreens', 'Shop our selection of Specialty Evergreens.', NULL, NULL, NULL, 1, 12, '2026-06-24 10:59:43', '2026-06-24 10:59:43'),
(17, NULL, 'Lilacs', 'lilacs', 'Shop our selection of Lilacs.', NULL, NULL, NULL, 1, 13, '2026-06-24 10:59:44', '2026-06-24 10:59:44'),
(18, NULL, 'Conifers/Specialty', 'conifers-specialty', 'Shop our selection of Conifers/Specialty.', NULL, NULL, NULL, 1, 14, '2026-06-24 10:59:44', '2026-06-24 10:59:44');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('percentage','fixed','free_shipping') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_cart_value` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL,
  `usage_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `per_user_limit` int(10) UNSIGNED DEFAULT NULL,
  `wholesale_only` tinyint(1) NOT NULL DEFAULT 0,
  `retail_only` tinyint(1) NOT NULL DEFAULT 0,
  `product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_ids`)),
  `category_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`category_ids`)),
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `type`, `value`, `min_cart_value`, `max_discount`, `usage_limit`, `usage_count`, `per_user_limit`, `wholesale_only`, `retail_only`, `product_ids`, `category_ids`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', '10% off first order', 'percentage', 10.00, 25.00, 50.00, 1000, 0, NULL, 0, 1, NULL, NULL, NULL, NULL, 1, '2026-06-24 10:34:25', '2026-06-24 10:34:25'),
(2, 'WHOLESALE15', '15% wholesale discount', 'percentage', 15.00, 100.00, NULL, NULL, 0, NULL, 1, 0, NULL, NULL, NULL, NULL, 1, '2026-06-24 10:34:25', '2026-06-24 10:34:25');

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_templates`
--

INSERT INTO `email_templates` (`id`, `slug`, `name`, `subject`, `body`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'welcome', 'Welcome Email', 'Welcome to Meadowlark Gardens!', 'Hello {{name}}, welcome to Meadowlark Gardens!', 1, '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(2, 'order_confirmation', 'Order Confirmation', 'Order #{{order_number}} Confirmed', 'Thank you for your order #{{order_number}}. Total: ${{total}}', 1, '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(3, 'payment_confirmation', 'Payment Confirmation', 'Payment Received - Order #{{order_number}}', 'We have received your payment for order #{{order_number}}.', 1, '2026-06-24 10:34:28', '2026-06-24 12:38:11'),
(4, 'shipping_confirmation', 'Shipping Confirmation', 'Your Order Has Shipped', 'Order #{{order_number}} has shipped. Tracking: {{tracking_number}}', 1, '2026-06-24 10:34:29', '2026-06-24 12:38:11'),
(5, 'delivery_confirmation', 'Delivery Confirmation', 'Order Delivered', 'Your order #{{order_number}} has been delivered.', 1, '2026-06-24 10:34:29', '2026-06-24 12:38:11'),
(6, 'password_reset', 'Password Reset', 'Reset Your Password', 'Click here to reset your password: {{reset_link}}', 1, '2026-06-24 10:34:29', '2026-06-24 10:34:29'),
(7, 'new_order_admin', 'New Order (Admin)', 'New Order #{{order_number}}', 'A new order has been placed. Total: ${{total}}', 1, '2026-06-24 10:34:29', '2026-06-24 10:34:29'),
(8, 'wholesale_approved', 'Wholesale Approved', 'Your Wholesale Account is Approved', 'Congratulations! Your wholesale account has been approved.', 1, '2026-06-24 10:34:29', '2026-06-24 10:34:29'),
(9, 'order_processing', 'Order Processing', 'Order #{{order_number}} is being processed', 'Hello {{name}},\n\nYour order #{{order_number}} is now being processed. We\'ll notify you when it\'s ready to ship.\n\nOrder total: ${{total}}', 1, '2026-06-24 12:38:11', '2026-06-24 12:38:11'),
(10, 'order_packed', 'Order Packed', 'Order #{{order_number}} has been packed', 'Hello {{name}},\n\nGood news! Your order #{{order_number}} has been packed and will ship soon.\n\nOrder total: ${{total}}', 1, '2026-06-24 12:38:11', '2026-06-24 12:38:11'),
(11, 'order_completed', 'Order Completed', 'Order #{{order_number}} is complete', 'Hello {{name}},\n\nYour order #{{order_number}} is now complete. Thank you for shopping with Meadowlark Gardens!\n\nOrder total: ${{total}}', 1, '2026-06-24 12:38:11', '2026-06-24 12:38:11'),
(12, 'order_cancelled', 'Order Cancelled', 'Order #{{order_number}} has been cancelled', 'Hello {{name}},\n\nYour order #{{order_number}} has been cancelled. If you have questions, please contact us.\n\nOrder total: ${{total}}', 1, '2026-06-24 12:38:11', '2026-06-24 12:38:11'),
(13, 'order_refunded', 'Order Refunded', 'Refund processed for order #{{order_number}}', 'Hello {{name}},\n\nA refund has been processed for order #{{order_number}}. Please allow 5–10 business days for it to appear on your statement.\n\nOrder total: ${{total}}', 1, '2026-06-24 12:38:11', '2026-06-24 12:38:11');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_06_23_221525_add_role_fields_to_users_table', 1),
(5, '2026_06_23_221525_create_personal_access_tokens_table', 1),
(6, '2026_06_23_221525_create_products_table', 1),
(7, '2026_06_23_221525_create_wholesale_applications_table', 1),
(8, '2026_06_23_221526_create_contact_messages_table', 1),
(9, '2026_06_23_221526_create_orders_table', 1),
(10, '2026_06_23_221527_create_order_items_table', 1),
(11, '2026_06_24_150719_add_customer_role_to_users_table', 2),
(12, '2026_06_24_152939_create_ecommerce_schema_tables', 3),
(13, '2026_06_24_220000_add_review_enhancements_to_reviews_table', 4),
(14, '2026_06_24_172708_add_avatar_to_users_table', 5),
(15, '2026_06_24_173333_expand_orders_status_column', 6),
(16, '2026_06_24_174000_seed_order_status_email_templates', 7);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `type` enum('retail','wholesale') NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) NOT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `billing_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`billing_address`)),
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_address`)),
  `order_notes` text DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `business_name`, `type`, `total`, `status`, `payment_method`, `coupon_code`, `subtotal`, `discount`, `tax`, `shipping_cost`, `billing_address`, `shipping_address`, `order_notes`, `tracking_number`, `payment_id`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 'ORD-2026-001', 2, NULL, NULL, 'Valley Garden Center', 'wholesale', 332.50, 'completed', 'Net 30', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 17:20:24', '2026-06-24 12:34:08'),
(2, 'ORD-2026-002', NULL, 'Et aperiam reiciendi Commodi voluptatem q', 'fuwyz@mailinator.com', NULL, 'retail', 91.65, 'paid', 'Cash on Delivery', NULL, 74.75, 0.00, 6.91, 9.99, '{\"firstName\":\"Et aperiam reiciendi\",\"lastName\":\"Commodi voluptatem q\",\"email\":\"fuwyz@mailinator.com\",\"phone\":\"Aut libero fugit pa\",\"company\":\"Voluptate accusamus\",\"addressLine1\":\"Rerum saepe repudian\",\"addressLine2\":\"Obcaecati tempore a\",\"city\":\"Veniam id officia u\",\"state\":\"Amet maiores quos s\",\"postalCode\":\"In do aut aliquam re\",\"country\":\"US\"}', '{\"addressLine1\":null,\"city\":null,\"state\":\"TN\",\"postalCode\":null,\"country\":\"US\"}', 'Necessitatibus qui e', NULL, NULL, '2026-06-24 13:16:52', '2026-06-24 12:49:14', '2026-06-24 13:16:52'),
(3, 'ORD-2026-003', 2, 'Valley Garden Center', 'wholesale@demo.com', 'Valley Garden Center', 'wholesale', 163.88, 'pending', 'Net 30', NULL, 150.00, 0.00, 13.88, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-24 13:37:51', '2026-06-24 13:37:51'),
(4, 'ORD-2026-004', 2, 'Valley Garden Center', 'wholesale@demo.com', 'Valley Garden Center', 'wholesale', 230.95, 'pending', 'Net 30', NULL, 211.40, 0.00, 19.55, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-24 13:38:21', '2026-06-24 13:38:21');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variation_id`, `quantity`, `unit_price`, `created_at`, `updated_at`) VALUES
(3, 2, 271, NULL, 1, 24.75, '2026-06-24 12:49:14', '2026-06-24 12:49:14'),
(4, 2, 272, NULL, 2, 10.00, '2026-06-24 12:49:14', '2026-06-24 12:49:14'),
(5, 2, 272, NULL, 2, 15.00, '2026-06-24 12:49:14', '2026-06-24 12:49:14'),
(6, 3, 272, 4, 15, 10.00, '2026-06-24 13:37:51', '2026-06-24 13:37:51'),
(7, 4, 143, NULL, 5, 9.29, '2026-06-24 13:38:21', '2026-06-24 13:38:21'),
(8, 4, 258, NULL, 5, 32.99, '2026-06-24 13:38:21', '2026-06-24 13:38:21');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_histories`
--

CREATE TABLE `order_status_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `note` text DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_histories`
--

INSERT INTO `order_status_histories` (`id`, `order_id`, `status`, `note`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'processing', NULL, 1, '2026-06-24 12:31:19', '2026-06-24 12:31:19'),
(2, 2, 'pending', 'Order placed', NULL, '2026-06-24 12:49:15', '2026-06-24 12:49:15'),
(3, 2, 'processing', NULL, 1, '2026-06-24 12:50:22', '2026-06-24 12:50:22'),
(4, 2, 'paid', NULL, 1, '2026-06-24 13:16:53', '2026-06-24 13:16:53'),
(5, 3, 'pending', 'Order placed', NULL, '2026-06-24 13:37:51', '2026-06-24 13:37:51'),
(6, 4, 'pending', 'Order placed', NULL, '2026-06-24 13:38:21', '2026-06-24 13:38:21');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth', '2c10c0c7eaef5721c403c7dadb7dd89e9ffa4f5dc62406cc16c61109b4d17b31', '[\"*\"]', NULL, NULL, '2026-06-23 17:21:01', '2026-06-23 17:21:01'),
(3, 'App\\Models\\User', 2, 'auth', 'c78ce89602563ea3d1ede7d36e603d11769a15ef2d902f39454845222a15bb60', '[\"*\"]', '2026-06-23 17:30:00', NULL, '2026-06-23 17:29:58', '2026-06-23 17:30:00'),
(4, 'App\\Models\\User', 1, 'auth', 'd4fb35bd89e687873fb36289e2ebec870a24cf2e76d191450f9d604f67d02fff', '[\"*\"]', '2026-06-24 12:11:23', NULL, '2026-06-24 10:16:10', '2026-06-24 12:11:23'),
(7, 'App\\Models\\User', 1, 'auth', '31e82ec4d0080a496dd253178c6646986e6dd0c92fff8b29fcf9ede1a8e9ae7b', '[\"*\"]', '2026-06-24 12:50:50', NULL, '2026-06-24 12:49:49', '2026-06-24 12:50:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `type` enum('simple','variable') NOT NULL DEFAULT 'simple',
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `wholesale_price` decimal(10,2) NOT NULL,
  `sale_wholesale_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `short_description` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `weight` decimal(8,2) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `badge` varchar(255) DEFAULT NULL,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `stock_quantity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `low_stock_threshold` int(10) UNSIGNED NOT NULL DEFAULT 5,
  `manage_stock` tinyint(1) NOT NULL DEFAULT 1,
  `allow_backorder` tinyint(1) NOT NULL DEFAULT 0,
  `min_wholesale_qty` int(10) UNSIGNED NOT NULL DEFAULT 5,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `sku`, `type`, `category_id`, `brand_id`, `category`, `price`, `sale_price`, `wholesale_price`, `sale_wholesale_price`, `image`, `description`, `short_description`, `tags`, `is_featured`, `is_active`, `weight`, `meta_title`, `meta_description`, `badge`, `in_stock`, `stock_quantity`, `low_stock_threshold`, `manage_stock`, `allow_backorder`, `min_wholesale_qty`, `created_at`, `updated_at`) VALUES
(142, 'Purple Coneflower', 'purple-coneflower', 'MG-0001', 'simple', 3, NULL, 'Perennials', 12.99, 11.04, 7.79, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Purple Coneflower grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 23, 5, 1, 0, 5, '2026-06-24 11:00:57', '2026-06-24 11:00:57'),
(143, 'Black-Eyed Susan', 'black-eyed-susan', 'MG-0002', 'simple', 3, NULL, 'Perennials', 15.49, NULL, 9.29, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Black-Eyed Susan grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 44, 5, 1, 0, 5, '2026-06-24 11:00:57', '2026-06-24 13:38:21'),
(144, 'Butterfly Weed', 'butterfly-weed', 'MG-0003', 'simple', 3, NULL, 'Perennials', 17.99, NULL, 10.79, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Butterfly Weed grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 74, 5, 1, 0, 5, '2026-06-24 11:00:57', '2026-06-24 11:00:57'),
(145, 'Wild Bergamot', 'wild-bergamot', 'MG-0004', 'simple', 3, NULL, 'Perennials', 20.49, NULL, 12.29, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Wild Bergamot grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 49, 5, 1, 0, 5, '2026-06-24 11:00:57', '2026-06-24 11:00:57'),
(146, 'Blue Wild Indigo', 'blue-wild-indigo', 'MG-0005', 'simple', 3, NULL, 'Perennials', 22.99, NULL, 13.79, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Blue Wild Indigo grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 114, 5, 1, 0, 5, '2026-06-24 11:00:57', '2026-06-24 11:00:57'),
(147, 'Switchgrass', 'switchgrass', 'MG-0006', 'simple', 3, NULL, 'Perennials', 12.99, NULL, 7.79, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Switchgrass grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 31, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(148, 'Tennessee Redbud', 'tennessee-redbud', 'MG-0007', 'simple', 6, NULL, 'Flowering Trees', 49.99, NULL, 29.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Tennessee Redbud grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Trees for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 45, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(149, 'Oakleaf Hydrangea', 'oakleaf-hydrangea', 'MG-0008', 'simple', 7, NULL, 'Flowering Shrubs', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Oakleaf Hydrangea grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 49, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(150, 'Fothergilla', 'fothergilla', 'MG-0009', 'simple', 7, NULL, 'Flowering Shrubs', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Fothergilla grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 68, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(151, 'Spirea Goldflame', 'spirea-goldflame', 'MG-0010', 'simple', 7, NULL, 'Flowering Shrubs', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Spirea Goldflame grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 40, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(152, 'Weigela Wine & Roses', 'weigela-wine-roses', 'MG-0011', 'simple', 7, NULL, 'Flowering Shrubs', 37.49, NULL, 22.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Weigela Wine & Roses grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 43, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(153, 'Azalea Encore', 'azalea-encore', 'MG-0012', 'simple', 7, NULL, 'Flowering Shrubs', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Azalea Encore grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 67, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(154, 'Loropetalum', 'loropetalum', 'MG-0013', 'simple', 7, NULL, 'Flowering Shrubs', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Loropetalum grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 112, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(155, 'Deutzia Chardonnay Pearls', 'deutzia-chardonnay-pearls', 'MG-0014', 'simple', 7, NULL, 'Flowering Shrubs', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Deutzia Chardonnay Pearls grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 29, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(156, 'Ninebark Diabolo', 'ninebark-diabolo', 'MG-0015', 'simple', 7, NULL, 'Flowering Shrubs', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Ninebark Diabolo grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 115, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(157, 'Beautyberry', 'beautyberry', 'MG-0016', 'simple', 7, NULL, 'Flowering Shrubs', 37.49, NULL, 22.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Beautyberry grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 62, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(158, 'Sweetspire Little Henry', 'sweetspire-little-henry', 'MG-0017', 'simple', 7, NULL, 'Flowering Shrubs', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Sweetspire Little Henry grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 85, 5, 1, 0, 5, '2026-06-24 11:00:58', '2026-06-24 11:00:58'),
(159, 'Virginia Sweetspire', 'virginia-sweetspire', 'MG-0018', 'simple', 7, NULL, 'Flowering Shrubs', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Virginia Sweetspire grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Flowering Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 43, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(160, 'Hosta Sum and Substance', 'hosta-sum-and-substance', 'MG-0019', 'simple', 8, NULL, 'Shade Perennials', 12.99, NULL, 7.79, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Hosta Sum and Substance grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Shade Perennials for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 88, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(161, 'Bleeding Heart', 'bleeding-heart', 'MG-0020', 'simple', 8, NULL, 'Shade Perennials', 15.49, NULL, 9.29, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Bleeding Heart grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Shade Perennials for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 73, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(162, 'Coral Bells Palace Purple', 'coral-bells-palace-purple', 'MG-0021', 'simple', 8, NULL, 'Shade Perennials', 17.99, NULL, 10.79, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Coral Bells Palace Purple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Shade Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 24, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(163, 'Fern Japanese Painted', 'fern-japanese-painted', 'MG-0022', 'simple', 8, NULL, 'Shade Perennials', 20.49, NULL, 12.29, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Fern Japanese Painted grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Shade Perennials for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 53, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(164, 'Knock Out Rose Red', 'knock-out-rose-red', 'MG-0023', 'simple', 9, NULL, 'Roses', 24.99, NULL, 14.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Knock Out Rose Red grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 38, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(165, 'Knock Out Rose Pink', 'knock-out-rose-pink', 'MG-0024', 'simple', 9, NULL, 'Roses', 27.49, NULL, 16.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Knock Out Rose Pink grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 35, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(166, 'Drift Rose Coral', 'drift-rose-coral', 'MG-0025', 'simple', 9, NULL, 'Roses', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Drift Rose Coral grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 35, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(167, 'Drift Rose Peach', 'drift-rose-peach', 'MG-0026', 'simple', 9, NULL, 'Roses', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Drift Rose Peach grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 25, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(168, 'David Austin Gertrude Jekyll', 'david-austin-gertrude-jekyll', 'MG-0027', 'simple', 9, NULL, 'Roses', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium David Austin Gertrude Jekyll grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 80, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(169, 'Climbing Rose New Dawn', 'climbing-rose-new-dawn', 'MG-0028', 'simple', 9, NULL, 'Roses', 24.99, NULL, 14.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Climbing Rose New Dawn grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 118, 5, 1, 0, 5, '2026-06-24 11:00:59', '2026-06-24 11:00:59'),
(170, 'Floribunda Iceberg', 'floribunda-iceberg', 'MG-0029', 'simple', 9, NULL, 'Roses', 27.49, NULL, 16.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Floribunda Iceberg grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 83, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(171, 'Hybrid Tea Mister Lincoln', 'hybrid-tea-mister-lincoln', 'MG-0030', 'simple', 9, NULL, 'Roses', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Hybrid Tea Mister Lincoln grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 74, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(172, 'Grandiflora Queen Elizabeth', 'grandiflora-queen-elizabeth', 'MG-0031', 'simple', 9, NULL, 'Roses', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Grandiflora Queen Elizabeth grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 90, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(173, 'Shrub Rose Carefree Wonder', 'shrub-rose-carefree-wonder', 'MG-0032', 'simple', 9, NULL, 'Roses', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Shrub Rose Carefree Wonder grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 120, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(174, 'Climbing Rose Blaze', 'climbing-rose-blaze', 'MG-0033', 'simple', 9, NULL, 'Roses', 24.99, NULL, 14.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Climbing Rose Blaze grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 40, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(175, 'Miniature Rose Sun Sprinkles', 'miniature-rose-sun-sprinkles', 'MG-0034', 'simple', 9, NULL, 'Roses', 27.49, NULL, 16.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Miniature Rose Sun Sprinkles grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 16, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(176, 'Rugosa Rose Hansa', 'rugosa-rose-hansa', 'MG-0035', 'simple', 9, NULL, 'Roses', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Rugosa Rose Hansa grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 79, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(177, 'English Rose Abraham Darby', 'english-rose-abraham-darby', 'MG-0036', 'simple', 9, NULL, 'Roses', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium English Rose Abraham Darby grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 112, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(178, 'Groundcover Rose Flower Carpet', 'groundcover-rose-flower-carpet', 'MG-0037', 'simple', 9, NULL, 'Roses', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Groundcover Rose Flower Carpet grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 24, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(179, 'Climbing Rose Don Juan', 'climbing-rose-don-juan', 'MG-0038', 'simple', 9, NULL, 'Roses', 24.99, NULL, 14.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Climbing Rose Don Juan grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 16, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(180, 'Shrub Rose Home Run', 'shrub-rose-home-run', 'MG-0039', 'simple', 9, NULL, 'Roses', 27.49, NULL, 16.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Shrub Rose Home Run grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 103, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(181, 'Floribunda Julia Child', 'floribunda-julia-child', 'MG-0040', 'simple', 9, NULL, 'Roses', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Floribunda Julia Child grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Roses for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 93, 5, 1, 0, 5, '2026-06-24 11:01:00', '2026-06-24 11:01:00'),
(182, 'Oakleaf Hydrangea Alice', 'oakleaf-hydrangea-alice', 'MG-0041', 'simple', 10, NULL, 'Hydrangeas', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Oakleaf Hydrangea Alice grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Hydrangeas for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 69, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(183, 'Endless Summer Hydrangea', 'endless-summer-hydrangea', 'MG-0042', 'simple', 10, NULL, 'Hydrangeas', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Endless Summer Hydrangea grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Hydrangeas for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 28, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(184, 'Limelight Hydrangea', 'limelight-hydrangea', 'MG-0043', 'simple', 10, NULL, 'Hydrangeas', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Limelight Hydrangea grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Hydrangeas for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 65, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(185, 'Pinky Winky Hydrangea', 'pinky-winky-hydrangea', 'MG-0044', 'simple', 10, NULL, 'Hydrangeas', 37.49, NULL, 22.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Pinky Winky Hydrangea grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Hydrangeas for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 92, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(186, 'Annabelle Hydrangea', 'annabelle-hydrangea', 'MG-0045', 'simple', 10, NULL, 'Hydrangeas', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Annabelle Hydrangea grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Hydrangeas for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 52, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(187, 'Blueberry Patriot', 'blueberry-patriot', 'MG-0046', 'simple', 11, NULL, 'Fruit Trees & Shrubs', 49.99, NULL, 29.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Blueberry Patriot grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Fruit Trees & Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 45, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(188, 'Fig Brown Turkey', 'fig-brown-turkey', 'MG-0047', 'simple', 11, NULL, 'Fruit Trees & Shrubs', 52.49, NULL, 31.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Fig Brown Turkey grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Fruit Trees & Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 29, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(189, 'Weeping Willow', 'weeping-willow', 'MG-0048', 'simple', 12, NULL, 'Willows', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Weeping Willow grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Willows for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 97, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(190, 'Pussy Willow', 'pussy-willow', 'MG-0049', 'simple', 12, NULL, 'Willows', 42.49, NULL, 25.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Pussy Willow grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Willows for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 87, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(191, 'Dappled Willow Hakuro Nishiki', 'dappled-willow-hakuro-nishiki', 'MG-0050', 'simple', 12, NULL, 'Willows', 44.99, NULL, 26.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Dappled Willow Hakuro Nishiki grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Willows for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 88, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(192, 'Smokebush Royal Purple', 'smokebush-royal-purple', 'MG-0051', 'simple', 13, NULL, 'Ornamental Shrub', 12.99, NULL, 7.79, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Smokebush Royal Purple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Ornamental Shrub for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 105, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(193, 'Bloodgood Japanese Maple', 'bloodgood-japanese-maple', 'MG-0052', 'simple', 14, NULL, 'Japanese Maples', 89.99, 76.49, 53.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Bloodgood Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 34, 5, 1, 0, 5, '2026-06-24 11:01:01', '2026-06-24 11:01:01'),
(194, 'Crimson Queen Japanese Maple', 'crimson-queen-japanese-maple', 'MG-0053', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Crimson Queen Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 92, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(195, 'Emperor I Japanese Maple', 'emperor-i-japanese-maple', 'MG-0054', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Emperor I Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 35, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(196, 'Coral Bark Japanese Maple', 'coral-bark-japanese-maple', 'MG-0055', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Coral Bark Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 82, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(197, 'Green Lace Japanese Maple', 'green-lace-japanese-maple', 'MG-0056', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Green Lace Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 96, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(198, 'Tamukeyama Japanese Maple', 'tamukeyama-japanese-maple', 'MG-0057', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Tamukeyama Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 21, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(199, 'Inaba Shidare Japanese Maple', 'inaba-shidare-japanese-maple', 'MG-0058', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Inaba Shidare Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 104, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(200, 'Osakazuki Japanese Maple', 'osakazuki-japanese-maple', 'MG-0059', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Osakazuki Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 75, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(201, 'Shishigashira Japanese Maple', 'shishigashira-japanese-maple', 'MG-0060', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Shishigashira Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 74, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(202, 'Viridis Japanese Maple', 'viridis-japanese-maple', 'MG-0061', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Viridis Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 76, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(203, 'Seiryu Japanese Maple', 'seiryu-japanese-maple', 'MG-0062', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Seiryu Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 67, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(204, 'Orangeola Japanese Maple', 'orangeola-japanese-maple', 'MG-0063', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Orangeola Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 18, 5, 1, 0, 5, '2026-06-24 11:01:02', '2026-06-24 11:01:02'),
(205, 'Red Dragon Japanese Maple', 'red-dragon-japanese-maple', 'MG-0064', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Red Dragon Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 85, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(206, 'Butterfly Japanese Maple', 'butterfly-japanese-maple', 'MG-0065', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Butterfly Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 32, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(207, 'Sango Kaku Japanese Maple', 'sango-kaku-japanese-maple', 'MG-0066', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Sango Kaku Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 55, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(208, 'Beni Schichihenge Japanese Maple', 'beni-schichihenge-japanese-maple', 'MG-0067', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Beni Schichihenge Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 17, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(209, 'Garnet Japanese Maple', 'garnet-japanese-maple', 'MG-0068', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Garnet Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 55, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(210, 'Waterfall Japanese Maple', 'waterfall-japanese-maple', 'MG-0069', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Waterfall Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 91, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(211, 'Ryusen Japanese Maple', 'ryusen-japanese-maple', 'MG-0070', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Ryusen Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 65, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(212, 'Koto No Ito Japanese Maple', 'koto-no-ito-japanese-maple', 'MG-0071', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Koto No Ito Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 100, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(213, 'Aoyagi Japanese Maple', 'aoyagi-japanese-maple', 'MG-0072', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Aoyagi Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 23, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(214, 'Beni Kawa Japanese Maple', 'beni-kawa-japanese-maple', 'MG-0073', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Beni Kawa Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 82, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(215, 'Fireglow Japanese Maple', 'fireglow-japanese-maple', 'MG-0074', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Fireglow Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 101, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(216, 'Lionheart Japanese Maple', 'lionheart-japanese-maple', 'MG-0075', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Lionheart Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 64, 5, 1, 0, 5, '2026-06-24 11:01:03', '2026-06-24 11:01:03'),
(217, 'Moonfire Japanese Maple', 'moonfire-japanese-maple', 'MG-0076', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Moonfire Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 60, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(218, 'Pixie Japanese Maple', 'pixie-japanese-maple', 'MG-0077', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Pixie Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 102, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(219, 'Shaina Japanese Maple', 'shaina-japanese-maple', 'MG-0078', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Shaina Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 64, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(220, 'Twomblys Red Sentinel', 'twomblys-red-sentinel', 'MG-0079', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Twomblys Red Sentinel grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 54, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(221, 'Ukigumo Japanese Maple', 'ukigumo-japanese-maple', 'MG-0080', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Ukigumo Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 112, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(222, 'Villa Taranto Japanese Maple', 'villa-taranto-japanese-maple', 'MG-0081', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Villa Taranto Japanese Maple grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 43, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(223, 'Acer palmatum Atropurpureum', 'acer-palmatum-atropurpureum', 'MG-0082', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Atropurpureum grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 25, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(224, 'Acer palmatum Dissectum', 'acer-palmatum-dissectum', 'MG-0083', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Dissectum grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 73, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(225, 'Acer palmatum Katsura', 'acer-palmatum-katsura', 'MG-0084', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Katsura grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 59, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(226, 'Acer palmatum Mikawa Yatsubusa', 'acer-palmatum-mikawa-yatsubusa', 'MG-0085', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Mikawa Yatsubusa grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 116, 5, 1, 0, 5, '2026-06-24 11:01:04', '2026-06-24 11:01:04'),
(227, 'Acer palmatum Orange Dream', 'acer-palmatum-orange-dream', 'MG-0086', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Orange Dream grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 87, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(228, 'Acer palmatum Red Select', 'acer-palmatum-red-select', 'MG-0087', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Red Select grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 55, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(229, 'Acer palmatum Skeeters Broom', 'acer-palmatum-skeeters-broom', 'MG-0088', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Skeeters Broom grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 45, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(230, 'Acer palmatum Trompenburg', 'acer-palmatum-trompenburg', 'MG-0089', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Trompenburg grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 84, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(231, 'Acer palmatum Wilsons Pink Dwarf', 'acer-palmatum-wilsons-pink-dwarf', 'MG-0090', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Wilsons Pink Dwarf grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 57, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(232, 'Acer japonicum Aconitifolium', 'acer-japonicum-aconitifolium', 'MG-0091', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Acer japonicum Aconitifolium grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 49, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(233, 'Acer shirasawanum Aureum', 'acer-shirasawanum-aureum', 'MG-0092', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Acer shirasawanum Aureum grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 113, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(234, 'Acer shirasawanum Moonrise', 'acer-shirasawanum-moonrise', 'MG-0093', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Acer shirasawanum Moonrise grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 23, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(235, 'Acer palmatum Beni Otake', 'acer-palmatum-beni-otake', 'MG-0094', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Beni Otake grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 85, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(236, 'Acer palmatum Geisha', 'acer-palmatum-geisha', 'MG-0095', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Geisha grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 63, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(237, 'Acer palmatum Hubbs Red Willow', 'acer-palmatum-hubbs-red-willow', 'MG-0096', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Hubbs Red Willow grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 107, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05');
INSERT INTO `products` (`id`, `name`, `slug`, `sku`, `type`, `category_id`, `brand_id`, `category`, `price`, `sale_price`, `wholesale_price`, `sale_wholesale_price`, `image`, `description`, `short_description`, `tags`, `is_featured`, `is_active`, `weight`, `meta_title`, `meta_description`, `badge`, `in_stock`, `stock_quantity`, `low_stock_threshold`, `manage_stock`, `allow_backorder`, `min_wholesale_qty`, `created_at`, `updated_at`) VALUES
(238, 'Acer palmatum Kagiri Nishiki', 'acer-palmatum-kagiri-nishiki', 'MG-0097', 'simple', 14, NULL, 'Japanese Maples', 89.99, NULL, 53.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Kagiri Nishiki grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 39, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(239, 'Acer palmatum Mikazuki', 'acer-palmatum-mikazuki', 'MG-0098', 'simple', 14, NULL, 'Japanese Maples', 92.49, NULL, 55.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Mikazuki grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 99, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(240, 'Acer palmatum Oshio Beni', 'acer-palmatum-oshio-beni', 'MG-0099', 'simple', 14, NULL, 'Japanese Maples', 94.99, NULL, 56.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Oshio Beni grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 65, 5, 1, 0, 5, '2026-06-24 11:01:05', '2026-06-24 11:01:05'),
(241, 'Acer palmatum Red Filigree Lace', 'acer-palmatum-red-filigree-lace', 'MG-0100', 'simple', 14, NULL, 'Japanese Maples', 97.49, NULL, 58.49, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Red Filigree Lace grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 114, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(242, 'Acer palmatum Shigitatsu Sawa', 'acer-palmatum-shigitatsu-sawa', 'MG-0101', 'simple', 14, NULL, 'Japanese Maples', 99.99, NULL, 59.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Acer palmatum Shigitatsu Sawa grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Japanese Maples for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 54, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(243, 'American Holly', 'american-holly', 'MG-0102', 'simple', 15, NULL, 'Evergreen Shrubs', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium American Holly grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 37, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(244, 'Boxwood Green Mountain', 'boxwood-green-mountain', 'MG-0103', 'simple', 15, NULL, 'Evergreen Shrubs', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Boxwood Green Mountain grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 105, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(245, 'Inkberry Holly', 'inkberry-holly', 'MG-0104', 'simple', 15, NULL, 'Evergreen Shrubs', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Inkberry Holly grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 106, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(246, 'Cherry Laurel', 'cherry-laurel', 'MG-0105', 'simple', 15, NULL, 'Evergreen Shrubs', 37.49, NULL, 22.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Cherry Laurel grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 47, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(247, 'Nandina Gulf Stream', 'nandina-gulf-stream', 'MG-0106', 'simple', 15, NULL, 'Evergreen Shrubs', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Nandina Gulf Stream grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 74, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(248, 'Pieris Mountain Fire', 'pieris-mountain-fire', 'MG-0107', 'simple', 15, NULL, 'Evergreen Shrubs', 29.99, NULL, 17.99, NULL, 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'Premium Pieris Mountain Fire grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 106, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(249, 'Rhododendron Nova Zembla', 'rhododendron-nova-zembla', 'MG-0108', 'simple', 15, NULL, 'Evergreen Shrubs', 32.49, NULL, 19.49, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Rhododendron Nova Zembla grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 19, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(250, 'Skip Laurel', 'skip-laurel', 'MG-0109', 'simple', 15, NULL, 'Evergreen Shrubs', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Skip Laurel grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Evergreen Shrubs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 30, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(252, 'Dwarf Alberta Spruce', 'dwarf-alberta-spruce', 'MG-0111', 'simple', 16, NULL, 'Specialty Evergreens', 54.99, NULL, 32.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Dwarf Alberta Spruce grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Specialty Evergreens for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 32, 5, 1, 0, 5, '2026-06-24 11:01:06', '2026-06-24 11:01:06'),
(253, 'Gold Mop Cypress', 'gold-mop-cypress', 'MG-0112', 'simple', 16, NULL, 'Specialty Evergreens', 57.49, NULL, 34.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Gold Mop Cypress grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Specialty Evergreens for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 41, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(254, 'Common Purple Lilac', 'common-purple-lilac', 'MG-0113', 'simple', 17, NULL, 'Lilacs', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Common Purple Lilac grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Lilacs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 79, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(255, 'Miss Kim Lilac', 'miss-kim-lilac', 'MG-0114', 'simple', 17, NULL, 'Lilacs', 37.49, NULL, 22.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Miss Kim Lilac grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Lilacs for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 66, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(256, 'Bloomerang Lilac', 'bloomerang-lilac', 'MG-0115', 'simple', 17, NULL, 'Lilacs', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Bloomerang Lilac grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Lilacs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 117, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(257, 'President Grevy Lilac', 'president-grevy-lilac', 'MG-0116', 'simple', 17, NULL, 'Lilacs', 42.49, NULL, 25.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium President Grevy Lilac grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Lilacs for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 46, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(258, 'Eastern Red Cedar', 'eastern-red-cedar', 'MG-0117', 'simple', 18, NULL, 'Conifers/Specialty', 54.99, NULL, 32.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Eastern Red Cedar grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Conifers/Specialty for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, 'Bestseller', 1, 34, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 13:38:21'),
(259, 'Norway Spruce', 'norway-spruce', 'MG-0118', 'simple', 18, NULL, 'Conifers/Specialty', 57.49, NULL, 34.49, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium Norway Spruce grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Conifers/Specialty for home and commercial landscapes.', NULL, 1, 1, NULL, NULL, NULL, NULL, 1, 60, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(260, 'Blue Atlas Cedar', 'blue-atlas-cedar', 'MG-0119', 'simple', 18, NULL, 'Conifers/Specialty', 59.99, NULL, 35.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Blue Atlas Cedar grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Conifers/Specialty for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 60, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(261, 'Dawn Redwood', 'dawn-redwood', 'MG-0120', 'simple', 18, NULL, 'Conifers/Specialty', 62.49, NULL, 37.49, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium Dawn Redwood grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.', 'Quality Conifers/Specialty for home and commercial landscapes.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 38, 5, 1, 0, 5, '2026-06-24 11:01:07', '2026-06-24 11:01:07'),
(262, 'Southern Magnolia', 'southern-magnolia-general', 'MG-0121', 'simple', NULL, NULL, 'General', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Southern Magnolia from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 50, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(263, 'River Birch', 'river-birch-general', 'MG-0122', 'simple', NULL, NULL, 'General', 39.99, NULL, 23.99, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'Premium River Birch from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 41, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(264, 'Little Bluestem', 'little-bluestem-general', 'MG-0123', 'simple', NULL, NULL, 'General', 44.99, NULL, 26.99, NULL, 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'Premium Little Bluestem from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 48, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(265, 'American Holly', 'american-holly-general', 'MG-0124', 'simple', NULL, NULL, 'General', 49.99, NULL, 29.99, NULL, 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'Premium American Holly from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 62, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(266, 'Tennessee Redbud', 'tennessee-redbud-general', 'MG-0125', 'simple', NULL, NULL, 'General', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'Premium Tennessee Redbud from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 56, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(268, 'Switchgrass', 'switchgrass-general', 'MG-0127', 'simple', NULL, NULL, 'General', 44.99, NULL, 26.99, NULL, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'Premium Switchgrass from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 62, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(269, 'Blueberry Patriot', 'blueberry-patriot-general', 'MG-0128', 'simple', NULL, NULL, 'General', 49.99, NULL, 29.99, NULL, 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'Premium Blueberry Patriot from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 29, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(270, 'Smokebush Royal Purple', 'smokebush-royal-purple-general', 'MG-0129', 'simple', NULL, NULL, 'General', 34.99, NULL, 20.99, NULL, 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'Premium Smokebush Royal Purple from Meadowlark Gardens nursery stock.', 'Nursery favorite — available while supplies last.', NULL, 0, 1, NULL, NULL, NULL, NULL, 1, 54, 5, 1, 0, 5, '2026-06-24 11:01:08', '2026-06-24 11:01:08'),
(271, 'Hardy Hibiscus moscheutos \'Luna Red\' Perennial Live Plant Huge Red Flowers--Gorgeous!!', 'hardy-hibiscus-moscheutos-luna-red-perennial-live-plant-huge-red-flowers-gorgeous', 'SKU-DVDAD3AX', 'simple', 3, 1, 'Perennials', 24.75, 24.75, 22.00, NULL, '/storage/products/6df995b4-2d2a-4a8d-9d1d-7c81e2d4f3cb.webp', 'WE CANNOT SHIP TO THE FOLLOWING STATES DUE TO SHIPPING RESTRICTIONS: CALIFORNIA, OREGON, WASHINGTON, ARIZONA, ALASKA, HAWAII, IDAHO AND NEVADA\n**WE CANNOT SHIP TO P.O. BOXES!!**\nSECOND PICTURE IS A REPRESENTATION OF THE PLANT YOU WILL RECEIVE.\n***ITEMS ARE TAPED IN THE BOX FOR SECURE SHIPPING. PLEASE BE CAREFUL TO REMOVE TAPE FIRST BEFORE REMOVING PLANT(S)***\n\nThis listing is for 1 live very large plant that is 8\"- 12\" tall and growing! This beautiful variety comes back year after year and produce large red flowers in Summer and Fall...did I say the flowers are huge? The plant will die back to the ground in Winter and can be a little slow to make an appearance in Spring, but it\'s well worth the wait! Make your landscape the talk of the neighborhood with these beauties!\n\n\nCommon Name: \'Luna Red\' Hardy Hibiscus\nBotanical Name: Hibiscus moscheutos\nHardiness Zones: 5 - 9\nBloom Time: Summer to Fall\nSunlight: Full sun\nSoil Requirements: Moist, well drained soil\nMature Size: 2\' to 3\' tall and 1\' to 2\' wide\nBloom Color: Red\nDeciduous or Evergreen: Deciduous....dies back to the ground in Winter', NULL, '[]', 1, 1, NULL, 'Hardy Hibiscus moscheutos \'Luna Red\' Perennial Live Plant Huge Red Flowers', 'Hardy Hibiscus moscheutos \'Luna Red\' Perennial Live Plant Huge Red Flowers', NULL, 1, 99, 5, 1, 0, 15, '2026-06-24 11:21:17', '2026-06-24 12:49:14'),
(272, 'Hardy Hibiscus moscheutos \'Luna Pink Swirl\' Shrubby Perennial Live Plant Huge Pink & White Flowers--Gorgeous!!', 'hardy-hibiscus-moscheutos-luna-pink-swirl-shrubby-perennial-live-plant-huge-pink-white-flowers-gorgeous', 'SKU-BOFBJ5WD', 'variable', 3, 2, 'Perennials', 10.00, NULL, 20.00, NULL, '/storage/products/7e7c4e2a-b9b3-4dbb-9aaa-8edf7283ff48.jpg', 'WE CANNOT SHIP TO THE FOLLOWING STATES DUE TO SHIPPING RESTRICTIONS: CALIFORNIA, OREGON, WASHINGTON, ARIZONA, ALASKA, HAWAII, IDAHO AND NEVADA!!\n***WE DO NOT SHIP TO PO BOXES***\nSECOND PICTURE IS A REPRESENTATION OF THE PLANT YOU WILL RECEIVE.\n***ITEMS ARE TAPED IN THE BOX FOR SECURE SHIPPING. PLEASE BE CAREFUL TO REMOVE TAPE FIRST BEFORE REMOVING PLANT(S)***\n\nThis listing is for 1 live plant that is 6\"- 8\" tall and growing! This beautiful variety comes back year after year and produce large pink flowers with white streaks in Summer and Fall...did I say the flowers are huge? The flowers measure a whopping 8\" across! The plant will die back to the ground in Winter and can be a little slow to make an appearance in Spring, but it\'s well worth the wait! Make your landscape the talk of the neighborhood with these beauties!\n\nCommon Name: \'Luna Pink Swirl\' Hardy Hibiscus\nBotanical Name: Hibiscus moscheutos\nHardiness Zones: 5 - 9\nBloom Time: Summer to Fall\nSunlight: Full sun\nSoil Requirements: Moist, well drained soil\nMature Size: 2\' to 3\' tall and 2\' to 3\' wide\nBloom Color: Pink with white streaks\nDeciduous or Evergreen: Deciduous....dies back to the ground in Winter', NULL, '[]', 0, 1, NULL, NULL, NULL, NULL, 1, 200, 5, 0, 0, 15, '2026-06-24 11:34:46', '2026-06-24 13:29:28');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `path` varchar(255) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `path`, `alt`, `is_primary`, `sort_order`, `created_at`, `updated_at`) VALUES
(4, 271, '/storage/products/6df995b4-2d2a-4a8d-9d1d-7c81e2d4f3cb.webp', NULL, 1, 0, '2026-06-24 11:23:08', '2026-06-24 11:23:08'),
(5, 271, '/storage/products/5cf24ca5-d4a7-405b-a3ee-ec0abf3e574b.webp', NULL, 0, 1, '2026-06-24 11:23:08', '2026-06-24 11:23:08'),
(6, 271, '/storage/products/398e0838-99dc-4eb4-a0b3-c2022df1a4f0.webp', NULL, 0, 2, '2026-06-24 11:23:08', '2026-06-24 11:23:08'),
(8, 272, '/storage/products/7e7c4e2a-b9b3-4dbb-9aaa-8edf7283ff48.jpg', NULL, 1, 0, '2026-06-24 13:29:28', '2026-06-24 13:29:28');

-- --------------------------------------------------------

--
-- Table structure for table `product_variations`
--

CREATE TABLE `product_variations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) NOT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `wholesale_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `attribute_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attribute_values`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variations`
--

INSERT INTO `product_variations` (`id`, `product_id`, `sku`, `barcode`, `price`, `sale_price`, `wholesale_price`, `stock_quantity`, `image`, `weight`, `attribute_values`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 272, 'VAR-BLIAXEZO', NULL, 10.00, 10.00, 8.00, 100, '/storage/products/7a1f2ce2-c3cf-4edf-a0d1-b9eb3db497e0.jpg', NULL, '{\"Color\":\"Red\",\"Flower Type\":\"Perennial\",\"Size\":\"Small (1 gal)\"}', 1, '2026-06-24 13:29:28', '2026-06-24 13:29:28'),
(4, 272, 'VAR-TTRPHDHL', NULL, 15.00, 15.00, 10.00, 100, '/storage/products/29a58053-c2a7-4f5c-8c24-087931a55b27.webp', NULL, '{\"Color\":\"Pink\",\"Flower Type\":\"Bulb\",\"Size\":\"Large (5 gal)\"}', 1, '2026-06-24 13:29:28', '2026-06-24 13:29:28');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `review_category` varchar(255) DEFAULT NULL,
  `quality_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `delivery_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `service_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `seller_response` text DEFAULT NULL,
  `seller_responded_at` timestamp NULL DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 0,
  `is_wholesale` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `order_id`, `rating`, `title`, `body`, `review_category`, `quality_rating`, `delivery_rating`, `service_rating`, `seller_response`, `seller_responded_at`, `images`, `is_verified_purchase`, `is_wholesale`, `status`, `created_at`, `updated_at`) VALUES
(1, 142, 5, NULL, 5, NULL, 'healthy plant love it', 'condition', 5, 5, 5, 'Thank you so much, I\'m glad you like it!!!', '2026-06-16 11:53:07', '[]', 1, 0, 'approved', '2026-06-15 11:53:07', '2026-06-15 11:53:07'),
(2, 142, 6, NULL, 5, NULL, 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!', 'delivery_packaging', 5, 5, 5, 'Thank you so much, Tanya! I really appreciate it!', '2026-06-11 11:53:08', '[]', 1, 0, 'approved', '2026-06-10 11:53:08', '2026-06-10 11:53:08'),
(3, 142, 7, NULL, 5, NULL, 'Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can\'t wait to see how it grows in its new home! Would order from this seller again!', 'description_accuracy', 5, 5, 5, 'Thank you again!!', '2026-06-01 11:53:08', '[]', 1, 0, 'approved', '2026-05-31 11:53:08', '2026-05-31 11:53:08'),
(4, 142, 8, NULL, 5, NULL, 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.', 'quality', 5, 5, 5, 'Thank you so much!!! It really means a lot!!', '2026-05-19 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-05-18 11:53:08', '2026-05-18 11:53:08'),
(5, 142, 9, NULL, 5, NULL, 'Beautiful addition to my garden, looks great and thriving after a week!', 'appearance', 5, 5, 5, 'So glad it is doing well for you!', '2026-06-20 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-19 11:53:08', '2026-06-19 11:53:08'),
(6, 142, 10, NULL, 5, NULL, 'very healthy plant i cant wait to watch it grow!', 'condition', 5, 5, 5, NULL, NULL, '[]', 1, 0, 'approved', '2026-06-23 11:53:08', '2026-06-23 11:53:08'),
(7, 142, 11, NULL, 5, NULL, 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.', 'sizing_fit', 5, 5, 5, 'Wonderful to hear!', '2026-06-23 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-22 11:53:08', '2026-06-22 11:53:08'),
(8, 142, 12, NULL, 4, NULL, 'The plants were as described. Seller service was helpful when I had a question.', 'seller_service', 4, 4, 4, 'Happy to help anytime!', '2026-06-22 11:53:08', '[]', 1, 0, 'approved', '2026-06-21 11:53:08', '2026-06-21 11:53:08'),
(9, 143, 6, NULL, 5, NULL, 'healthy plant love it', 'condition', 5, 5, 5, 'Thank you so much, I\'m glad you like it!!!', '2026-06-16 11:53:08', '[]', 1, 0, 'approved', '2026-06-15 11:53:08', '2026-06-15 11:53:08'),
(10, 143, 7, NULL, 5, NULL, 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!', 'delivery_packaging', 5, 5, 5, 'Thank you so much, Tanya! I really appreciate it!', '2026-06-11 11:53:08', '[]', 1, 0, 'approved', '2026-06-10 11:53:08', '2026-06-10 11:53:08'),
(11, 143, 8, NULL, 5, NULL, 'Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can\'t wait to see how it grows in its new home! Would order from this seller again!', 'description_accuracy', 5, 5, 5, 'Thank you again!!', '2026-06-01 11:53:08', '[]', 1, 0, 'approved', '2026-05-31 11:53:08', '2026-05-31 11:53:08'),
(12, 143, 9, NULL, 5, NULL, 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.', 'quality', 5, 5, 5, 'Thank you so much!!! It really means a lot!!', '2026-05-19 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-05-18 11:53:08', '2026-05-18 11:53:08'),
(13, 143, 10, NULL, 5, NULL, 'Beautiful addition to my garden, looks great and thriving after a week!', 'appearance', 5, 5, 5, 'So glad it is doing well for you!', '2026-06-20 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-19 11:53:08', '2026-06-19 11:53:08'),
(14, 143, 11, NULL, 5, NULL, 'very healthy plant i cant wait to watch it grow!', 'condition', 5, 5, 5, NULL, NULL, '[]', 1, 0, 'approved', '2026-06-23 11:53:08', '2026-06-23 11:53:08'),
(15, 143, 12, NULL, 5, NULL, 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.', 'sizing_fit', 5, 5, 5, 'Wonderful to hear!', '2026-06-23 11:53:08', '[\"https:\\/\\/images.unsplash.com\\/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-22 11:53:08', '2026-06-22 11:53:08'),
(16, 143, 5, NULL, 4, NULL, 'The plants were as described. Seller service was helpful when I had a question.', 'seller_service', 4, 4, 4, 'Happy to help anytime!', '2026-06-22 11:53:08', '[]', 1, 0, 'approved', '2026-06-21 11:53:08', '2026-06-21 11:53:08'),
(17, 144, 7, NULL, 5, NULL, 'healthy plant love it', 'condition', 5, 5, 5, 'Thank you so much, I\'m glad you like it!!!', '2026-06-16 11:53:08', '[]', 1, 0, 'approved', '2026-06-15 11:53:08', '2026-06-15 11:53:08'),
(18, 144, 8, NULL, 5, NULL, 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!', 'delivery_packaging', 5, 5, 5, 'Thank you so much, Tanya! I really appreciate it!', '2026-06-11 11:53:09', '[]', 1, 0, 'approved', '2026-06-10 11:53:09', '2026-06-10 11:53:09'),
(19, 144, 9, NULL, 5, NULL, 'Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can\'t wait to see how it grows in its new home! Would order from this seller again!', 'description_accuracy', 5, 5, 5, 'Thank you again!!', '2026-06-01 11:53:09', '[]', 1, 0, 'approved', '2026-05-31 11:53:09', '2026-05-31 11:53:09'),
(20, 144, 10, NULL, 5, NULL, 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.', 'quality', 5, 5, 5, 'Thank you so much!!! It really means a lot!!', '2026-05-19 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-05-18 11:53:09', '2026-05-18 11:53:09'),
(21, 144, 11, NULL, 5, NULL, 'Beautiful addition to my garden, looks great and thriving after a week!', 'appearance', 5, 5, 5, 'So glad it is doing well for you!', '2026-06-20 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-19 11:53:09', '2026-06-19 11:53:09'),
(22, 144, 12, NULL, 5, NULL, 'very healthy plant i cant wait to watch it grow!', 'condition', 5, 5, 5, NULL, NULL, '[]', 1, 0, 'approved', '2026-06-23 11:53:09', '2026-06-23 11:53:09'),
(23, 144, 5, NULL, 5, NULL, 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.', 'sizing_fit', 5, 5, 5, 'Wonderful to hear!', '2026-06-23 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-22 11:53:09', '2026-06-22 11:53:09'),
(24, 144, 6, NULL, 4, NULL, 'The plants were as described. Seller service was helpful when I had a question.', 'seller_service', 4, 4, 4, 'Happy to help anytime!', '2026-06-22 11:53:09', '[]', 1, 0, 'approved', '2026-06-21 11:53:09', '2026-06-21 11:53:09'),
(25, 145, 8, NULL, 5, NULL, 'healthy plant love it', 'condition', 5, 5, 5, 'Thank you so much, I\'m glad you like it!!!', '2026-06-16 11:53:09', '[]', 1, 0, 'approved', '2026-06-15 11:53:09', '2026-06-15 11:53:09'),
(26, 145, 9, NULL, 5, NULL, 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!', 'delivery_packaging', 5, 5, 5, 'Thank you so much, Tanya! I really appreciate it!', '2026-06-11 11:53:09', '[]', 1, 0, 'approved', '2026-06-10 11:53:09', '2026-06-10 11:53:09'),
(27, 145, 10, NULL, 5, NULL, 'Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can\'t wait to see how it grows in its new home! Would order from this seller again!', 'description_accuracy', 5, 5, 5, 'Thank you again!!', '2026-06-01 11:53:09', '[]', 1, 0, 'approved', '2026-05-31 11:53:09', '2026-05-31 11:53:09'),
(28, 145, 11, NULL, 5, NULL, 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.', 'quality', 5, 5, 5, 'Thank you so much!!! It really means a lot!!', '2026-05-19 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-05-18 11:53:09', '2026-05-18 11:53:09'),
(29, 145, 12, NULL, 5, NULL, 'Beautiful addition to my garden, looks great and thriving after a week!', 'appearance', 5, 5, 5, 'So glad it is doing well for you!', '2026-06-20 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-19 11:53:09', '2026-06-19 11:53:09'),
(30, 145, 5, NULL, 5, NULL, 'very healthy plant i cant wait to watch it grow!', 'condition', 5, 5, 5, NULL, NULL, '[]', 1, 0, 'approved', '2026-06-23 11:53:09', '2026-06-23 11:53:09'),
(31, 145, 6, NULL, 5, NULL, 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.', 'sizing_fit', 5, 5, 5, 'Wonderful to hear!', '2026-06-23 11:53:09', '[\"https:\\/\\/images.unsplash.com\\/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-22 11:53:09', '2026-06-22 11:53:09'),
(32, 145, 7, NULL, 4, NULL, 'The plants were as described. Seller service was helpful when I had a question.', 'seller_service', 4, 4, 4, 'Happy to help anytime!', '2026-06-22 11:53:09', '[]', 1, 0, 'approved', '2026-06-21 11:53:09', '2026-06-21 11:53:09'),
(33, 146, 9, NULL, 5, NULL, 'healthy plant love it', 'condition', 5, 5, 5, 'Thank you so much, I\'m glad you like it!!!', '2026-06-16 11:53:10', '[]', 1, 0, 'approved', '2026-06-15 11:53:10', '2026-06-15 11:53:10'),
(34, 146, 10, NULL, 5, NULL, 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!', 'delivery_packaging', 5, 5, 5, 'Thank you so much, Tanya! I really appreciate it!', '2026-06-11 11:53:10', '[]', 1, 0, 'approved', '2026-06-10 11:53:10', '2026-06-10 11:53:10'),
(35, 146, 11, NULL, 5, NULL, 'Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can\'t wait to see how it grows in its new home! Would order from this seller again!', 'description_accuracy', 5, 5, 5, 'Thank you again!!', '2026-06-01 11:53:10', '[]', 1, 0, 'approved', '2026-05-31 11:53:10', '2026-05-31 11:53:10'),
(36, 146, 12, NULL, 5, NULL, 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.', 'quality', 5, 5, 5, 'Thank you so much!!! It really means a lot!!', '2026-05-19 11:53:10', '[\"https:\\/\\/images.unsplash.com\\/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-05-18 11:53:10', '2026-05-18 11:53:10'),
(37, 146, 5, NULL, 5, NULL, 'Beautiful addition to my garden, looks great and thriving after a week!', 'appearance', 5, 5, 5, 'So glad it is doing well for you!', '2026-06-20 11:53:10', '[\"https:\\/\\/images.unsplash.com\\/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-19 11:53:10', '2026-06-19 11:53:10'),
(38, 146, 6, NULL, 5, NULL, 'very healthy plant i cant wait to watch it grow!', 'condition', 5, 5, 5, NULL, NULL, '[]', 1, 0, 'approved', '2026-06-23 11:53:10', '2026-06-23 11:53:10'),
(39, 146, 7, NULL, 5, NULL, 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.', 'sizing_fit', 5, 5, 5, 'Wonderful to hear!', '2026-06-23 11:53:10', '[\"https:\\/\\/images.unsplash.com\\/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80\"]', 1, 0, 'approved', '2026-06-22 11:53:10', '2026-06-22 11:53:10'),
(40, 146, 8, NULL, 4, NULL, 'The plants were as described. Seller service was helpful when I had a question.', 'seller_service', 4, 4, 4, 'Happy to help anytime!', '2026-06-22 11:53:10', '[]', 1, 0, 'approved', '2026-06-21 11:53:10', '2026-06-21 11:53:10');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('cOHJLgiupxIoSL32AgWOd9KdTIG9w6UIKdvFF9F2', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoic2pKdmhOU0tHZDgzN1laUGZlNGhta2I0MU51OWg0MVVlTUVnTk9ncyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9jaGVja291dCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1782327246);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `group`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'general', 'site_name', 'Meadowlark Gardens', '2026-06-24 10:34:26', '2026-06-24 10:34:26'),
(2, 'general', 'site_email', 'info@meadowlarkgardens.com', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(3, 'general', 'site_phone', '(615) 555-0100', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(4, 'general', 'tax_rate', '9.25', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(5, 'general', 'currency', 'USD', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(6, 'general', 'stripe_enabled', 'false', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(7, 'general', 'paypal_enabled', 'false', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(8, 'general', 'bank_transfer_enabled', 'true', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(9, 'general', 'cod_enabled', 'true', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(10, 'smtp', 'smtp_host', '', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(11, 'smtp', 'smtp_port', '587', '2026-06-24 10:34:27', '2026-06-24 10:34:27'),
(12, 'smtp', 'smtp_username', '', '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(13, 'smtp', 'smtp_password', '', '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(14, 'smtp', 'smtp_encryption', 'tls', '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(15, 'smtp', 'smtp_from_name', 'Meadowlark Gardens', '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(16, 'smtp', 'smtp_from_email', 'noreply@meadowlarkgardens.com', '2026-06-24 10:34:28', '2026-06-24 10:34:28'),
(17, 'general', 'contact_page_subtitle', '', '2026-06-24 13:24:21', '2026-06-24 13:24:21'),
(18, 'general', 'contact_address', '', '2026-06-24 13:24:21', '2026-06-24 13:24:21'),
(19, 'general', 'contact_phone_note', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(20, 'general', 'contact_email_note', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(21, 'general', 'business_hours_weekday', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(22, 'general', 'business_hours_sunday', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(23, 'general', 'footer_description', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(24, 'general', 'social_facebook', 'https://facebook.com', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(25, 'general', 'social_instagram', '', '2026-06-24 13:24:22', '2026-06-24 13:24:22'),
(26, 'general', 'social_twitter', '', '2026-06-24 13:24:23', '2026-06-24 13:24:23'),
(27, 'general', 'social_youtube', '', '2026-06-24 13:24:23', '2026-06-24 13:24:23'),
(28, 'general', 'social_pinterest', '', '2026-06-24 13:24:23', '2026-06-24 13:24:23'),
(29, 'general', 'stripe_key', '', '2026-06-24 13:51:00', '2026-06-24 13:51:05'),
(30, 'general', 'stripe_secret', '', '2026-06-24 13:51:00', '2026-06-24 13:51:05');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_methods`
--

CREATE TABLE `shipping_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shipping_zone_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('flat_rate','free_shipping','local_delivery','weight_based','price_based') NOT NULL DEFAULT 'flat_rate',
  `cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `estimated_days` varchar(255) DEFAULT NULL,
  `wholesale_only` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_methods`
--

INSERT INTO `shipping_methods` (`id`, `shipping_zone_id`, `name`, `type`, `cost`, `min_order_amount`, `estimated_days`, `wholesale_only`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Standard Shipping', 'flat_rate', 9.99, NULL, '3-5 business days', 0, 1, '2026-06-24 10:34:26', '2026-06-24 10:34:26'),
(2, 1, 'Free Shipping', 'free_shipping', 0.00, 75.00, '5-7 business days', 0, 1, '2026-06-24 10:34:26', '2026-06-24 10:34:26'),
(3, 1, 'Wholesale Delivery', 'flat_rate', 19.99, NULL, '2-4 business days', 1, 1, '2026-06-24 10:34:26', '2026-06-24 10:34:26');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_zones`
--

CREATE TABLE `shipping_zones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `countries` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`countries`)),
  `states` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`states`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_zones`
--

INSERT INTO `shipping_zones` (`id`, `name`, `countries`, `states`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Tennessee & Surrounding', '[\"US\"]', '[\"TN\",\"KY\",\"GA\",\"AL\",\"NC\",\"VA\"]', 1, '2026-06-24 10:34:25', '2026-06-24 10:34:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','wholesale','customer') NOT NULL DEFAULT 'customer',
  `approved` tinyint(1) NOT NULL DEFAULT 1,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `business_name`, `email`, `phone`, `avatar`, `role`, `approved`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Meadowlark Gardens TN', 'admin@meadowlarkgardens.com', 'admin@meadowlarkgardens.com', '/storage/avatars/dbd2026e-5ce3-4f5a-aeb4-7fdba9764019.jpg', 'admin', 1, NULL, '$2y$12$xgY7ABCtJF7xbGPk9nRcgO7ulf3PYnB4afvXod1fvvKJ/S.FSDDue', NULL, '2026-06-23 17:20:23', '2026-06-24 12:30:13'),
(2, 'Patricia Lee', 'Valley Garden Center', 'wholesale@demo.com', NULL, NULL, 'wholesale', 1, NULL, '$2y$12$fvAnAn5ePZxA2uh5NNG2Aunm5w0XLx2FXSnFoKSzfAogVQBpiOc/u', NULL, '2026-06-23 17:20:23', '2026-06-24 10:09:24'),
(3, 'Emily Carter', NULL, 'customer@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$Y8sq.Mpr0iZms54dIYCPbuvhp/fI.8AYzlYhmJg87IyodtU1TmCva', NULL, '2026-06-24 10:09:25', '2026-06-24 10:09:25'),
(4, 'Marcus Johnson', 'Bloom & Grow Landscaping', 'marcus@bloomgrow.com', NULL, NULL, 'wholesale', 1, NULL, '$2y$12$dgSvmSrqyfFe1p5ZIiXoneEhvrOVUa/PpPv5YvCJ8kuBoz29yvUuS', NULL, '2026-06-24 11:04:03', '2026-06-24 11:04:04'),
(5, 'Thao', NULL, 'thao.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$TGW3OdW78rNY0gJdcS5hPemB8k0cOMwgPpQ4jBx44hj0fJgLaCVPq', NULL, '2026-06-24 11:53:05', '2026-06-24 11:53:05'),
(6, 'Tanya', NULL, 'tanya.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$BnzLOsm9R5VxdkXLNNAty.km/0f.DE/Z7F07sKSSYzxqERwN8Xs36', NULL, '2026-06-24 11:53:06', '2026-06-24 11:53:06'),
(7, 'Ruey-I', NULL, 'rueyi.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$cpCcnoSyZh998Y7.TFpqzeHuEmpHYwYfkWgDSRtBZ6FQ.QtaC9iNC', NULL, '2026-06-24 11:53:06', '2026-06-24 11:53:06'),
(8, 'Amandatory', NULL, 'amandatory.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$PWTM2e8lUYf1MPEeo7PJleqV7AfD0Lx6eEvLDuIwiMDiPwNwZrVmS', NULL, '2026-06-24 11:53:06', '2026-06-24 11:53:06'),
(9, 'Tamara', NULL, 'tamara.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$bC6Obw/K.5YnkzeWhfUB2eU8kSJThR6zs0bD/m90D6A3Teu9lZswW', NULL, '2026-06-24 11:53:06', '2026-06-24 11:53:06'),
(10, 'Katie', NULL, 'katie.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$qZ3ZoidpGbTL5ENfB38hk.HvEl7ApLhn35rTZKPwEYXwjz7ZDTehS', NULL, '2026-06-24 11:53:07', '2026-06-24 11:53:07'),
(11, 'Brian', NULL, 'brian.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$ZJxm7SOndw4ogEyMXejMHu/lY0hU8SnEa6kcgdAe9iIhVEEb21lKa', NULL, '2026-06-24 11:53:07', '2026-06-24 11:53:07'),
(12, 'Analise', NULL, 'analise.review@demo.com', NULL, NULL, 'customer', 1, NULL, '$2y$12$AYv/qw39PQ1A3ZwtqvBAPOI8P4kS4uqhG3wIYlr9LVfxazTiAiyaO', NULL, '2026-06-24 11:53:07', '2026-06-24 11:53:07');

-- --------------------------------------------------------

--
-- Table structure for table `wholesale_applications`
--

CREATE TABLE `wholesale_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `business_type` varchar(255) NOT NULL,
  `estimated_monthly_order` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wholesale_applications`
--

INSERT INTO `wholesale_applications` (`id`, `business_name`, `contact_name`, `email`, `phone`, `address`, `business_type`, `estimated_monthly_order`, `message`, `status`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 'Green Thumb Nursery', 'Sarah Mitchell', 'sarah@greenthumb.com', '(615) 555-0191', '245 Garden Way, Nashville, TN 37201', 'Retail Nursery', '$2,000 - $5,000', NULL, 'pending', '2026-06-20 17:20:24', '2026-06-23 17:20:24', '2026-06-23 17:20:24'),
(2, 'Bloom & Grow Landscaping', 'Marcus Johnson', 'marcus@bloomgrow.com', '(865) 555-0247', '88 Creekside Blvd, Knoxville, TN 37902', 'Landscaping Company', '$5,000 - $10,000', NULL, 'approved', '2026-06-24 16:04:02', '2026-06-23 17:20:24', '2026-06-24 11:04:02');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES
(1, 1, 271, '2026-06-24 12:08:31', '2026-06-24 12:08:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_user_id_foreign` (`user_id`);

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attributes_slug_unique` (`slug`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attribute_values_attribute_id_foreign` (`attribute_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_slug_unique` (`slug`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_unique` (`code`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_templates_slug_unique` (`slug`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_user_id_foreign` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`),
  ADD KEY `order_items_variation_id_foreign` (`variation_id`);

--
-- Indexes for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_status_histories_order_id_foreign` (`order_id`),
  ADD KEY `order_status_histories_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_brand_id_foreign` (`brand_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_variations`
--
ALTER TABLE `product_variations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variations_sku_unique` (`sku`),
  ADD KEY `product_variations_product_id_foreign` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_product_id_foreign` (`product_id`),
  ADD KEY `reviews_user_id_foreign` (`user_id`),
  ADD KEY `reviews_order_id_foreign` (`order_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipping_methods_shipping_zone_id_foreign` (`shipping_zone_id`);

--
-- Indexes for table `shipping_zones`
--
ALTER TABLE `shipping_zones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `wholesale_applications`
--
ALTER TABLE `wholesale_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `wishlists_product_id_foreign` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_variations`
--
ALTER TABLE `product_variations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `shipping_zones`
--
ALTER TABLE `shipping_zones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `wholesale_applications`
--
ALTER TABLE `wholesale_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `attribute_values_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_variation_id_foreign` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `order_status_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_status_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variations`
--
ALTER TABLE `product_variations`
  ADD CONSTRAINT `product_variations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD CONSTRAINT `shipping_methods_shipping_zone_id_foreign` FOREIGN KEY (`shipping_zone_id`) REFERENCES `shipping_zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
