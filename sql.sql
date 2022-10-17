-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: assetmgt
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assetallocation`
--

DROP TABLE IF EXISTS `assetallocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assetallocation` (
  `assetallocationId` int NOT NULL AUTO_INCREMENT,
  `empId` varchar(100) NOT NULL,
  `assetId` int NOT NULL,
  `allocationTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assetallocationId`),
  KEY `empId` (`empId`),
  KEY `assetId_idx` (`assetId`),
  CONSTRAINT `assetId` FOREIGN KEY (`assetId`) REFERENCES `assets` (`assetId`),
  CONSTRAINT `empId` FOREIGN KEY (`empId`) REFERENCES `employees` (`empId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assetallocation`
--

LOCK TABLES `assetallocation` WRITE;
/*!40000 ALTER TABLE `assetallocation` DISABLE KEYS */;
INSERT INTO `assetallocation` VALUES (34,'E003',8,'2022-09-28 00:43:35'),(35,'E003',2,'2022-09-28 00:44:11'),(36,'E010',10,'2022-09-28 11:50:36'),(37,'E010',23,'2022-09-28 11:50:36'),(38,'E003',16,'2022-09-30 10:51:11');
/*!40000 ALTER TABLE `assetallocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `assetId` int NOT NULL AUTO_INCREMENT,
  `brandId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `assetType` enum('software','hardware') NOT NULL,
  `category` varchar(100) NOT NULL,
  `modelNo` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `status` enum('allocated','available') NOT NULL,
  `usability` enum('usable','unusable','disposed') NOT NULL,
  `asset_location` varchar(100) NOT NULL,
  `addedTime` datetime NOT NULL,
  `isRented` tinyint DEFAULT '1',
  `vendor` varchar(100) DEFAULT NULL,
  `deposit` int DEFAULT NULL,
  `rentStartDate` datetime DEFAULT NULL,
  `rentEndDate` datetime DEFAULT NULL,
  `rent` int DEFAULT NULL,
  PRIMARY KEY (`assetId`),
  UNIQUE KEY `modelNo_UNIQUE` (`modelNo`),
  KEY `brandId_idx` (`brandId`),
  CONSTRAINT `brandId` FOREIGN KEY (`brandId`) REFERENCES `brands` (`brandId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,1002,'Macbook Air M1','hardware','Laptop','1234567','Processor: M1, 8 core GPU, 16gb RAM, 256GB SSD','allocated','usable','','2022-09-01 11:23:00',1,NULL,NULL,NULL,NULL,NULL),(2,1000,'Thinkpad','hardware','Laptop','L01','Processor: i5 8250U, 8GB RAM, 256GB RAM','allocated','usable','','2022-09-01 12:35:00',1,NULL,NULL,NULL,NULL,NULL),(3,1001,'EliteBook','hardware','Laptop','HP01','Processor: i5 8250U, 8GB RAM,256GB SSD','allocated','usable','','2022-09-01 13:49:35',1,NULL,NULL,NULL,NULL,NULL),(5,1001,'EliteBook','hardware','Laptop','HP02','Processor: i5 8250U, 8GB RAM,256GB SSD','available','usable','Mumbai','2022-09-14 11:06:23',1,NULL,NULL,NULL,NULL,NULL),(6,1001,'EliteBook','hardware','Laptop','HP03','Processor: i5 8250U, 8GB RAM,256GB SSD','allocated','usable','Mumbai','2022-09-14 11:06:53',1,NULL,NULL,NULL,NULL,NULL),(7,1002,'Windows 10','software','laptop','123456789','Windows 10 Home','allocated','usable','Pune office','2022-09-16 13:20:43',1,NULL,NULL,NULL,NULL,NULL),(8,1001,'wireless mouse','hardware','mouse','HP!232134','sadasdasndjajshd','allocated','usable','','2022-09-16 17:37:25',1,NULL,NULL,NULL,NULL,NULL),(10,1002,'Macbook Pro','hardware','laptop','123456799999','sadasdasdasd','allocated','usable','','2022-09-28 01:06:13',1,NULL,NULL,NULL,NULL,NULL),(12,1002,'Macbook  prod','hardware','Laptop','MF555','gvgvgv','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(13,1002,'Macbook prok','hardware','Desktop','HJ4444','nnfffv','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(14,1002,'Macbook s','hardware','Laptop','UR875','sddgdf','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(15,1002,'Macbook X','hardware','Desktop','DN F5555','fhthgb','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(16,1002,'Macbook Z','hardware','Laptop','FNSF555','rgdfgxf','allocated','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(17,1002,'Macbook T','hardware','Desktop','DSNF5444','dfgdfxb','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(18,1002,'Macbook U ','hardware','Laptop','FDN544DS','sgdfgfgh','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(19,1002,'Macbook  n','hardware','Desktop','DCNB585','dgdxfbngg','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(20,1002,'Macbook  m','hardware','Laptop','DSJD55DS','ghjghjgh','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(21,1002,'Macbook  B','hardware','Desktop','DSDC78','sfFSfz','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(22,1002,'Macbook  BA','hardware','Laptop','SRYH8','fxfhf','available','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(23,1002,'Macbook za ','hardware','Desktop','GFGF88','fdhfj','allocated','usable','','2022-09-28 03:00:36',1,NULL,NULL,NULL,NULL,NULL),(24,1000,'lenovo mouse','hardware','mouse','LNV10000000','wireless mouse','available','unusable','','2022-09-29 12:02:14',1,NULL,NULL,NULL,NULL,NULL),(25,1001,'popo','software','mouse','u89','scx','available','usable','','2022-09-29 12:17:59',1,NULL,NULL,NULL,NULL,NULL),(26,1001,'kjfjkdsfjk','software','mouse','uri89','wireless mouse','available','usable','','2022-09-29 12:22:55',1,NULL,NULL,NULL,NULL,NULL),(27,1001,'mom','hardware','os','M90','mom','available','usable','','2022-09-29 12:34:36',1,NULL,NULL,NULL,NULL,NULL),(28,1001,'thinkpad max','software','Laptop','ho90','hoho','allocated','disposed','','2022-09-29 15:14:34',1,NULL,NULL,NULL,NULL,NULL),(29,1002,'macos','software','os mac','mac111','high processor','available','usable','','2022-09-29 15:15:35',1,NULL,NULL,NULL,NULL,NULL),(30,1002,'macos','software','os','MAC201','high djkshfjkf','available','usable','','2022-09-29 15:16:31',1,NULL,NULL,NULL,NULL,NULL),(31,1000,'hgcg','software','gghgh','5fr5','hgfcghj','available','usable','','2022-09-29 15:29:33',1,NULL,NULL,NULL,NULL,NULL),(32,1005,'Windows 10','software','OS','1234567890','Windows 10 professional edition','available','usable','','2022-09-29 15:50:42',1,NULL,NULL,NULL,NULL,NULL),(34,1005,'Windows 10','software','OS','10101010','Windows 10 professional edition','available','usable','','2022-09-29 16:01:26',1,'hjkdhk',4000,'2022-09-01 00:00:00','2022-09-15 00:00:00',NULL),(35,1005,'Windows 10','software','OS','101777','Windows 10 professional edition','available','usable','','2022-09-29 16:05:03',1,'hjkdhk',4000,'2022-09-01 00:00:00','2022-09-15 00:00:00',10000),(36,1000,'keyboard','hardware','keyboard','key101','ajdksfn','allocated','disposed','','2022-09-29 16:07:11',1,'yjhnv',100,'2022-09-01 00:00:00','2022-09-30 00:00:00',50),(37,1009,'Dell inspirion','hardware','Laptop','DEL101','SSD ','available','usable','','2022-09-29 16:11:47',1,NULL,NULL,NULL,NULL,NULL),(38,1000,'lappy','hardware','lapatop','lap890','lap','available','unusable','Mumbai','2022-09-29 18:15:35',1,'varma',10000,'2022-09-01 00:00:00','2022-09-30 00:00:00',500);
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `brandId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`brandId`)
) ENGINE=InnoDB AUTO_INCREMENT=1011 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1000,'Lenovo'),(1001,'HP'),(1002,'Apple'),(1003,'Asus'),(1004,'LG'),(1005,'windows'),(1006,'LG'),(1007,'LG'),(1008,'    Dell'),(1009,'Dell'),(1010,'Bosh');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `empId` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` bigint NOT NULL,
  `password` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT '0',
  `jobTitle` varchar(100) NOT NULL,
  PRIMARY KEY (`empId`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('E003','Mahesh Bhadane','mahesh.bhadane@torinit.ca',9999999999,'$2b$10$ZL0PNDXbSXRY63oz7.FL0e7IAGPSR9VU8oxa8M5b8LRX7eCsq9KEu','Pune',0,'Junior Software Engineer'),('E010','Pratiksha Sontakke','pratiksha.sontakke@torinit.ca',1234567890,'$2b$10$SiliArMDhE42/RPlyYWzCO/DHRZygRhKlUIlVRzAZ4IBVfVNbJuWy','Pune',0,'Junior Software Engineer'),('E0199','Amit Wagh','amit@torinit.ca',1234567890,'$2b$10$9FABH.w.Jrp0h3i9ACv3fO1XjOjQhkGwoxpdSgDQLUm6iETFBxksa','Pune',0,'Software Engineer'),('E100','Rakesh Bhadane','rakesh.bhadane@torinit.ca',1234567890,'$2b$10$QB/ocb5BWKxcPIcif5BQvuLAdQAj46SlhCcnKg.80oLCQug/pTuXm','Canada',0,'Senior Software Engineer'),('E120','Rupali Deshpande','rupali.deshpande@torinit.ca',1212312312,'$2b$10$Zm69DXIgvbs.12duyumJe.UFxxr.p3qewDx6f5GZWTJSxafsKwyl6','Pune',0,'software developer'),('E122','Yash Kumar','yash.kumar@torinit.ca',1234567890,'$2b$10$Rv/vYHxMV01uXUF5EFZnTusWQyUIScsQKxZs.RdLZNMAd9sbhvjPu','Pune',0,'Software engineer'),('E123','Yash Raj','yash.raj@torinit.ca',1289312873,'$2b$10$fuTKD3YleTlCCDGWnxOG4eSOvEiVMgA1olRjEQTkBlXGv1ho2AIa.','Pune',0,'Senior software engineer'),('E123131232','Rahul Sharma','rahul@torinit.ca',1234567890,'$2b$10$T/25Xz9ic80Cw04YqNDOaOfNyxtyuZtxAxFplvjQ6eeKT5PfzqlF2','Pune',0,'Software engineer'),('E2999','Mahesh Wagh','mahesh@torinit.ca',1234567890,'$2b$10$rn9yLw295gTznlXZRfwAd.9lDtT0jz2jbeSfblIAk6TyXf16GzGV.','Pune',0,'Software engineer'),('E99999999','Rahul Wagh','rahulw@torinit.ca',1234567890,'$2b$10$bb.K.O1o3Uk1mna4MSgb4O6VKX42P7fsHk0MtCiPIpcL7/KWSa.Bu','Pune',0,'Software engineer'),('E999999999','Rahul Waghs','rahulwa@torinit.ca',1234567890,'$2b$10$Rh2qC/rWG0RyFcj6kZ5UUOsleEJixIitKS8lxgjRy5bO9Qz47O4OK','Pune',0,'Software engineer'),('EMP05','Shubham Desai','shubham.torinit@gmail.com',1234567890,'$2b$10$n6dObt0iacEDR6.JNTIfQOteBd.ByslAFBNssLM4I2DyoEyr1FP7u','Pune',0,'Junior Software Developer'),('EMP101','Rohan Desai','rohan.desai@torinit.ca',9373551557,'$2b$10$SNrgAAUpUk4GrV8KPp9cuOaZb0K1nmDYcvVrXfCumBnRnFM4yloEm','Pune',0,'Junior Software Engineer'),('EMP102','Akram Ansari','akram.ansari@torinit.ca',9930539961,'$2a$10$chhItmuv9K40nem.1hZZheBaQEbJqbL/XyN6ChP4j3RJSOoMS1b/i','Pune',1,'Junior Software Engineer'),('EMP110','Randhir','randhir.jha@torinit.ca',1234567890,'$2b$10$YMm/z.avloJaPSjvf3CMFehx8Xxu07YjMJvlWuT3nrxmwI8orPnKS','Nagpur',0,'Technical Delivery Manager'),('EMP111','Amit Waghmare','amit.waghmare@torinit.ca',9876543210,'$2b$10$dRiiAilz2x7qSEuMrEsMuuM8hBDxoosQrKnYP27TRoH0XaP7/ibfO','Pune',0,'Senior Software Engineer'),('EMP112','Dhikesh Karunvakandy','dhikesk.karunvakandy@torinit.ca',9876543210,'$2b$10$NDVw8qfmiDTZnMJ.zZxlGOIkRMMmE0gRtSx3e4/22oc49eqMDMGdK','Mumbai',0,'Senior Software Engineer'),('EMP113','Madhuri Borude','madhuri.borude@torinit.ca',9876543210,'$2b$10$BsEri4AhKsaxVICemSeonumUyh.70LUJJ3oAiaslDMlF3RscGmYiy','Mumbai',0,'Senior Software Engineer'),('EMP114','Vasu kapil','vasu.kapil@torinit.ca',9876543210,'$2b$10$.DmahUPEmukfVWnZRC2QZOqzsX9muH7pgs6pLgX37.UyaQ9yid5b2','Mumbai',0,'Senior Software Engineer'),('EMP115','Heena Parashar','heena.parashar@torinit.ca',9876543210,'$2b$10$W0z.79JWlMFig/n3z6fgfeQ1F3GpkzMlhft3rQwc72xbCpoLcB1Ku','Mumbai',0,'Senior Software Engineer'),('EMP116','Akshada Kumar','akshada.kumar@torinit.ca',9876543210,'$2b$10$N9jCn4RbB36WhAUC.UPjBuw.6MEtlWlllGRq9Y4SLtewVRakL4/CG','Mumbai',0,'Senior Software Engineer'),('EMP117','Mobin Khan','mobin.khan@torinit.ca',9876543210,'$2b$10$m5glRwy.hStIa.h2dEZxAOcT3DN1U6ZFeoa91t4VETJ2Sj324Q3AS','Mumbai',0,'Senior Software Engineer'),('EMP118','Krishna Jha','krishna.jha@torinit.ca',9876543210,'$2b$10$W04nCPfyrIWkLFRdFdsgfOkd4JKkJghv5jznLEvaelTyDmjLaAeOO','Mumbai',0,'Senior Software Engineer'),('EMP1234','Rishab Dev','rishab.dev@torinit.ca',1264121234,'$2b$10$VeHyajqbVOeqjhq7EsWOM.HuQkA3TKM1QBFqlHKi56C08WOxvHlqu','Pune',0,'senior_software_developer'),('EMP177','Amol Patil','amol.patil@torinit.ca',1234567890,'$2b$10$Z.QmFMFdbvLTJBpx902oYuRwtZAoZkI6mz.BKVh9LQpJvlNhzFoJq','Pune',0,'senior_software_developer'),('EMP178','Pragati Waghmare','pragati.waghmare@torinit.ca',1234567890,'$2b$10$ytv9rU7aPh9tkJGiRHHKWOwjtaYSDSUOWFqqDJ9ehNymlpkpNG3S.','Pune',0,'senior_software_developer'),('EMP1799','Pooja Patil','pooja.patil@torinit.ca',1234567890,'$2b$10$ZJT7tdWeT8RwyXrh8gqS6e6A63zi5UXIs/fNmXwKFvb1UqyTh7m1a','Pune',0,'senior_software_developer'),('EMP22','Tushar Mahajan','tushar.mahajan@torinit.ca',9876543210,'$2b$10$kTsfgand9uLr3SktI6CYvu7/rNY6PnPwDwGU3fyxRLHpJXFjA33I.','Pune',0,'Senior Software Engineer'),('EMP222','Sandeep','sandeep.mahajan@torinit.ca',9876543210,'$2b$10$C7eGgxnGEnQZm.AdoKp4pui2aqMO56L4vwWX4oMZ890fvIBvBaSH6','Pune',0,'Senior Software Engineer'),('T717','Rohan Joshi','rohan@torinit.ca',9632587412,'$2b$10$9e.WSFBh3ATLm8F5q8nmzOdenu0GFTsUosRT9ud453bBjxgw9Cr1G','Mumbai',0,'senior_software_developer'),('TNT1010','Neha Kumar','neha@torinit.ca',9632587412,'$2b$10$M9oFTP01sdkvy4BVIqqG3Oil/gawYlbB75uk07kqZhxknZEv5D12a','mumbai',0,'Human Resourse'),('TR123422','Mike Hareber','mahesh.bhadane1@torinit.ca',4511111111,'$2b$10$OHC1zLYeW7LBa2NbpHm2GOxZkFICsyb9yo7tPQH1VDE9QRhQPkXY2','Pune',0,'senior_software_developer'),('TRNT1012','Rani Ray','rani@torinit.ca',9686859656,'$2b$10$ovQFqJFhjyR5mXmdPa37hesjNArDiw/hjeSetSa3Wwv6gsFFLOttS','Mumbai',0,'associate_software_developer'),('TRNT701','Shubh Paul','shubh@torinit.ca',9636568965,'$2b$10$yw66iv2DbYk39cjCAXSjbOmbo741BOgKCOkX8QoUGZtoeBUIW.iNy','Canada',0,'human_resourse');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `ticketId` int NOT NULL AUTO_INCREMENT,
  `empId` varchar(100) NOT NULL,
  `assetId` int DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `ticketStatus` enum('active','pending','closed') NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`ticketId`),
  KEY `empId_idx` (`empId`),
  KEY `assetId_idx` (`assetId`),
  CONSTRAINT `asset_Id` FOREIGN KEY (`assetId`) REFERENCES `assets` (`assetId`),
  CONSTRAINT `emp_Id` FOREIGN KEY (`empId`) REFERENCES `employees` (`empId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'E003',7,'Mac has issues','asdkjbjkasbdkjasnjdnaskjdnkjasndkjasndkjs','active','2022-09-16 17:16:12'),(2,'E003',6,'Macbook has issues','sadjasbjdaskbdkasbdkjasbdjkasbdkasdbaskjdbkjasdbasdjasbjkdas','closed','2022-09-16 17:19:57'),(3,'E003',7,'jhjghfgxf','uyguftdgxcvhjbhknjm,','closed','2022-09-20 00:33:36'),(4,'E003',6,'sjkbkrbdjbelet','hufythdgvjkjlkihuiyfrutdcghjhugiyfujg','active','2022-09-20 10:57:53'),(5,'E003',7,'asdasdasd','asdasdasdasd','active','2022-09-20 21:14:18'),(6,'E003',7,'asghdvbasdkhas','asdasdbhkasbvdiksn md asn dkn','closed','2022-09-20 21:14:36'),(7,'E003',5,'prooo','sadasdasdas','active','2022-09-28 01:10:41'),(8,'E003',8,'jkesdmnf','jkekrwnmds x','active','2022-09-30 12:45:33'),(9,'E003',8,'gfggfg','gfgfgfgf','active','2022-09-30 12:54:32'),(10,'E003',8,'I want a macbook','M1 mac pro','pending','2022-09-30 12:59:17'),(11,'E003',NULL,'hjnbnm ','hjbnnm ','pending','2022-09-30 13:05:37'),(12,'E003',NULL,'hello there','aiedsfhx','active','2022-09-30 18:50:32');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticketstatus`
--

DROP TABLE IF EXISTS `ticketstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticketstatus` (
  `ticketstatusId` int NOT NULL AUTO_INCREMENT,
  `ticketId` int NOT NULL,
  `note` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`ticketstatusId`),
  KEY `ticketId_idx` (`ticketId`),
  CONSTRAINT `ticketId` FOREIGN KEY (`ticketId`) REFERENCES `tickets` (`ticketId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketstatus`
--

LOCK TABLES `ticketstatus` WRITE;
/*!40000 ALTER TABLE `ticketstatus` DISABLE KEYS */;
INSERT INTO `ticketstatus` VALUES (1,1,'uytdrgxbvhjhihytiyutdyrhuihugjchfguhfyhfgxhgukhjn','2022-09-20 00:22:11'),(2,1,'Noted','2022-09-28 00:58:18');
/*!40000 ALTER TABLE `ticketstatus` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-10-03 12:00:29
