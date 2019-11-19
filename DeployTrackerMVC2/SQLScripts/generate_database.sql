USE [master]
GO
/****** Object:  Database [dbMain]    Script Date: 11/19/2019 11:42:20 AM ******/
CREATE DATABASE [dbMain]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'dbMain', FILENAME = N'C:\Users\erick.mccoy\AppData\Local\Microsoft\VisualStudio\SSDT\dbMain\dbMain.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'dbMain_log', FILENAME = N'C:\Users\erick.mccoy\AppData\Local\Microsoft\VisualStudio\SSDT\dbMain\dbMain.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
GO
ALTER DATABASE [dbMain] SET COMPATIBILITY_LEVEL = 130
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [dbMain].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [dbMain] SET ANSI_NULL_DEFAULT ON 
GO
ALTER DATABASE [dbMain] SET ANSI_NULLS ON 
GO
ALTER DATABASE [dbMain] SET ANSI_PADDING ON 
GO
ALTER DATABASE [dbMain] SET ANSI_WARNINGS ON 
GO
ALTER DATABASE [dbMain] SET ARITHABORT ON 
GO
ALTER DATABASE [dbMain] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [dbMain] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [dbMain] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [dbMain] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [dbMain] SET CURSOR_DEFAULT  LOCAL 
GO
ALTER DATABASE [dbMain] SET CONCAT_NULL_YIELDS_NULL ON 
GO
ALTER DATABASE [dbMain] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [dbMain] SET QUOTED_IDENTIFIER ON 
GO
ALTER DATABASE [dbMain] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [dbMain] SET  ENABLE_BROKER 
GO
ALTER DATABASE [dbMain] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [dbMain] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [dbMain] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [dbMain] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [dbMain] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [dbMain] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [dbMain] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [dbMain] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [dbMain] SET  MULTI_USER 
GO
ALTER DATABASE [dbMain] SET PAGE_VERIFY NONE  
GO
ALTER DATABASE [dbMain] SET DB_CHAINING OFF 
GO
ALTER DATABASE [dbMain] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [dbMain] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
ALTER DATABASE [dbMain] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [dbMain] SET QUERY_STORE = OFF
GO
USE [dbMain]
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = OFF;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = ON;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = OFF;
GO
USE [dbMain]
GO
USE [dbMain]
GO
/****** Object:  Sequence [dbo].[VIDSequence]    Script Date: 11/19/2019 11:42:20 AM ******/
CREATE SEQUENCE [dbo].[VIDSequence] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE -9223372036854775808
 MAXVALUE 9223372036854775807
 CACHE 
GO
/****** Object:  Table [dbo].[tblComments]    Script Date: 11/19/2019 11:42:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblComments](
	[comID] [int] IDENTITY(1,1) NOT NULL,
	[comBody] [varchar](500) NULL,
	[comDateTime] [datetimeoffset](7) NOT NULL,
	[comUser] [varchar](50) NULL,
	[depID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[comID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tblDeploy]    Script Date: 11/19/2019 11:42:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblDeploy](
	[depID] [int] IDENTITY(1,1) NOT NULL,
	[depFeature] [varchar](50) NULL,
	[depVersion] [varchar](50) NULL,
	[depPlannedDateTime] [datetimeoffset](7) NULL,
	[depStartTime] [datetimeoffset](7) NULL,
	[depEndTime] [datetimeoffset](7) NULL,
	[depStatus] [varchar](50) NULL,
	[depEnvironment] [varchar](50) NULL,
	[depLocked] [bit] NULL,
	[noteID] [int] NULL,
	[depSmoke] [varchar](50) NULL,
	[depTimeDiff]  AS (datediff(hour,[depStartTime],getdate())),
PRIMARY KEY CLUSTERED 
(
	[depID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tblEnvironments]    Script Date: 11/19/2019 11:42:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblEnvironments](
	[envID] [int] IDENTITY(1,1) NOT NULL,
	[envName] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[envID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tblFeatures]    Script Date: 11/19/2019 11:42:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblFeatures](
	[feaID] [int] IDENTITY(1,1) NOT NULL,
	[feaName] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[feaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tblNotes]    Script Date: 11/19/2019 11:42:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tblNotes](
	[noteID] [int] IDENTITY(1,1) NOT NULL,
	[noteBody] [varchar](2000) NULL,
	[noteDateTime] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[noteID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tblDeploy] ADD  DEFAULT ((0)) FOR [depLocked]
GO
ALTER TABLE [dbo].[tblComments]  WITH CHECK ADD  CONSTRAINT [comment-deploy-relationship] FOREIGN KEY([depID])
REFERENCES [dbo].[tblDeploy] ([depID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[tblComments] CHECK CONSTRAINT [comment-deploy-relationship]
GO
ALTER TABLE [dbo].[tblDeploy]  WITH CHECK ADD  CONSTRAINT [note-deploy-relationship] FOREIGN KEY([noteID])
REFERENCES [dbo].[tblNotes] ([noteID])
GO
ALTER TABLE [dbo].[tblDeploy] CHECK CONSTRAINT [note-deploy-relationship]
GO
USE [master]
GO
ALTER DATABASE [dbMain] SET  READ_WRITE 
GO
