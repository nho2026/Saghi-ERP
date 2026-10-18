-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dhf_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `dhf_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dhf_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `dhf_db`;

--
-- Table structure for table `access_permission`
--

DROP TABLE IF EXISTS `access_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_permission` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_permission`
--

LOCK TABLES `access_permission` WRITE;
/*!40000 ALTER TABLE `access_permission` DISABLE KEYS */;
INSERT INTO `access_permission` VALUES ('cmupa0hbo0000t3vsy4v1zxhp','building-expenses.view','view building expenses','building-expenses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbo0001t3vs2xs1pb9p','building-expenses.create','create building expenses','building-expenses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbo0002t3vsppm2gb23','building-expenses.update','update building expenses','building-expenses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbo0003t3vs9zvtkqx1','building-expenses.approve','approve building expenses','building-expenses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbo0004t3vs2161ufis','laboratory.pages.dashboard.view','View laboratory / dashboard','laboratory.pages.dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp0005t3vsbd4mie4v','laboratory.pages.reception.view','View laboratory / reception','laboratory.pages.reception',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp0006t3vs4jbnqo3d','laboratory.pages.queue.view','View laboratory / queue','laboratory.pages.queue',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp0007t3vs08ucyxbj','laboratory.pages.room.view','View laboratory / room','laboratory.pages.room',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp0008t3vstk2wlvt8','laboratory.pages.tickets.view','View laboratory / tickets','laboratory.pages.tickets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp0009t3vsjkq1lkws','laboratory.pages.display.view','View laboratory / display','laboratory.pages.display',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000at3vsi68enlos','laboratory.pages.received.view','View laboratory / received','laboratory.pages.received',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000bt3vs06pipukr','laboratory.pages.completed.view','View laboratory / completed','laboratory.pages.completed',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000ct3vsrbv2ip5j','laboratory.pages.accounting.view','View laboratory / accounting','laboratory.pages.accounting',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000dt3vssskhttou','laboratory.pages.tests.view','View laboratory / tests','laboratory.pages.tests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000et3vs2ssesd4o','laboratory.display.call','Call laboratory display tickets','laboratory.display',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000ft3vsexvdrpfw','laboratory.display.view','View laboratory display management','laboratory.display',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000gt3vsl1933v6f','accounting.accounts.create','Create accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000ht3vsggu2e2au','accounting.accounts.delete','Delete accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbp000it3vs6qovx95n','accounting.accounts.export','Export accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000jt3vshocjq5lq','accounting.accounts.print','Print accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000kt3vsa2xpgreo','accounting.accounts.update','Update accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000lt3vsscbddyb9','accounting.accounts.view','View accounting / accounts','accounting.accounts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000mt3vs5e0zrca4','accounting.customers.create','Create accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000nt3vss0zorrsh','accounting.customers.delete','Delete accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000ot3vsjm6pjpe0','accounting.customers.export','Export accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000pt3vs9djsqgvf','accounting.customers.print','Print accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000qt3vs2s5zmbhj','accounting.customers.update','Update accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000rt3vsmas4ki1s','accounting.customers.view','View accounting / customers','accounting.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000st3vs2hjbndzo','accounting.invoices.create','Create accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000tt3vs5cfom0jp','accounting.invoices.delete','Delete accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000ut3vs1ghcns7d','accounting.invoices.export','Export accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000vt3vs72vwuh9c','accounting.invoices.print','Print accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000wt3vs50dsfbfx','accounting.invoices.update','Update accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000xt3vs4ttwbjs8','accounting.invoices.view','View accounting / invoices','accounting.invoices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbq000yt3vsqkfnglrf','accounting.journals.create','Create accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr000zt3vs03rtrcn0','accounting.journals.delete','Delete accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0010t3vsdfbf3eqa','accounting.journals.export','Export accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0011t3vseb8ori6p','accounting.journals.post','Post accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0012t3vs9z5fxun1','accounting.journals.print','Print accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0013t3vssg5qd2wa','accounting.journals.update','Update accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0014t3vs2laup6jt','accounting.journals.view','View accounting / journals','accounting.journals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0015t3vstde7tegf','accounting.payments.create','Create accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0016t3vsfr1nd6yl','accounting.payments.delete','Delete accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0017t3vs2xpkdnbs','accounting.payments.export','Export accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0018t3vsj0i3vnqx','accounting.payments.print','Print accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr0019t3vswf8zhsbk','accounting.payments.update','Update accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr001at3vslyxfrkq1','accounting.payments.view','View accounting / payments','accounting.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr001bt3vss83csxh6','accounting.reports.create','Create accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr001ct3vsokgnm185','accounting.reports.delete','Delete accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbr001dt3vs463fm0qi','accounting.reports.export','Export accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001et3vsy3b0ld31','accounting.reports.print','Print accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001ft3vswy8karis','accounting.reports.update','Update accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001gt3vsdbpmou9h','accounting.reports.view','View accounting / reports','accounting.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001ht3vs2s0x0vea','accounting.service_advances.create','Create accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001it3vsq6scd9o7','accounting.service_advances.delete','Delete accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001jt3vswkcq0zpx','accounting.service_advances.export','Export accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001kt3vs722lceg9','accounting.service_advances.print','Print accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001lt3vsk9totrcq','accounting.service_advances.update','Update accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001mt3vsa7rn7ycz','accounting.service_advances.view','View accounting / service_advances','accounting.service_advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001nt3vs48hb3mfw','attendance.create','Create attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001ot3vsoh9whbtm','attendance.delete','Delete attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001pt3vsqyqpo2k2','attendance.devices.create','Create attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001qt3vs6q168xru','attendance.devices.delete','Delete attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001rt3vs0yy53hg8','attendance.devices.export','Export attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001st3vs99wa7vnj','attendance.devices.print','Print attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbs001tt3vskaroughj','attendance.devices.test','Test attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001ut3vsn3akv569','attendance.devices.update','Update attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001vt3vsr3x340ss','attendance.devices.view','View attendance / devices','attendance.devices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001wt3vs0hgeb8hz','attendance.events.create','Create attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001xt3vsoim8fnfg','attendance.events.delete','Delete attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001yt3vs3uoravf8','attendance.events.export','Export attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt001zt3vs8zfbnkzx','attendance.events.print','Print attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0020t3vs5p7nit58','attendance.events.sync','Sync attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0021t3vsqfnt4rkq','attendance.events.update','Update attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0022t3vsmo4pm1i8','attendance.events.view','View attendance / events','attendance.events',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0023t3vshs2bdkt1','attendance.export','Export attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0024t3vsl9jhr87c','attendance.print','Print attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0025t3vsupgaz9s3','attendance.update','Update attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0026t3vsemj3lu0d','attendance.users.create','Create attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0027t3vsnp8vagui','attendance.users.delete','Delete attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0028t3vs7mlgjskb','attendance.users.export','Export attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt0029t3vs1cyg44pt','attendance.users.print','Print attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt002at3vs4dwxo5w5','attendance.users.sync','Sync attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbt002bt3vsc4zocp07','attendance.users.update','Update attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002ct3vs3uost8ui','attendance.users.view','View attendance / users','attendance.users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002dt3vsoruv5ygy','attendance.view','View attendance','attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002et3vsnufsob9f','crm.forms.create','Create crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002ft3vstrlng4cc','crm.forms.delete','Delete crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002gt3vsji9y9i8o','crm.forms.export','Export crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002ht3vsrjozxfht','crm.forms.print','Print crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002it3vsg28jh0u8','crm.forms.update','Update crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002jt3vsgtlhkeyg','crm.forms.view','View crm / forms','crm.forms',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002kt3vsd65cdf6w','crm.leads.create','Create crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002lt3vsym3l75q0','crm.leads.delete','Delete crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002mt3vssdn8nznd','crm.leads.export','Export crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002nt3vs7ahto5r1','crm.leads.print','Print crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002ot3vsj947e6qa','crm.leads.update','Update crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002pt3vsqj9q4l9h','crm.leads.view','View crm / leads','crm.leads',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbu002qt3vs4r9j9lmd','crm.lookups.create','Create crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002rt3vsk2nfa8ku','crm.lookups.delete','Delete crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002st3vshr2rp2hu','crm.lookups.export','Export crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002tt3vsd7rk0n6p','crm.lookups.print','Print crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002ut3vs79314q6p','crm.lookups.update','Update crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002vt3vs6rfflgnv','crm.lookups.view','View crm / lookups','crm.lookups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002wt3vsmzmzk7zk','crm.patients.create','Create crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002xt3vsgn1jw26r','crm.patients.delete','Delete crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002yt3vslxyoyzbv','crm.patients.export','Export crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv002zt3vsc0hop27h','crm.patients.print','Print crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0030t3vswe2yt1eh','crm.patients.update','Update crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0031t3vsxgft2c9v','crm.patients.view','View crm / patients','crm.patients',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0032t3vsx0uhq0os','crm.payments.create','Create crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0033t3vshdhgak6l','crm.payments.delete','Delete crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0034t3vsq60ge7cd','crm.payments.export','Export crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0035t3vstohoscfv','crm.payments.print','Print crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0036t3vsxp3ph6rp','crm.payments.update','Update crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbv0037t3vssjs37yrc','crm.payments.view','View crm / payments','crm.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw0038t3vsxbb7k1k2','crm.prescriptions.create','Create crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw0039t3vsnos9556v','crm.prescriptions.delete','Delete crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003at3vscd3w1t4g','crm.prescriptions.export','Export crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003bt3vsiufysopn','crm.prescriptions.print','Print crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003ct3vsids7y97q','crm.prescriptions.update','Update crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003dt3vsel9frzr3','crm.prescriptions.view','View crm / prescriptions','crm.prescriptions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003et3vsukn3m9gx','crm.referrals.create','Create crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003ft3vs9fgaedwx','crm.referrals.delete','Delete crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003gt3vsnh0y6s4u','crm.referrals.export','Export crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003ht3vs04yoxeh0','crm.referrals.print','Print crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003it3vssf8jq8ff','crm.referrals.update','Update crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003jt3vsv1gx9l8w','crm.referrals.view','View crm / referrals','crm.referrals',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003kt3vsog983ezd','crm.surgeries.create','Create crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003lt3vspulew9ss','crm.surgeries.delete','Delete crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003mt3vsp7t6c0g2','crm.surgeries.export','Export crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003nt3vsrv301dbo','crm.surgeries.print','Print crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbw003ot3vs3eaad4p8','crm.surgeries.update','Update crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003pt3vsxjym7sty','crm.surgeries.view','View crm / surgeries','crm.surgeries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003qt3vsc6xn19xz','crm.surgery-appointments.create','Create crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003rt3vssmhkhv67','crm.surgery-appointments.delete','Delete crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003st3vsf5ro3ohm','crm.surgery-appointments.export','Export crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003tt3vsj9g4ar03','crm.surgery-appointments.print','Print crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003ut3vshrmk6akh','crm.surgery-appointments.update','Update crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003vt3vsj8nf7mob','crm.surgery-appointments.view','View crm / surgery appointments','crm.surgery-appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003wt3vs1ggdqyun','crm.whatsapp.create','Create crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003xt3vs6a4mybad','crm.whatsapp.delete','Delete crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003yt3vsif78k7nb','crm.whatsapp.export','Export crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx003zt3vs6w8zv22c','crm.whatsapp.print','Print crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx0040t3vskf03r92r','crm.whatsapp.send','Send crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx0041t3vs2lysmwee','crm.whatsapp.update','Update crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx0042t3vsl3m4si3t','crm.whatsapp.view','View crm / whatsapp','crm.whatsapp',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbx0043t3vsh9b2mt46','dashboard.create','Create dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0044t3vsed6eealq','dashboard.delete','Delete dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0045t3vshh2qdoi8','dashboard.export','Export dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0046t3vs692kuhdq','dashboard.print','Print dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0047t3vswv8mlbqa','dashboard.update','Update dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0048t3vse6vw6v9s','dashboard.view','View dashboard','dashboard',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby0049t3vsnux2amlk','employee-portal.create','Create employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004at3vsoje0dqg9','employee-portal.delete','Delete employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004bt3vsb56e7z22','employee-portal.export','Export employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004ct3vsakfg4kb8','employee-portal.print','Print employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004dt3vswt8impk3','employee-portal.update','Update employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004et3vsql2pp9tt','employee-portal.view','View employee portal','employee-portal',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004ft3vs7z0lg8d9','finance.analysis.create','Create finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004gt3vsqn6e6tsw','finance.analysis.delete','Delete finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hby004ht3vsxhbm6qmp','finance.analysis.export','Export finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004it3vs80ik9xk6','finance.analysis.print','Print finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004jt3vs81m37x4u','finance.analysis.update','Update finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004kt3vsoofriqf9','finance.analysis.view','View finance / analysis','finance.analysis',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004lt3vskjefp06a','finance.budgets.create','Create finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004mt3vsyvqajlm5','finance.budgets.delete','Delete finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004nt3vshqmjklxm','finance.budgets.export','Export finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004ot3vsz6qqlv19','finance.budgets.print','Print finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004pt3vs9nge9t0t','finance.budgets.update','Update finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004qt3vsq3faizkl','finance.budgets.view','View finance / budgets','finance.budgets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004rt3vsi74v42f2','finance.cash-flow.approve','Approve finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004st3vsjm2rt6rr','finance.cash-flow.create','Create finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004tt3vssuigsf19','finance.cash-flow.delete','Delete finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004ut3vspywvk7xf','finance.cash-flow.export','Export finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hbz004vt3vsq5fqij0l','finance.cash-flow.print','Print finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc0004wt3vsxyyw69yd','finance.cash-flow.update','Update finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc0004xt3vsd8rsfzvc','finance.cash-flow.view','View finance / cash flow','finance.cash-flow',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc0004yt3vs2tpy6dyj','finance.forecasts.create','Create finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc0004zt3vsb8p7dnip','finance.forecasts.delete','Delete finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00050t3vskuvdukca','finance.forecasts.export','Export finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00051t3vscnkdcpzo','finance.forecasts.print','Print finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00052t3vsueucgkeo','finance.forecasts.update','Update finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00053t3vs03idacji','finance.forecasts.view','View finance / forecasts','finance.forecasts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00054t3vsgnm3bdww','finance.funding.create','Create finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00055t3vso3ixjwpe','finance.funding.delete','Delete finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00056t3vsyov5sf6k','finance.funding.export','Export finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00057t3vsrsspnxnc','finance.funding.print','Print finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc00058t3vsecbzrf5e','finance.funding.update','Update finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc10059t3vssrvf2eee','finance.funding.view','View finance / funding','finance.funding',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005at3vsgcmb1a0a','finance.overview.create','Create finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005bt3vs75e8dcsj','finance.overview.delete','Delete finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005ct3vsgpl9ub98','finance.overview.export','Export finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005dt3vs30jv8yvt','finance.overview.print','Print finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005et3vsullpey5e','finance.overview.update','Update finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005ft3vsocoosubn','finance.overview.view','View finance / overview','finance.overview',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005gt3vslmuyy4r6','healthcare.appointments.create','Create healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005ht3vsvld4erzw','healthcare.appointments.delete','Delete healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005it3vs2mnxcgqp','healthcare.appointments.export','Export healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005jt3vszf7qr5i6','healthcare.appointments.print','Print healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005kt3vsu0zm3my0','healthcare.appointments.update','Update healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005lt3vskc2t2cc8','healthcare.appointments.view','View healthcare / appointments','healthcare.appointments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005mt3vssoz42vko','healthcare.departments.create','Create healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc1005nt3vstopli3qc','healthcare.departments.delete','Delete healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005ot3vs91b4dbn9','healthcare.departments.export','Export healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005pt3vswnldseq6','healthcare.departments.print','Print healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005qt3vsubw8sbv1','healthcare.departments.update','Update healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005rt3vsg17ebgqe','healthcare.departments.view','View healthcare / departments','healthcare.departments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005st3vsrzofxehc','healthcare.feedback.create','Create healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005tt3vsuognne1u','healthcare.feedback.delete','Delete healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005ut3vs8cqzt10y','healthcare.feedback.export','Export healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005vt3vseldy5pb7','healthcare.feedback.print','Print healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005wt3vsup9w6nc7','healthcare.feedback.update','Update healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005xt3vs202h014o','healthcare.feedback.view','View healthcare / feedback','healthcare.feedback',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005yt3vs4hedgb0r','healthcare.specializations.create','Create healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc2005zt3vs3tf3nl5q','healthcare.specializations.delete','Delete healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20060t3vs2dy61xvh','healthcare.specializations.export','Export healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20061t3vsv581vx8n','healthcare.specializations.print','Print healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20062t3vsuantr8gd','healthcare.specializations.update','Update healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20063t3vsmgnik2ej','healthcare.specializations.view','View healthcare / specializations','healthcare.specializations',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20064t3vs23udpme9','healthcare.staff.create','Create healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc20065t3vsbr3rnz2l','healthcare.staff.delete','Delete healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc30066t3vscxtwypew','healthcare.staff.export','Export healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc30067t3vs146qf0ag','healthcare.staff.print','Print healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc30068t3vsth3fc20s','healthcare.staff.update','Update healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc30069t3vszfv847an','healthcare.staff.view','View healthcare / staff','healthcare.staff',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006at3vszv05834d','hr.advances.create','Create hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006bt3vsvosmud23','hr.advances.delete','Delete hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006ct3vszqgsc6hu','hr.advances.export','Export hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006dt3vson1jz5ks','hr.advances.print','Print hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006et3vs6pkldyum','hr.advances.update','Update hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006ft3vsgkiica7m','hr.advances.view','View hr / advances','hr.advances',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006gt3vsobbbnx7m','hr.attendance-permissions.create','Create hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006ht3vsxy2p2tcg','hr.attendance-permissions.delete','Delete hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006it3vs17sw69yp','hr.attendance-permissions.export','Export hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc3006jt3vs1g9c8qdj','hr.attendance-permissions.print','Print hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006kt3vs2q6ghegs','hr.attendance-permissions.update','Update hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006lt3vs8myb7wvd','hr.attendance-permissions.view','View hr / attendance permissions','hr.attendance-permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006mt3vsv8v2g3m2','hr.attendance.create','Create hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006nt3vsqogcq2ys','hr.attendance.delete','Delete hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006ot3vso09oem8k','hr.attendance.export','Export hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006pt3vsdeyf4xu2','hr.attendance.print','Print hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006qt3vsm6lwttre','hr.attendance.update','Update hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006rt3vskd4ajj61','hr.attendance.view','View hr / attendance','hr.attendance',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006st3vsq091761l','hr.employees.create','Create hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006tt3vsokrj4kgq','hr.employees.delete','Delete hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006ut3vstvsai8sm','hr.employees.export','Export hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006vt3vsi9by8fsj','hr.employees.print','Print hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006wt3vs7nw2sg98','hr.employees.update','Update hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006xt3vs5z6tzhr4','hr.employees.view','View hr / employees','hr.employees',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006yt3vsasoejg1i','hr.payroll-adjustments.create','Create hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc4006zt3vsndkx7f4p','hr.payroll-adjustments.delete','Delete hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc40070t3vsgfkpceks','hr.payroll-adjustments.export','Export hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc40071t3vs5xcm4t2i','hr.payroll-adjustments.print','Print hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50072t3vsm9sdft5g','hr.payroll-adjustments.update','Update hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50073t3vspx8i52ec','hr.payroll-adjustments.view','View hr / payroll adjustments','hr.payroll-adjustments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50074t3vsvmnplgf1','hr.payrolls.create','Create hr / payrolls','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50075t3vsukb2cz3f','hr.payrolls.delete','Delete hr / payrolls','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50076t3vsia5mz8t2','hr.payrolls.export','Export hr / payrolls','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50077t3vs1grls6ea','hr.payrolls.print','Print payroll list','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50078t3vsq0t4ns5l','hr.payrolls.update','Update hr / payrolls','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc50079t3vs6khp7kg3','hr.payrolls.view','View hr / payrolls','hr.payrolls',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007at3vsn7uonyem','hr.positions.create','Create hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007bt3vs5fq9v8b9','hr.positions.delete','Delete hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007ct3vs0hautyz8','hr.positions.export','Export hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007dt3vswj6c1a45','hr.positions.print','Print hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007et3vs4ctbj941','hr.positions.update','Update hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007ft3vs1qf0t9ul','hr.positions.view','View hr / positions','hr.positions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007gt3vs9d0cgn4s','hr.reports.create','Create hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc5007ht3vsq9whk6q6','hr.reports.delete','Delete hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007it3vscjv7k9n7','hr.reports.export','Export hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007jt3vsdifi1vmh','hr.reports.print','Print hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007kt3vske3s2grx','hr.reports.update','Update hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007lt3vsq63q31pz','hr.reports.view','View hr / reports','hr.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007mt3vsotadn23u','hr.salaries.create','Create hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007nt3vsr0sqp264','hr.salaries.delete','Delete hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007ot3vsrp80ssro','hr.salaries.export','Export hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007pt3vsrni1yb0o','hr.salaries.print','Print hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007qt3vsnp47oazc','hr.salaries.update','Update hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007rt3vshzfkvnjv','hr.salaries.view','View hr / salaries','hr.salaries',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007st3vs3p77z2n7','hr.warnings.create','Create hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007tt3vsuidnbl6j','hr.warnings.delete','Delete hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007ut3vsz8met7cb','hr.warnings.export','Export hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007vt3vs8kfn54d3','hr.warnings.print','Print hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007wt3vsiqa89arh','hr.warnings.update','Update hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007xt3vseejb9l7r','hr.warnings.view','View hr / warnings','hr.warnings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc6007yt3vsjz80a39p','inventory.barcodes.create','Create inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7007zt3vsfkhksre1','inventory.barcodes.delete','Delete inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70080t3vsqrdbfplg','inventory.barcodes.export','Export inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70081t3vsxbf7zann','inventory.barcodes.print','Print inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70082t3vsbi73vj7u','inventory.barcodes.update','Update inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70083t3vsky77ujf4','inventory.barcodes.view','View inventory / barcodes','inventory.barcodes',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70084t3vsx0tq9qer','inventory.brands.create','Create inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70085t3vs6dlhqpgb','inventory.brands.delete','Delete inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70086t3vsnl73i44w','inventory.brands.export','Export inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70087t3vsqaych120','inventory.brands.print','Print inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70088t3vsrot632y3','inventory.brands.update','Update inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc70089t3vsn599hnh8','inventory.brands.view','View inventory / brands','inventory.brands',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008at3vs2y9yrd2n','inventory.cardiac-surgery.create','Create inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008bt3vsthyvdaoc','inventory.cardiac-surgery.delete','Delete inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008ct3vsmv2goiff','inventory.cardiac-surgery.export','Export inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008dt3vsi4894sz0','inventory.cardiac-surgery.print','Print inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008et3vsd3u4jtmh','inventory.cardiac-surgery.update','Update inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008ft3vsip1q0s5r','inventory.cardiac-surgery.view','View inventory / cardiac surgery','inventory.cardiac-surgery',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc7008gt3vsj0stjvnj','inventory.cardiac-sw.create','Create inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008ht3vs3ypaymnw','inventory.cardiac-sw.delete','Delete inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008it3vsdcmkfn3g','inventory.cardiac-sw.export','Export inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008jt3vsr5dy9m40','inventory.cardiac-sw.print','Print inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008kt3vsq2uaj3au','inventory.cardiac-sw.update','Update inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008lt3vsre2v50dw','inventory.cardiac-sw.view','View inventory / cardiac sw','inventory.cardiac-sw',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008mt3vsicb52t9k','inventory.cardiology.create','Create inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008nt3vsjgelr7u0','inventory.cardiology.delete','Delete inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008ot3vs68bd0eh0','inventory.cardiology.export','Export inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008pt3vsc3d7makx','inventory.cardiology.print','Print inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008qt3vsrn1mlydk','inventory.cardiology.update','Update inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008rt3vsf6ja6s5o','inventory.cardiology.view','View inventory / cardiology','inventory.cardiology',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008st3vsjw805zqz','inventory.categories.create','Create inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008tt3vsnfdadrsh','inventory.categories.delete','Delete inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008ut3vsieqsm4g3','inventory.categories.export','Export inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008vt3vsc7pyopv9','inventory.categories.print','Print inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008wt3vs40qv0iz3','inventory.categories.update','Update inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc8008xt3vsvnxl9a9o','inventory.categories.view','View inventory / categories','inventory.categories',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc9008yt3vst702wf5a','inventory.customers.create','Create inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc9008zt3vskrojbkp3','inventory.customers.delete','Delete inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90090t3vsweu08wcj','inventory.customers.export','Export inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90091t3vskxapn1r0','inventory.customers.print','Print inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90092t3vsadjnyt16','inventory.customers.update','Update inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90093t3vsnsvugewu','inventory.customers.view','View inventory / customers','inventory.customers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90094t3vs2t1acwld','inventory.department-orders.comment','Comment inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90095t3vsfdxwkkxi','inventory.department-orders.create','Create inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90096t3vs4xi6mriy','inventory.department-orders.delete','Delete inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90097t3vscebny9xd','inventory.department-orders.export','Export inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90098t3vsxhao5s4j','inventory.department-orders.print','Print inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc90099t3vso9yxav4z','inventory.department-orders.update','Update inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc9009at3vspygqy3bo','inventory.department-orders.view','View inventory / department orders','inventory.department-orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc9009bt3vsvuhhp9mu','inventory.department-requests.create','Create inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hc9009ct3vska03rg9u','inventory.department-requests.delete','Delete inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009dt3vshi628a0v','inventory.department-requests.export','Export inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009et3vsspn9wo2l','inventory.department-requests.print','Print inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009ft3vsmr4ktzog','inventory.department-requests.update','Update inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009gt3vseolad4r5','inventory.department-requests.view','View inventory / department requests','inventory.department-requests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009ht3vs1x40yoae','inventory.expiry.create','Create inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009it3vsxdevvxyk','inventory.expiry.delete','Delete inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009jt3vsdgk29amq','inventory.expiry.export','Export inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009kt3vsqx07mzvr','inventory.expiry.print','Print inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009lt3vskex8na0j','inventory.expiry.update','Update inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009mt3vs0rd4fc67','inventory.expiry.view','View inventory / expiry','inventory.expiry',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009nt3vsvuj6no5x','inventory.icu.create','Create inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009ot3vshr6dzwmn','inventory.icu.delete','Delete inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009pt3vsdzd4rsju','inventory.icu.export','Export inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009qt3vsjtyb6a8u','inventory.icu.print','Print inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009rt3vs2ix8imvb','inventory.icu.update','Update inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009st3vsgbebvfh7','inventory.icu.view','View inventory / icu','inventory.icu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009tt3vsxdeuggzd','inventory.item-reductions.create','Create inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009ut3vs1ionsiz5','inventory.item-reductions.delete','Delete inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hca009vt3vsqb27sf0x','inventory.item-reductions.export','Export inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb009wt3vsegyhyr3y','inventory.item-reductions.print','Print inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb009xt3vs0n2j3uth','inventory.item-reductions.update','Update inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb009yt3vsem4ofqe9','inventory.item-reductions.view','View inventory / item reductions','inventory.item-reductions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb009zt3vslsssn5db','inventory.movements.create','Create inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a0t3vsjyl5uni4','inventory.movements.delete','Delete inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a1t3vs3xijrbc2','inventory.movements.export','Export inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a2t3vszqptgcyj','inventory.movements.print','Print inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a3t3vsosje8gej','inventory.movements.update','Update inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a4t3vsm3y3xm25','inventory.movements.view','View inventory / movements','inventory.movements',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a5t3vs33q6po7v','inventory.orders.create','Create inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a6t3vsrngwukwd','inventory.orders.delete','Delete inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a7t3vs91lt3rft','inventory.orders.export','Export inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a8t3vssp7mo8yq','inventory.orders.print','Print inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00a9t3vsleiibey3','inventory.orders.update','Update inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00aat3vsz1tdnk8v','inventory.orders.view','View inventory / orders','inventory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00abt3vslu8snoy8','inventory.patient-products.create','Create inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00act3vs964rqhbj','inventory.patient-products.delete','Delete inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcb00adt3vs51cevtpv','inventory.patient-products.export','Export inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aet3vszcjxljt3','inventory.patient-products.print','Print inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aft3vs9rzjwm9i','inventory.patient-products.update','Update inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00agt3vspnlqpbri','inventory.patient-products.view','View inventory / patient products','inventory.patient-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aht3vsg4p67m3j','inventory.picu.create','Create inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00ait3vs3qzhs08k','inventory.picu.delete','Delete inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00ajt3vsqf7j9aeo','inventory.picu.export','Export inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00akt3vssdhazj2v','inventory.picu.print','Print inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00alt3vsayad787w','inventory.picu.update','Update inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00amt3vs89j3j2bm','inventory.picu.view','View inventory / picu','inventory.picu',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00ant3vsgb00wz6x','inventory.production-companies.create','Create inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aot3vsp90uxop9','inventory.production-companies.delete','Delete inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00apt3vsw1keaqa1','inventory.production-companies.export','Export inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aqt3vs9w7gcyms','inventory.production-companies.print','Print inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00art3vs0284inth','inventory.production-companies.update','Update inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00ast3vsbmuv9kaa','inventory.production-companies.view','View inventory / production companies','inventory.production-companies',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00att3vs1ds5mbf1','inventory.products.create','Create inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcc00aut3vsuydndm1e','inventory.products.delete','Delete inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00avt3vsofaeqctp','inventory.products.export','Export inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00awt3vscesgnex3','inventory.products.print','Print inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00axt3vsv3eliv1d','inventory.products.update','Update inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00ayt3vs1gdgqdwr','inventory.products.view','View inventory / products','inventory.products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00azt3vsjhcsafec','inventory.purchase-debts.create','Create inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b0t3vs1v00qvlz','inventory.purchase-debts.delete','Delete inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b1t3vsybjc8l63','inventory.purchase-debts.export','Export inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b2t3vsd7vzvn5x','inventory.purchase-debts.print','Print inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b3t3vs4g3hm7nv','inventory.purchase-debts.update','Update inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b4t3vsyzwdc9u1','inventory.purchase-debts.view','View inventory / purchase debts','inventory.purchase-debts',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b5t3vs8jlkl511','inventory.purchases.create','Create inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b6t3vshd1saivv','inventory.purchases.delete','Delete inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b7t3vst9aye8gy','inventory.purchases.export','Export inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b8t3vsl5i7g76z','inventory.purchases.pay','Pay inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00b9t3vsute820yz','inventory.purchases.print','Print inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00bat3vs3ggy988u','inventory.purchases.return','Return inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcd00bbt3vsf788u1p9','inventory.purchases.update','Update inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bct3vs1ovgqviz','inventory.purchases.view','View inventory / purchases','inventory.purchases',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bdt3vsmzypk7j9','inventory.retailers.create','Create inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bet3vs84hlc67m','inventory.retailers.delete','Delete inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bft3vs6jd4px5r','inventory.retailers.export','Export inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bgt3vsiwsb6q6t','inventory.retailers.print','Print inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bht3vs1qhorbsq','inventory.retailers.update','Update inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bit3vs673vw5oz','inventory.retailers.view','View inventory / retailers','inventory.retailers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bjt3vszuxv0snf','inventory.special-prices.create','Create inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bkt3vs6d19617n','inventory.special-prices.delete','Delete inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00blt3vs1ze2kv7t','inventory.special-prices.export','Export inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bmt3vs5rhsw5pw','inventory.special-prices.print','Print inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bnt3vsopnnpcl2','inventory.special-prices.update','Update inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bot3vs1ujb0obz','inventory.special-prices.view','View inventory / special prices','inventory.special-prices',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bpt3vsjco6nlpc','inventory.stock.adjust','Adjust inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bqt3vsoxixb66b','inventory.stock.create','Create inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00brt3vsviv0fshl','inventory.stock.delete','Delete inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00bst3vslvqp3qma','inventory.stock.export','Export inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hce00btt3vsg1pc4yxx','inventory.stock.print','Print inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00but3vspjm6qvdq','inventory.stock.update','Update inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00bvt3vsvvl3sthj','inventory.stock.view','View inventory / stock','inventory.stock',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00bwt3vszw2kgdfu','inventory.surgery-bypass.create','Create inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00bxt3vsw23n0mrw','inventory.surgery-bypass.delete','Delete inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00byt3vsiv2jpzx6','inventory.surgery-bypass.export','Export inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00bzt3vs7wy8tolm','inventory.surgery-bypass.print','Print inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c0t3vs1a79sdsm','inventory.surgery-bypass.update','Update inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c1t3vs00oks9zp','inventory.surgery-bypass.view','View inventory / surgery bypass','inventory.surgery-bypass',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c2t3vss3pb0f79','inventory.thresholds.create','Create inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c3t3vswgtt6hz7','inventory.thresholds.delete','Delete inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c4t3vsgiudecnw','inventory.thresholds.export','Export inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c5t3vs69s9npt1','inventory.thresholds.print','Print inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c6t3vs3hlxb738','inventory.thresholds.update','Update inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c7t3vsp0m3zmwo','inventory.thresholds.view','View inventory / thresholds','inventory.thresholds',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c8t3vsh6e454kl','inventory.top-products.create','Create inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00c9t3vs4ae42a3g','inventory.top-products.delete','Delete inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00cat3vsggya9y2s','inventory.top-products.export','Export inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcf00cbt3vsau5eu5t9','inventory.top-products.print','Print inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cct3vskuju06z8','inventory.top-products.update','Update inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cdt3vsi3zk74r2','inventory.top-products.view','View inventory / top products','inventory.top-products',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cet3vsci1lypnq','inventory.transfers.create','Create inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cft3vsr7e0ge0d','inventory.transfers.delete','Delete inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cgt3vs4f646k99','inventory.transfers.export','Export inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cht3vs4iu938fh','inventory.transfers.print','Print inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cit3vspa12hhtf','inventory.transfers.update','Update inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cjt3vs1yjyu7uj','inventory.transfers.view','View inventory / transfers','inventory.transfers',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00ckt3vssfncvm9m','inventory.warehouses.create','Create inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00clt3vscl1yjsbu','inventory.warehouses.delete','Delete inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cmt3vsbw5pote9','inventory.warehouses.export','Export inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cnt3vsgz03s4f3','inventory.warehouses.print','Print inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cot3vsufgdy5dr','inventory.warehouses.update','Update inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cpt3vs4q1i1obg','inventory.warehouses.view','View inventory / warehouses','inventory.warehouses',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00cqt3vs237wl5ut','meetings.chat','Chat meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcg00crt3vs00lguv6f','meetings.create','Create meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cst3vshdi7odb2','meetings.delete','Delete meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00ctt3vsknl26wo6','meetings.end','End meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cut3vs4bdmtn13','meetings.export','Export meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cvt3vs1lipjehk','meetings.join','Join meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cwt3vs5x22zama','meetings.print','Print meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cxt3vs4v52vv6p','meetings.update','Update meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00cyt3vsaxgysd1u','meetings.view','View meetings','meetings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00czt3vstjknuroo','notifications.create','Create notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d0t3vs9zhuun60','notifications.delete','Delete notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d1t3vso771aebq','notifications.export','Export notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d2t3vsczuf7jvo','notifications.print','Print notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d3t3vsv1recz0s','notifications.update','Update notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d4t3vsye1dhbnq','notifications.view','View notifications','notifications',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d5t3vs5tje6h60','permissions.create','Create permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d6t3vs48byl119','permissions.delete','Delete permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d7t3vsuey7erri','permissions.export','Export permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d8t3vsnms3bc8w','permissions.print','Print permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hch00d9t3vs2wrguhxd','permissions.update','Update permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dat3vs6jzgf7tn','permissions.view','View permissions','permissions',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dbt3vso8xer2my','pos.checkout.create','Create pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dct3vs5yiamsm5','pos.checkout.delete','Delete pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00ddt3vst4ofx25c','pos.checkout.export','Export pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00det3vsgmcg6h30','pos.checkout.print','Print pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dft3vsfmm7sxj4','pos.checkout.update','Update pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dgt3vsn80krirj','pos.checkout.view','View pos / checkout','pos.checkout',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dht3vsis0l49y3','pos.sales.cancel','Cancel pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dit3vskht64j9e','pos.sales.create','Create pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00djt3vsows1t6s2','pos.sales.delete','Delete pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dkt3vstt4lcgnj','pos.sales.export','Export pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dlt3vsgw8fi8kv','pos.sales.print','Print pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dmt3vs0ry7tkn9','pos.sales.return','Return pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dnt3vsa0lrgpa7','pos.sales.update','Update pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dot3vsmvbxnnpl','pos.sales.view','View pos / sales','pos.sales',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dpt3vs2zfowptz','profile.create','Create profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00dqt3vszqk9i7na','profile.delete','Delete profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hci00drt3vsmshogn17','profile.export','Export profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dst3vspqy6q5p2','profile.print','Print profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dtt3vshcdw4nz7','profile.update','Update profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dut3vsncxp5j8u','profile.view','View profile','profile',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dvt3vsyd2ui4n9','roles.assign_permissions','Assign permissions roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dwt3vsfnwps0fo','roles.create','Create roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dxt3vswke2mf3h','roles.delete','Delete roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dyt3vshhxsx4kn','roles.export','Export roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00dzt3vsfxrtfszc','roles.print','Print roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e0t3vs8ietcqr6','roles.update','Update roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e1t3vsgbdq2ydc','roles.view','View roles','roles',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e2t3vss1zq6qmu','settings.backups.create','Create settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e3t3vswanijyal','settings.backups.delete','Delete settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e4t3vsog4d9zd8','settings.backups.export','Export settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e5t3vsmu4ib27r','settings.backups.print','Print settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e6t3vs0wmx8chq','settings.backups.update','Update settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e7t3vsl428frf3','settings.backups.view','View settings / backups','settings.backups',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e8t3vsq4dw5isv','settings.create','Create settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcj00e9t3vs5679lf5i','settings.delete','Delete settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eat3vshnb4x5ju','settings.export','Export settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00ebt3vsm9kci3iz','settings.print','Print settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00ect3vstrxn27pm','settings.update','Update settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00edt3vs654d3vw0','settings.view','View settings','settings',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eet3vs8yg9s41h','system.logs.create','Create system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eft3vslsc5ti60','system.logs.delete','Delete system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00egt3vsmhqm1f3j','system.logs.export','Export system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eht3vsrnmpfj7b','system.logs.print','Print system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eit3vsbi1n2voe','system.logs.update','Update system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00ejt3vs5id3bwrt','system.logs.view','View system / logs','system.logs',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00ekt3vsojehj7fw','targets.create','Create targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00elt3vsikfpr9w5','targets.delete','Delete targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00emt3vsvle5p694','targets.export','Export targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00ent3vsvmbjj33k','targets.manage_all','Manage all targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hck00eot3vsnb6x1zls','targets.print','Print targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ept3vsrv96shgy','targets.reward','Grant target rewards','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00eqt3vsiash177l','targets.update','Update targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ert3vsisv7dfgx','targets.view','View targets','targets',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00est3vs7kk8pax2','tasks.list.approve','Approve task completion','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ett3vs0yubhdw7','tasks.list.attach','Attach tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00eut3vsfoa1s4il','tasks.list.comment','Comment tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00evt3vs9ukjay28','tasks.list.create','Create tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ewt3vs24plctm1','tasks.list.delete','Delete tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ext3vs1ummq2gp','tasks.list.export','Export tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00eyt3vstojbz2zj','tasks.list.manage_all','Manage all tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00ezt3vsvfzz4x33','tasks.list.print','Print tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f0t3vsi2udzvjc','tasks.list.record_time','Record time tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f1t3vsmr4d7lj4','tasks.list.update','Update tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f2t3vsrzg47zhc','tasks.list.view','View tasks / list','tasks.list',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f3t3vsaena40xn','tasks.reports.create','Create tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f4t3vsw3s32m89','tasks.reports.delete','Delete tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f5t3vs8zbujy3i','tasks.reports.export','Export tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcl00f6t3vsrpztzhtg','tasks.reports.print','Print tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00f7t3vsu8t032sk','tasks.reports.update','Update tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00f8t3vspm4n3a5j','tasks.reports.view','View tasks / reports','tasks.reports',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00f9t3vsa4m8clem','users.assign_roles','Assign user roles','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fat3vsoxlislku','users.create','Create users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fbt3vses7vv9uj','users.delete','Delete users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fct3vsqa29crep','users.export','Export users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fdt3vsi1noo4zt','users.password','Password users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fet3vsdzw2tw1e','users.print','Print users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fft3vswkuecsjq','users.update','Update users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fgt3vshg7q2tjd','users.view','View users','users',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fht3vsjz6q8eez','laboratory.orders.view','View laboratory / orders','laboratory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fit3vs00sxy8lh','laboratory.orders.create','Create laboratory / orders','laboratory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fjt3vsugtv6qid','laboratory.orders.update','Update laboratory / orders','laboratory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fkt3vson9o64p2','laboratory.orders.print','Print laboratory / orders','laboratory.orders',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00flt3vstehm622t','laboratory.tests.view','View laboratory / tests','laboratory.tests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcm00fmt3vswy2uv4wt','laboratory.tests.create','Create laboratory / tests','laboratory.tests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcn00fnt3vs33ixcrno','laboratory.tests.delete','Delete laboratory / tests','laboratory.tests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcn00fot3vs4hxe3q38','laboratory.tests.update','Update laboratory / tests','laboratory.tests',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcn00fpt3vsw83cd8qx','laboratory.payments.view','View laboratory / payments','laboratory.payments',NULL,'2026-10-01 08:32:33.204'),('cmupa0hcn00fqt3vszzbs6xsx','laboratory.payments.create','Create laboratory / payments','laboratory.payments',NULL,'2026-10-01 08:32:33.204');
/*!40000 ALTER TABLE `access_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_role`
--

DROP TABLE IF EXISTS `access_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_role` (
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`),
  UNIQUE KEY `Role_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_role`
--

LOCK TABLES `access_role` WRITE;
/*!40000 ALTER TABLE `access_role` DISABLE KEYS */;
INSERT INTO `access_role` VALUES (NULL,'cmupa7klf0000t3g86xijxu3g','Super Administrator','Unrestricted access to every current and future system capability','2026-10-01 08:38:04.035','2026-10-01 08:38:04.035');
/*!40000 ALTER TABLE `access_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_rolepermission`
--

DROP TABLE IF EXISTS `access_rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_rolepermission` (
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`roleId`,`permissionId`),
  KEY `role_permission_permissionId_fkey` (`permissionId`),
  CONSTRAINT `role_permission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `access_permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `access_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_rolepermission`
--

LOCK TABLES `access_rolepermission` WRITE;
/*!40000 ALTER TABLE `access_rolepermission` DISABLE KEYS */;
/*!40000 ALTER TABLE `access_rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_user`
--

DROP TABLE IF EXISTS `access_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_user` (
  `warehouseId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pinLookup` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_pinLookup_key` (`pinLookup`),
  KEY `access_User_warehouseId_idx` (`warehouseId`),
  CONSTRAINT `access_User_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_user`
--

LOCK TABLES `access_user` WRITE;
/*!40000 ALTER TABLE `access_user` DISABLE KEYS */;
INSERT INTO `access_user` VALUES (NULL,'cmupa7kli0001t3g8hwi3awu1','superadmin','superadmin@admin.local','Super Administrator','$2b$12$ZKVFsPlR92vFyO7w6Vj/1.fKZv4TkItmFiYeCb.D.6FJLLSVeoz72',NULL,NULL,'Administration','active','2026-10-01 08:38:04.038','2026-10-01 08:38:04.038');
/*!40000 ALTER TABLE `access_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_userrole`
--

DROP TABLE IF EXISTS `access_userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_userrole` (
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`,`roleId`),
  KEY `UserRole_roleId_fkey` (`roleId`),
  CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `access_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_userrole`
--

LOCK TABLES `access_userrole` WRITE;
/*!40000 ALTER TABLE `access_userrole` DISABLE KEYS */;
INSERT INTO `access_userrole` VALUES ('cmupa7kli0001t3g8hwi3awu1','cmupa7klf0000t3g86xijxu3g');
/*!40000 ALTER TABLE `access_userrole` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_accountingaccount`
--

DROP TABLE IF EXISTS `accounting_accountingaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_accountingaccount` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AccountingAccount_code_key` (`code`),
  KEY `AccountingAccount_type_idx` (`type`),
  KEY `AccountingAccount_parentId_idx` (`parentId`),
  CONSTRAINT `AccountingAccount_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `accounting_accountingaccount` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_accountingaccount`
--

LOCK TABLES `accounting_accountingaccount` WRITE;
/*!40000 ALTER TABLE `accounting_accountingaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_accountingaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_journalentry`
--

DROP TABLE IF EXISTS `accounting_journalentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_journalentry` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entryNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entryDate` datetime(3) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `JournalEntry_entryNumber_key` (`entryNumber`),
  KEY `JournalEntry_entryDate_idx` (`entryDate`),
  KEY `JournalEntry_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_journalentry`
--

LOCK TABLES `accounting_journalentry` WRITE;
/*!40000 ALTER TABLE `accounting_journalentry` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_journalentry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_journalline`
--

DROP TABLE IF EXISTS `accounting_journalline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_journalline` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit` double NOT NULL DEFAULT '0',
  `credit` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `JournalLine_entryId_idx` (`entryId`),
  KEY `JournalLine_accountId_idx` (`accountId`),
  CONSTRAINT `JournalLine_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounting_accountingaccount` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `JournalLine_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `accounting_journalentry` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_journalline`
--

LOCK TABLES `accounting_journalline` WRITE;
/*!40000 ALTER TABLE `accounting_journalline` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_journalline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_attendancedevice`
--

DROP TABLE IF EXISTS `attendance_attendancedevice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_attendancedevice` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DS-K1T342MFWX-E1',
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port` int NOT NULL DEFAULT '80',
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serialNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'offline',
  `lastSeenAt` datetime(3) DEFAULT NULL,
  `eventsClearedAt` datetime(3) DEFAULT NULL,
  `workingDaysPerMonth` int NOT NULL DEFAULT '22',
  `checkInTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '09:00',
  `checkOutTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '17:00',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttendanceDevice_ipAddress_port_key` (`ipAddress`,`port`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_attendancedevice`
--

LOCK TABLES `attendance_attendancedevice` WRITE;
/*!40000 ALTER TABLE `attendance_attendancedevice` DISABLE KEYS */;
INSERT INTO `attendance_attendancedevice` VALUES ('cmupa8npn00fzt3u0s7jkb72a','Main','DS-K1T342MFWX-E1','192.168.1.131',80,'admin','tt123456',NULL,'online','2026-10-01 08:49:01.768',NULL,22,'09:00','17:00','2026-10-01 08:38:54.731','2026-10-01 08:49:01.770');
/*!40000 ALTER TABLE `attendance_attendancedevice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_attendanceevent`
--

DROP TABLE IF EXISTS `attendance_attendanceevent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_attendanceevent` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employeeNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eventType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `occurredAt` datetime(3) NOT NULL,
  `verification` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deviceEventId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttendanceEvent_deviceId_deviceEventId_key` (`deviceId`,`deviceEventId`),
  KEY `AttendanceEvent_occurredAt_idx` (`occurredAt`),
  KEY `AttendanceEvent_employeeNo_idx` (`employeeNo`),
  KEY `AttendanceEvent_personId_fkey` (`personId`),
  CONSTRAINT `AttendanceEvent_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `attendance_attendancedevice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AttendanceEvent_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `attendance_attendanceperson` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_attendanceevent`
--

LOCK TABLES `attendance_attendanceevent` WRITE;
/*!40000 ALTER TABLE `attendance_attendanceevent` DISABLE KEYS */;
INSERT INTO `attendance_attendanceevent` VALUES ('cmupa8yba00iet3u0mx541rw3','cmupa8npn00fzt3u0s7jkb72a','cmupa8sve00h3t3u0hmfsebvb','35','DR suhaib','check_in','2026-10-01 04:53:17.000','face','92872','2026-10-01 08:39:08.470'),('cmupa8ybt00igt3u0oo9qlz78','cmupa8npn00fzt3u0s7jkb72a','cmupa8stj00ght3u0mqz38g1z','24','Eman bilal','check_in','2026-10-01 04:53:19.000','fingerprint','92874','2026-10-01 08:39:08.489'),('cmupa8yc800iit3u07cepods5','cmupa8npn00fzt3u0s7jkb72a','cmupa8svj00h5t3u04sc2bl26','36','KAK hawkar','check_in','2026-10-01 04:53:24.000','face','92875','2026-10-01 08:39:08.505'),('cmupa8ycm00ikt3u0z6boh2l2','cmupa8npn00fzt3u0s7jkb72a','cmupa8suq00gvt3u09of2dqeo','31','KAK nabaz','check_in','2026-10-01 04:57:02.000','face','92877','2026-10-01 08:39:08.518'),('cmupa8yd100imt3u0pleorljx','cmupa8npn00fzt3u0s7jkb72a','cmupa8svx00h9t3u0te4vx4dc','38','KAK hunnar','check_in','2026-10-01 05:08:37.000','face','92881','2026-10-01 08:39:08.533'),('cmupa8ydf00iot3u0afy7kmim','cmupa8npn00fzt3u0s7jkb72a','cmupa8sw300hbt3u0phqku513','39','KAK MAWLAN','check_in','2026-10-01 05:12:43.000','fingerprint','92884','2026-10-01 08:39:08.547'),('cmupa8ydu00iqt3u0srw4w1rs','cmupa8npn00fzt3u0s7jkb72a','cmupa8suw00gxt3u02j9umz4e','32','KAK shaxawan','check_in','2026-10-01 05:26:51.000','face','92887','2026-10-01 08:39:08.563'),('cmupa8ye900ist3u0x4ysfw73','cmupa8npn00fzt3u0s7jkb72a','cmupa8sy400hzt3u0r7uymshv','51','Rayan outpatient','check_in','2026-10-01 05:46:49.000','fingerprint','92890','2026-10-01 08:39:08.577'),('cmupa8yem00iut3u0wan1u5nu','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssi00g7t3u0ulehdpab','19','kawa ph','check_in','2026-10-01 05:51:27.000','face','92893','2026-10-01 08:39:08.590'),('cmupa8yey00iwt3u0r6e1v5vi','cmupa8npn00fzt3u0s7jkb72a','cmupa8sw800hdt3u075spbzl0','40','KAK rebaz','check_in','2026-10-01 05:54:51.000','face','92896','2026-10-01 08:39:08.602'),('cmupa8yfm00iyt3u03agl14sm','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxg00hrt3u05d3l8d9b','47','dr younis','check_in','2026-10-01 05:54:58.000','face','92899','2026-10-01 08:39:08.626'),('cmupa8z8d00j0t3u0iqhiwe6c','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssy00gbt3u095dbxde1','21','yasir','check_in','2026-10-01 06:08:15.000','face','92902','2026-10-01 08:39:09.661'),('cmupa8z9100j2t3u0mysppj6u','cmupa8npn00fzt3u0s7jkb72a','cmupa8syu00i7t3u0h56pog2o','55','KAK awara','check_in','2026-10-01 06:11:23.000','face','92905','2026-10-01 08:39:09.686'),('cmupa8z9o00j4t3u06a717t7b','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxy00hxt3u0m5iwmwgi','50','Hawzheen xan','check_in','2026-10-01 06:54:19.000','face','92908','2026-10-01 08:39:09.709'),('cmupa8za700j6t3u0be93gric','cmupa8npn00fzt3u0s7jkb72a','cmupa8stb00gft3u09gjyiuec','23','SHAMAL ','check_in','2026-10-01 07:06:13.000','face','92911','2026-10-01 08:39:09.728'),('cmupa8zaz00j8t3u0dua9iqu6','cmupa8npn00fzt3u0s7jkb72a','cmupa8sz700ibt3u0pcnjvgc0','10','DR marwan','check_in','2026-10-01 07:27:04.000','face','92914','2026-10-01 08:39:09.755'),('cmupa8zbu00jat3u0ia0ffe9g','cmupa8npn00fzt3u0s7jkb72a','cmupa8su600gpt3u0mexusvj0','28','KAK mustafa','check_in','2026-10-01 07:50:51.000','face','92917','2026-10-01 08:39:09.786'),('cmupa8zca00jct3u0yhx9otyt','cmupa8npn00fzt3u0s7jkb72a','cmupa8st500gdt3u0xf54jg5e','22','HR','check_in','2026-10-01 07:59:23.000','face','92920','2026-10-01 08:39:09.802'),('cmupa8zcs00jet3u0jxtjrfj4','cmupa8npn00fzt3u0s7jkb72a','cmupa8syu00i7t3u0h56pog2o','55','KAK awara','check_out','2026-10-01 08:09:22.000','face','92923','2026-10-01 08:39:09.821'),('cmupa8zd900jgt3u0t0c3vki0','cmupa8npn00fzt3u0s7jkb72a','cmupa8suk00gtt3u03jp1q3t4','30','KAK adam','check_in','2026-10-01 08:19:10.000','face','92926','2026-10-01 08:39:09.837'),('cmupa8zdr00jit3u09n5y85k5','cmupa8npn00fzt3u0s7jkb72a','cmupa8sv900h1t3u0nm3wy8aj','34','KAK abdulghafar','check_in','2026-10-01 08:19:13.000','face','92928','2026-10-01 08:39:09.855'),('cmupa8ze500jkt3u0d49nydt7','cmupa8npn00fzt3u0s7jkb72a','cmupa8suc00grt3u0n1odmak2','29','KAK lehat','check_in','2026-10-01 08:22:59.000','face','92930','2026-10-01 08:39:09.870'),('cmupa9pr600lxt3u0jxz8ycw1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000082','Abdulqahar Marketing','check_in','2026-09-06 07:07:28.000','face','88664','2026-10-01 08:39:44.035'),('cmupa9prg00lzt3u0s01hnyfz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000082','Abdulqahar Marketing','check_out','2026-09-06 07:07:51.000','face','88667','2026-10-01 08:39:44.044'),('cmupa9prr00m1t3u07uh4gqxa','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000082','Abdulqahar Marketing','check_in','2026-09-06 07:08:58.000','face','88671','2026-10-01 08:39:44.056'),('cmupa9ps300m3t3u04sh8nitz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000116','Abdulqahar shar','check_in','2026-09-06 07:09:34.000','fingerprint','88674','2026-10-01 08:39:44.067'),('cmupa9pse00m5t3u0x8kin9f0','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000116','Abdulqahar shar','check_out','2026-09-06 07:09:39.000','fingerprint','88678','2026-10-01 08:39:44.078'),('cmupa9psx00m7t3u0s1xlsa38','cmupa8npn00fzt3u0s7jkb72a',NULL,'6','dr halwest','check_in','2026-09-06 07:15:51.000','face','88684','2026-10-01 08:39:44.097'),('cmupa9pt700m9t3u0wis1mvm2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-06 07:37:25.000','fingerprint','88687','2026-10-01 08:39:44.108'),('cmupa9qjc00mbt3u0dvfp68zi','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-06 07:44:11.000','fingerprint','88690','2026-10-01 08:39:45.048'),('cmupa9qkm00mdt3u0660z4sgk','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-06 07:48:56.000','face','88697','2026-10-01 08:39:45.095'),('cmupa9ql400mft3u00al8i8lk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-06 08:26:39.000','fingerprint','88700','2026-10-01 08:39:45.113'),('cmupa9qlw00mht3u0p592pvz3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-06 09:08:49.000','fingerprint','88704','2026-10-01 08:39:45.140'),('cmupa9qme00mjt3u0rotqty5a','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-06 09:20:11.000','fingerprint','88707','2026-10-01 08:39:45.158'),('cmupa9qn400mlt3u08knjz4nz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-06 10:04:49.000','fingerprint','88715','2026-10-01 08:39:45.184'),('cmupa9qnq00mnt3u0e0h5322j','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-06 10:34:40.000','face','88718','2026-10-01 08:39:45.206'),('cmupa9rf100mpt3u0yg4v2yr6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-06 10:34:43.000','face','88720','2026-10-01 08:39:46.190'),('cmupa9rg400mrt3u0tp663q7a','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-06 11:25:19.000','fingerprint','88723','2026-10-01 08:39:46.228'),('cmupa9rgn00mtt3u0uzpvqas5','cmupa8npn00fzt3u0s7jkb72a',NULL,'6','dr halwest','check_out','2026-09-06 11:29:52.000','face','88726','2026-10-01 08:39:46.247'),('cmupa9rh700mvt3u0l5aius2e','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000061','Zryan Othman','check_out','2026-09-06 11:38:09.000','fingerprint','88729','2026-10-01 08:39:46.268'),('cmupa9rhy00mxt3u0bp286v4q','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_out','2026-09-06 11:38:15.000','face','88732','2026-10-01 08:39:46.294'),('cmupa9riz00mzt3u0cvdcjc94','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-06 12:02:37.000','face','88736','2026-10-01 08:39:46.331'),('cmupa9rjt00n1t3u04t71gqbs','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-06 12:03:03.000','face','88745','2026-10-01 08:39:46.362'),('cmupa9rk600n3t3u09hyzghkn','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-06 12:03:10.000','fingerprint','88748','2026-10-01 08:39:46.375'),('cmupa9sks00n5t3u0d73itbd0','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-06 12:07:33.000','face','88750','2026-10-01 08:39:47.692'),('cmupa9slg00n7t3u07vimlk2u','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-06 12:10:24.000','face','88756','2026-10-01 08:39:47.716'),('cmupa9slx00n9t3u0i6y93cs9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000193','Shamal Karim','check_out','2026-09-06 12:14:32.000','face','88760','2026-10-01 08:39:47.733'),('cmupa9sme00nbt3u038g3f4pj','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-06 12:36:29.000','fingerprint','88763','2026-10-01 08:39:47.750'),('cmupa9smt00ndt3u0uyzq4hfp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-06 12:43:32.000','fingerprint','88766','2026-10-01 08:39:47.765'),('cmupa9sn600nft3u08gs4fb6q','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-06 12:46:27.000','fingerprint','88769','2026-10-01 08:39:47.778'),('cmupa9snr00nht3u08xj2dy1y','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000217','Hunar Ghafur (Research)','check_out','2026-09-06 12:46:36.000','face','88773','2026-10-01 08:39:47.799'),('cmupa9so300njt3u0ts53hanh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-06 13:01:40.000','fingerprint','88776','2026-10-01 08:39:47.812'),('cmupa9soe00nlt3u01zbla41v','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-06 13:01:47.000','face','88779','2026-10-01 08:39:47.822'),('cmupa9tdo00nnt3u0k29v34ln','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-06 13:16:26.000','face','88782','2026-10-01 08:39:48.733'),('cmupa9tef00npt3u0megy2gn3','cmupa8npn00fzt3u0s7jkb72a',NULL,'15','hawzhen xan','check_out','2026-09-06 13:19:25.000','face','88786','2026-10-01 08:39:48.759'),('cmupa9tf000nrt3u0e3jutfoo','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-06 13:19:55.000','face','88789','2026-10-01 08:39:48.780'),('cmupa9tft00ntt3u08rr8hhud','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-06 13:22:37.000','face','88793','2026-10-01 08:39:48.810'),('cmupa9tg800nvt3u01qdnu2f9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_out','2026-09-06 13:34:55.000','fingerprint','88798','2026-10-01 08:39:48.824'),('cmupa9tgo00nxt3u0hh946jrj','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_out','2026-09-06 14:03:25.000','face','88801','2026-10-01 08:39:48.841'),('cmupa9the00nzt3u0bi91edoi','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_out','2026-09-06 14:04:00.000','fingerprint','88807','2026-10-01 08:39:48.866'),('cmupa9u6f00o1t3u0ze1mi6pi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000136','Rayan Musa Cardiology','check_out','2026-09-06 14:11:42.000','fingerprint','88811','2026-10-01 08:39:49.767'),('cmupa9u6w00o3t3u0mtuohdtg','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-06 14:15:51.000','fingerprint','88814','2026-10-01 08:39:49.784'),('cmupa9u7900o5t3u0dv9a31x6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000067','Mohammad jamal','check_out','2026-09-06 14:31:59.000','fingerprint','88817','2026-10-01 08:39:49.797'),('cmupa9u7m00o7t3u0oae7ovdu','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-06 14:39:57.000','face','88820','2026-10-01 08:39:49.811'),('cmupa9u7z00o9t3u0z9pwmie5','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-06 15:58:59.000','fingerprint','88823','2026-10-01 08:39:49.823'),('cmupa9u8j00obt3u0p0wa2fqd','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000067','Mohammad jamal','check_in','2026-09-07 04:44:23.000','fingerprint','88829','2026-10-01 08:39:49.844'),('cmupa9u8y00odt3u0osumdv9t','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_in','2026-09-07 04:54:02.000','face','88832','2026-10-01 08:39:49.858'),('cmupa9u9a00oft3u0nlbjjdu1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-07 04:59:20.000','fingerprint','88835','2026-10-01 08:39:49.870'),('cmupa9u9l00oht3u0sobqggdj','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_in','2026-09-07 05:01:03.000','fingerprint','88838','2026-10-01 08:39:49.882'),('cmupa9uvp00ojt3u054aa9i9f','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-07 05:03:18.000','face','88841','2026-10-01 08:39:50.678'),('cmupa9uwl00olt3u0ibccnwxb','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-07 05:03:28.000','face','88845','2026-10-01 08:39:50.710'),('cmupa9uwv00ont3u04atprp8l','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_in','2026-09-07 05:04:29.000','fingerprint','88848','2026-10-01 08:39:50.720'),('cmupa9ux800opt3u0jh90itri','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-07 05:05:00.000','fingerprint','88851','2026-10-01 08:39:50.732'),('cmupa9uxj00ort3u04335sjf7','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-07 05:06:02.000','face','88854','2026-10-01 08:39:50.743'),('cmupa9uy400ott3u0vdzm0ck6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-07 05:06:24.000','face','88860','2026-10-01 08:39:50.764'),('cmupa9uyp00ovt3u0ur53ph7l','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-07 05:09:10.000','face','88864','2026-10-01 08:39:50.786'),('cmupa9uz300oxt3u0c7i993oz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-07 05:12:47.000','fingerprint','88867','2026-10-01 08:39:50.799'),('cmupa9vq800ozt3u0kq6d6ylt','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-07 05:13:12.000','fingerprint','88870','2026-10-01 08:39:51.777'),('cmupa9vqz00p1t3u09f8xas0d','cmupa8npn00fzt3u0s7jkb72a',NULL,'4','dr salahdin','check_in','2026-09-07 05:13:58.000','fingerprint','88873','2026-10-01 08:39:51.803'),('cmupa9vro00p3t3u07n5dwpmq','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-07 05:18:23.000','face','88876','2026-10-01 08:39:51.828'),('cmupa9vsc00p5t3u0mzm747wk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000096','Shamal Office','check_in','2026-09-07 05:20:35.000','face','88879','2026-10-01 08:39:51.852'),('cmupa9vt000p7t3u0u4f13ns1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-07 05:26:55.000','face','88882','2026-10-01 08:39:51.877'),('cmupa9vte00p9t3u0qjnucqc9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_in','2026-09-07 05:39:14.000','face','88886','2026-10-01 08:39:51.890'),('cmupa9vtp00pbt3u0ai7vecli','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-07 05:52:25.000','fingerprint','88889','2026-10-01 08:39:51.901'),('cmupa9vu400pdt3u05r5s8tim','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-07 06:00:49.000','face','88892','2026-10-01 08:39:51.916'),('cmupa9wjk00pft3u0sisknkhp','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-07 06:11:30.000','face','88903','2026-10-01 08:39:52.832'),('cmupa9wkq00pht3u06v8dja4d','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000136','Rayan Musa Cardiology','check_in','2026-09-07 06:21:20.000','fingerprint','88910','2026-10-01 08:39:52.874'),('cmupa9wl400pjt3u0eworj22m','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000070','Dyar Nadir','check_in','2026-09-07 06:22:12.000','face','88913','2026-10-01 08:39:52.888'),('cmupa9wlg00plt3u00c2aij59','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-07 06:33:38.000','fingerprint','88916','2026-10-01 08:39:52.901'),('cmupa9wls00pnt3u0wzor4qgf','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-07 07:38:59.000','fingerprint','88920','2026-10-01 08:39:52.913'),('cmupa9wm400ppt3u04vtocfmq','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-07 09:55:28.000','face','88924','2026-10-01 08:39:52.924'),('cmupa9xb000prt3u0md5y34bm','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-07 10:22:14.000','face','88931','2026-10-01 08:39:53.821'),('cmupa9xbv00ptt3u07dtyxw6h','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-07 10:36:31.000','fingerprint','88935','2026-10-01 08:39:53.851'),('cmupa9xc700pvt3u0pq34jj7s','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_out','2026-09-07 10:38:18.000','fingerprint','88938','2026-10-01 08:39:53.863'),('cmupa9xci00pxt3u0n8vd0nph','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000103','Mustafa Kawa','check_out','2026-09-07 10:46:49.000','face','88941','2026-10-01 08:39:53.874'),('cmupa9xcv00pzt3u0seyxixlg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-07 10:49:55.000','face','88944','2026-10-01 08:39:53.888'),('cmupa9xd800q1t3u0pgkexqg9','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-07 11:00:30.000','face','88947','2026-10-01 08:39:53.900'),('cmupa9xdr00q3t3u0we7harnp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-07 11:02:02.000','face','88951','2026-10-01 08:39:53.920'),('cmupa9xe200q5t3u0818m3suh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_out','2026-09-07 11:24:18.000','fingerprint','88954','2026-10-01 08:39:53.931'),('cmupa9xed00q7t3u0gayn40t2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_out','2026-09-07 11:31:19.000','face','88957','2026-10-01 08:39:53.942'),('cmupa9y0b00q9t3u0z4pk2wx4','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-07 11:38:55.000','face','88960','2026-10-01 08:39:54.731'),('cmupa9y1700qbt3u00510tyte','cmupa8npn00fzt3u0s7jkb72a','cmupa8sz700ibt3u0pcnjvgc0','10','HR','check_out','2026-09-07 11:41:10.000','face','88964','2026-10-01 08:39:54.764'),('cmupa9y1m00qdt3u0w4h094li','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000136','Rayan Musa Cardiology','check_out','2026-09-07 11:54:13.000','fingerprint','88967','2026-10-01 08:39:54.778'),('cmupa9y2000qft3u0dujaamku','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-07 12:06:45.000','fingerprint','88970','2026-10-01 08:39:54.792'),('cmupa9y2k00qht3u0vmjligoz','cmupa8npn00fzt3u0s7jkb72a',NULL,'4','dr salahdin','check_out','2026-09-07 12:13:09.000','face','88976','2026-10-01 08:39:54.813'),('cmupa9y2y00qjt3u074x1cmoa','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-07 12:13:13.000','fingerprint','88978','2026-10-01 08:39:54.827'),('cmupa9y3b00qlt3u0vqvcdiw1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-07 12:13:19.000','fingerprint','88980','2026-10-01 08:39:54.839'),('cmupa9y3x00qnt3u0bsw9afgr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_out','2026-09-07 12:59:12.000','face','88986','2026-10-01 08:39:54.862'),('cmupa9y4900qpt3u0mrui2rdy','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-07 13:01:30.000','face','88989','2026-10-01 08:39:54.873'),('cmupa9ypc00qrt3u0yisw25lu','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_out','2026-09-07 14:01:23.000','face','88992','2026-10-01 08:39:55.632'),('cmupa9yq700qtt3u0rc5kgahy','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_out','2026-09-07 14:01:27.000','fingerprint','88994','2026-10-01 08:39:55.663'),('cmupa9yqp00qvt3u0g2q8irzr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-07 14:05:19.000','face','88996','2026-10-01 08:39:55.681'),('cmupa9yr600qxt3u0wtan09lr','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-07 14:22:25.000','face','88999','2026-10-01 08:39:55.698'),('cmupa9yrr00qzt3u03bh3ypld','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-07 14:22:32.000','face','89002','2026-10-01 08:39:55.719'),('cmupa9ys100r1t3u04xjj873y','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-07 14:41:12.000','face','89004','2026-10-01 08:39:55.730'),('cmupa9ysd00r3t3u0ki5g65c4','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-07 14:47:58.000','fingerprint','89007','2026-10-01 08:39:55.741'),('cmupa9yso00r5t3u0346yg14l','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-07 15:19:52.000','fingerprint','89010','2026-10-01 08:39:55.752'),('cmupa9ysz00r7t3u081168i74','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-07 15:58:16.000','fingerprint','89014','2026-10-01 08:39:55.763'),('cmupa9zhk00r9t3u09txxairc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-08 04:12:25.000','face','89026','2026-10-01 08:39:56.648'),('cmupa9zi700rbt3u0ooyppz5p','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000193','Shamal Karim','check_in','2026-09-08 04:14:35.000','face','89029','2026-10-01 08:39:56.671'),('cmupa9zir00rdt3u0khfv35c9','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-08 04:57:39.000','fingerprint','89032','2026-10-01 08:39:56.691'),('cmupa9zj800rft3u06npwccpz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-08 05:01:24.000','face','89035','2026-10-01 08:39:56.708'),('cmupa9zjp00rht3u0bfw0i5tn','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-08 05:01:33.000','face','89038','2026-10-01 08:39:56.726'),('cmupa9zk400rjt3u0f1byt5ni','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-08 05:01:39.000','face','89041','2026-10-01 08:39:56.740'),('cmupa9zkg00rlt3u0u1id2eh9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-08 05:01:44.000','face','89043','2026-10-01 08:39:56.752'),('cmupa9zku00rnt3u04pjcxwwd','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_in','2026-09-08 05:02:24.000','face','89045','2026-10-01 08:39:56.767'),('cmupa9zl600rpt3u0ndsftxvp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-08 05:08:00.000','fingerprint','89048','2026-10-01 08:39:56.778'),('cmupaa04k00rrt3u0asljoykb','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-08 05:08:04.000','fingerprint','89050','2026-10-01 08:39:57.477'),('cmupaa05600rtt3u0ons290tj','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-08 05:11:55.000','face','89052','2026-10-01 08:39:57.498'),('cmupaa05n00rvt3u084z0uq33','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-08 05:14:45.000','face','89055','2026-10-01 08:39:57.515'),('cmupaa06300rxt3u0il8rju88','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-08 05:17:22.000','face','89058','2026-10-01 08:39:57.532'),('cmupaa06v00rzt3u0q2ttamku','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-08 05:30:28.000','face','89065','2026-10-01 08:39:57.559'),('cmupaa07a00s1t3u0fut37ndc','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-08 05:40:38.000','fingerprint','89068','2026-10-01 08:39:57.574'),('cmupaa07o00s3t3u0xh1pct6d','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-08 05:47:09.000','face','89071','2026-10-01 08:39:57.588'),('cmupaa08d00s5t3u04r3opqcl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000061','Zryan Othman','check_in','2026-09-08 05:48:04.000','face','89077','2026-10-01 08:39:57.613'),('cmupaa0vk00s7t3u04us5g0x5','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-08 05:55:14.000','face','89083','2026-10-01 08:39:58.449'),('cmupaa0w800s9t3u0s09voi7o','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-08 05:58:25.000','fingerprint','89087','2026-10-01 08:39:58.472'),('cmupaa0wj00sbt3u04tyck47v','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-08 06:05:41.000','fingerprint','89090','2026-10-01 08:39:58.483'),('cmupaa0ws00sdt3u0vfa95qj2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000136','Rayan Musa Cardiology','check_in','2026-09-08 06:07:35.000','fingerprint','89096','2026-10-01 08:39:58.492'),('cmupaa0x300sft3u0kgypb4lx','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_in','2026-09-08 06:17:00.000','fingerprint','89099','2026-10-01 08:39:58.503'),('cmupaa0xi00sht3u0u6yzirk4','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-08 07:06:47.000','fingerprint','89105','2026-10-01 08:39:58.519'),('cmupaa0xv00sjt3u0ujynlvyt','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000103','Mustafa Kawa','check_in','2026-09-08 07:17:21.000','face','89108','2026-10-01 08:39:58.531'),('cmupaa1kd00slt3u0mgfrxztv','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-08 07:32:50.000','fingerprint','89111','2026-10-01 08:39:59.341'),('cmupaa1kq00snt3u03ebvnvrr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-08 08:23:50.000','fingerprint','89115','2026-10-01 08:39:59.355'),('cmupaa1l200spt3u0qtn6lsa2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-08 08:32:55.000','face','89118','2026-10-01 08:39:59.366'),('cmupaa1lc00srt3u0dzjr5xwi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-08 09:35:51.000','fingerprint','89121','2026-10-01 08:39:59.376'),('cmupaa1ll00stt3u02w7q53ir','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-08 10:02:21.000','face','89124','2026-10-01 08:39:59.385'),('cmupaa1lx00svt3u0scxrzwfa','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-08 11:34:00.000','fingerprint','89130','2026-10-01 08:39:59.398'),('cmupaa1mc00sxt3u0l7k3c65j','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-08 11:42:10.000','face','89137','2026-10-01 08:39:59.412'),('cmupaa27j00szt3u0jatgvu7n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000096','Shamal Office','check_out','2026-09-08 11:42:16.000','face','89140','2026-10-01 08:40:00.176'),('cmupaa28000t1t3u0v5ddhuxw','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-08 11:56:03.000','face','89142','2026-10-01 08:40:00.193'),('cmupaa28f00t3t3u0w8pjvdu9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-08 12:00:13.000','fingerprint','89145','2026-10-01 08:40:00.207'),('cmupaa28u00t5t3u0d3gn02yw','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-08 12:01:29.000','fingerprint','89148','2026-10-01 08:40:00.222'),('cmupaa29900t7t3u0uluy9hta','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-08 12:09:38.000','fingerprint','89151','2026-10-01 08:40:00.237'),('cmupaa29m00t9t3u0pkvmt7sm','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-08 12:22:21.000','face','89154','2026-10-01 08:40:00.250'),('cmupaa2a000tbt3u0fx9m2vpk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-08 12:34:18.000','face','89157','2026-10-01 08:40:00.265'),('cmupaa2ae00tdt3u0t9nvron7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-08 12:36:33.000','fingerprint','89160','2026-10-01 08:40:00.278'),('cmupaa2ar00tft3u0dy7l7d8h','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_out','2026-09-08 12:36:40.000','face','89163','2026-10-01 08:40:00.292'),('cmupaa2b500tht3u0bh9kcwgk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-08 12:52:09.000','face','89166','2026-10-01 08:40:00.306'),('cmupaa2bm00tjt3u0ffi3899c','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-08 13:07:24.000','face','89169','2026-10-01 08:40:00.322'),('cmupaa2x300tlt3u000qofhxn','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-08 13:07:27.000','face','89171','2026-10-01 08:40:01.095'),('cmupaa2xt00tnt3u07ipzzieg','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-08 13:16:26.000','fingerprint','89173','2026-10-01 08:40:01.121'),('cmupaa2yh00tpt3u0ybggqyrs','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-08 13:28:30.000','face','89177','2026-10-01 08:40:01.145'),('cmupaa2yu00trt3u0j1xhu2kl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-08 13:47:48.000','fingerprint','89180','2026-10-01 08:40:01.158'),('cmupaa2z600ttt3u0vb9frgub','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_out','2026-09-08 14:04:49.000','fingerprint','89183','2026-10-01 08:40:01.170'),('cmupaa2zh00tvt3u0n3dr76mi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_out','2026-09-08 14:04:53.000','face','89185','2026-10-01 08:40:01.181'),('cmupaa30200txt3u0deao0x4x','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000136','Rayan Musa Cardiology','check_out','2026-09-08 14:15:12.000','fingerprint','89190','2026-10-01 08:40:01.202'),('cmupaa30f00tzt3u0awj1rk3x','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_out','2026-09-08 14:15:19.000','fingerprint','89193','2026-10-01 08:40:01.215'),('cmupaa30u00u1t3u0uyaag26g','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-08 14:35:13.000','fingerprint','89196','2026-10-01 08:40:01.231'),('cmupaa3kb00u3t3u0zpalf6r9','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-08 15:07:40.000','fingerprint','89200','2026-10-01 08:40:01.931'),('cmupaa3kt00u5t3u0mkr3enlc','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-08 16:00:27.000','fingerprint','89204','2026-10-01 08:40:01.949'),('cmupaa3lh00u7t3u0npj6ygev','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-09 04:59:31.000','fingerprint','89212','2026-10-01 08:40:01.973'),('cmupaa3lq00u9t3u04ykdysdb','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-09 05:01:03.000','fingerprint','89215','2026-10-01 08:40:01.983'),('cmupaa3lw00ubt3u0jz8xjg17','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-09 05:02:59.000','face','89218','2026-10-01 08:40:01.989'),('cmupaa3m500udt3u0om1lt7f6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-09 05:05:32.000','face','89221','2026-10-01 08:40:01.997'),('cmupaa3ma00uft3u0z7a6bc42','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_in','2026-09-09 05:06:28.000','face','89224','2026-10-01 08:40:02.002'),('cmupaa4cu00uht3u0uoqypazi','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_in','2026-09-09 05:06:42.000','face','89230','2026-10-01 08:40:02.958'),('cmupaa4dr00ujt3u03m72jb5w','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-09 05:07:37.000','fingerprint','89236','2026-10-01 08:40:02.991'),('cmupaa4eg00ult3u00j8tne8u','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-09 05:07:46.000','face','89240','2026-10-01 08:40:03.017'),('cmupaa4f800unt3u0tr3wmkus','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-09 05:08:15.000','face','89247','2026-10-01 08:40:03.044'),('cmupaa4fk00upt3u0s6nmgayp','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-09 05:13:57.000','face','89250','2026-10-01 08:40:03.056'),('cmupaa4fw00urt3u04j2m7sf7','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_in','2026-09-09 05:15:24.000','fingerprint','89253','2026-10-01 08:40:03.069'),('cmupaa4g900utt3u004fer8pf','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-09 05:23:26.000','fingerprint','89256','2026-10-01 08:40:03.081'),('cmupaa4gl00uvt3u0u8crw45m','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-09 05:42:20.000','fingerprint','89259','2026-10-01 08:40:03.094'),('cmupaa51h00uxt3u0h6tl7gz0','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-09 05:49:04.000','face','89262','2026-10-01 08:40:03.845'),('cmupaa52h00uzt3u0k494nl0g','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-09 05:55:31.000','face','89266','2026-10-01 08:40:03.881'),('cmupaa53800v1t3u0ndl0h3yk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-09 05:58:17.000','fingerprint','89270','2026-10-01 08:40:03.909'),('cmupaa53q00v3t3u0lxqs8ggc','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-09 06:03:02.000','face','89273','2026-10-01 08:40:03.926'),('cmupaa54j00v5t3u0qyzp4pn4','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-09 06:04:01.000','face','89277','2026-10-01 08:40:03.956'),('cmupaa55000v7t3u0y8qyiifi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-09 06:04:22.000','face','89280','2026-10-01 08:40:03.972'),('cmupaa55l00v9t3u0ew7ahkyz','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-09 06:15:08.000','face','89286','2026-10-01 08:40:03.993'),('cmupaa5o500vbt3u0ubvj4mpp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-09 06:47:52.000','face','89290','2026-10-01 08:40:04.661'),('cmupaa5ol00vdt3u0wxiyopj2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-09 07:27:42.000','fingerprint','89295','2026-10-01 08:40:04.677'),('cmupaa5oz00vft3u0lrb8pxyh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-09 08:01:06.000','face','89300','2026-10-01 08:40:04.691'),('cmupaa5pd00vht3u0x4oy5lsw','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-09 08:05:19.000','fingerprint','89304','2026-10-01 08:40:04.706'),('cmupaa5q100vjt3u0ctwnoiq5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-09 08:53:32.000','face','89311','2026-10-01 08:40:04.729'),('cmupaa6ab00vlt3u05dvcs20l','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-09 10:20:32.000','fingerprint','89321','2026-10-01 08:40:05.459'),('cmupaa6az00vnt3u07nnzgprv','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-09 10:29:57.000','face','89327','2026-10-01 08:40:05.483'),('cmupaa6bc00vpt3u0v4zjghqf','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-09 11:11:45.000','face','89333','2026-10-01 08:40:05.496'),('cmupaa6br00vrt3u0andsgom6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-09 11:47:44.000','fingerprint','89336','2026-10-01 08:40:05.511'),('cmupaa6c200vtt3u0hw05fs8a','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-09 12:02:01.000','face','89339','2026-10-01 08:40:05.522'),('cmupaa6cm00vvt3u08u4gjwgh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-09 12:02:26.000','face','89343','2026-10-01 08:40:05.543'),('cmupaa6d600vxt3u056s41lha','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-09 12:04:37.000','face','89348','2026-10-01 08:40:05.562'),('cmupaa6tz00vzt3u0nd6i64q7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-09 12:08:36.000','face','89351','2026-10-01 08:40:06.167'),('cmupaa6uh00w1t3u0u1l98a1v','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-09 12:08:42.000','fingerprint','89354','2026-10-01 08:40:06.186'),('cmupaa6uw00w3t3u0t4uvf59o','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-09 12:09:12.000','fingerprint','89357','2026-10-01 08:40:06.201'),('cmupaa6vk00w5t3u02naegm0t','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-09 12:15:48.000','fingerprint','89363','2026-10-01 08:40:06.225'),('cmupaa6w800w7t3u0uk2cnpe5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000050','Dyar Nadr','check_in','2026-09-09 12:40:26.000','face','89372','2026-10-01 08:40:06.249'),('cmupaa6wn00w9t3u0bdh1x226','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-09 12:57:58.000','face','89375','2026-10-01 08:40:06.263'),('cmupaa6x000wbt3u0rqalqvee','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-09 12:58:18.000','fingerprint','89378','2026-10-01 08:40:06.276'),('cmupaa7gj00wdt3u0kgs45gjs','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-09 12:58:22.000','fingerprint','89380','2026-10-01 08:40:06.980'),('cmupaa7gx00wft3u0g92rbczn','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-09 13:01:00.000','face','89382','2026-10-01 08:40:06.994'),('cmupaa7hd00wht3u07xi4apgv','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-09 13:01:31.000','face','89385','2026-10-01 08:40:07.010'),('cmupaa7hs00wjt3u0m0ka2g0e','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-09 13:03:00.000','face','89388','2026-10-01 08:40:07.025'),('cmupaa7is00wlt3u0tbm8zu3z','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-09 13:27:48.000','fingerprint','89395','2026-10-01 08:40:07.060'),('cmupaa7j400wnt3u0if8tyu0t','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000231','abdulrahman call','check_out','2026-09-09 14:13:39.000','face','89398','2026-10-01 08:40:07.073'),('cmupaa7ju00wpt3u0hixb8lio','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-09 15:14:38.000','face','89402','2026-10-01 08:40:07.098'),('cmupaa7k900wrt3u0q2dlz90r','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-09 16:08:11.000','face','89405','2026-10-01 08:40:07.114'),('cmupaa84v00wtt3u08tdk0ev6','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-10 04:57:24.000','face','89413','2026-10-01 08:40:07.855'),('cmupaa85900wvt3u0r76r4joo','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-10 05:01:59.000','face','89416','2026-10-01 08:40:07.869'),('cmupaa85n00wxt3u01sxkt5x6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-10 05:02:31.000','face','89419','2026-10-01 08:40:07.883'),('cmupaa86100wzt3u0pwcprscn','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-10 05:02:35.000','fingerprint','89421','2026-10-01 08:40:07.898'),('cmupaa86f00x1t3u07jiv95bs','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-10 05:07:26.000','face','89423','2026-10-01 08:40:07.912'),('cmupaa87400x3t3u0av1znz72','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-10 05:07:32.000','face','89426','2026-10-01 08:40:07.937'),('cmupaa87j00x5t3u067du8025','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000217','Hunar Ghafur (Research)','check_in','2026-09-10 05:18:31.000','face','89428','2026-10-01 08:40:07.951'),('cmupaa8t300x7t3u0w17ioglj','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-10 06:01:41.000','face','89440','2026-10-01 08:40:08.728'),('cmupaa8tn00x9t3u0wknrm4v7','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-10 06:02:40.000','face','89447','2026-10-01 08:40:08.747'),('cmupaa8ui00xbt3u0wojomlug','cmupa8npn00fzt3u0s7jkb72a',NULL,'15','hawzhen xan','check_in','2026-09-10 06:03:28.000','face','89451','2026-10-01 08:40:08.779'),('cmupaa9ik00xdt3u04yu1lz39','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-10 06:23:23.000','face','89473','2026-10-01 08:40:09.645'),('cmupaa9j000xft3u0q0mu0flj','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-10 06:34:29.000','face','89476','2026-10-01 08:40:09.660'),('cmupaa9jn00xht3u0rxf9v6y3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-10 07:32:15.000','fingerprint','89485','2026-10-01 08:40:09.683'),('cmupaa9jz00xjt3u0573ht7dh','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-10 08:44:47.000','face','89490','2026-10-01 08:40:09.696'),('cmupaa9kl00xlt3u0z85cgb7y','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-10 09:03:42.000','face','89498','2026-10-01 08:40:09.717'),('cmupaaa4h00xnt3u0fkt6knrs','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-10 09:03:45.000','fingerprint','89500','2026-10-01 08:40:10.433'),('cmupaaa5500xpt3u0vuavo9hl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-10 09:05:57.000','face','89502','2026-10-01 08:40:10.458'),('cmupaaa5q00xrt3u0p5xgvuae','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-10 10:54:52.000','face','89515','2026-10-01 08:40:10.479'),('cmupaaa6200xtt3u0d38ghigj','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-10 11:02:30.000','face','89518','2026-10-01 08:40:10.490'),('cmupaaa6m00xvt3u0v5zu1q18','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-10 12:02:42.000','face','89522','2026-10-01 08:40:10.510'),('cmupaaa6y00xxt3u0xx0fu357','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-10 12:03:36.000','fingerprint','89525','2026-10-01 08:40:10.522'),('cmupaaa7a00xzt3u07r6uadvs','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-10 12:05:00.000','face','89528','2026-10-01 08:40:10.534'),('cmupaaaqi00y1t3u0b2iijyfq','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-10 12:12:47.000','face','89532','2026-10-01 08:40:11.226'),('cmupaaaqz00y3t3u0xrwatazc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-10 12:24:07.000','face','89535','2026-10-01 08:40:11.243'),('cmupaaarc00y5t3u0domvnv9r','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-10 12:27:01.000','fingerprint','89538','2026-10-01 08:40:11.256'),('cmupaaaro00y7t3u0jf4wef31','cmupa8npn00fzt3u0s7jkb72a',NULL,'15','hawzhen xan','check_out','2026-09-10 13:21:42.000','face','89541','2026-10-01 08:40:11.269'),('cmupaaas100y9t3u0ies9dbne','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_out','2026-09-10 13:21:45.000','face','89543','2026-10-01 08:40:11.281'),('cmupaaasl00ybt3u0rava159y','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-10 13:21:51.000','face','89545','2026-10-01 08:40:11.302'),('cmupaaasx00ydt3u0r7lw0e90','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-10 13:26:28.000','face','89547','2026-10-01 08:40:11.314'),('cmupaaat900yft3u0hqpwbtt3','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-10 13:48:09.000','face','89550','2026-10-01 08:40:11.325'),('cmupaaatl00yht3u0m28jz5jo','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-10 16:01:30.000','face','89553','2026-10-01 08:40:11.338'),('cmupaabd500yjt3u0upwlbcab','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-12 07:09:23.000','face','89579','2026-10-01 08:40:12.042'),('cmupaabdr00ylt3u06peh3roh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-12 07:09:33.000','face','89584','2026-10-01 08:40:12.064'),('cmupaabtb00ynt3u0uunz83st','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-12 07:24:20.000','face','89587','2026-10-01 08:40:12.623'),('cmupaabtv00ypt3u08rmlukju','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-12 07:40:30.000','face','89590','2026-10-01 08:40:12.643'),('cmupaabue00yrt3u0iwdozmmh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-12 07:48:04.000','fingerprint','89594','2026-10-01 08:40:12.662'),('cmupaabuw00ytt3u0k0ceq3l7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-12 08:08:47.000','fingerprint','89605','2026-10-01 08:40:12.680'),('cmupaac9g00yvt3u03v2oatr5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000063','Shazad Abdullah','check_in','2026-09-12 09:30:49.000','face','89623','2026-10-01 08:40:13.204'),('cmupaaca900yxt3u0hoey5685','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000117','Aras','check_out','2026-09-12 09:49:23.000','face','89628','2026-10-01 08:40:13.233'),('cmupaacat00yzt3u038wskxkg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-12 09:58:31.000','face','89632','2026-10-01 08:40:13.253'),('cmupaacb500z1t3u0l0nrv2sm','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000103','Mustafa Kawa','check_out','2026-09-12 10:14:06.000','face','89635','2026-10-01 08:40:13.266'),('cmupaacts00z3t3u0zvtsgnh8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-12 12:02:13.000','face','89658','2026-10-01 08:40:13.937'),('cmupaacus00z5t3u09bkr957l','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_out','2026-09-12 12:08:12.000','fingerprint','89670','2026-10-01 08:40:13.972'),('cmupaacv600z7t3u01ols68od','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-12 12:08:17.000','fingerprint','89673','2026-10-01 08:40:13.986'),('cmupaadbu00z9t3u0azzb6n77','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-12 12:33:01.000','face','89685','2026-10-01 08:40:14.586'),('cmupaadch00zbt3u0wdm9cueg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000205','IBRAHIM (ICU)','check_out','2026-09-12 12:33:06.000','face','89688','2026-10-01 08:40:14.609'),('cmupaadct00zdt3u0y4iu9rw3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000010','Shamal Karim','check_out','2026-09-12 12:34:02.000','face','89690','2026-10-01 08:40:14.622'),('cmupaadda00zft3u0ww74fkoi','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-12 13:02:14.000','face','89693','2026-10-01 08:40:14.639'),('cmupaadve00zht3u08hdrpnx6','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-12 13:40:05.000','face','89716','2026-10-01 08:40:15.291'),('cmupaadvu00zjt3u0ogoacoau','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000217','Hunar Ghafur (Research)','check_out','2026-09-12 13:40:12.000','face','89719','2026-10-01 08:40:15.306'),('cmupaadwt00zlt3u0upiho82z','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000070','Dyar Nadir','check_out','2026-09-12 13:46:02.000','face','89728','2026-10-01 08:40:15.342'),('cmupaadxd00znt3u0js37y2qk','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_out','2026-09-12 14:34:52.000','face','89734','2026-10-01 08:40:15.362'),('cmupaaeeh00zpt3u0783yqwdi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_in','2026-09-13 04:49:24.000','face','89750','2026-10-01 08:40:15.978'),('cmupaaef100zrt3u0cp70dpr2','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-13 04:53:34.000','face','89752','2026-10-01 08:40:15.997'),('cmupaaefe00ztt3u0hchbiql5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-13 04:58:02.000','fingerprint','89755','2026-10-01 08:40:16.011'),('cmupaaefr00zvt3u0sr76iidj','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-13 04:58:43.000','face','89759','2026-10-01 08:40:16.023'),('cmupaaeg100zxt3u0pwfs4cto','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-13 04:59:30.000','fingerprint','89762','2026-10-01 08:40:16.034'),('cmupaaegd00zzt3u0m6pktri2','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-13 05:04:12.000','face','89765','2026-10-01 08:40:16.045'),('cmupaaevy0101t3u0v5m159k9','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-13 05:04:18.000','face','89768','2026-10-01 08:40:16.607'),('cmupaaewf0103t3u05rz2l4mc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-13 05:07:23.000','face','89770','2026-10-01 08:40:16.624'),('cmupaaex10105t3u0c9ub93zv','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-13 05:14:13.000','fingerprint','89776','2026-10-01 08:40:16.645'),('cmupaaexd0107t3u0sevsbqxm','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-13 05:17:32.000','face','89779','2026-10-01 08:40:16.657'),('cmupaaexq0109t3u09ncdjklk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-13 05:23:08.000','fingerprint','89782','2026-10-01 08:40:16.670'),('cmupaaey1010bt3u0tl0b2565','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000030','Ibrahem ICU','check_in','2026-09-13 05:32:14.000','fingerprint','89785','2026-10-01 08:40:16.681'),('cmupaaeyj010dt3u06hxz3zch','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-13 05:51:02.000','fingerprint','89791','2026-10-01 08:40:16.700'),('cmupaaeyv010ft3u087sf8tv0','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-13 05:52:08.000','face','89794','2026-10-01 08:40:16.711'),('cmupaafdx010ht3u0q3axzduz','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-13 05:54:09.000','fingerprint','89797','2026-10-01 08:40:17.253'),('cmupaafej010jt3u06laa6njw','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000194','Yasir Faisal (OPD)','check_in','2026-09-13 05:56:29.000','face','89800','2026-10-01 08:40:17.275'),('cmupaaffd010lt3u01i64qxy2','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_in','2026-09-13 06:03:31.000','face','89808','2026-10-01 08:40:17.306'),('cmupaaffq010nt3u00iabytpu','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-13 06:04:08.000','face','89811','2026-10-01 08:40:17.318'),('cmupaafg1010pt3u0dylx2zuh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_in','2026-09-13 06:05:55.000','face','89814','2026-10-01 08:40:17.329'),('cmupaafgk010rt3u0bthuu9j5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-13 06:06:47.000','face','89820','2026-10-01 08:40:17.348'),('cmupaafgv010tt3u0yoiye6f7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-13 06:10:24.000','face','89823','2026-10-01 08:40:17.359'),('cmupaafw5010vt3u0etyk70ew','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000103','Mustafa Kawa','check_in','2026-09-13 06:41:20.000','face','89829','2026-10-01 08:40:17.909'),('cmupaafws010xt3u0zm26sg7x','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-13 07:01:54.000','face','89832','2026-10-01 08:40:17.933'),('cmupaafx5010zt3u0ftl6o8kg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-13 08:59:04.000','fingerprint','89835','2026-10-01 08:40:17.946'),('cmupaafxh0111t3u0qnoacf20','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-13 09:00:08.000','face','89838','2026-10-01 08:40:17.958'),('cmupaafxt0113t3u013nmwxee','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-13 09:46:47.000','face','89842','2026-10-01 08:40:17.969'),('cmupaafyd0115t3u0ferbn6px','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000193','Shamal Karim','check_out','2026-09-13 10:40:08.000','face','89853','2026-10-01 08:40:17.990'),('cmupaage90117t3u0zgev2o0o','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-13 10:55:00.000','fingerprint','89859','2026-10-01 08:40:18.561'),('cmupaagfa0119t3u0rm1sdmf3','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-13 11:08:25.000','fingerprint','89866','2026-10-01 08:40:18.598'),('cmupaagfp011bt3u0f6v69kb8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_out','2026-09-13 11:16:44.000','face','89869','2026-10-01 08:40:18.614'),('cmupaaggd011dt3u0xu5oqgnc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000063','Shazad Abdullah','check_out','2026-09-13 11:42:00.000','face','89873','2026-10-01 08:40:18.637'),('cmupaaggq011ft3u0uwndmqj8','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-13 11:48:05.000','fingerprint','89876','2026-10-01 08:40:18.651'),('cmupaagh2011ht3u0en8wwrh9','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-13 12:00:30.000','face','89879','2026-10-01 08:40:18.663'),('cmupaaghf011jt3u04y46u9uk','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-13 12:01:17.000','face','89882','2026-10-01 08:40:18.676'),('cmupaaghr011lt3u0j766sxg7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_out','2026-09-13 12:04:43.000','fingerprint','89885','2026-10-01 08:40:18.687'),('cmupaagx4011nt3u04cjus4tu','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-13 12:04:50.000','face','89888','2026-10-01 08:40:19.240'),('cmupaagxm011pt3u0yi4qfm5d','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-13 12:10:21.000','face','89891','2026-10-01 08:40:19.258'),('cmupaagy4011rt3u03owiw711','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-13 12:10:26.000','face','89894','2026-10-01 08:40:19.277'),('cmupaagyf011tt3u0szyj6um0','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-13 12:11:26.000','fingerprint','89896','2026-10-01 08:40:19.288'),('cmupaagyy011vt3u0kzmefg2j','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_out','2026-09-13 12:43:58.000','fingerprint','89902','2026-10-01 08:40:19.306'),('cmupaagz9011xt3u0yk5p6e6n','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-13 12:57:34.000','face','89905','2026-10-01 08:40:19.317'),('cmupaagzz011zt3u0lmf0e88z','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-13 13:01:26.000','face','89910','2026-10-01 08:40:19.343'),('cmupaah0a0121t3u0s5h050m8','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-13 13:03:51.000','face','89913','2026-10-01 08:40:19.354'),('cmupaah0l0123t3u00y7jot24','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-13 13:13:37.000','face','89916','2026-10-01 08:40:19.365'),('cmupaahg10125t3u07aj3avfk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-13 13:25:56.000','face','89919','2026-10-01 08:40:19.922'),('cmupaahgr0127t3u0gddqmhyb','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-13 13:26:00.000','fingerprint','89921','2026-10-01 08:40:19.948'),('cmupaahh40129t3u0vf4qyth5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-13 14:12:54.000','face','89923','2026-10-01 08:40:19.960'),('cmupaahhx012bt3u0dead83pu','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-13 16:00:33.000','face','89930','2026-10-01 08:40:19.989'),('cmupaahig012dt3u0p5jdvee8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000067','Mohammad jamal','check_out','2026-09-13 17:10:07.000','fingerprint','89936','2026-10-01 08:40:20.009'),('cmupaahit012ft3u0mbpbkmx7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000067','Mohammad jamal','check_in','2026-09-14 02:33:08.000','fingerprint','89939','2026-10-01 08:40:20.021'),('cmupaahj5012ht3u0rsopyja7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000193','Shamal Karim','check_in','2026-09-14 03:00:41.000','face','89942','2026-10-01 08:40:20.034'),('cmupaahji012jt3u04y0i0dkx','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000205','IBRAHIM (ICU)','check_in','2026-09-14 03:02:29.000','face','89945','2026-10-01 08:40:20.046'),('cmupaai26012lt3u0y67s2l5q','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-14 04:58:54.000','face','89960','2026-10-01 08:40:20.719'),('cmupaai2l012nt3u0uw538pje','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-14 05:02:26.000','face','89963','2026-10-01 08:40:20.734'),('cmupaai30012pt3u03r81t914','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-14 05:02:31.000','face','89966','2026-10-01 08:40:20.749'),('cmupaai3f012rt3u0ro75syg3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-14 05:02:36.000','fingerprint','89969','2026-10-01 08:40:20.763'),('cmupaai3w012tt3u0emcvrp9x','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-14 05:02:41.000','fingerprint','89971','2026-10-01 08:40:20.780'),('cmupaai4c012vt3u04w4kdrvy','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-14 05:06:10.000','face','89974','2026-10-01 08:40:20.796'),('cmupaaijk012xt3u0trmzg5s1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-14 05:07:01.000','face','89977','2026-10-01 08:40:21.344'),('cmupaaikb012zt3u0cgpc23hg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-14 05:07:04.000','face','89979','2026-10-01 08:40:21.372'),('cmupaaiku0131t3u007xbom08','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-14 05:07:33.000','fingerprint','89982','2026-10-01 08:40:21.391'),('cmupaailb0133t3u0giq56ws2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-14 05:08:12.000','face','89985','2026-10-01 08:40:21.408'),('cmupaaim20135t3u02sau0i4b','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-14 05:08:17.000','face','89988','2026-10-01 08:40:21.435'),('cmupaaimv0137t3u0f3j3wriq','cmupa8npn00fzt3u0s7jkb72a',NULL,'4','dr salahdin','check_in','2026-09-14 05:12:32.000','face','89993','2026-10-01 08:40:21.463'),('cmupaaina0139t3u0prge3eg2','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-14 05:14:52.000','face','89996','2026-10-01 08:40:21.478'),('cmupaainr013bt3u00o86exj3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-14 05:37:54.000','face','89999','2026-10-01 08:40:21.495'),('cmupaaio6013dt3u0vyk8qnhr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000070','Dyar Nadir','check_in','2026-09-14 05:46:27.000','face','90002','2026-10-01 08:40:21.510'),('cmupaaiom013ft3u0ovcy7oql','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-14 06:00:51.000','face','90005','2026-10-01 08:40:21.526'),('cmupaaj3b013ht3u0zmo97vxq','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-14 06:10:47.000','face','90008','2026-10-01 08:40:22.055'),('cmupaaj3w013jt3u0v40dalak','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-14 06:11:26.000','face','90011','2026-10-01 08:40:22.077'),('cmupaaj4i013lt3u0ufnsmrj1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-14 06:29:40.000','face','90017','2026-10-01 08:40:22.099'),('cmupaaj4w013nt3u0rj70tdtw','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-14 06:32:08.000','fingerprint','90020','2026-10-01 08:40:22.112'),('cmupaaj57013pt3u0q9ia1kmd','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-14 07:58:51.000','face','90023','2026-10-01 08:40:22.123'),('cmupaaj5y013rt3u07erlg77v','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-14 09:00:30.000','fingerprint','90033','2026-10-01 08:40:22.151'),('cmupaajmt013tt3u0zz92ht1k','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-14 09:30:26.000','fingerprint','90042','2026-10-01 08:40:22.757'),('cmupaajn8013vt3u0c1cjvv17','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-14 10:00:11.000','fingerprint','90045','2026-10-01 08:40:22.773'),('cmupaajo0013xt3u05k14fs7b','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-14 10:33:19.000','fingerprint','90054','2026-10-01 08:40:22.800'),('cmupaajoi013zt3u06szz8q3k','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000205','IBRAHIM (ICU)','check_out','2026-09-14 10:57:36.000','face','90059','2026-10-01 08:40:22.819'),('cmupaajou0141t3u050p4f4r1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_out','2026-09-14 10:59:33.000','face','90061','2026-10-01 08:40:22.831'),('cmupaajpe0143t3u08rk3y6xg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-14 10:59:38.000','face','90064','2026-10-01 08:40:22.850'),('cmupaak480145t3u07td1siht','cmupa8npn00fzt3u0s7jkb72a',NULL,'4','dr salahdin','check_out','2026-09-14 11:52:20.000','face','90067','2026-10-01 08:40:23.384'),('cmupaak4v0147t3u0z26eci8p','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-14 12:02:54.000','fingerprint','90070','2026-10-01 08:40:23.407'),('cmupaak580149t3u0hhkp0mjy','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-14 12:03:09.000','face','90073','2026-10-01 08:40:23.421'),('cmupaak5l014bt3u0x0evbsv6','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-14 12:05:33.000','face','90076','2026-10-01 08:40:23.433'),('cmupaak5v014dt3u00xzumjnp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-14 12:06:48.000','face','90080','2026-10-01 08:40:23.443'),('cmupaak67014ft3u06l8c4tko','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-14 12:10:16.000','face','90083','2026-10-01 08:40:23.456'),('cmupaak6j014ht3u0f0qq86cl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-14 12:10:22.000','face','90086','2026-10-01 08:40:23.468'),('cmupaak6v014jt3u0vlxqwoiy','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_out','2026-09-14 12:10:25.000','face','90088','2026-10-01 08:40:23.480'),('cmupaak77014lt3u0h3s26xup','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-14 12:18:49.000','face','90090','2026-10-01 08:40:23.492'),('cmupaak7k014nt3u0plmc2dgh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000070','Dyar Nadir','check_out','2026-09-14 12:25:17.000','face','90093','2026-10-01 08:40:23.504'),('cmupaakmc014pt3u0jpoagkrc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-14 13:17:20.000','fingerprint','90099','2026-10-01 08:40:24.036'),('cmupaakmx014rt3u095hvrhyn','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-14 13:18:25.000','face','90102','2026-10-01 08:40:24.057'),('cmupaaknj014tt3u0ygzje7ky','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-14 13:18:31.000','face','90105','2026-10-01 08:40:24.079'),('cmupaaknv014vt3u0hdkj14hi','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-14 13:18:42.000','face','90107','2026-10-01 08:40:24.092'),('cmupaakoz014xt3u050ibv5vx','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-14 14:16:48.000','face','90119','2026-10-01 08:40:24.132'),('cmupaakpa014zt3u0v5e4yw06','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-14 16:00:56.000','face','90122','2026-10-01 08:40:24.142'),('cmupaal6a0151t3u0ya04fleg','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-15 04:57:33.000','face','90128','2026-10-01 08:40:24.754'),('cmupaal750153t3u0sazoy1op','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_in','2026-09-15 04:58:30.000','face','90134','2026-10-01 08:40:24.785'),('cmupaal7j0155t3u0fpiwhqp6','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-15 05:01:27.000','face','90137','2026-10-01 08:40:24.800'),('cmupaal8h0157t3u0xrg5b38r','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-15 05:09:01.000','face','90142','2026-10-01 08:40:24.833'),('cmupaal8v0159t3u06vpqui8n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-15 05:09:06.000','fingerprint','90146','2026-10-01 08:40:24.847'),('cmupaal97015bt3u0zzweguj6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-15 05:11:24.000','face','90149','2026-10-01 08:40:24.860'),('cmupaal9k015dt3u0wfs3prti','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-15 05:12:35.000','face','90152','2026-10-01 08:40:24.873'),('cmupaal9y015ft3u0zzzr1qde','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-15 05:13:29.000','fingerprint','90155','2026-10-01 08:40:24.886'),('cmupaalpd015ht3u01y944ooa','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_in','2026-09-15 05:17:32.000','face','90158','2026-10-01 08:40:25.442'),('cmupaalpw015jt3u01q38o9a6','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-15 05:30:37.000','face','90161','2026-10-01 08:40:25.460'),('cmupaalqa015lt3u0pkyftfo5','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-15 05:37:10.000','face','90164','2026-10-01 08:40:25.474'),('cmupaalqv015nt3u0nrpre2uw','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-15 05:52:16.000','face','90170','2026-10-01 08:40:25.495'),('cmupaalr6015pt3u0d6jsf1l8','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-15 06:00:00.000','face','90173','2026-10-01 08:40:25.506'),('cmupaalrh015rt3u0uyz0ndlk','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-15 06:05:53.000','face','90176','2026-10-01 08:40:25.517'),('cmupaalrz015tt3u0pz80p73p','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-15 06:07:24.000','face','90180','2026-10-01 08:40:25.535'),('cmupaalsb015vt3u0u36dy8pq','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000063','Shazad Abdullah','check_in','2026-09-15 06:23:44.000','face','90183','2026-10-01 08:40:25.548'),('cmupaalsn015xt3u00by8ihdy','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-15 06:31:20.000','face','90186','2026-10-01 08:40:25.559'),('cmupaam7q015zt3u0i986t9d5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-15 06:51:36.000','face','90189','2026-10-01 08:40:26.102'),('cmupaam8e0161t3u0pgsiecgz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-15 06:54:57.000','fingerprint','90192','2026-10-01 08:40:26.126'),('cmupaam8y0163t3u0cwvuibvg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-15 07:40:45.000','face','90198','2026-10-01 08:40:26.146'),('cmupaam990165t3u09fs3apmo','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-15 07:44:19.000','fingerprint','90201','2026-10-01 08:40:26.157'),('cmupaam9k0167t3u0kdf4uhf1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-15 08:07:08.000','fingerprint','90204','2026-10-01 08:40:26.169'),('cmupaam9w0169t3u0rdu49gdi','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-15 08:18:04.000','fingerprint','90208','2026-10-01 08:40:26.180'),('cmupaama7016bt3u0i0jwo70k','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-15 09:40:25.000','face','90211','2026-10-01 08:40:26.192'),('cmupaams3016dt3u0q60hs2d2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-15 10:03:47.000','face','90217','2026-10-01 08:40:26.835'),('cmupaamsl016ft3u09ux31zzt','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-15 10:28:09.000','face','90220','2026-10-01 08:40:26.854'),('cmupaamsy016ht3u0h3y0m32n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-15 11:19:05.000','face','90223','2026-10-01 08:40:26.867'),('cmupaamtj016jt3u0e2ko72pp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-15 12:02:42.000','face','90229','2026-10-01 08:40:26.887'),('cmupaamtv016lt3u0duf46sha','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_out','2026-09-15 12:03:15.000','fingerprint','90233','2026-10-01 08:40:26.899'),('cmupaamue016nt3u0m4kl9sr4','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-15 12:04:18.000','face','90241','2026-10-01 08:40:26.919'),('cmupaan9k016pt3u0eoe3j795','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-15 12:04:28.000','face','90247','2026-10-01 08:40:27.465'),('cmupaana6016rt3u0x47oexst','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-15 12:06:44.000','fingerprint','90251','2026-10-01 08:40:27.487'),('cmupaanas016tt3u0yeb0ui7c','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-15 12:28:55.000','fingerprint','90254','2026-10-01 08:40:27.508'),('cmupaanbt016vt3u01l8r4yki','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-15 13:06:40.000','face','90261','2026-10-01 08:40:27.545'),('cmupaanci016xt3u058n41qnm','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-15 13:18:47.000','face','90265','2026-10-01 08:40:27.570'),('cmupaancv016zt3u0profkvtc','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-15 13:18:55.000','fingerprint','90268','2026-10-01 08:40:27.584'),('cmupaanda0171t3u077rjj3dr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-15 13:19:00.000','face','90271','2026-10-01 08:40:27.598'),('cmupaandq0173t3u0oeqcvsum','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-15 13:28:04.000','face','90274','2026-10-01 08:40:27.615'),('cmupaansx0175t3u05ze4b9zq','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-15 13:34:17.000','face','90277','2026-10-01 08:40:28.161'),('cmupaantj0177t3u0gz340v9b','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-15 13:41:56.000','face','90280','2026-10-01 08:40:28.183'),('cmupaanty0179t3u0n0f048lf','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-15 13:50:31.000','face','90283','2026-10-01 08:40:28.198'),('cmupaanuw017bt3u0i0ur3o5o','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-15 14:08:02.000','face','90292','2026-10-01 08:40:28.232'),('cmupaanvg017dt3u02gy2aw57','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-15 14:08:10.000','face','90296','2026-10-01 08:40:28.252'),('cmupaanvr017ft3u0ulnuhyve','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-15 16:02:18.000','face','90299','2026-10-01 08:40:28.263'),('cmupaaoba017ht3u0ne94gs30','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-16 04:22:58.000','fingerprint','90308','2026-10-01 08:40:28.822'),('cmupaaobx017jt3u0begk2env','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000205','IBRAHIM (ICU)','check_in','2026-09-16 04:46:14.000','face','90311','2026-10-01 08:40:28.845'),('cmupaaoc9017lt3u0pbuby6h1','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-16 04:54:26.000','face','90314','2026-10-01 08:40:28.858'),('cmupaaocs017nt3u0jjhjo2bh','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-16 05:02:22.000','face','90320','2026-10-01 08:40:28.876'),('cmupaaodi017pt3u0633i9wr0','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-16 05:08:18.000','face','90329','2026-10-01 08:40:28.902'),('cmupaaodu017rt3u0h71tbhmq','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-16 05:08:57.000','face','90332','2026-10-01 08:40:28.914'),('cmupaaoec017tt3u0p2d3fda6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-16 05:10:41.000','face','90336','2026-10-01 08:40:28.933'),('cmupaaoti017vt3u0uw45fvpb','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-16 05:12:24.000','face','90339','2026-10-01 08:40:29.478'),('cmupaaoub017xt3u017w1hbks','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-16 05:12:30.000','face','90342','2026-10-01 08:40:29.508'),('cmupaaouo017zt3u0zuxtd7uv','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-16 05:13:05.000','face','90344','2026-10-01 08:40:29.521'),('cmupaaov10181t3u0aysuk288','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-16 05:17:42.000','fingerprint','90347','2026-10-01 08:40:29.534'),('cmupaaovy0183t3u0fs0wrh0z','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-16 05:57:54.000','face','90353','2026-10-01 08:40:29.566'),('cmupaaowc0185t3u0tnxal9k7','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-16 05:59:55.000','face','90356','2026-10-01 08:40:29.580'),('cmupaapbz0187t3u0a6t3vd4q','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-16 06:08:52.000','face','90368','2026-10-01 08:40:30.143'),('cmupaapdc0189t3u04xk29341','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-16 06:12:27.000','face','90374','2026-10-01 08:40:30.193'),('cmupaapdu018bt3u0k69zq14r','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-16 06:22:36.000','face','90377','2026-10-01 08:40:30.210'),('cmupaapec018dt3u08pdwuc5d','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-16 06:36:48.000','face','90380','2026-10-01 08:40:30.229'),('cmupaapey018ft3u0ps5ag08b','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-16 06:44:59.000','face','90383','2026-10-01 08:40:30.250'),('cmupaapvh018ht3u0m6p19d06','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-16 07:43:08.000','fingerprint','90398','2026-10-01 08:40:30.846'),('cmupaapw4018jt3u0ygnqkgsp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-16 07:52:45.000','face','90401','2026-10-01 08:40:30.868'),('cmupaapwv018lt3u0bzyubunl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-16 08:51:25.000','fingerprint','90410','2026-10-01 08:40:30.896'),('cmupaapy6018nt3u091vx3uo4','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-16 11:15:30.000','face','90424','2026-10-01 08:40:30.942'),('cmupaaqf1018pt3u0fdlayct1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-16 11:50:45.000','fingerprint','90430','2026-10-01 08:40:31.550'),('cmupaaqfk018rt3u047syebbe','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-16 11:51:50.000','fingerprint','90433','2026-10-01 08:40:31.568'),('cmupaaqfw018tt3u0h1hauv5m','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-16 12:03:30.000','face','90436','2026-10-01 08:40:31.581'),('cmupaaqg8018vt3u02n67lr5b','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-16 12:03:57.000','face','90439','2026-10-01 08:40:31.593'),('cmupaaqgj018xt3u0a7mkx376','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-16 12:04:33.000','face','90442','2026-10-01 08:40:31.604'),('cmupaaqgv018zt3u02s2y1qq4','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-16 12:08:34.000','fingerprint','90445','2026-10-01 08:40:31.615'),('cmupaaqh70191t3u0697pljob','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_out','2026-09-16 12:09:54.000','face','90448','2026-10-01 08:40:31.627'),('cmupaaqhr0193t3u0ek1la32d','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-16 12:11:58.000','fingerprint','90454','2026-10-01 08:40:31.647'),('cmupaaqwu0195t3u0m1nkdulc','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-16 12:12:03.000','face','90457','2026-10-01 08:40:32.191'),('cmupaaqxg0197t3u0288rp21a','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-16 12:46:06.000','face','90460','2026-10-01 08:40:32.212'),('cmupaaqxt0199t3u0m4060eqq','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-16 13:08:15.000','face','90463','2026-10-01 08:40:32.226'),('cmupaaqyd019bt3u0qvh3pq1j','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-16 13:08:23.000','face','90468','2026-10-01 08:40:32.245'),('cmupaaqz7019dt3u0w39zgqr3','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-16 13:16:00.000','face','90474','2026-10-01 08:40:32.275'),('cmupaaqzj019ft3u03wdf3mpp','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-16 13:16:03.000','face','90476','2026-10-01 08:40:32.287'),('cmupaar03019ht3u0ko3dq3lb','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-16 13:16:09.000','face','90478','2026-10-01 08:40:32.308'),('cmupaar0n019jt3u0tv15q0kf','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000050','Dyar Nadr','check_out','2026-09-16 13:48:08.000','face','90483','2026-10-01 08:40:32.327'),('cmupaar0z019lt3u0qvwup9ja','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_out','2026-09-16 13:51:28.000','face','90486','2026-10-01 08:40:32.339'),('cmupaarg2019nt3u0i3mp4nbe','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-16 14:08:00.000','face','90490','2026-10-01 08:40:32.883'),('cmupaargs019pt3u078g7g2l6','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-16 14:18:13.000','fingerprint','90496','2026-10-01 08:40:32.908'),('cmupaarh4019rt3u0se4iuk9b','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_out','2026-09-16 15:22:22.000','fingerprint','90499','2026-10-01 08:40:32.921'),('cmupaarhg019tt3u01fpvxq01','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-16 15:22:27.000','face','90502','2026-10-01 08:40:32.932'),('cmupaarhq019vt3u0crhzpwlu','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-16 16:02:05.000','face','90505','2026-10-01 08:40:32.943'),('cmupaari0019xt3u0k9pkk3v7','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-17 05:01:01.000','face','90515','2026-10-01 08:40:32.953'),('cmupaaryn019zt3u0dqvzva09','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-17 05:05:57.000','fingerprint','90519','2026-10-01 08:40:33.551'),('cmupaarzo01a1t3u0i7ddvjdl','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_in','2026-09-17 05:09:01.000','face','90524','2026-10-01 08:40:33.588'),('cmupaas0401a3t3u08aez13ko','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-17 05:16:08.000','face','90526','2026-10-01 08:40:33.605'),('cmupaas0k01a5t3u0wzn78c3k','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-17 05:16:10.000','fingerprint','90528','2026-10-01 08:40:33.620'),('cmupaas1a01a7t3u0qaa3p3xj','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-17 05:16:17.000','face','90530','2026-10-01 08:40:33.646'),('cmupaas1o01a9t3u0kvqymar8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-17 05:25:17.000','fingerprint','90532','2026-10-01 08:40:33.660'),('cmupaas2801abt3u0lq45a7ws','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000050','Dyar Nadr','check_in','2026-09-17 05:41:40.000','face','90538','2026-10-01 08:40:33.681'),('cmupaas2l01adt3u0i34tnrgk','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-17 05:55:56.000','face','90541','2026-10-01 08:40:33.693'),('cmupaas3001aft3u05brsdbdv','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-17 05:59:58.000','face','90544','2026-10-01 08:40:33.708'),('cmupaasht01aht3u0npeazkb2','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-17 06:01:21.000','fingerprint','90547','2026-10-01 08:40:34.242'),('cmupaasix01ajt3u0dlt1b297','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-17 06:02:12.000','face','90555','2026-10-01 08:40:34.282'),('cmupaasj801alt3u0c3ubnwkm','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-17 06:10:45.000','face','90558','2026-10-01 08:40:34.293'),('cmupaasjl01ant3u0qdahw0o1','cmupa8npn00fzt3u0s7jkb72a',NULL,'15','hawzhen xan','check_in','2026-09-17 06:24:55.000','face','90561','2026-10-01 08:40:34.305'),('cmupaasjx01apt3u0oel7qfpj','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-17 06:28:02.000','face','90564','2026-10-01 08:40:34.317'),('cmupaask801art3u09xriucqe','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-17 06:28:48.000','face','90567','2026-10-01 08:40:34.329'),('cmupaaskk01att3u04g6341b8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-17 06:49:55.000','face','90570','2026-10-01 08:40:34.341'),('cmupaaskw01avt3u0gitvzbt1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-17 07:18:23.000','fingerprint','90573','2026-10-01 08:40:34.352'),('cmupaasl701axt3u0bwdchmte','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000180','Adam Naahmat (Innovation)','check_out','2026-09-17 09:09:00.000','fingerprint','90576','2026-10-01 08:40:34.363'),('cmupaatsg01azt3u0puygxbr3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-17 09:09:02.000','face','90578','2026-10-01 08:40:35.921'),('cmupaatt301b1t3u0earb6t53','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_out','2026-09-17 09:09:09.000','fingerprint','90581','2026-10-01 08:40:35.944'),('cmupaattg01b3t3u0javj1iis','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000052','Amanj HR','check_in','2026-09-17 09:31:20.000','face','90584','2026-10-01 08:40:35.957'),('cmupaatu101b5t3u0fqty2bgx','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-17 09:53:40.000','face','90588','2026-10-01 08:40:35.978'),('cmupaatue01b7t3u0fqgf7sj3','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_out','2026-09-17 09:54:05.000','fingerprint','90591','2026-10-01 08:40:35.990'),('cmupaatuq01b9t3u04qmhnynk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-17 10:03:49.000','face','90594','2026-10-01 08:40:36.002'),('cmupaatv201bbt3u05sl4nuyr','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-17 10:26:46.000','face','90597','2026-10-01 08:40:36.014'),('cmupaatve01bdt3u032mf8ywq','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-17 10:37:35.000','fingerprint','90602','2026-10-01 08:40:36.026'),('cmupaatvp01bft3u06aek37iv','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-17 11:01:26.000','face','90605','2026-10-01 08:40:36.038'),('cmupaaubf01bht3u01whvzjye','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-17 11:37:09.000','face','90608','2026-10-01 08:40:36.603'),('cmupaauce01bjt3u0e6me6vd8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-17 11:37:24.000','face','90612','2026-10-01 08:40:36.639'),('cmupaaud301blt3u0x9kimlie','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-17 11:44:44.000','fingerprint','90618','2026-10-01 08:40:36.663'),('cmupaaudi01bnt3u0ls67r0hg','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_out','2026-09-17 11:47:01.000','fingerprint','90621','2026-10-01 08:40:36.678'),('cmupaaudv01bpt3u0doryrn5k','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-17 11:52:36.000','face','90624','2026-10-01 08:40:36.691'),('cmupaaue901brt3u02yv63ryz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-17 12:03:54.000','face','90627','2026-10-01 08:40:36.705'),('cmupaauen01btt3u0iuj1sz1n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-17 12:07:24.000','face','90630','2026-10-01 08:40:36.719'),('cmupaaufb01bvt3u0n4k9ainx','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-17 12:14:53.000','face','90636','2026-10-01 08:40:36.744'),('cmupaauua01bxt3u070651zl7','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_out','2026-09-17 12:27:33.000','face','90639','2026-10-01 08:40:37.282'),('cmupaauux01bzt3u0dm39pk2f','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-17 13:01:31.000','face','90642','2026-10-01 08:40:37.305'),('cmupaauvi01c1t3u0xjgp8u0w','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-17 14:31:18.000','face','90648','2026-10-01 08:40:37.326'),('cmupaauvu01c3t3u0a5bp649s','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-17 16:05:28.000','face','90651','2026-10-01 08:40:37.338'),('cmupaauwe01c5t3u01ijtchqz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_in','2026-09-19 04:50:02.000','face','90664','2026-10-01 08:40:37.359'),('cmupaavd201c7t3u08v6jdl4m','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_in','2026-09-19 05:00:42.000','fingerprint','90667','2026-10-01 08:40:37.958'),('cmupaavdl01c9t3u006lnqcww','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-19 05:03:21.000','face','90670','2026-10-01 08:40:37.978'),('cmupaavdy01cbt3u0k2viv5a8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000121','Abdulghafar','check_in','2026-09-19 05:05:23.000','fingerprint','90673','2026-10-01 08:40:37.990'),('cmupaaveb01cdt3u0f3jjra61','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-19 05:09:24.000','face','90676','2026-10-01 08:40:38.003'),('cmupaaven01cft3u0l3575rju','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-19 05:09:48.000','face','90679','2026-10-01 08:40:38.016'),('cmupaavez01cht3u00eovvsjy','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-19 05:10:46.000','face','90682','2026-10-01 08:40:38.028'),('cmupaavfb01cjt3u0tkqezw4q','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-19 05:10:57.000','face','90685','2026-10-01 08:40:38.040'),('cmupaavfo01clt3u0ix2vwsfb','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-19 05:12:43.000','face','90688','2026-10-01 08:40:38.052'),('cmupaavfz01cnt3u0vi9fdcm2','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-19 05:15:03.000','face','90691','2026-10-01 08:40:38.064'),('cmupaavgb01cpt3u02pfmimnl','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-19 05:22:20.000','face','90694','2026-10-01 08:40:38.075'),('cmupaavwu01crt3u0ua33xxnb','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-19 05:24:53.000','face','90697','2026-10-01 08:40:38.671'),('cmupaavxb01ctt3u02iab9y4w','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_in','2026-09-19 05:27:06.000','face','90700','2026-10-01 08:40:38.687'),('cmupaavy001cvt3u08ykx0v8n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-19 05:44:11.000','face','90703','2026-10-01 08:40:38.713'),('cmupaavyi01cxt3u0bbsnuksj','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_in','2026-09-19 05:46:53.000','face','90706','2026-10-01 08:40:38.731'),('cmupaavzn01czt3u0nb8qhoqr','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-19 05:52:19.000','face','90715','2026-10-01 08:40:38.772'),('cmupaaw0401d1t3u0c6pxf650','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-19 05:53:21.000','face','90719','2026-10-01 08:40:38.788'),('cmupaaw0o01d3t3u05uoi731e','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-19 05:54:40.000','face','90724','2026-10-01 08:40:38.809'),('cmupaawfx01d5t3u0dtkhprn0','cmupa8npn00fzt3u0s7jkb72a',NULL,'1','Lehat LAB','check_in','2026-09-19 06:02:57.000','face','90731','2026-10-01 08:40:39.358'),('cmupaawh101d7t3u0blum1f24','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-19 06:27:58.000','face','90737','2026-10-01 08:40:39.397'),('cmupaawht01d9t3u0y89eggwr','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-19 07:02:01.000','face','90743','2026-10-01 08:40:39.425'),('cmupaawi701dbt3u0syqw2zu1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-19 08:42:19.000','fingerprint','90746','2026-10-01 08:40:39.440'),('cmupaawil01ddt3u00hbqdzul','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_in','2026-09-19 08:47:32.000','fingerprint','90749','2026-10-01 08:40:39.454'),('cmupaawzp01dft3u0mnv05fbt','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_out','2026-09-19 10:07:16.000','face','90758','2026-10-01 08:40:40.069'),('cmupaax0301dht3u0917ffauv','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_out','2026-09-19 11:10:40.000','face','90771','2026-10-01 08:40:40.084'),('cmupaax0h01djt3u01sz79quu','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000048','Zryan store','check_out','2026-09-19 11:46:43.000','face','90783','2026-10-01 08:40:40.098'),('cmupaaxfc01dlt3u026b67hjs','cmupa8npn00fzt3u0s7jkb72a',NULL,'1','Lehat LAB','check_out','2026-09-19 12:01:02.000','face','90788','2026-10-01 08:40:40.632'),('cmupaaxfz01dnt3u0fcwqaami','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_out','2026-09-19 12:02:26.000','face','90791','2026-10-01 08:40:40.655'),('cmupaaxgj01dpt3u08nbyd40a','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_out','2026-09-19 12:03:46.000','face','90797','2026-10-01 08:40:40.676'),('cmupaaxgv01drt3u0xby1hi13','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_out','2026-09-19 12:03:48.000','face','90799','2026-10-01 08:40:40.688'),('cmupaaxi201dtt3u0ycuhx14x','cmupa8npn00fzt3u0s7jkb72a',NULL,'18','Nabaz storage','check_out','2026-09-19 12:09:44.000','face','90811','2026-10-01 08:40:40.730'),('cmupaaxif01dvt3u0dhjavwp8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_out','2026-09-19 12:09:52.000','face','90814','2026-10-01 08:40:40.744'),('cmupaaxxx01dxt3u0bvy8o6pq','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_out','2026-09-19 12:11:33.000','face','90817','2026-10-01 08:40:41.301'),('cmupaaxyl01dzt3u0d6euo58p','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_in','2026-09-19 12:33:00.000','face','90820','2026-10-01 08:40:41.325'),('cmupaaxyy01e1t3u0owuudoaq','cmupa8npn00fzt3u0s7jkb72a',NULL,'11','Rayan Education','check_out','2026-09-19 12:41:17.000','fingerprint','90824','2026-10-01 08:40:41.338'),('cmupaaxza01e3t3u0jl7khxuz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_out','2026-09-19 12:49:58.000','fingerprint','90827','2026-10-01 08:40:41.350'),('cmupaaxzm01e5t3u0xfybkhi5','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_out','2026-09-19 13:02:37.000','face','90830','2026-10-01 08:40:41.362'),('cmupaaxzw01e7t3u0yu8leule','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_out','2026-09-19 13:04:40.000','face','90833','2026-10-01 08:40:41.373'),('cmupaay0a01e9t3u0gixtahk4','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_out','2026-09-19 13:04:45.000','face','90835','2026-10-01 08:40:41.386'),('cmupaay0n01ebt3u0jj2rw0zq','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_out','2026-09-19 13:13:44.000','fingerprint','90837','2026-10-01 08:40:41.400'),('cmupaay0z01edt3u00c0b7t1n','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_out','2026-09-19 13:13:48.000','face','90839','2026-10-01 08:40:41.412'),('cmupaay1a01eft3u0sufnmuv8','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_out','2026-09-19 13:48:42.000','face','90841','2026-10-01 08:40:41.423'),('cmupaay1n01eht3u04hztgo5e','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_out','2026-09-19 13:55:02.000','face','90844','2026-10-01 08:40:41.436'),('cmupaayjd01ejt3u0wlghh71k','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_out','2026-09-19 14:15:50.000','face','90848','2026-10-01 08:40:42.073'),('cmupaayk001elt3u02b9qje1m','cmupa8npn00fzt3u0s7jkb72a',NULL,'15','hawzhen xan','check_out','2026-09-19 14:15:55.000','face','90850','2026-10-01 08:40:42.097'),('cmupaaykd01ent3u0b1se8g95','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_out','2026-09-19 14:15:59.000','face','90851','2026-10-01 08:40:42.110'),('cmupaaykq01ept3u0x8b56m9v','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_out','2026-09-19 16:00:48.000','face','90853','2026-10-01 08:40:42.123'),('cmupaayl201ert3u03vb7x5yw','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000075','Marwan Taib','check_out','2026-09-19 17:43:55.000','face','90856','2026-10-01 08:40:42.135'),('cmupaaym001ett3u0gfihio2q','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000151','Akram Rasul (Marketing)','check_in','2026-09-20 05:05:26.000','face','90865','2026-10-01 08:40:42.168'),('cmupaaymg01evt3u0q1y15k3f','cmupa8npn00fzt3u0s7jkb72a',NULL,'9','bashar ahmad','check_in','2026-09-20 05:05:30.000','face','90867','2026-10-01 08:40:42.185'),('cmupaaymv01ext3u0bj780zit','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000189','Hunar Ghafur (Research)','check_in','2026-09-20 05:08:16.000','face','90869','2026-10-01 08:40:42.199'),('cmupaayn901ezt3u0j1gep8f1','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000065','Bilal Aziz','check_in','2026-09-20 05:09:22.000','fingerprint','90872','2026-10-01 08:40:42.213'),('cmupaayno01f1t3u0304ybhnn','cmupa8npn00fzt3u0s7jkb72a',NULL,'7','Dr Salh ','check_in','2026-09-20 05:15:03.000','face','90875','2026-10-01 08:40:42.229'),('cmupaaz3601f3t3u0srq8pxxz','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000089','Aras Othman Store','check_in','2026-09-20 05:18:41.000','face','90878','2026-10-01 08:40:42.786'),('cmupaaz3r01f5t3u02nh9vh65','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000200','Adam Naamat (Innovation)','check_in','2026-09-20 05:18:46.000','face','90881','2026-10-01 08:40:42.808'),('cmupaaz4801f7t3u0hvkrio4n','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000187','Hawkar Muhammad','check_in','2026-09-20 05:18:51.000','face','90883','2026-10-01 08:40:42.825'),('cmupaaz4q01f9t3u0ykjr5679','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000183','Suhaib Bilal (Innovation)','check_in','2026-09-20 05:19:11.000','face','90885','2026-10-01 08:40:42.842'),('cmupaaz5601fbt3u01tcaqud8','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000131','Yousif Dawd Marketing','check_in','2026-09-20 05:20:00.000','face','90888','2026-10-01 08:40:42.859'),('cmupaaz5l01fdt3u0lulwwqru','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-20 05:23:53.000','fingerprint','90891','2026-10-01 08:40:42.874'),('cmupaaz6p01fft3u04fcn8f9e','cmupa8npn00fzt3u0s7jkb72a',NULL,'1','Lehat LAB','check_in','2026-09-20 05:55:45.000','face','90904','2026-10-01 08:40:42.914'),('cmupaazm901fht3u0m4lw7l4n','cmupa8npn00fzt3u0s7jkb72a',NULL,'3','jubrail Ramazan','check_in','2026-09-20 05:57:39.000','face','90907','2026-10-01 08:40:43.474'),('cmupaazmv01fjt3u099f51s7d','cmupa8npn00fzt3u0s7jkb72a',NULL,'17','Batoll khan','check_in','2026-09-20 05:57:42.000','face','90909','2026-10-01 08:40:43.496'),('cmupaazn801flt3u06q9ybjjb','cmupa8npn00fzt3u0s7jkb72a',NULL,'14','Rebaz accountant','check_in','2026-09-20 05:58:55.000','face','90911','2026-10-01 08:40:43.508'),('cmupaaznk01fnt3u0vegdz5a5','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000044','Dr.Muhamad Research','check_in','2026-09-20 06:00:09.000','face','90914','2026-10-01 08:40:43.520'),('cmupaazoc01fpt3u0ojvfhfbf','cmupa8npn00fzt3u0s7jkb72a',NULL,'13','kawa ph','check_in','2026-09-20 06:00:23.000','fingerprint','90920','2026-10-01 08:40:43.548'),('cmupaazon01frt3u0jxjvw592','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000133','Hauzhin Haidar','check_in','2026-09-20 06:03:58.000','face','90922','2026-10-01 08:40:43.559'),('cmupaazp001ftt3u0k1doljbr','cmupa8npn00fzt3u0s7jkb72a',NULL,'16','awara lab','check_in','2026-09-20 06:22:29.000','face','90925','2026-10-01 08:40:43.572'),('cmupaazpb01fvt3u0s50kbtai','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000043','Yasir OPD','check_in','2026-09-20 06:31:26.000','face','90929','2026-10-01 08:40:43.583'),('cmupaazpm01fxt3u0p6y6doq0','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000221','Faisal Amir (Marketing)','check_in','2026-09-20 06:55:26.000','fingerprint','90932','2026-10-01 08:40:43.594'),('cmupaazpx01fzt3u0knjgk70k','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000242','Dr Ibrahim Research','check_in','2026-09-20 07:41:29.000','fingerprint','90935','2026-10-01 08:40:43.605'),('cmupab07c01g1t3u0sgjpunvk','cmupa8npn00fzt3u0s7jkb72a',NULL,'00000191','Rayan Musa (CARDIOLOGY)','check_in','2026-09-20 08:39:04.000','face','90938','2026-10-01 08:40:44.232'),('cmupab08g01g3t3u0yei8pzkg','cmupa8npn00fzt3u0s7jkb72a',NULL,'12','mawlan ','check_out','2026-09-20 09:38:25.000','face','90945','2026-10-01 08:40:44.272'),('cmupab0nz01g5t3u09pb66d2i','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-20 10:07:31.000','fingerprint','90974','2026-10-01 08:40:44.831'),('cmupab0ok01g7t3u0xn7waptk','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-20 10:07:36.000','fingerprint','90976','2026-10-01 08:40:44.853'),('cmupab1i601g9t3u035tkhsgn','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-20 12:09:56.000','face','91053','2026-10-01 08:40:45.918'),('cmupab41t01gbt3u0lr7ua25x','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-21 06:19:52.000','fingerprint','91198','2026-10-01 08:40:49.217'),('cmupab42l01gdt3u06n643b5y','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_in','2026-09-21 07:47:50.000','face','91212','2026-10-01 08:40:49.246'),('cmupab4j801gft3u025ssq3sp','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssi00g7t3u0ulehdpab','19','kawa ph','check_out','2026-09-21 08:17:03.000','face','91237','2026-10-01 08:40:49.844'),('cmupab4yf01ght3u0j8tf5eop','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-21 09:52:27.000','face','91250','2026-10-01 08:40:50.391'),('cmupab4z101gjt3u0qofxzriy','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-21 09:53:51.000','face','91254','2026-10-01 08:40:50.413'),('cmupab4zs01glt3u0prru26ba','cmupa8npn00fzt3u0s7jkb72a','cmupa8suk00gtt3u03jp1q3t4','30','KAK adam','check_out','2026-09-21 10:05:50.000','face','91263','2026-10-01 08:40:50.440'),('cmupab50301gnt3u073brchio','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssy00gbt3u095dbxde1','21','yasir','check_out','2026-09-21 10:57:26.000','face','91268','2026-10-01 08:40:50.451'),('cmupab50e01gpt3u072rcnrl1','cmupa8npn00fzt3u0s7jkb72a','cmupa8st500gdt3u0xf54jg5e','22','HR','check_out','2026-09-21 11:42:13.000','face','91277','2026-10-01 08:40:50.463'),('cmupab5hp01grt3u0z3g1vxg3','cmupa8npn00fzt3u0s7jkb72a','cmupa8suc00grt3u0n1odmak2','29','KAK lehat','check_out','2026-09-21 11:59:26.000','face','91280','2026-10-01 08:40:51.085'),('cmupab5ia01gtt3u0xb5x7vqv','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-21 12:51:42.000','fingerprint','91298','2026-10-01 08:40:51.107'),('cmupab5in01gvt3u0zb32hn5p','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-21 13:07:22.000','face','91304','2026-10-01 08:40:51.119'),('cmupab5j701gxt3u0wi3mxpdb','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-21 13:07:27.000','face','91307','2026-10-01 08:40:51.139'),('cmupab6cv01gzt3u00qoqa246','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-22 04:55:15.000','face','91341','2026-10-01 08:40:52.207'),('cmupab6de01h1t3u0iumkd7g5','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-22 05:03:39.000','face','91347','2026-10-01 08:40:52.227'),('cmupab6ds01h3t3u0bhgpbzd9','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-22 05:08:50.000','face','91356','2026-10-01 08:40:52.240'),('cmupab7ao01h5t3u087v9hyyz','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-22 07:40:20.000','fingerprint','91418','2026-10-01 08:40:53.425'),('cmupab7qp01h7t3u001uquhau','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-22 10:04:59.000','face','91439','2026-10-01 08:40:54.001'),('cmupab86a01h9t3u0uk614wrw','cmupa8npn00fzt3u0s7jkb72a','cmupa8stj00ght3u0mqz38g1z','24','Eman bilal','check_out','2026-09-22 12:03:41.000','fingerprint','91462','2026-10-01 08:40:54.563'),('cmupab86z01hbt3u0gs754w6g','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-22 13:14:10.000','face','91471','2026-10-01 08:40:54.588'),('cmupab87e01hdt3u04i2h19wi','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-22 13:21:20.000','face','91474','2026-10-01 08:40:54.602'),('cmupab87w01hft3u0a4czxq58','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-22 14:06:07.000','fingerprint','91480','2026-10-01 08:40:54.621'),('cmupab8pg01hht3u0h4r5djct','cmupa8npn00fzt3u0s7jkb72a','cmupa8su600gpt3u0mexusvj0','28','KAK mustafa','check_out','2026-09-22 14:59:58.000','face','91491','2026-10-01 08:40:55.253'),('cmupab8ql01hjt3u04rqk0gwr','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-23 04:56:47.000','face','91500','2026-10-01 08:40:55.293'),('cmupab8qw01hlt3u09q1615of','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-23 04:57:21.000','face','91503','2026-10-01 08:40:55.304'),('cmupab8r701hnt3u0iidc25pp','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-23 05:05:05.000','face','91506','2026-10-01 08:40:55.315'),('cmupaba8l01hpt3u0gzicikao','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-23 07:41:15.000','face','91555','2026-10-01 08:40:57.237'),('cmupaba9601hrt3u0rvpqc33j','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-23 08:02:29.000','fingerprint','91560','2026-10-01 08:40:57.259'),('cmupaba9w01htt3u0rps74lw1','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-23 10:10:02.000','face','91566','2026-10-01 08:40:57.284'),('cmupabaq401hvt3u07cre86ix','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-23 12:05:12.000','face','91601','2026-10-01 08:40:57.868'),('cmupabaqi01hxt3u0cxuge0bu','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-23 12:05:19.000','fingerprint','91604','2026-10-01 08:40:57.882'),('cmupabb6301hzt3u0kzxzxc9o','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-23 13:59:43.000','face','91612','2026-10-01 08:40:58.443'),('cmupabb6n01i1t3u0i19nhaga','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-23 13:59:47.000','face','91614','2026-10-01 08:40:58.463'),('cmupabb7901i3t3u0j4s63a3q','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-24 05:06:18.000','face','91621','2026-10-01 08:40:58.485'),('cmupabbnj01i5t3u0h3cio6cm','cmupa8npn00fzt3u0s7jkb72a','cmupa8sv200gzt3u0y89l4dhb','33','KAK shaho','check_in','2026-09-24 05:09:49.000','face','91641','2026-10-01 08:40:59.071'),('cmupabbp401i7t3u0fz0ayzgx','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-24 05:21:56.000','face','91665','2026-10-01 08:40:59.129'),('cmupabcnf01i9t3u0os37kmr3','cmupa8npn00fzt3u0s7jkb72a','cmupa8sv900h1t3u0nm3wy8aj','34','KAK abdulghafar','check_out','2026-09-24 09:10:11.000','fingerprint','91708','2026-10-01 08:41:00.364'),('cmupabcnv01ibt3u0l94gmbs5','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-24 10:01:53.000','face','91712','2026-10-01 08:41:00.380'),('cmupabcob01idt3u00telj97l','cmupa8npn00fzt3u0s7jkb72a','cmupa8suw00gxt3u02j9umz4e','32','KAK shaxawan','check_out','2026-09-24 10:16:21.000','face','91716','2026-10-01 08:41:00.395'),('cmupabcp901ift3u0nvludzde','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-24 11:09:39.000','face','91725','2026-10-01 08:41:00.430'),('cmupabdcr01iht3u0bsd6ueqe','cmupa8npn00fzt3u0s7jkb72a','cmupa8stb00gft3u09gjyiuec','23','SHAMAL ','check_out','2026-09-24 11:21:18.000','face','91732','2026-10-01 08:41:01.275'),('cmupabdd701ijt3u0re467q2b','cmupa8npn00fzt3u0s7jkb72a','cmupa8suq00gvt3u09of2dqeo','31','KAK nabaz','check_out','2026-09-24 12:03:31.000','face','91738','2026-10-01 08:41:01.291'),('cmupabddl01ilt3u0uhxn3xiz','cmupa8npn00fzt3u0s7jkb72a','cmupa8sve00h3t3u0hmfsebvb','35','DR suhaib','check_out','2026-09-24 12:04:58.000','fingerprint','91747','2026-10-01 08:41:01.306'),('cmupabde401int3u05qmzdx1l','cmupa8npn00fzt3u0s7jkb72a','cmupa8svj00h5t3u04sc2bl26','36','KAK hawkar','check_out','2026-09-24 12:13:50.000','face','91753','2026-10-01 08:41:01.325'),('cmupabdeh01ipt3u0fi50pb03','cmupa8npn00fzt3u0s7jkb72a','cmupa8svx00h9t3u0te4vx4dc','38','KAK hunnar','check_out','2026-09-24 12:18:13.000','face','91756','2026-10-01 08:41:01.337'),('cmupabeam01irt3u0ara3a71m','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-26 05:04:36.000','face','91794','2026-10-01 08:41:02.494'),('cmupabebk01itt3u0lvuhg4po','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-26 05:06:12.000','face','91801','2026-10-01 08:41:02.529'),('cmupabec801ivt3u0gqcd7xv4','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-26 05:10:29.000','face','91810','2026-10-01 08:41:02.552'),('cmupabes901ixt3u0dmqs1doa','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-26 05:36:37.000','face','91820','2026-10-01 08:41:03.130'),('cmupabeus01izt3u0s5z7sa91','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_in','2026-09-26 06:01:51.000','face','91839','2026-10-01 08:41:03.221'),('cmupabew201j1t3u09bvk7bmp','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_in','2026-09-26 06:05:18.000','face','91846','2026-10-01 08:41:03.266'),('cmupabfdh01j3t3u06tk89yyb','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_in','2026-09-26 06:07:54.000','face','91854','2026-10-01 08:41:03.894'),('cmupabfeg01j5t3u0lef1ad8f','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_in','2026-09-26 06:08:01.000','fingerprint','91858','2026-10-01 08:41:03.928'),('cmupabffn01j7t3u0z5s5fazw','cmupa8npn00fzt3u0s7jkb72a','cmupa8swx00hlt3u032qga0jz','44','KAK muhamad jabr','check_in','2026-09-26 06:08:16.000','face','91865','2026-10-01 08:41:03.972'),('cmupabfgb01j9t3u0rvnf2b55','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_in','2026-09-26 06:08:22.000','face','91868','2026-10-01 08:41:03.995'),('cmupabfi401jbt3u0val51dm2','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_in','2026-09-26 06:14:39.000','fingerprint','91879','2026-10-01 08:41:04.061'),('cmupabfxl01jdt3u0z2bg5v82','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxm00htt3u0mj066jqn','48','DR salahadin','check_in','2026-09-26 06:14:47.000','face','91882','2026-10-01 08:41:04.617'),('cmupabge701jft3u0jdrpsrvb','cmupa8npn00fzt3u0s7jkb72a','cmupa8syb00i1t3u01trtyx1w','52','Abd Radiology','check_in','2026-09-26 08:26:56.000','face','91916','2026-10-01 08:41:05.215'),('cmupabgeg01jht3u0gt10ydoo','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxm00htt3u0mj066jqn','48','DR salahadin','check_out','2026-09-26 09:15:59.000','fingerprint','91919','2026-10-01 08:41:05.224'),('cmupabgeq01jjt3u0rwsz19uj','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-26 09:39:33.000','fingerprint','91922','2026-10-01 08:41:05.235'),('cmupabgf101jlt3u0vj2m5625','cmupa8npn00fzt3u0s7jkb72a','cmupa8sw300hbt3u0phqku513','39','KAK MAWLAN','check_out','2026-09-26 09:50:40.000','fingerprint','91925','2026-10-01 08:41:05.245'),('cmupabgfa01jnt3u0vrbeupf5','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-26 09:55:50.000','face','91928','2026-10-01 08:41:05.255'),('cmupabgfs01jpt3u08st104py','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_out','2026-09-26 11:48:23.000','face','91934','2026-10-01 08:41:05.273'),('cmupabgwq01jrt3u0hmzmf72j','cmupa8npn00fzt3u0s7jkb72a','cmupa8syh00i3t3u0yo5uck29','53','Amanj Amin','check_out','2026-09-26 11:49:28.000','face','91942','2026-10-01 08:41:05.882'),('cmupabgxr01jtt3u0z87dkb72','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_out','2026-09-26 12:01:48.000','fingerprint','91955','2026-10-01 08:41:05.920'),('cmupabhek01jvt3u0fdk2j2va','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_out','2026-09-26 12:19:38.000','face','91975','2026-10-01 08:41:06.524'),('cmupabhfe01jxt3u0xso9x0fp','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_out','2026-09-26 12:41:59.000','face','91983','2026-10-01 08:41:06.555'),('cmupabhfr01jzt3u0q7p0jzpn','cmupa8npn00fzt3u0s7jkb72a','cmupa8sy400hzt3u0r7uymshv','51','Rayan outpatient','check_out','2026-09-26 12:47:14.000','fingerprint','91987','2026-10-01 08:41:06.567'),('cmupabhg501k1t3u0fsnh6emh','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-26 13:01:29.000','face','91990','2026-10-01 08:41:06.581'),('cmupabhgt01k3t3u0tlly0duf','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxg00hrt3u05d3l8d9b','47','dr younis','check_out','2026-09-26 13:03:13.000','face','91994','2026-10-01 08:41:06.605'),('cmupabhwh01k5t3u0jab2xhrh','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_out','2026-09-26 13:22:33.000','face','92000','2026-10-01 08:41:07.170'),('cmupabhx601k7t3u09cq9ml4s','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-26 13:22:38.000','face','92003','2026-10-01 08:41:07.194'),('cmupabhxi01k9t3u00ojhh2di','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-26 13:22:44.000','face','92005','2026-10-01 08:41:07.206'),('cmupabhxu01kbt3u0p03fupuz','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_out','2026-09-26 13:23:48.000','face','92008','2026-10-01 08:41:07.218'),('cmupabhy701kdt3u0g9391tzy','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-26 13:32:38.000','fingerprint','92011','2026-10-01 08:41:07.231'),('cmupabhyj01kft3u07fnwide0','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_out','2026-09-26 13:41:10.000','face','92014','2026-10-01 08:41:07.243'),('cmupabhyv01kht3u095vc4lw3','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxy00hxt3u0m5iwmwgi','50','Hawzheen xan','check_out','2026-09-26 13:44:55.000','face','92017','2026-10-01 08:41:07.256'),('cmupabhz801kjt3u00pj8274p','cmupa8npn00fzt3u0s7jkb72a','cmupa8swx00hlt3u032qga0jz','44','KAK muhamad jabr','check_out','2026-09-26 13:45:50.000','face','92020','2026-10-01 08:41:07.268'),('cmupabi0501klt3u0l324b235','cmupa8npn00fzt3u0s7jkb72a','cmupa8swx00hlt3u032qga0jz','44','KAK muhamad jabr','check_in','2026-09-27 04:20:06.000','face','92029','2026-10-01 08:41:07.302'),('cmupabifr01knt3u0wlgey1f3','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-27 05:00:46.000','face','92035','2026-10-01 08:41:07.864'),('cmupabign01kpt3u0pk3sz1aj','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_in','2026-09-27 05:02:56.000','face','92043','2026-10-01 08:41:07.896'),('cmupabigz01krt3u0paftgaoy','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-27 05:03:01.000','face','92044','2026-10-01 08:41:07.908'),('cmupabihl01ktt3u0x6mc9cea','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_in','2026-09-27 05:07:22.000','face','92049','2026-10-01 08:41:07.930'),('cmupabihz01kvt3u0polrmnpr','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_in','2026-09-27 05:12:39.000','face','92053','2026-10-01 08:41:07.944'),('cmupabixt01kxt3u0u5utyx0l','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-27 05:39:34.000','face','92064','2026-10-01 08:41:08.513'),('cmupabiz101kzt3u03jocvw17','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-27 05:52:55.000','face','92076','2026-10-01 08:41:08.557'),('cmupabj0701l1t3u0sec6xtu3','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_in','2026-09-27 06:07:46.000','face','92085','2026-10-01 08:41:08.600'),('cmupabj0l01l3t3u0m5fdqgap','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-27 06:08:54.000','fingerprint','92088','2026-10-01 08:41:08.613'),('cmupabjfv01l5t3u07svs323m','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_in','2026-09-27 06:15:34.000','fingerprint','92094','2026-10-01 08:41:09.163'),('cmupabjgg01l7t3u08ys5n5yu','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_in','2026-09-27 06:20:30.000','face','92098','2026-10-01 08:41:09.184'),('cmupabjhq01l9t3u0ar19j49r','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-27 07:02:31.000','fingerprint','92111','2026-10-01 08:41:09.231'),('cmupabji501lbt3u0oys4d4v9','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_in','2026-09-27 07:21:51.000','face','92114','2026-10-01 08:41:09.246'),('cmupabjy601ldt3u0eeubmljd','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_in','2026-09-27 08:26:37.000','face','92129','2026-10-01 08:41:09.823'),('cmupabjyx01lft3u0y3sptxsh','cmupa8npn00fzt3u0s7jkb72a','cmupa8sz000i9t3u0r7mzcpl7','460','Rayan Radiology','check_in','2026-09-27 09:08:46.000','fingerprint','92143','2026-10-01 08:41:09.849'),('cmupabkek01lht3u0a8sh5vxm','cmupa8npn00fzt3u0s7jkb72a','cmupa8sz000i9t3u0r7mzcpl7','460','Rayan Radiology','check_out','2026-09-27 09:59:04.000','fingerprint','92152','2026-10-01 08:41:10.413'),('cmupabkfc01ljt3u01kxg72n5','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-27 10:04:32.000','face','92158','2026-10-01 08:41:10.440'),('cmupabkfz01llt3u095a9d8as','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_out','2026-09-27 10:08:24.000','face','92164','2026-10-01 08:41:10.464'),('cmupabkgk01lnt3u0j5mj98ht','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_out','2026-09-27 11:27:58.000','face','92170','2026-10-01 08:41:10.485'),('cmupabkwi01lpt3u0hfouggn6','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_out','2026-09-27 12:03:37.000','fingerprint','92185','2026-10-01 08:41:11.058'),('cmupabkye01lrt3u0qx41x6sq','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_out','2026-09-27 12:56:58.000','face','92205','2026-10-01 08:41:11.126'),('cmupabkys01ltt3u0bmgtciop','cmupa8npn00fzt3u0s7jkb72a','cmupa8sw800hdt3u075spbzl0','40','KAK rebaz','check_out','2026-09-27 13:01:49.000','face','92208','2026-10-01 08:41:11.140'),('cmupablma01lvt3u04bfeo5mu','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-27 13:02:46.000','face','92214','2026-10-01 08:41:11.986'),('cmupablmz01lxt3u0l0m40kq1','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-27 13:13:34.000','face','92218','2026-10-01 08:41:12.011'),('cmupablnd01lzt3u0pbhrpxol','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_out','2026-09-27 13:13:38.000','face','92220','2026-10-01 08:41:12.026'),('cmupablnq01m1t3u07i3gvcdk','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_out','2026-09-27 13:13:41.000','face','92221','2026-10-01 08:41:12.038'),('cmupablof01m3t3u0cgxm9sli','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-27 13:25:55.000','fingerprint','92226','2026-10-01 08:41:12.063'),('cmupablou01m5t3u0sq9ghe35','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-27 13:30:43.000','face','92229','2026-10-01 08:41:12.078'),('cmupablp701m7t3u0dswdccu1','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_out','2026-09-27 13:30:46.000','face','92231','2026-10-01 08:41:12.091'),('cmupablpk01m9t3u0l7v872to','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-27 13:31:59.000','fingerprint','92233','2026-10-01 08:41:12.104'),('cmupablpw01mbt3u0yommwbn7','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_out','2026-09-27 14:18:00.000','face','92237','2026-10-01 08:41:12.116'),('cmupabmi501mdt3u0pafifz3x','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-28 05:03:40.000','face','92263','2026-10-01 08:41:13.133'),('cmupabmij01mft3u0q649gxol','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_in','2026-09-28 05:03:44.000','face','92265','2026-10-01 08:41:13.148'),('cmupabpcj01mht3u0ym768vrd','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-28 05:09:34.000','face','92276','2026-10-01 08:41:16.820'),('cmupabpcy01mjt3u04zty5pd7','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_in','2026-09-28 05:11:21.000','face','92279','2026-10-01 08:41:16.834'),('cmupabpdo01mlt3u02ctvnm2t','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxm00htt3u0mj066jqn','48','DR salahadin','check_in','2026-09-28 05:12:22.000','face','92285','2026-10-01 08:41:16.860'),('cmupabpeo01mnt3u0d7bsoucy','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-28 05:36:16.000','face','92297','2026-10-01 08:41:16.896'),('cmupabpuj01mpt3u0mn0rysts','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_in','2026-09-28 06:03:22.000','face','92311','2026-10-01 08:41:17.468'),('cmupabpvj01mrt3u0yeki4pr4','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-28 06:12:28.000','fingerprint','92318','2026-10-01 08:41:17.503'),('cmupabpwj01mtt3u05ogd73nb','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_in','2026-09-28 06:18:31.000','face','92328','2026-10-01 08:41:17.539'),('cmupabqc701mvt3u06gsa5brf','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_in','2026-09-28 06:59:56.000','face','92337','2026-10-01 08:41:18.104'),('cmupabqcl01mxt3u0hysvcmtr','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_in','2026-09-28 07:03:08.000','face','92340','2026-10-01 08:41:18.117'),('cmupabqcz01mzt3u0rr7trpa2','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxm00htt3u0mj066jqn','48','DR salahadin','check_out','2026-09-28 07:14:07.000','face','92343','2026-10-01 08:41:18.132'),('cmupabqdt01n1t3u0wcckxn37','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_out','2026-09-28 08:34:59.000','face','92349','2026-10-01 08:41:18.161'),('cmupabqwb01n3t3u03brb3pht','cmupa8npn00fzt3u0s7jkb72a','cmupa8syu00i7t3u0h56pog2o','55','KAK awara','check_out','2026-09-28 10:07:58.000','face','92370','2026-10-01 08:41:18.827'),('cmupabqx901n5t3u0y0oflcve','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-28 11:17:08.000','face','92379','2026-10-01 08:41:18.862'),('cmupabrdi01n7t3u02w3s09ko','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_out','2026-09-28 11:37:03.000','face','92391','2026-10-01 08:41:19.447'),('cmupabre801n9t3u0679hp4fn','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_out','2026-09-28 12:04:57.000','face','92396','2026-10-01 08:41:19.472'),('cmupabrfu01nbt3u0q62m0vrd','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-28 12:54:09.000','fingerprint','92411','2026-10-01 08:41:19.530'),('cmupabrg601ndt3u04levpfih','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_out','2026-09-28 12:55:34.000','face','92414','2026-10-01 08:41:19.542'),('cmupabrx301nft3u0v0mopkkb','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-28 13:45:39.000','face','92432','2026-10-01 08:41:20.151'),('cmupabrxe01nht3u0i03naw5b','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_out','2026-09-28 13:45:43.000','face','92434','2026-10-01 08:41:20.163'),('cmupabry001njt3u0m9i3tn79','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-28 13:45:48.000','face','92436','2026-10-01 08:41:20.185'),('cmupabrym01nlt3u0jabvozlh','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_out','2026-09-28 14:11:22.000','face','92441','2026-10-01 08:41:20.207'),('cmupabsfg01nnt3u0opgyvkh9','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_in','2026-09-29 05:01:45.000','face','92461','2026-10-01 08:41:20.812'),('cmupabsfv01npt3u0gf9asurj','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_in','2026-09-29 05:06:37.000','face','92464','2026-10-01 08:41:20.827'),('cmupabsg701nrt3u0gaxpacsj','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-29 05:06:42.000','face','92466','2026-10-01 08:41:20.839'),('cmupabsgt01ntt3u0mrkg20k5','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_in','2026-09-29 05:10:54.000','face','92471','2026-10-01 08:41:20.862'),('cmupabshy01nvt3u04cx5tnlk','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-29 05:11:11.000','face','92478','2026-10-01 08:41:20.902'),('cmupabsyc01nxt3u0xx0mrbgx','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_in','2026-09-29 05:16:06.000','face','92484','2026-10-01 08:41:21.492'),('cmupabszf01nzt3u0kzt55i5w','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_in','2026-09-29 05:51:57.000','face','92495','2026-10-01 08:41:21.531'),('cmupabszt01o1t3u0264vw0is','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_in','2026-09-29 05:55:46.000','face','92498','2026-10-01 08:41:21.546'),('cmupabtgc01o3t3u0oqfm73e9','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-29 05:59:39.000','face','92511','2026-10-01 08:41:22.141'),('cmupabtic01o5t3u0drp3eabg','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_in','2026-09-29 06:51:14.000','face','92529','2026-10-01 08:41:22.212'),('cmupabtiz01o7t3u02firaxjq','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_in','2026-09-29 07:30:10.000','fingerprint','92535','2026-10-01 08:41:22.235'),('cmupabtjc01o9t3u0qq5q9730','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_in','2026-09-29 07:59:04.000','fingerprint','92538','2026-10-01 08:41:22.248'),('cmupabtyt01obt3u0sren6okx','cmupa8npn00fzt3u0s7jkb72a','cmupa8sz000i9t3u0r7mzcpl7','460','Rayan Radiology','check_in','2026-09-29 07:59:16.000','fingerprint','92541','2026-10-01 08:41:22.806'),('cmupabu0e01odt3u0zz403r7p','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_out','2026-09-29 11:41:52.000','face','92561','2026-10-01 08:41:22.863'),('cmupabu1101oft3u07y6usmhc','cmupa8npn00fzt3u0s7jkb72a','cmupa8syh00i3t3u0yo5uck29','53','Amanj Amin','check_in','2026-09-29 11:55:27.000','face','92568','2026-10-01 08:41:22.885'),('cmupabuii01oht3u0pydqd4em','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_out','2026-09-29 12:03:57.000','face','92574','2026-10-01 08:41:23.515'),('cmupabukm01ojt3u0cai2xlcv','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-29 12:26:00.000','face','92596','2026-10-01 08:41:23.591'),('cmupabul401olt3u02230t848','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_out','2026-09-29 12:26:02.000','face','92598','2026-10-01 08:41:23.609'),('cmupabv2i01ont3u0shxq4ozf','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_out','2026-09-29 13:08:13.000','face','92617','2026-10-01 08:41:24.234'),('cmupabv3401opt3u0hmtnnv76','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_out','2026-09-29 13:10:22.000','face','92620','2026-10-01 08:41:24.256'),('cmupabv3h01ort3u000uolmwh','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_out','2026-09-29 13:13:59.000','fingerprint','92623','2026-10-01 08:41:24.269'),('cmupabv3u01ott3u0dc0szatl','cmupa8npn00fzt3u0s7jkb72a','cmupa8srl00g3t3u0xr3yhc9d','459','Faisal Amir','check_out','2026-09-29 13:21:31.000','fingerprint','92627','2026-10-01 08:41:24.283'),('cmupabvja01ovt3u0pb93w0wn','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_out','2026-09-29 13:36:46.000','face','92632','2026-10-01 08:41:24.838'),('cmupabvjq01oxt3u0hdpiws9f','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-29 13:36:49.000','face','92633','2026-10-01 08:41:24.854'),('cmupabvku01ozt3u01wy0i4tb','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-29 13:55:53.000','face','92640','2026-10-01 08:41:24.894'),('cmupabvm001p1t3u0stutffdl','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_out','2026-09-29 14:25:25.000','face','92646','2026-10-01 08:41:24.937'),('cmupabw3s01p3t3u0prtm7fbe','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_in','2026-09-30 04:51:51.000','face','92661','2026-10-01 08:41:25.576'),('cmupabw4701p5t3u07f6o4ovz','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_in','2026-09-30 04:51:54.000','face','92663','2026-10-01 08:41:25.591'),('cmupabw4l01p7t3u0ly09t3ra','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_in','2026-09-30 04:53:44.000','face','92665','2026-10-01 08:41:25.605'),('cmupabw5o01p9t3u0cgrwdpbq','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_in','2026-09-30 05:03:45.000','face','92677','2026-10-01 08:41:25.644'),('cmupabw6s01pbt3u0bbfeme39','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_in','2026-09-30 05:11:57.000','face','92685','2026-10-01 08:41:25.684'),('cmupabw7601pdt3u0gaslvrt0','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_in','2026-09-30 05:12:03.000','face','92688','2026-10-01 08:41:25.699'),('cmupabwlv01pft3u07t2uguak','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_in','2026-09-30 05:15:10.000','face','92691','2026-10-01 08:41:26.227'),('cmupabwmd01pht3u0k10u7zm9','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_in','2026-09-30 05:17:49.000','face','92694','2026-10-01 08:41:26.245'),('cmupabwn901pjt3u0ijynvk4h','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_in','2026-09-30 05:45:46.000','face','92703','2026-10-01 08:41:26.277'),('cmupabwnw01plt3u00nyrvx4z','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_in','2026-09-30 05:48:31.000','face','92709','2026-10-01 08:41:26.300'),('cmupabx6901pnt3u0jfkyn30i','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_in','2026-09-30 06:19:44.000','fingerprint','92744','2026-10-01 08:41:26.961'),('cmupabxwg01ppt3u0zn8aqb0f','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_in','2026-09-30 07:02:49.000','face','92750','2026-10-01 08:41:27.904'),('cmupabxxc01prt3u0jgixresl','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_in','2026-09-30 07:31:17.000','face','92758','2026-10-01 08:41:27.937'),('cmupabxyg01ptt3u0q5b7dvti','cmupa8npn00fzt3u0s7jkb72a','cmupa8stp00gjt3u0tgijlytf','25','KAK aras','check_out','2026-09-30 10:00:53.000','face','92765','2026-10-01 08:41:27.976'),('cmupabxz501pvt3u0hn5nayzt','cmupa8npn00fzt3u0s7jkb72a','cmupa8syh00i3t3u0yo5uck29','53','Amanj Amin','check_out','2026-09-30 10:56:00.000','face','92771','2026-10-01 08:41:28.001'),('cmupabyec01pxt3u0j7jkzg20','cmupa8npn00fzt3u0s7jkb72a','cmupa8swk00hht3u02tu5lcar','42','diyar accountant','check_out','2026-09-30 12:02:50.000','face','92787','2026-10-01 08:41:28.548'),('cmupabyff01pzt3u02t705xiw','cmupa8npn00fzt3u0s7jkb72a','cmupa8swd00hft3u0rfu96xdw','41','KAK zryan','check_out','2026-09-30 12:06:36.000','face','92795','2026-10-01 08:41:28.588'),('cmupabyfw01q1t3u0q47d3m2c','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxr00hvt3u0clatr26s','49','Rayan education','check_out','2026-09-30 12:06:46.000','fingerprint','92797','2026-10-01 08:41:28.605'),('cmupabywg01q3t3u02jfmrxjl','cmupa8npn00fzt3u0s7jkb72a','cmupa8sx400hnt3u0uai3mga1','45','KAK Akram','check_out','2026-09-30 12:13:53.000','face','92810','2026-10-01 08:41:29.200'),('cmupabyy101q5t3u0oi0ceux1','cmupa8npn00fzt3u0s7jkb72a','cmupa8su000gnt3u0dcbffba6','27','KAK bashar','check_out','2026-09-30 13:03:37.000','face','92824','2026-10-01 08:41:29.257'),('cmupabyyg01q7t3u02p7djihj','cmupa8npn00fzt3u0s7jkb72a','cmupa8stu00glt3u0wlflklou','26','KAK jubrail','check_out','2026-09-30 13:07:04.000','face','92827','2026-10-01 08:41:29.272'),('cmupabyz601q9t3u03w5kxloa','cmupa8npn00fzt3u0s7jkb72a','cmupa8sxb00hpt3u0v3h6kfrf','46','KAK yousif ','check_out','2026-09-30 13:07:10.000','face','92830','2026-10-01 08:41:29.298'),('cmupabyzu01qbt3u019fcfycn','cmupa8npn00fzt3u0s7jkb72a','cmupa8swq00hjt3u0i170j2xo','43','KAK bilal','check_out','2026-09-30 13:07:18.000','face','92832','2026-10-01 08:41:29.323'),('cmupabz0k01qdt3u0f9rt10a3','cmupa8npn00fzt3u0s7jkb72a','cmupa8ss800g5t3u0xaet2esz','458','Qasem Najm','check_out','2026-09-30 13:38:06.000','face','92837','2026-10-01 08:41:29.348'),('cmupabzhg01qft3u0um1sr58g','cmupa8npn00fzt3u0s7jkb72a','cmupa8ssq00g9t3u0be3boby0','20','dr sidra','check_out','2026-09-30 13:44:29.000','face','92840','2026-10-01 08:41:29.956'),('cmupabzi901qht3u0g9s1q4x7','cmupa8npn00fzt3u0s7jkb72a','cmupa8svr00h7t3u0v99tbvbz','37','Batoll KHAN','check_out','2026-09-30 13:55:11.000','face','92848','2026-10-01 08:41:29.985'),('cmupabzj001qjt3u0ehmbk56i','cmupa8npn00fzt3u0s7jkb72a','cmupa8syo00i5t3u0m0xluirv','54','DR salih','check_out','2026-09-30 14:05:42.000','face','92852','2026-10-01 08:41:30.012');
/*!40000 ALTER TABLE `attendance_attendanceevent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_attendanceperson`
--

DROP TABLE IF EXISTS `attendance_attendanceperson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_attendanceperson` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employeeNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cardNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hasFingerprint` tinyint(1) NOT NULL DEFAULT '0',
  `hasFace` tinyint(1) NOT NULL DEFAULT '0',
  `hasPassword` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttendancePerson_deviceId_employeeNo_key` (`deviceId`,`employeeNo`),
  KEY `AttendancePerson_employeeId_idx` (`employeeId`),
  CONSTRAINT `AttendancePerson_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `attendance_attendancedevice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AttendancePerson_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_attendanceperson`
--

LOCK TABLES `attendance_attendanceperson` WRITE;
/*!40000 ALTER TABLE `attendance_attendanceperson` DISABLE KEYS */;
INSERT INTO `attendance_attendanceperson` VALUES ('cmupa8srl00g3t3u0xr3yhc9d','cmupa8npn00fzt3u0s7jkb72a',NULL,'459','Faisal Amir',NULL,1,0,0,'2026-10-01 08:39:01.281','2026-10-01 08:39:43.747'),('cmupa8ss800g5t3u0xaet2esz','cmupa8npn00fzt3u0s7jkb72a',NULL,'458','Qasem Najm',NULL,1,1,0,'2026-10-01 08:39:01.304','2026-10-01 08:39:43.768'),('cmupa8ssi00g7t3u0ulehdpab','cmupa8npn00fzt3u0s7jkb72a',NULL,'19','kawa ph',NULL,1,1,0,'2026-10-01 08:39:01.315','2026-10-01 08:39:43.776'),('cmupa8ssq00g9t3u0be3boby0','cmupa8npn00fzt3u0s7jkb72a',NULL,'20','dr sidra',NULL,1,1,0,'2026-10-01 08:39:01.322','2026-10-01 08:39:43.784'),('cmupa8ssy00gbt3u095dbxde1','cmupa8npn00fzt3u0s7jkb72a',NULL,'21','yasir',NULL,1,1,0,'2026-10-01 08:39:01.330','2026-10-01 08:39:43.792'),('cmupa8st500gdt3u0xf54jg5e','cmupa8npn00fzt3u0s7jkb72a',NULL,'22','HR',NULL,1,1,0,'2026-10-01 08:39:01.337','2026-10-01 08:39:43.799'),('cmupa8stb00gft3u09gjyiuec','cmupa8npn00fzt3u0s7jkb72a',NULL,'23','SHAMAL ',NULL,1,1,0,'2026-10-01 08:39:01.343','2026-10-01 08:39:43.805'),('cmupa8stj00ght3u0mqz38g1z','cmupa8npn00fzt3u0s7jkb72a',NULL,'24','Eman bilal',NULL,1,0,0,'2026-10-01 08:39:01.351','2026-10-01 08:39:43.812'),('cmupa8stp00gjt3u0tgijlytf','cmupa8npn00fzt3u0s7jkb72a',NULL,'25','KAK aras',NULL,1,1,0,'2026-10-01 08:39:01.358','2026-10-01 08:39:43.819'),('cmupa8stu00glt3u0wlflklou','cmupa8npn00fzt3u0s7jkb72a',NULL,'26','KAK jubrail',NULL,1,1,0,'2026-10-01 08:39:01.363','2026-10-01 08:39:43.826'),('cmupa8su000gnt3u0dcbffba6','cmupa8npn00fzt3u0s7jkb72a',NULL,'27','KAK bashar',NULL,1,1,0,'2026-10-01 08:39:01.369','2026-10-01 08:39:43.832'),('cmupa8su600gpt3u0mexusvj0','cmupa8npn00fzt3u0s7jkb72a',NULL,'28','KAK mustafa',NULL,1,1,0,'2026-10-01 08:39:01.374','2026-10-01 08:39:43.838'),('cmupa8suc00grt3u0n1odmak2','cmupa8npn00fzt3u0s7jkb72a',NULL,'29','KAK lehat',NULL,1,1,0,'2026-10-01 08:39:01.380','2026-10-01 08:39:43.844'),('cmupa8suk00gtt3u03jp1q3t4','cmupa8npn00fzt3u0s7jkb72a',NULL,'30','KAK adam',NULL,1,1,0,'2026-10-01 08:39:01.388','2026-10-01 08:39:43.850'),('cmupa8suq00gvt3u09of2dqeo','cmupa8npn00fzt3u0s7jkb72a',NULL,'31','KAK nabaz',NULL,1,1,0,'2026-10-01 08:39:01.394','2026-10-01 08:39:43.856'),('cmupa8suw00gxt3u02j9umz4e','cmupa8npn00fzt3u0s7jkb72a',NULL,'32','KAK shaxawan',NULL,1,1,0,'2026-10-01 08:39:01.401','2026-10-01 08:39:43.863'),('cmupa8sv200gzt3u0y89l4dhb','cmupa8npn00fzt3u0s7jkb72a',NULL,'33','KAK shaho',NULL,1,1,0,'2026-10-01 08:39:01.406','2026-10-01 08:39:43.869'),('cmupa8sv900h1t3u0nm3wy8aj','cmupa8npn00fzt3u0s7jkb72a',NULL,'34','KAK abdulghafar',NULL,1,1,0,'2026-10-01 08:39:01.413','2026-10-01 08:39:43.875'),('cmupa8sve00h3t3u0hmfsebvb','cmupa8npn00fzt3u0s7jkb72a',NULL,'35','DR suhaib',NULL,1,1,0,'2026-10-01 08:39:01.418','2026-10-01 08:39:43.882'),('cmupa8svj00h5t3u04sc2bl26','cmupa8npn00fzt3u0s7jkb72a',NULL,'36','KAK hawkar',NULL,1,1,0,'2026-10-01 08:39:01.424','2026-10-01 08:39:43.888'),('cmupa8svr00h7t3u0v99tbvbz','cmupa8npn00fzt3u0s7jkb72a',NULL,'37','Batoll KHAN',NULL,1,1,0,'2026-10-01 08:39:01.432','2026-10-01 08:39:43.894'),('cmupa8svx00h9t3u0te4vx4dc','cmupa8npn00fzt3u0s7jkb72a',NULL,'38','KAK hunnar',NULL,1,1,0,'2026-10-01 08:39:01.437','2026-10-01 08:39:43.901'),('cmupa8sw300hbt3u0phqku513','cmupa8npn00fzt3u0s7jkb72a',NULL,'39','KAK MAWLAN',NULL,1,1,0,'2026-10-01 08:39:01.443','2026-10-01 08:39:43.907'),('cmupa8sw800hdt3u075spbzl0','cmupa8npn00fzt3u0s7jkb72a',NULL,'40','KAK rebaz',NULL,1,1,0,'2026-10-01 08:39:01.449','2026-10-01 08:39:43.913'),('cmupa8swd00hft3u0rfu96xdw','cmupa8npn00fzt3u0s7jkb72a',NULL,'41','KAK zryan',NULL,1,1,0,'2026-10-01 08:39:01.453','2026-10-01 08:39:43.919'),('cmupa8swk00hht3u02tu5lcar','cmupa8npn00fzt3u0s7jkb72a',NULL,'42','diyar accountant',NULL,1,1,0,'2026-10-01 08:39:01.460','2026-10-01 08:39:43.925'),('cmupa8swq00hjt3u0i170j2xo','cmupa8npn00fzt3u0s7jkb72a',NULL,'43','KAK bilal',NULL,1,1,0,'2026-10-01 08:39:01.466','2026-10-01 08:39:43.931'),('cmupa8swx00hlt3u032qga0jz','cmupa8npn00fzt3u0s7jkb72a',NULL,'44','KAK muhamad jabr',NULL,1,1,0,'2026-10-01 08:39:01.473','2026-10-01 08:39:43.937'),('cmupa8sx400hnt3u0uai3mga1','cmupa8npn00fzt3u0s7jkb72a',NULL,'45','KAK Akram',NULL,1,1,0,'2026-10-01 08:39:01.480','2026-10-01 08:39:43.942'),('cmupa8sxb00hpt3u0v3h6kfrf','cmupa8npn00fzt3u0s7jkb72a',NULL,'46','KAK yousif ',NULL,1,1,0,'2026-10-01 08:39:01.487','2026-10-01 08:39:43.948'),('cmupa8sxg00hrt3u05d3l8d9b','cmupa8npn00fzt3u0s7jkb72a',NULL,'47','dr younis',NULL,1,1,0,'2026-10-01 08:39:01.493','2026-10-01 08:39:43.953'),('cmupa8sxm00htt3u0mj066jqn','cmupa8npn00fzt3u0s7jkb72a',NULL,'48','DR salahadin',NULL,1,1,0,'2026-10-01 08:39:01.498','2026-10-01 08:39:43.959'),('cmupa8sxr00hvt3u0clatr26s','cmupa8npn00fzt3u0s7jkb72a',NULL,'49','Rayan education',NULL,1,0,0,'2026-10-01 08:39:01.504','2026-10-01 08:39:43.964'),('cmupa8sxy00hxt3u0m5iwmwgi','cmupa8npn00fzt3u0s7jkb72a',NULL,'50','Hawzheen xan',NULL,1,1,0,'2026-10-01 08:39:01.510','2026-10-01 08:39:43.970'),('cmupa8sy400hzt3u0r7uymshv','cmupa8npn00fzt3u0s7jkb72a',NULL,'51','Rayan outpatient',NULL,1,0,0,'2026-10-01 08:39:01.516','2026-10-01 08:39:43.977'),('cmupa8syb00i1t3u01trtyx1w','cmupa8npn00fzt3u0s7jkb72a',NULL,'52','Abd Radiology',NULL,1,1,0,'2026-10-01 08:39:01.523','2026-10-01 08:39:43.982'),('cmupa8syh00i3t3u0yo5uck29','cmupa8npn00fzt3u0s7jkb72a',NULL,'53','Amanj Amin',NULL,1,1,0,'2026-10-01 08:39:01.529','2026-10-01 08:39:43.988'),('cmupa8syo00i5t3u0m0xluirv','cmupa8npn00fzt3u0s7jkb72a',NULL,'54','DR salih',NULL,1,1,0,'2026-10-01 08:39:01.536','2026-10-01 08:39:43.994'),('cmupa8syu00i7t3u0h56pog2o','cmupa8npn00fzt3u0s7jkb72a',NULL,'55','KAK awara',NULL,1,1,0,'2026-10-01 08:39:01.542','2026-10-01 08:39:44.000'),('cmupa8sz000i9t3u0r7mzcpl7','cmupa8npn00fzt3u0s7jkb72a',NULL,'460','Rayan Radiology',NULL,1,1,0,'2026-10-01 08:39:01.548','2026-10-01 08:39:44.007'),('cmupa8sz700ibt3u0pcnjvgc0','cmupa8npn00fzt3u0s7jkb72a',NULL,'10','DR marwan',NULL,1,1,0,'2026-10-01 08:39:01.555','2026-10-01 08:39:44.013');
/*!40000 ALTER TABLE `attendance_attendanceperson` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_loginattempt`
--

DROP TABLE IF EXISTS `auth_loginattempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_loginattempt` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `expiresAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_LoginAttempt_expiresAt_idx` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_loginattempt`
--

LOCK TABLES `auth_loginattempt` WRITE;
/*!40000 ALTER TABLE `auth_loginattempt` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_loginattempt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_billingcustomer`
--

DROP TABLE IF EXISTS `billing_billingcustomer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_billingcustomer` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `taxNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `BillingCustomer_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_billingcustomer`
--

LOCK TABLES `billing_billingcustomer` WRITE;
/*!40000 ALTER TABLE `billing_billingcustomer` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_billingcustomer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_billinginvoice`
--

DROP TABLE IF EXISTS `billing_billinginvoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_billinginvoice` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issueDate` datetime(3) NOT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `subtotal` double NOT NULL,
  `discountAmount` double NOT NULL DEFAULT '0',
  `taxAmount` double NOT NULL DEFAULT '0',
  `totalAmount` double NOT NULL,
  `paidAmount` double NOT NULL DEFAULT '0',
  `balanceAmount` double NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `BillingInvoice_invoiceNumber_key` (`invoiceNumber`),
  KEY `BillingInvoice_customerId_idx` (`customerId`),
  KEY `BillingInvoice_issueDate_idx` (`issueDate`),
  KEY `BillingInvoice_status_idx` (`status`),
  CONSTRAINT `BillingInvoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `billing_billingcustomer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_billinginvoice`
--

LOCK TABLES `billing_billinginvoice` WRITE;
/*!40000 ALTER TABLE `billing_billinginvoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_billinginvoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_billinginvoiceitem`
--

DROP TABLE IF EXISTS `billing_billinginvoiceitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_billinginvoiceitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` double NOT NULL,
  `unitPrice` double NOT NULL,
  `discount` double NOT NULL DEFAULT '0',
  `taxRate` double NOT NULL DEFAULT '0',
  `lineTotal` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `BillingInvoiceItem_invoiceId_idx` (`invoiceId`),
  CONSTRAINT `BillingInvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_billinginvoiceitem`
--

LOCK TABLES `billing_billinginvoiceitem` WRITE;
/*!40000 ALTER TABLE `billing_billinginvoiceitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_billinginvoiceitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_billingpayment`
--

DROP TABLE IF EXISTS `billing_billingpayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_billingpayment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `BillingPayment_invoiceId_idx` (`invoiceId`),
  KEY `BillingPayment_paidAt_idx` (`paidAt`),
  CONSTRAINT `BillingPayment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_billingpayment`
--

LOCK TABLES `billing_billingpayment` WRITE;
/*!40000 ALTER TABLE `billing_billingpayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_billingpayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_serviceadvance`
--

DROP TABLE IF EXISTS `billing_serviceadvance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_serviceadvance` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiptNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` double NOT NULL,
  `appliedAmount` double NOT NULL DEFAULT '0',
  `balanceAmount` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receivedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ServiceAdvance_receiptNumber_key` (`receiptNumber`),
  KEY `ServiceAdvance_departmentId_idx` (`departmentId`),
  KEY `ServiceAdvance_appointmentId_idx` (`appointmentId`),
  KEY `ServiceAdvance_receivedAt_idx` (`receivedAt`),
  KEY `ServiceAdvance_status_idx` (`status`),
  CONSTRAINT `ServiceAdvance_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `crm_appointment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ServiceAdvance_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_serviceadvance`
--

LOCK TABLES `billing_serviceadvance` WRITE;
/*!40000 ALTER TABLE `billing_serviceadvance` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing_serviceadvance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building_departmentproduct`
--

DROP TABLE IF EXISTS `building_departmentproduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building_departmentproduct` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `building_DepartmentProduct_departmentId_productId_key` (`departmentId`,`productId`),
  KEY `building_DepartmentProduct_productId_fkey` (`productId`),
  CONSTRAINT `building_DepartmentProduct_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `building_DepartmentProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `building_product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building_departmentproduct`
--

LOCK TABLES `building_departmentproduct` WRITE;
/*!40000 ALTER TABLE `building_departmentproduct` DISABLE KEYS */;
/*!40000 ALTER TABLE `building_departmentproduct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building_expense`
--

DROP TABLE IF EXISTS `building_expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building_expense` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `date` date NOT NULL,
  `paidBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `building_Expense_departmentId_date_idx` (`departmentId`,`date`),
  CONSTRAINT `building_Expense_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building_expense`
--

LOCK TABLES `building_expense` WRITE;
/*!40000 ALTER TABLE `building_expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `building_expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building_product`
--

DROP TABLE IF EXISTS `building_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building_product` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(14,2) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `building_Product_barcode_key` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building_product`
--

LOCK TABLES `building_product` WRITE;
/*!40000 ALTER TABLE `building_product` DISABLE KEYS */;
/*!40000 ALTER TABLE `building_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building_request`
--

DROP TABLE IF EXISTS `building_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building_request` (
  `paidAmount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `items` json NOT NULL,
  `history` json NOT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `building_Request_departmentId_status_idx` (`departmentId`,`status`),
  CONSTRAINT `building_Request_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building_request`
--

LOCK TABLES `building_request` WRITE;
/*!40000 ALTER TABLE `building_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `building_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_appointment`
--

DROP TABLE IF EXISTS `crm_appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_appointment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientPhone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduledAt` datetime(3) NOT NULL,
  `durationMinutes` int NOT NULL DEFAULT '30',
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `source` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Appointment_scheduledAt_idx` (`scheduledAt`),
  KEY `Appointment_doctorId_scheduledAt_idx` (`doctorId`,`scheduledAt`),
  KEY `Appointment_departmentId_idx` (`departmentId`),
  CONSTRAINT `Appointment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `crm_Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `healthcare_healthstaff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_appointment`
--

LOCK TABLES `crm_appointment` WRITE;
/*!40000 ALTER TABLE `crm_appointment` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_crmformtemplate`
--

DROP TABLE IF EXISTS `crm_crmformtemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_crmformtemplate` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'clinical',
  `fields` json NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CrmFormTemplate_code_key` (`code`),
  KEY `CrmFormTemplate_category_status_idx` (`category`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_crmformtemplate`
--

LOCK TABLES `crm_crmformtemplate` WRITE;
/*!40000 ALTER TABLE `crm_crmformtemplate` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_crmformtemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_crmlead`
--

DROP TABLE IF EXISTS `crm_crmlead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_crmlead` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsappPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondaryPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maritalStatus` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferredLanguage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leadSourceChannel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patientType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralPersona` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralNote` text COLLATE utf8mb4_unicode_ci,
  `interest` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `competitorsNote` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `satisfactionScore` int DEFAULT '0',
  `knowledgeRating` int DEFAULT NULL,
  `budgetRange` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decisionInfluencers` text COLLATE utf8mb4_unicode_ci,
  `painPoints` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `convertedPatientId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CrmLead_code_key` (`code`),
  UNIQUE KEY `CrmLead_whatsappPhone_key` (`whatsappPhone`),
  KEY `CrmLead_status_createdAt_idx` (`status`,`createdAt`),
  KEY `CrmLead_phone_idx` (`phone`),
  KEY `CrmLead_convertedPatientId_fkey` (`convertedPatientId`),
  CONSTRAINT `CrmLead_convertedPatientId_fkey` FOREIGN KEY (`convertedPatientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_crmlead`
--

LOCK TABLES `crm_crmlead` WRITE;
/*!40000 ALTER TABLE `crm_crmlead` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_crmlead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_crmleadattachment`
--

DROP TABLE IF EXISTS `crm_crmleadattachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_crmleadattachment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fileSize` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `CrmLeadAttachment_leadId_createdAt_idx` (`leadId`,`createdAt`),
  CONSTRAINT `CrmLeadAttachment_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_crmleadattachment`
--

LOCK TABLES `crm_crmleadattachment` WRITE;
/*!40000 ALTER TABLE `crm_crmleadattachment` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_crmleadattachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_crmleadstatushistory`
--

DROP TABLE IF EXISTS `crm_crmleadstatushistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_crmleadstatushistory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fromStatus` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `CrmLeadStatusHistory_leadId_createdAt_idx` (`leadId`,`createdAt`),
  CONSTRAINT `CrmLeadStatusHistory_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_crmleadstatushistory`
--

LOCK TABLES `crm_crmleadstatushistory` WRITE;
/*!40000 ALTER TABLE `crm_crmleadstatushistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_crmleadstatushistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_feedback`
--

DROP TABLE IF EXISTS `crm_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_feedback` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `source` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'website',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Feedback_targetType_status_idx` (`targetType`,`status`),
  KEY `Feedback_productId_idx` (`productId`),
  KEY `Feedback_serviceId_idx` (`serviceId`),
  KEY `Feedback_createdAt_idx` (`createdAt`),
  CONSTRAINT `Feedback_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Feedback_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `healthcare_healthcareservice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_feedback`
--

LOCK TABLES `crm_feedback` WRITE;
/*!40000 ALTER TABLE `crm_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_lead_convarasations`
--

DROP TABLE IF EXISTS `crm_lead_convarasations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_lead_convarasations` (
  `channel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'whatsapp',
  `isDemo` tinyint(1) NOT NULL DEFAULT '0',
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profileName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastMessageAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CrmWhatsappConversation_phone_key` (`phone`),
  KEY `CrmWhatsappConversation_lastMessageAt_idx` (`lastMessageAt`),
  KEY `CrmWhatsappConversation_leadId_idx` (`leadId`),
  CONSTRAINT `CrmWhatsappConversation_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_lead_convarasations`
--

LOCK TABLES `crm_lead_convarasations` WRITE;
/*!40000 ALTER TABLE `crm_lead_convarasations` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_lead_convarasations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_leadinbox`
--

DROP TABLE IF EXISTS `crm_leadinbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_leadinbox` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `externalId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `body` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'received',
  `sentAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `rawPayload` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CrmWhatsappMessage_externalId_key` (`externalId`),
  KEY `CrmWhatsappMessage_conversationId_sentAt_idx` (`conversationId`,`sentAt`),
  CONSTRAINT `CrmWhatsappMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `crm_lead_convarasations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_leadinbox`
--

LOCK TABLES `crm_leadinbox` WRITE;
/*!40000 ALTER TABLE `crm_leadinbox` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_leadinbox` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_cashaccount`
--

DROP TABLE IF EXISTS `finance_cashaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_cashaccount` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `openingBalance` decimal(18,2) NOT NULL,
  `openingDate` datetime(3) NOT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `finance_CashAccount_name_currency_key` (`name`,`currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_cashaccount`
--

LOCK TABLES `finance_cashaccount` WRITE;
/*!40000 ALTER TABLE `finance_cashaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_cashaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_cashflowaudit`
--

DROP TABLE IF EXISTS `finance_cashflowaudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_cashflowaudit` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flowId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before` json DEFAULT NULL,
  `after` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `finance_CashFlowAudit_flowId_createdAt_idx` (`flowId`,`createdAt`),
  CONSTRAINT `finance_CashFlowAudit_flowId_fkey` FOREIGN KEY (`flowId`) REFERENCES `finance_financecashflow` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_cashflowaudit`
--

LOCK TABLES `finance_cashflowaudit` WRITE;
/*!40000 ALTER TABLE `finance_cashflowaudit` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_cashflowaudit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_financebudget`
--

DROP TABLE IF EXISTS `finance_financebudget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_financebudget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscalYear` int NOT NULL,
  `department` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plannedAmount` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FinanceBudget_fiscalYear_idx` (`fiscalYear`),
  KEY `FinanceBudget_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_financebudget`
--

LOCK TABLES `finance_financebudget` WRITE;
/*!40000 ALTER TABLE `finance_financebudget` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_financebudget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_financecashflow`
--

DROP TABLE IF EXISTS `finance_financecashflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_financecashflow` (
  `sourceType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cashAccountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flowDate` datetime(3) NOT NULL,
  `flowType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `finance_FinanceCashFlow_sourceType_sourceId_key` (`sourceType`,`sourceId`),
  KEY `finance_FinanceCashFlow_cashAccountId_idx` (`cashAccountId`),
  KEY `finance_FinanceCashFlow_departmentId_flowDate_idx` (`departmentId`,`flowDate`),
  KEY `FinanceCashFlow_flowDate_idx` (`flowDate`),
  KEY `FinanceCashFlow_flowType_idx` (`flowType`),
  CONSTRAINT `finance_FinanceCashFlow_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `finance_cashaccount` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `finance_FinanceCashFlow_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_financecashflow`
--

LOCK TABLES `finance_financecashflow` WRITE;
/*!40000 ALTER TABLE `finance_financecashflow` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_financecashflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_financeforecast`
--

DROP TABLE IF EXISTS `finance_financeforecast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_financeforecast` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scenario` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'base',
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `projectedRevenue` double NOT NULL,
  `projectedExpense` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FinanceForecast_periodStart_periodEnd_idx` (`periodStart`,`periodEnd`),
  KEY `FinanceForecast_scenario_idx` (`scenario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_financeforecast`
--

LOCK TABLES `finance_financeforecast` WRITE;
/*!40000 ALTER TABLE `finance_financeforecast` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_financeforecast` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_financefunding`
--

DROP TABLE IF EXISTS `finance_financefunding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_financefunding` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fundingType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `committedAmount` double NOT NULL,
  `receivedAmount` double NOT NULL DEFAULT '0',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `interestRate` double NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FinanceFunding_status_idx` (`status`),
  KEY `FinanceFunding_startDate_idx` (`startDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_financefunding`
--

LOCK TABLES `finance_financefunding` WRITE;
/*!40000 ALTER TABLE `finance_financefunding` DISABLE KEYS */;
/*!40000 ALTER TABLE `finance_financefunding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_doctorspecialization`
--

DROP TABLE IF EXISTS `healthcare_doctorspecialization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_doctorspecialization` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `healthcare_DoctorSpecialization_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_doctorspecialization`
--

LOCK TABLES `healthcare_doctorspecialization` WRITE;
/*!40000 ALTER TABLE `healthcare_doctorspecialization` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_doctorspecialization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_healthcareservice`
--

DROP TABLE IF EXISTS `healthcare_healthcareservice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_healthcareservice` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` double DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `HealthcareService_code_key` (`code`),
  KEY `HealthcareService_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_healthcareservice`
--

LOCK TABLES `healthcare_healthcareservice` WRITE;
/*!40000 ALTER TABLE `healthcare_healthcareservice` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_healthcareservice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_healthstaff`
--

DROP TABLE IF EXISTS `healthcare_healthstaff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_healthstaff` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staffType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `licenseNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biography` text COLLATE utf8mb4_unicode_ci,
  `publicBookingEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `HealthStaff_employeeId_key` (`employeeId`),
  UNIQUE KEY `HealthStaff_licenseNumber_key` (`licenseNumber`),
  KEY `HealthStaff_departmentId_idx` (`departmentId`),
  KEY `HealthStaff_staffType_idx` (`staffType`),
  KEY `healthcare_HealthStaff_specialization_fkey` (`specialization`),
  CONSTRAINT `healthcare_HealthStaff_specialization_fkey` FOREIGN KEY (`specialization`) REFERENCES `healthcare_doctorspecialization` (`name`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `HealthStaff_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `HealthStaff_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_healthstaff`
--

LOCK TABLES `healthcare_healthstaff` WRITE;
/*!40000 ALTER TABLE `healthcare_healthstaff` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_healthstaff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_patient`
--

DROP TABLE IF EXISTS `healthcare_patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_patient` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bloodType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weightKg` double DEFAULT NULL,
  `heightCm` double DEFAULT NULL,
  `isMarried` tinyint(1) NOT NULL DEFAULT '0',
  `childrenCount` int NOT NULL DEFAULT '0',
  `hasDiabetes` tinyint(1) NOT NULL DEFAULT '0',
  `hasHypertension` tinyint(1) NOT NULL DEFAULT '0',
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `medicalNotes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `followUpDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Patient_patientCode_key` (`patientCode`),
  KEY `Patient_phone_idx` (`phone`),
  KEY `Patient_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_patient`
--

LOCK TABLES `healthcare_patient` WRITE;
/*!40000 ALTER TABLE `healthcare_patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_patientformsubmission`
--

DROP TABLE IF EXISTS `healthcare_patientformsubmission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_patientformsubmission` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formTemplateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json NOT NULL,
  `submittedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `healthcare_PatientFormSubmission_submittedById_idx` (`submittedById`),
  KEY `PatientFormSubmission_patientId_createdAt_idx` (`patientId`,`createdAt`),
  KEY `PatientFormSubmission_formTemplateId_idx` (`formTemplateId`),
  CONSTRAINT `healthcare_PatientFormSubmission_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `access_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PatientFormSubmission_formTemplateId_fkey` FOREIGN KEY (`formTemplateId`) REFERENCES `crm_crmformtemplate` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PatientFormSubmission_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_patientformsubmission`
--

LOCK TABLES `healthcare_patientformsubmission` WRITE;
/*!40000 ALTER TABLE `healthcare_patientformsubmission` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_patientformsubmission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_patientpayment`
--

DROP TABLE IF EXISTS `healthcare_patientpayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_patientpayment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surgeryAppointmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paid',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PatientPayment_patientId_paidAt_idx` (`patientId`,`paidAt`),
  KEY `PatientPayment_surgeryAppointmentId_idx` (`surgeryAppointmentId`),
  CONSTRAINT `PatientPayment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PatientPayment_surgeryAppointmentId_fkey` FOREIGN KEY (`surgeryAppointmentId`) REFERENCES `healthcare_surgeryappointment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_patientpayment`
--

LOCK TABLES `healthcare_patientpayment` WRITE;
/*!40000 ALTER TABLE `healthcare_patientpayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_patientpayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_patientprescription`
--

DROP TABLE IF EXISTS `healthcare_patientprescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_patientprescription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescriberId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prescriberName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `items` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `healthcare_PatientPrescription_requestId_key` (`requestId`),
  KEY `healthcare_PatientPrescription_patientId_createdAt_idx` (`patientId`,`createdAt`),
  KEY `healthcare_PatientPrescription_prescriberId_idx` (`prescriberId`),
  CONSTRAINT `healthcare_PatientPrescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `healthcare_PatientPrescription_prescriberId_fkey` FOREIGN KEY (`prescriberId`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_patientprescription`
--

LOCK TABLES `healthcare_patientprescription` WRITE;
/*!40000 ALTER TABLE `healthcare_patientprescription` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_patientprescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_patientreferral`
--

DROP TABLE IF EXISTS `healthcare_patientreferral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_patientreferral` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referrerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referrerPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrerProfession` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referrerAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direction` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inbound',
  `referralPersona` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referringPatientName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referralType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'patient',
  `referredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PatientReferral_patientId_referredAt_idx` (`patientId`,`referredAt`),
  KEY `PatientReferral_status_idx` (`status`),
  CONSTRAINT `PatientReferral_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_patientreferral`
--

LOCK TABLES `healthcare_patientreferral` WRITE;
/*!40000 ALTER TABLE `healthcare_patientreferral` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_patientreferral` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_surgery`
--

DROP TABLE IF EXISTS `healthcare_surgery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_surgery` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `durationMinutes` int NOT NULL,
  `basePrice` decimal(12,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Surgery_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_surgery`
--

LOCK TABLES `healthcare_surgery` WRITE;
/*!40000 ALTER TABLE `healthcare_surgery` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_surgery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `healthcare_surgeryappointment`
--

DROP TABLE IF EXISTS `healthcare_surgeryappointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `healthcare_surgeryappointment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surgeryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduledAt` datetime(3) NOT NULL,
  `operatingRoom` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `preOpNotes` text COLLATE utf8mb4_unicode_ci,
  `postOpNotes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SurgeryAppointment_scheduledAt_status_idx` (`scheduledAt`,`status`),
  KEY `SurgeryAppointment_patientId_idx` (`patientId`),
  KEY `SurgeryAppointment_doctorId_idx` (`doctorId`),
  KEY `SurgeryAppointment_surgeryId_fkey` (`surgeryId`),
  CONSTRAINT `healthcare_SurgeryAppointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `healthcare_healthstaff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `SurgeryAppointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SurgeryAppointment_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `healthcare_surgery` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `healthcare_surgeryappointment`
--

LOCK TABLES `healthcare_surgeryappointment` WRITE;
/*!40000 ALTER TABLE `healthcare_surgeryappointment` DISABLE KEYS */;
/*!40000 ALTER TABLE `healthcare_surgeryappointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_attendancepermission`
--

DROP TABLE IF EXISTS `hr_attendancepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_attendancepermission` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissionType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fromDate` datetime(3) NOT NULL,
  `toDate` datetime(3) NOT NULL,
  `permittedMinutes` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `leaveType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AttendancePermission_employeeId_fromDate_toDate_idx` (`employeeId`,`fromDate`,`toDate`),
  KEY `AttendancePermission_status_idx` (`status`),
  CONSTRAINT `AttendancePermission_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_attendancepermission`
--

LOCK TABLES `hr_attendancepermission` WRITE;
/*!40000 ALTER TABLE `hr_attendancepermission` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_attendancepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_department`
--

DROP TABLE IF EXISTS `hr_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_department` (
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'office',
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `managerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_code_key` (`code`),
  UNIQUE KEY `Department_name_key` (`name`),
  KEY `Department_managerId_idx` (`managerId`),
  CONSTRAINT `Department_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `hr_employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_department`
--

LOCK TABLES `hr_department` WRITE;
/*!40000 ALTER TABLE `hr_department` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employeeattendance`
--

DROP TABLE IF EXISTS `hr_employeeattendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employeeattendance` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendanceDate` datetime(3) NOT NULL,
  `checkIn` datetime(3) DEFAULT NULL,
  `checkOut` datetime(3) DEFAULT NULL,
  `workedMinutes` int NOT NULL DEFAULT '0',
  `lateMinutes` int NOT NULL DEFAULT '0',
  `earlyLeaveMinutes` int NOT NULL DEFAULT '0',
  `overtimeMinutes` int NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `EmployeeAttendance_employeeId_attendanceDate_key` (`employeeId`,`attendanceDate`),
  KEY `EmployeeAttendance_attendanceDate_idx` (`attendanceDate`),
  CONSTRAINT `EmployeeAttendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employeeattendance`
--

LOCK TABLES `hr_employeeattendance` WRITE;
/*!40000 ALTER TABLE `hr_employeeattendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employeeattendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employeeidea`
--

DROP TABLE IF EXISTS `hr_employeeidea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employeeidea` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `EmployeeIdea_userId_createdAt_idx` (`userId`,`createdAt`),
  CONSTRAINT `EmployeeIdea_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employeeidea`
--

LOCK TABLES `hr_employeeidea` WRITE;
/*!40000 ALTER TABLE `hr_employeeidea` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employeeidea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employees`
--

DROP TABLE IF EXISTS `hr_employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employees` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `positionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hireDate` datetime(3) NOT NULL,
  `checkInTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '09:00',
  `checkOutTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '17:00',
  `scheduleType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'static',
  `workSchedule` json DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `isTeamLeader` tinyint(1) NOT NULL DEFAULT '0',
  `teamLeaderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teamId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_employeeCode_key` (`employeeCode`),
  UNIQUE KEY `Employee_userId_key` (`userId`),
  KEY `Employee_departmentId_idx` (`departmentId`),
  KEY `Employee_positionId_idx` (`positionId`),
  KEY `Employee_teamLeaderId_idx` (`teamLeaderId`),
  KEY `hr_Employees_teamId_fkey` (`teamId`),
  CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Employee_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `hr_position` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Employee_teamLeaderId_fkey` FOREIGN KEY (`teamLeaderId`) REFERENCES `hr_employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Employee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `hr_Employees_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `hr_team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employees`
--

LOCK TABLES `hr_employees` WRITE;
/*!40000 ALTER TABLE `hr_employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employeesalary`
--

DROP TABLE IF EXISTS `hr_employeesalary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employeesalary` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `baseSalary` double NOT NULL,
  `currencyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effectiveFrom` datetime(3) NOT NULL,
  `effectiveTo` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `EmployeeSalary_employeeId_idx` (`employeeId`),
  CONSTRAINT `EmployeeSalary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employeesalary`
--

LOCK TABLES `hr_employeesalary` WRITE;
/*!40000 ALTER TABLE `hr_employeesalary` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employeesalary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_employeetarget`
--

DROP TABLE IF EXISTS `hr_employeetarget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_employeetarget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metric` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetValue` double NOT NULL,
  `currentValue` double NOT NULL DEFAULT '0',
  `startDate` datetime(3) NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `EmployeeTarget_employeeId_status_idx` (`employeeId`,`status`),
  KEY `EmployeeTarget_createdById_idx` (`createdById`),
  KEY `EmployeeTarget_dueDate_idx` (`dueDate`),
  CONSTRAINT `EmployeeTarget_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EmployeeTarget_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_employeetarget`
--

LOCK TABLES `hr_employeetarget` WRITE;
/*!40000 ALTER TABLE `hr_employeetarget` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_employeetarget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_payroll`
--

DROP TABLE IF EXISTS `hr_payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_payroll` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salaryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `baseSalary` double NOT NULL,
  `overtimeAmount` double NOT NULL DEFAULT '0',
  `bonusAmount` double NOT NULL DEFAULT '0',
  `allowanceAmount` double NOT NULL DEFAULT '0',
  `lateDeduction` double NOT NULL DEFAULT '0',
  `absenceDeduction` double NOT NULL DEFAULT '0',
  `otherDeduction` double NOT NULL DEFAULT '0',
  `grossSalary` double NOT NULL,
  `totalDeduction` double NOT NULL,
  `netSalary` double NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payroll_employeeId_year_month_key` (`employeeId`,`year`,`month`),
  KEY `Payroll_salaryId_idx` (`salaryId`),
  CONSTRAINT `hr_Payroll_salaryId_fkey` FOREIGN KEY (`salaryId`) REFERENCES `hr_employeesalary` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_payroll`
--

LOCK TABLES `hr_payroll` WRITE;
/*!40000 ALTER TABLE `hr_payroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_payrolladjustment`
--

DROP TABLE IF EXISTS `hr_payrolladjustment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_payrolladjustment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sourceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appliedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PayrollAdjustment_sourceType_sourceId_key` (`sourceType`,`sourceId`),
  KEY `PayrollAdjustment_employeeId_year_month_idx` (`employeeId`,`year`,`month`),
  KEY `PayrollAdjustment_appliedAt_idx` (`appliedAt`),
  KEY `PayrollAdjustment_year_month_type_idx` (`year`,`month`,`type`),
  CONSTRAINT `PayrollAdjustment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_payrolladjustment`
--

LOCK TABLES `hr_payrolladjustment` WRITE;
/*!40000 ALTER TABLE `hr_payrolladjustment` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_payrolladjustment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_position`
--

DROP TABLE IF EXISTS `hr_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_position` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Position_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_position`
--

LOCK TABLES `hr_position` WRITE;
/*!40000 ALTER TABLE `hr_position` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_salaryadvance`
--

DROP TABLE IF EXISTS `hr_salaryadvance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_salaryadvance` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `requestedAt` datetime(3) NOT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `deductionStartDate` datetime(3) DEFAULT NULL,
  `installments` int NOT NULL DEFAULT '1',
  `deductedAmount` double NOT NULL DEFAULT '0',
  `remainingAmount` double NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SalaryAdvance_employeeId_idx` (`employeeId`),
  KEY `SalaryAdvance_status_idx` (`status`),
  KEY `SalaryAdvance_requestedAt_idx` (`requestedAt`),
  CONSTRAINT `SalaryAdvance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_salaryadvance`
--

LOCK TABLES `hr_salaryadvance` WRITE;
/*!40000 ALTER TABLE `hr_salaryadvance` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_salaryadvance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_team`
--

DROP TABLE IF EXISTS `hr_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_team` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `leaderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Team_name_key` (`name`),
  KEY `hr_Team_leaderId_idx` (`leaderId`),
  CONSTRAINT `hr_Team_leaderId_fkey` FOREIGN KEY (`leaderId`) REFERENCES `hr_employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_team`
--

LOCK TABLES `hr_team` WRITE;
/*!40000 ALTER TABLE `hr_team` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_warning`
--

DROP TABLE IF EXISTS `hr_warning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_warning` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'warning',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Warning_createdAt_idx` (`createdAt`),
  KEY `Warning_senderId_fkey` (`senderId`),
  CONSTRAINT `Warning_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_warning`
--

LOCK TABLES `hr_warning` WRITE;
/*!40000 ALTER TABLE `hr_warning` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_warning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_warningrecipient`
--

DROP TABLE IF EXISTS `hr_warningrecipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_warningrecipient` (
  `warningId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `readAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`warningId`,`userId`),
  KEY `WarningRecipient_userId_readAt_idx` (`userId`,`readAt`),
  CONSTRAINT `WarningRecipient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WarningRecipient_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `hr_warning` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_warningrecipient`
--

LOCK TABLES `hr_warningrecipient` WRITE;
/*!40000 ALTER TABLE `hr_warningrecipient` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_warningrecipient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorydepartmentorder`
--

DROP TABLE IF EXISTS `inventory_inventorydepartmentorder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorydepartmentorder` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` datetime(3) DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` json NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `price` decimal(18,2) DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `inventory_InventoryDepartmentOrder_departmentId_createdAt_idx` (`departmentId`,`createdAt`),
  CONSTRAINT `inventory_InventoryDepartmentOrder_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorydepartmentorder`
--

LOCK TABLES `inventory_inventorydepartmentorder` WRITE;
/*!40000 ALTER TABLE `inventory_inventorydepartmentorder` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorydepartmentorder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorydepartmentordercomment`
--

DROP TABLE IF EXISTS `inventory_inventorydepartmentordercomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorydepartmentordercomment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `inventory_InventoryDepartmentOrderComment_orderId_idx` (`orderId`),
  CONSTRAINT `inventory_InventoryDepartmentOrderComment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `inventory_inventorydepartmentorder` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorydepartmentordercomment`
--

LOCK TABLES `inventory_inventorydepartmentordercomment` WRITE;
/*!40000 ALTER TABLE `inventory_inventorydepartmentordercomment` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorydepartmentordercomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorymovement`
--

DROP TABLE IF EXISTS `inventory_inventorymovement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorymovement` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `movementType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` double NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occurredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `inventory_InventoryMovement_movementType_occurredAt_id_idx` (`movementType`,`occurredAt`,`id`),
  KEY `InventoryMovement_occurredAt_idx` (`occurredAt`),
  KEY `InventoryMovement_productId_idx` (`productId`),
  KEY `InventoryMovement_warehouseId_idx` (`warehouseId`),
  CONSTRAINT `InventoryMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InventoryMovement_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorymovement`
--

LOCK TABLES `inventory_inventorymovement` WRITE;
/*!40000 ALTER TABLE `inventory_inventorymovement` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorymovement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventoryorder`
--

DROP TABLE IF EXISTS `inventory_inventoryorder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventoryorder` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `items` json NOT NULL,
  `totalPrice` decimal(18,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_InventoryOrder_requestId_key` (`requestId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventoryorder`
--

LOCK TABLES `inventory_inventoryorder` WRITE;
/*!40000 ALTER TABLE `inventory_inventoryorder` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventoryorder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventoryproduct`
--

DROP TABLE IF EXISTS `inventory_inventoryproduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventoryproduct` (
  `doseMgKgDay` double DEFAULT NULL,
  `dosesPerDay` double DEFAULT NULL,
  `concentrationMg` double DEFAULT NULL,
  `concentrationMl` double DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `isSpecial` tinyint(1) NOT NULL DEFAULT '0',
  `size` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `boxPrice` double NOT NULL DEFAULT '0',
  `specialProfitRate` double NOT NULL DEFAULT '0',
  `specialPrice` double NOT NULL DEFAULT '0',
  `productType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'patient_use',
  `productionCompany` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brandId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'item',
  `costPrice` double NOT NULL,
  `sellingPrice` double NOT NULL,
  `taxRate` double NOT NULL DEFAULT '0',
  `discountType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discountValue` double NOT NULL DEFAULT '0',
  `discountStart` datetime(3) DEFAULT NULL,
  `discountEnd` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryProduct_sku_key` (`sku`),
  UNIQUE KEY `InventoryProduct_barcode_key` (`barcode`),
  KEY `InventoryProduct_categoryId_idx` (`categoryId`),
  KEY `InventoryProduct_brandId_idx` (`brandId`),
  KEY `InventoryProduct_status_idx` (`status`),
  CONSTRAINT `InventoryProduct_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `inventory_productbrand` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryProduct_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `inventory_productcategory` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventoryproduct`
--

LOCK TABLES `inventory_inventoryproduct` WRITE;
/*!40000 ALTER TABLE `inventory_inventoryproduct` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventoryproduct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventoryproductimage`
--

DROP TABLE IF EXISTS `inventory_inventoryproductimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventoryproductimage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isMain` tinyint(1) NOT NULL DEFAULT '0',
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `products_images_productId_sortOrder_idx` (`productId`,`sortOrder`),
  CONSTRAINT `products_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventoryproductimage`
--

LOCK TABLES `inventory_inventoryproductimage` WRITE;
/*!40000 ALTER TABLE `inventory_inventoryproductimage` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventoryproductimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorypurchase`
--

DROP TABLE IF EXISTS `inventory_inventorypurchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorypurchase` (
  `paidAmount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyDate` datetime(3) NOT NULL,
  `retailer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salesperson` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isDebt` tinyint(1) NOT NULL DEFAULT '0',
  `note` text COLLATE utf8mb4_unicode_ci,
  `hasInvoice` tinyint(1) NOT NULL DEFAULT '0',
  `attachmentUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalPrice` decimal(18,2) NOT NULL,
  `items` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_InventoryPurchase_requestId_key` (`requestId`),
  UNIQUE KEY `inventory_InventoryPurchase_retailer_invoiceNumber_key` (`retailer`,`invoiceNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorypurchase`
--

LOCK TABLES `inventory_inventorypurchase` WRITE;
/*!40000 ALTER TABLE `inventory_inventorypurchase` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorypurchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorypurchasepayment`
--

DROP TABLE IF EXISTS `inventory_inventorypurchasepayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorypurchasepayment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchaseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_InventoryPurchasePayment_requestId_key` (`requestId`),
  KEY `inventory_InventoryPurchasePayment_purchaseId_idx` (`purchaseId`),
  CONSTRAINT `inventory_InventoryPurchasePayment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `inventory_inventorypurchase` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorypurchasepayment`
--

LOCK TABLES `inventory_inventorypurchasepayment` WRITE;
/*!40000 ALTER TABLE `inventory_inventorypurchasepayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorypurchasepayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorystock`
--

DROP TABLE IF EXISTS `inventory_inventorystock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorystock` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` double NOT NULL DEFAULT '0',
  `reorderLevel` double NOT NULL DEFAULT '0',
  `anesthesiaMinimum` double NOT NULL DEFAULT '0',
  `scrubNurseMinimum` double NOT NULL DEFAULT '0',
  `perfusionMinimum` double NOT NULL DEFAULT '0',
  `cardiologyMinimum` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryStock_productId_warehouseId_key` (`productId`,`warehouseId`),
  KEY `InventoryStock_warehouseId_idx` (`warehouseId`),
  CONSTRAINT `InventoryStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `InventoryStock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorystock`
--

LOCK TABLES `inventory_inventorystock` WRITE;
/*!40000 ALTER TABLE `inventory_inventorystock` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorystock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inventorywarehouse`
--

DROP TABLE IF EXISTS `inventory_inventorywarehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inventorywarehouse` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryWarehouse_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inventorywarehouse`
--

LOCK TABLES `inventory_inventorywarehouse` WRITE;
/*!40000 ALTER TABLE `inventory_inventorywarehouse` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_inventorywarehouse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_productbrand`
--

DROP TABLE IF EXISTS `inventory_productbrand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_productbrand` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_brands_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_productbrand`
--

LOCK TABLES `inventory_productbrand` WRITE;
/*!40000 ALTER TABLE `inventory_productbrand` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_productbrand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_productcategory`
--

DROP TABLE IF EXISTS `inventory_productcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_productcategory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductCategory_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_productcategory`
--

LOCK TABLES `inventory_productcategory` WRITE;
/*!40000 ALTER TABLE `inventory_productcategory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_productcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorycustomer`
--

DROP TABLE IF EXISTS `inventorycustomer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorycustomer` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `note` text COLLATE utf8mb4_unicode_ci,
  `debtThreshold` decimal(14,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorycustomer`
--

LOCK TABLES `inventorycustomer` WRITE;
/*!40000 ALTER TABLE `inventorycustomer` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventorycustomer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventoryicucase`
--

DROP TABLE IF EXISTS `inventoryicucase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventoryicucase` (
  `isBypass` tinyint(1) NOT NULL DEFAULT '0',
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'icu',
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry` datetime(3) NOT NULL,
  `exit` datetime(3) DEFAULT NULL,
  `items` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InventoryIcuCase_unit_entry_id_idx` (`unit`,`entry`,`id`),
  KEY `InventoryIcuCase_unit_idx` (`unit`),
  KEY `InventoryIcuCase_patientId_idx` (`patientId`),
  CONSTRAINT `InventoryIcuCase_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventoryicucase`
--

LOCK TABLES `inventoryicucase` WRITE;
/*!40000 ALTER TABLE `inventoryicucase` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventoryicucase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventoryproductioncompany`
--

DROP TABLE IF EXISTS `inventoryproductioncompany`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventoryproductioncompany` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryProductionCompany_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventoryproductioncompany`
--

LOCK TABLES `inventoryproductioncompany` WRITE;
/*!40000 ALTER TABLE `inventoryproductioncompany` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventoryproductioncompany` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventoryretailer`
--

DROP TABLE IF EXISTS `inventoryretailer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventoryretailer` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryRetailer_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventoryretailer`
--

LOCK TABLES `inventoryretailer` WRITE;
/*!40000 ALTER TABLE `inventoryretailer` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventoryretailer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratory_dailyqueue`
--

DROP TABLE IF EXISTS `laboratory_dailyqueue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratory_dailyqueue` (
  `day` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nextNumber` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratory_dailyqueue`
--

LOCK TABLES `laboratory_dailyqueue` WRITE;
/*!40000 ALTER TABLE `laboratory_dailyqueue` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratory_dailyqueue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratory_orderitems`
--

DROP TABLE IF EXISTS `laboratory_orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratory_orderitems` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `testId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `testName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specimen` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(18,2) NOT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referenceRange` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result` text COLLATE utf8mb4_unicode_ci,
  `resultNotes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `laboratory_OrderItems_orderId_idx` (`orderId`),
  KEY `laboratory_OrderItems_testId_idx` (`testId`),
  CONSTRAINT `laboratory_OrderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `laboratory_OrderItems_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `laboratory_tests` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratory_orderitems`
--

LOCK TABLES `laboratory_orderitems` WRITE;
/*!40000 ALTER TABLE `laboratory_orderitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratory_orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratory_orders`
--

DROP TABLE IF EXISTS `laboratory_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratory_orders` (
  `accountingCalledAt` datetime(3) DEFAULT NULL,
  `accountingCalledByName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receivedAt` datetime(3) DEFAULT NULL,
  `contactedAt` datetime(3) DEFAULT NULL,
  `contactedByName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `deliveredByName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoiceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queueDay` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queueNumber` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'awaiting_payment',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdByName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collectedByName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completedByName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collectedAt` datetime(3) DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `laboratory_Orders_requestId_key` (`requestId`),
  UNIQUE KEY `laboratory_Orders_invoiceId_key` (`invoiceId`),
  UNIQUE KEY `laboratory_Orders_queueDay_queueNumber_key` (`queueDay`,`queueNumber`),
  KEY `laboratory_Orders_patientId_createdAt_idx` (`patientId`,`createdAt`),
  KEY `laboratory_Orders_leadId_idx` (`leadId`),
  KEY `laboratory_Orders_appointmentId_idx` (`appointmentId`),
  KEY `laboratory_Orders_status_queueDay_queueNumber_idx` (`status`,`queueDay`,`queueNumber`),
  CONSTRAINT `laboratory_Orders_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `crm_appointment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `laboratory_Orders_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `billing_billinginvoice` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `laboratory_Orders_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `crm_crmlead` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `laboratory_Orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `healthcare_patient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratory_orders`
--

LOCK TABLES `laboratory_orders` WRITE;
/*!40000 ALTER TABLE `laboratory_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratory_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratory_paymentreceipts`
--

DROP TABLE IF EXISTS `laboratory_paymentreceipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratory_paymentreceipts` (
  `requestId` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`requestId`),
  UNIQUE KEY `laboratory_PaymentReceipts_paymentId_key` (`paymentId`),
  KEY `laboratory_PaymentReceipts_orderId_idx` (`orderId`),
  CONSTRAINT `laboratory_PaymentReceipts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `laboratory_orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `laboratory_PaymentReceipts_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `billing_billingpayment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratory_paymentreceipts`
--

LOCK TABLES `laboratory_paymentreceipts` WRITE;
/*!40000 ALTER TABLE `laboratory_paymentreceipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratory_paymentreceipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laboratory_tests`
--

DROP TABLE IF EXISTS `laboratory_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laboratory_tests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specimen` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(18,2) NOT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referenceRange` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `laboratory_Tests_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laboratory_tests`
--

LOCK TABLES `laboratory_tests` WRITE;
/*!40000 ALTER TABLE `laboratory_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `laboratory_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings_meeting`
--

DROP TABLE IF EXISTS `meetings_meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings_meeting` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creatorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Meeting_roomCode_key` (`roomCode`),
  KEY `Meeting_departmentId_status_idx` (`departmentId`,`status`),
  KEY `Meeting_creatorId_idx` (`creatorId`),
  CONSTRAINT `Meeting_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meeting_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings_meeting`
--

LOCK TABLES `meetings_meeting` WRITE;
/*!40000 ALTER TABLE `meetings_meeting` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetings_meeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings_meetingparticipant`
--

DROP TABLE IF EXISTS `meetings_meetingparticipant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings_meetingparticipant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meetingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `leftAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `MeetingParticipant_meetingId_idx` (`meetingId`),
  KEY `MeetingParticipant_userId_idx` (`userId`),
  CONSTRAINT `MeetingParticipant_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings_meeting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MeetingParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings_meetingparticipant`
--

LOCK TABLES `meetings_meetingparticipant` WRITE;
/*!40000 ALTER TABLE `meetings_meetingparticipant` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetings_meetingparticipant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_possale`
--

DROP TABLE IF EXISTS `pos_possale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_possale` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saleNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` double NOT NULL,
  `discountAmount` double NOT NULL DEFAULT '0',
  `taxAmount` double NOT NULL DEFAULT '0',
  `totalAmount` double NOT NULL,
  `paidAmount` double NOT NULL,
  `changeAmount` double NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `cashierName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soldAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PosSale_saleNumber_key` (`saleNumber`),
  KEY `PosSale_soldAt_idx` (`soldAt`),
  KEY `PosSale_status_idx` (`status`),
  KEY `PosSale_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `PosSale_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `inventory_inventorywarehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_possale`
--

LOCK TABLES `pos_possale` WRITE;
/*!40000 ALTER TABLE `pos_possale` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_possale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pos_possaleitem`
--

DROP TABLE IF EXISTS `pos_possaleitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pos_possaleitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` double NOT NULL,
  `unitPrice` double NOT NULL,
  `taxRate` double NOT NULL DEFAULT '0',
  `lineTotal` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PosSaleItem_saleId_idx` (`saleId`),
  KEY `PosSaleItem_productId_idx` (`productId`),
  CONSTRAINT `PosSaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `inventory_inventoryproduct` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PosSaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `pos_possale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pos_possaleitem`
--

LOCK TABLES `pos_possaleitem` WRITE;
/*!40000 ALTER TABLE `pos_possaleitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `pos_possaleitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_auditlog`
--

DROP TABLE IF EXISTS `system_auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_auditlog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statusCode` int NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `details` json DEFAULT NULL,
  `durationMs` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_createdAt_idx` (`createdAt`),
  KEY `AuditLog_userId_createdAt_idx` (`userId`,`createdAt`),
  KEY `AuditLog_module_createdAt_idx` (`module`,`createdAt`),
  KEY `AuditLog_action_createdAt_idx` (`action`,`createdAt`),
  KEY `AuditLog_statusCode_createdAt_idx` (`statusCode`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_auditlog`
--

LOCK TABLES `system_auditlog` WRITE;
/*!40000 ALTER TABLE `system_auditlog` DISABLE KEYS */;
INSERT INTO `system_auditlog` VALUES ('cmupa164p00frt3vsja1rocco',NULL,'superadmin','POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',38,'2026-10-01 08:33:05.354'),('cmupa21ma00frt3u0c4pbbdh0',NULL,'superadmin','POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',36,'2026-10-01 08:33:46.163'),('cmupa25wx00fst3u0n0uam693',NULL,'superadmin','POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',16,'2026-10-01 08:33:51.730'),('cmupa29cd00ftt3u0ojtw0zox',NULL,NULL,'POST','/api/auth/login','auth','login',429,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"pin\"}',17,'2026-10-01 08:33:56.173'),('cmupa5eu200fut3u0jo18zuda',NULL,NULL,'POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"pin\"}',10,'2026-10-01 08:36:23.258'),('cmupa5ib000fvt3u09utjdyjl',NULL,NULL,'POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"pin\"}',10,'2026-10-01 08:36:27.756'),('cmupa5rcn00fwt3u0s7fxwn9w',NULL,'superadmin','POST','/api/auth/login','auth','login',401,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',23,'2026-10-01 08:36:39.479'),('cmupa5x4q00fxt3u02bmr7pr2',NULL,'superadmin','POST','/api/auth/login','auth','login',429,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',15,'2026-10-01 08:36:46.970'),('cmupa814k00fyt3u0nwnx91vq','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/auth/login','auth','login',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"loginMethod\": \"credentials\"}',594,'2026-10-01 08:38:25.460'),('cmupa8nq800g0t3u083yqr7c5','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/devices','attendance','create',201,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"name\": \"Main\", \"port\": 80, \"username\": \"admin\", \"ipAddress\": \"192.168.1.131\", \"checkInTime\": \"09:00\", \"checkOutTime\": \"17:00\", \"workingDaysPerMonth\": 22}',120,'2026-10-01 08:38:54.752'),('cmupa8orf00g1t3u0z295ck0w','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/devices/cmupa8npn00fzt3u0s7jkb72a/test','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"recordId\": \"test\"}',60,'2026-10-01 08:38:56.091'),('cmupa8szl00ict3u0oomf4qxk','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/people/sync','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"deviceId\": \"cmupa8npn00fzt3u0s7jkb72a\", \"recordId\": \"sync\"}',618,'2026-10-01 08:39:01.569'),('cmupa8zzw00jlt3u08inkgmot','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/events/sync','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"to\": \"2026-10-01\", \"from\": \"2026-10-01\", \"deviceId\": \"cmupa8npn00fzt3u0s7jkb72a\", \"recordId\": \"sync\"}',3060,'2026-10-01 08:39:10.653'),('cmupac17w01qkt3u0ieu2gga5','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/events/sync','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"to\": \"2026-10-01\", \"from\": \"2026-09-01\", \"deviceId\": \"cmupa8npn00fzt3u0s7jkb72a\", \"recordId\": \"sync\"}',128113,'2026-10-01 08:41:32.204'),('cmupald9401qlt3u0zg3fzgk9','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/events/sync','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"to\": \"2026-10-01\", \"from\": \"2026-10-01\", \"deviceId\": \"cmupa8npn00fzt3u0s7jkb72a\", \"recordId\": \"sync\"}',2117,'2026-10-01 08:48:47.705'),('cmupalo4501qmt3u025tqoio4','cmupa7kli0001t3g8hwi3awu1','Super Administrator','POST','/api/attendance/events/sync','attendance','create',200,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NHOERP/0.0.0 Chrome/138.0.7204.251 Electron/37.10.3 Safari/537.36','{\"to\": \"2026-10-01\", \"from\": \"2026-09-30\", \"deviceId\": \"cmupa8npn00fzt3u0s7jkb72a\", \"recordId\": \"sync\"}',7392,'2026-10-01 08:49:01.781');
/*!40000 ALTER TABLE `system_auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_notification`
--

DROP TABLE IF EXISTS `system_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_notification` (
  `reminderKey` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `route` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warningId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meetingId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `crmLeadId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_Notification_reminderKey_key` (`reminderKey`),
  KEY `Notification_userId_readAt_createdAt_idx` (`userId`,`readAt`,`createdAt`),
  KEY `Notification_taskId_idx` (`taskId`),
  KEY `Notification_warningId_idx` (`warningId`),
  KEY `Notification_meetingId_idx` (`meetingId`),
  KEY `Notification_crmLeadId_idx` (`crmLeadId`),
  CONSTRAINT `Notification_crmLeadId_fkey` FOREIGN KEY (`crmLeadId`) REFERENCES `crm_crmlead` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notification_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings_meeting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notification_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notification_warningId_fkey` FOREIGN KEY (`warningId`) REFERENCES `hr_warning` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_notification`
--

LOCK TABLES `system_notification` WRITE;
/*!40000 ALTER TABLE `system_notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_project`
--

DROP TABLE IF EXISTS `tasks_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_project` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `departmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_Project_departmentId_status_idx` (`departmentId`,`status`),
  KEY `tasks_Project_createdById_fkey` (`createdById`),
  CONSTRAINT `tasks_Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `tasks_Project_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `hr_department` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_project`
--

LOCK TABLES `tasks_project` WRITE;
/*!40000 ALTER TABLE `tasks_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_task`
--

DROP TABLE IF EXISTS `tasks_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_task` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `team` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'todo',
  `startDate` datetime(3) DEFAULT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `estimatedMinutes` int DEFAULT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewNote` text COLLATE utf8mb4_unicode_ci,
  `createdById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Task_status_idx` (`status`),
  KEY `Task_team_idx` (`team`),
  KEY `Task_projectId_idx` (`projectId`),
  KEY `Task_dueDate_idx` (`dueDate`),
  KEY `Task_createdById_fkey` (`createdById`),
  KEY `Task_reviewedById_fkey` (`reviewedById`),
  CONSTRAINT `Task_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Task_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `access_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `tasks_project` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_task`
--

LOCK TABLES `tasks_task` WRITE;
/*!40000 ALTER TABLE `tasks_task` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_taskassignee`
--

DROP TABLE IF EXISTS `tasks_taskassignee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_taskassignee` (
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`taskId`,`employeeId`),
  KEY `TaskAssignee_employeeId_idx` (`employeeId`),
  CONSTRAINT `TaskAssignee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TaskAssignee_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_taskassignee`
--

LOCK TABLES `tasks_taskassignee` WRITE;
/*!40000 ALTER TABLE `tasks_taskassignee` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_taskassignee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_taskattachment`
--

DROP TABLE IF EXISTS `tasks_taskattachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_taskattachment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileSize` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaskAttachment_taskId_idx` (`taskId`),
  CONSTRAINT `TaskAttachment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_taskattachment`
--

LOCK TABLES `tasks_taskattachment` WRITE;
/*!40000 ALTER TABLE `tasks_taskattachment` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_taskattachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_taskcomment`
--

DROP TABLE IF EXISTS `tasks_taskcomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_taskcomment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaskComment_taskId_idx` (`taskId`),
  KEY `TaskComment_authorId_fkey` (`authorId`),
  CONSTRAINT `TaskComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `access_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TaskComment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_taskcomment`
--

LOCK TABLES `tasks_taskcomment` WRITE;
/*!40000 ALTER TABLE `tasks_taskcomment` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_taskcomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks_tasktimeentry`
--

DROP TABLE IF EXISTS `tasks_tasktimeentry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks_tasktimeentry` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recordedById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `workDate` datetime(3) NOT NULL,
  `minutes` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TaskTimeEntry_taskId_idx` (`taskId`),
  KEY `TaskTimeEntry_employeeId_workDate_idx` (`employeeId`,`workDate`),
  KEY `TaskTimeEntry_recordedById_fkey` (`recordedById`),
  CONSTRAINT `TaskTimeEntry_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `hr_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TaskTimeEntry_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `access_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TaskTimeEntry_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks_task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks_tasktimeentry`
--

LOCK TABLES `tasks_tasktimeentry` WRITE;
/*!40000 ALTER TABLE `tasks_tasktimeentry` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks_tasktimeentry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dhf_db'
--

--
-- Dumping routines for database 'dhf_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01 11:49:20
