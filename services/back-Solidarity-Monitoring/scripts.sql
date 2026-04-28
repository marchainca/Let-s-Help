-- =============================================
-- MER Let's Help - PostgreSQL
-- =============================================

-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS lets_help CASCADE;

-- Crear la base de datos
CREATE DATABASE lets_help;

-- Eliminar tablas en orden inverso a las dependencias (si existen)
DROP TABLE IF EXISTS Biometric_data CASCADE;
DROP TABLE IF EXISTS Absences CASCADE;
DROP TABLE IF EXISTS Reports CASCADE;
DROP TABLE IF EXISTS Tasks CASCADE;
DROP TABLE IF EXISTS Sub_programs CASCADE;
DROP TABLE IF EXISTS Programs CASCADE;
DROP TABLE IF EXISTS Activities CASCADE;
DROP TABLE IF EXISTS Beneficiaries CASCADE;
DROP TABLE IF EXISTS Address CASCADE;
DROP TABLE IF EXISTS Neighborhoods CASCADE;
DROP TABLE IF EXISTS Cities CASCADE;
DROP TABLE IF EXISTS States CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

-- =============================================
-- 1. Roles
-- =============================================
CREATE TABLE Roles (
    IdRole      SERIAL PRIMARY KEY,
    NameRole    VARCHAR(100) NOT NULL,
    Description VARCHAR(250) NOT NULL,
    CreatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. Users
-- =============================================
CREATE TABLE Users (
    IdUser           SERIAL PRIMARY KEY,
    Identification   VARCHAR(15) UNIQUE,
    Email            VARCHAR(100) UNIQUE,
    Birthdate        DATE,
    FirstName        VARCHAR(250),
    LastName         VARCHAR(250),
    Password         VARCHAR(250) NOT NULL,
    IdRole           INTEGER NOT NULL REFERENCES Roles(IdRole) ON DELETE RESTRICT,
    UrlImage         VARCHAR(250),
    CreatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. States
-- =============================================
CREATE TABLE States (
    IdState   SERIAL PRIMARY KEY,
    NameState VARCHAR(250) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. Cities
-- =============================================
CREATE TABLE Cities (
    IdCity    SERIAL PRIMARY KEY,
    IdState   INTEGER NOT NULL REFERENCES States(IdState),
    NameCity  VARCHAR(250) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. Neighborhoods
-- =============================================
CREATE TABLE Neighborhoods (
    IdNeighborhood   SERIAL PRIMARY KEY,
    IdCity           INTEGER NOT NULL REFERENCES Cities(IdCity),
    NameNeighborhood VARCHAR(250) NOT NULL,
    CreatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. Address
-- =============================================
CREATE TABLE Address (
    IdAddress       SERIAL PRIMARY KEY,
    IdCity          INTEGER NOT NULL REFERENCES Cities(IdCity),
    IdNeighborhood  INTEGER NOT NULL REFERENCES Neighborhoods(IdNeighborhood),
    Street          VARCHAR(250),
    Number          VARCHAR(50),
    PostalCode      VARCHAR(20) DEFAULT NULL,
    CreatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. Beneficiaries
-- =============================================
CREATE TABLE Beneficiaries (
    IdBeneficiary SERIAL PRIMARY KEY,
    Identification VARCHAR(15) UNIQUE,
    Email          VARCHAR(100) UNIQUE,
    Birthdate      DATE,
    FirstName      VARCHAR(250),
    LastName       VARCHAR(250),
    IdAddress      INTEGER REFERENCES Address(IdAddress) ON DELETE SET NULL,
    UrlImage       VARCHAR(250),
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. BiometricData
-- =============================================
CREATE TABLE Biometric_data (
    IdBiometric      SERIAL PRIMARY KEY,
    IdBeneficiary    INTEGER NOT NULL REFERENCES Beneficiaries(IdBeneficiary) ON DELETE CASCADE,
    binaryDescriptor BYTEA,
    CreatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. Programs
-- =============================================
CREATE TABLE Programs (
    IdProgram           SERIAL PRIMARY KEY,
    IdLeadUser          INTEGER NOT NULL REFERENCES Users(IdUser),
    NameProgram         VARCHAR(100) NOT NULL,
    DescriptionProgram  TEXT,
    CreatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. SubPrograms
-- =============================================
CREATE TABLE Sub_Programs (
    IdSubProgram            SERIAL PRIMARY KEY,
    IdProgram               INTEGER NOT NULL REFERENCES Programs(IdProgram) ON DELETE CASCADE,
    NameSubProgram          VARCHAR(100) NOT NULL,
    DescriptionSubProgram   TEXT,
    CreatedAt               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 11. Tasks - se deja creada aunque no se va a usar en esta versión, para evitar problemas de dependencias con Activities
-- =============================================
CREATE TABLE Tasks (
    IdTask        SERIAL PRIMARY KEY,
    IdSubProgram  INTEGER NOT NULL REFERENCES Sub_Programs(IdSubProgram) ON DELETE CASCADE,
    NameTask      VARCHAR(250) NOT NULL,
    IdAssignedTo  INTEGER REFERENCES Users(IdUser) ON DELETE SET NULL,
    CreatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 12. Activities
-- =============================================
CREATE TABLE Activities (
    IdActivity   SERIAL PRIMARY KEY,
    IdProgram    INTEGER NOT NULL REFERENCES Programs(IdProgram) ON DELETE CASCADE,
    IdSubProgram INTEGER NOT NULL REFERENCES Sub_Programs(IdSubProgram) ON DELETE CASCADE,
    IdUser       INTEGER NOT NULL REFERENCES Users(IdUser), -- usuario que crea/lidera la actividad
    NameActivity VARCHAR(250) NOT NULL,
    CreatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 13. Absences
-- =============================================
CREATE TABLE Absences (
    IdAbsence           SERIAL PRIMARY KEY,
    IdUser              INTEGER NOT NULL REFERENCES Users(IdUser), -- quien reporta la ausencia
    IdBeneficiary       INTEGER NOT NULL REFERENCES Beneficiaries(IdBeneficiary), -- Beneficiario que se ausenta.
    IdActivity          INTEGER NOT NULL REFERENCES Activities(IdActivity),
    DescriptionAbsence  TEXT,
    CreatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 14. Reports
-- =============================================
CREATE TABLE Reports (
    IdReport          SERIAL PRIMARY KEY,
    IdUser            INTEGER NOT NULL REFERENCES Users(IdUser), -- quien genera el reporte
    IdBeneficiary     INTEGER NOT NULL REFERENCES Beneficiaries(IdBeneficiary), -- beneficiario que comete la falla.    DescriptionReport TEXT NOT NULL,
    CreatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
/*
    - Evaluar para una segunda versión guardar el tipo de falta
    según el manual disciplinario
*/
-- =============================================
-- 15. ActivitiesTracking
-- =============================================
CREATE TABLE "Activities_tracking" (
    "IdTracking"          SERIAL PRIMARY KEY,
    "IdActivity"          INTEGER NOT NULL REFERENCES "Activities"("IdActivity"),
    "IdUser"              INTEGER NOT NULL REFERENCES "Users"("IdUser"),
    "ActualAttendees"     INTEGER,
    "ExecutedActivities"  INTEGER,
    "PlannedActivities"   INTEGER,
    "ProjectedAttendees"  INTEGER,
    "WeekNumber"          INTEGER,
    "CreatedAt"           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 16. DocumentTypes
-- =============================================
CREATE TABLE "DocumentTypes" (
    "IdDocumentType" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(250),
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES RECOMENDADOS
-- =============================================
CREATE INDEX idx_users_idrole ON Users(IdRole);
CREATE INDEX idx_cities_idstate ON Cities(IdState);
CREATE INDEX idx_neighborhoods_idcity ON Neighborhoods(IdCity);
CREATE INDEX idx_address_idcity ON Address(IdCity);
CREATE INDEX idx_beneficiaries_idaddress ON Beneficiaries(IdAddress);
CREATE INDEX idx_beneficiaries_idneighborhood ON Beneficiaries(IdNeighborhood);
CREATE INDEX idx_biometric_idbeneficiary ON BiometricData(IdBeneficiary);
CREATE INDEX idx_programs_idleaduser ON Programs(IdLeadUser);
CREATE INDEX idx_subprograms_idprogram ON SubPrograms(IdProgram);
CREATE INDEX idx_tasks_idsubprogram ON Tasks(IdSubProgram);
CREATE INDEX idx_tasks_idassignedto ON Tasks(IdAssignedTo);
CREATE INDEX idx_activities_iduser ON Activities(IdUser);
CREATE INDEX idx_absences_iduser ON Absences(IdUser);
CREATE INDEX idx_absences_idbeneficiary ON Absences(IdBeneficiary);
CREATE INDEX idx_absences_idactivity ON Absences(IdActivity);
CREATE INDEX idx_reports_iduser ON Reports(IdUser);
CREATE INDEX idx_reports_idbeneficiary ON Reports(IdBeneficiary);
CREATE INDEX idx_Activities_tracking_idactivity ON Activities_tracking(IdActivity);
CREATE INDEX idx_Activities_tracking_iduser ON Activities_tracking(IdUser);
CREATE INDEX idx_Activities_tracking_week ON Activities_tracking(WeekNumber);

-- =============================================
-- COMENTARIOS
-- =============================================
COMMENT ON TABLE Beneficiaries IS 'Personas beneficiarias del programa de solidaridad';
COMMENT ON TABLE Absences IS 'Registro de inasistencias de beneficiarios a actividades';
COMMENT ON TABLE Reports IS 'Reportes disciplinarios o incidencias sobre beneficiarios';
COMMENT ON TABLE Tasks IS 'Tareas asignadas a usuarios dentro de subprogramas';
COMMENT ON COLUMN Tasks.IdAssignedTo IS 'Usuario responsable de ejecutar la tarea';
COMMENT ON TABLE Activities_tracking IS 'Seguimiento semanal de actividades: registra ejecución, asistencia real vs proyectada, y avance de actividades planificadas vs ejecutadas.';
COMMENT ON TABLE DocumentTypes IS 'Tipos de documentos de identificación (Cédula, Tarjeta de Identidad, etc.)';

-- =============================================
-- ALTERACIONES POSTERIORES
-- =============================================

-- Agregar columnas faltantes a la tabla Beneficiaries
-- Se agregan columnas para almacenar el tipo de documento, número de póliza de salud y contacto de emergencia, que son datos relevantes para la gestión de los beneficiarios.

ALTER TABLE "Beneficiaries"
ADD COLUMN "IdDocumentType" INTEGER REFERENCES "DocumentTypes"("IdDocumentType") ON DELETE SET NULL,
ADD COLUMN "PolicyNumber" VARCHAR(100),
ADD COLUMN "EmergencyContact" VARCHAR(20);

-- Agregar columna para relacionar beneficiarios con barrios, lo que permitirá un análisis geográfico más detallado de la población beneficiaria y facilitará la planificación de actividades y recursos en función de la ubicación de los beneficiarios.

ALTER TABLE "Beneficiaries"
ADD COLUMN "IdNeighborhood" INTEGER REFERENCES "Neighborhoods"("IdNeighborhood") ON DELETE SET NULL;
