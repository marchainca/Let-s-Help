-- =============================================
-- 1. Asegurar que existe un rol (por ejemplo, "Líder")
-- =============================================
INSERT INTO "Roles" ("IdRole", "NameRole", "Description", "CreatedAt")
VALUES (2, 'Admin', 'Usuario Admin', NOW())
ON CONFLICT ("IdRole") DO NOTHING;

-- =============================================
-- 2. Crear un usuario líder (IdLeadUser = 1)
-- =============================================
INSERT INTO "Users" (
    "IdUser",
    "Identification",
    "Email",
    "FirstName",
    "LastName",
    "Password",
    "IdRole",
    "CreatedAt"
) VALUES (
    2,
    '4567890123',
    'lead@program.com',
    'Lead',
    'User',
    'dummy_hash',
    1,
    NOW()
) ON CONFLICT ("IdUser") DO NOTHING;

-- =============================================
-- 3. Insertar programas (usando IdLeadUser = 1)
-- =============================================
INSERT INTO "Programs" ("NameProgram", "DescriptionProgram", "IdLeadUser", "CreatedAt") VALUES
('Programa deportivo', 'Programa de formación deportiva', 1, NOW()),
('familias saludables', 'Programa de apoyo a familias', 1, NOW()),
('gestión de emociones', 'Programa de inteligencia emocional', 1, NOW());

-- =============================================
-- 4. Insertar subprogramas
-- =============================================

-- Para "Programa deportivo"
INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'Iniciación', 'Nivel inicial', NOW()
FROM "Programs" WHERE "NameProgram" = 'Programa deportivo';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'Fortalecimiento', 'Nivel intermedio', NOW()
FROM "Programs" WHERE "NameProgram" = 'Programa deportivo';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'Perfeccionamiento', 'Nivel avanzado', NOW()
FROM "Programs" WHERE "NameProgram" = 'Programa deportivo';

-- Para "familias saludables"
INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'salud financiera', 'Educación financiera', NOW()
FROM "Programs" WHERE "NameProgram" = 'familias saludables';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'hábitos de vida saludable', 'Promoción de hábitos', NOW()
FROM "Programs" WHERE "NameProgram" = 'familias saludables';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'crianza responsable', 'Orientación parental', NOW()
FROM "Programs" WHERE "NameProgram" = 'familias saludables';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'gestión de emociones', 'Manejo emocional', NOW()
FROM "Programs" WHERE "NameProgram" = 'familias saludables';

-- Para "gestión de emociones"
INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'quien soy yo', 'Autoconocimiento', NOW()
FROM "Programs" WHERE "NameProgram" = 'gestión de emociones';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'El mundo y las emociones', 'Comprensión emocional', NOW()
FROM "Programs" WHERE "NameProgram" = 'gestión de emociones';

INSERT INTO "Sub_Programs" ("IdProgram", "NameSubProgram", "DescriptionSubProgram", "CreatedAt")
SELECT "IdProgram", 'Gestión de emociones', 'Técnicas de regulación', NOW()
FROM "Programs" WHERE "NameProgram" = 'gestión de emociones';

-- =============================================
-- 5. Insertar tareas
-- =============================================

-- 5.1 Programa deportivo - Iniciación
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Entrenamientos', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Iniciación';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Partidos / Competencia', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Iniciación';

-- 5.2 Programa deportivo - Fortalecimiento
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Entrenamientos', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Fortalecimiento';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Partidos / Competencia', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Fortalecimiento';

-- 5.3 Programa deportivo - Perfeccionamiento
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Entrenamientos', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Perfeccionamiento';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Partidos / Competencia', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Perfeccionamiento';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Pruebas Deportistas Destacados', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'Programa deportivo' AND sp."NameSubProgram" = 'Perfeccionamiento';

-- 5.4 Tareas para "familias saludables" - salud financiera
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Promoción del emprendimiento familiar y socialización de herramientas de salud financiera', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'salud financiera';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Apoyo al desarrollo y fortalecimiento de emprendimientos familiares', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'salud financiera';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Realización curso manipulación de alimentos', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'salud financiera';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividad intercambio de experiencia con emprendedores artesanos de Palmira', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'salud financiera';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Orientación elaboración hoja de vida familiares integrantes', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'salud financiera';

-- 5.5 Tareas para "familias saludables" - hábitos de vida saludable
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Gestión citas médicas integrantes proyecto y orientación acceso a servicios de salud para familias e integrantes', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'hábitos de vida saludable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividades para la promoción de hábitos y estilo de vida saludable a través de la actividad física, técnicas de relajación, meditación y yoga', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'hábitos de vida saludable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividades de prevención y detección temprana del consumo de SPA', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'hábitos de vida saludable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Taller hábitos y estilos de vida saludable-prevención enfermedades cardiovasculares mediante una alimentación balanceada', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'hábitos de vida saludable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividades para la promoción de salud sexual y reproductiva', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'hábitos de vida saludable';

-- 5.6 Tareas para "familias saludables" - crianza responsable
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Orientación familiar', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'crianza responsable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividades Escuela de Padres, temas: Estilos y Pautas de Crianza, cambios en la adolescencia, escucha activa', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'crianza responsable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Definición de estrategia psicosocial y revisión de casos prioritarios para orientación familiar', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'crianza responsable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Intervención familiar', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'crianza responsable';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Visitas domiciliarias a integrantes para identificación de factores de riesgo psicosocial', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'crianza responsable';

-- 5.7 Tareas para "familias saludables" - gestión de emociones
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión equipo psicosocial - Análisis y planeación', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividad con familias e integrantes para el fortalecimiento de vínculos familiares', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión con integrantes sobre herramientas de afrontamiento y gestión de Emociones', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Intervenciones integrantes para resolución de conflictos y establecimiento de compromisos', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Socialización Manual de convivencia a integrantes y sus familias', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Actividades para el fortalecimiento y cohesión grupal del equipo de femenino (socialización violentometro, talleres perspectiva de género)', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Fortalecimiento de la cohesión grupal en cada una de las categorías mediante el desarrollo de actividades lúdicas en los espacios de entrenamiento y torneos locales', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'familias saludables' AND sp."NameSubProgram" = 'gestión de emociones';

-- 5.8 Tareas para programa "gestión de emociones" - quien soy yo
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Valoraciones individuales.', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Observaciones grupales.', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Intervención individual.', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Valoraciones sociofamiliares', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión manual de convivencia -ingreso integrante, revision manual convivecia', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión reingreso de jóvenes', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'planeacion actividades', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Elaboración matriz DOFA', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Elaboración informe final Sebastián Bojassen', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Convocatoria nuevos integrantes', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'quien soy yo';

-- 5.9 Tareas para "El mundo y las emociones"
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Talleres lúdicos que brinden conocimiento sobre las emociones.', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Orientaciones a nivel individual para una mejor comprensión de las emociones.', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Acompañamiento casos especiales psicología', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Seguimiento grupo palmira', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión comportamiento jóvenes', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Reunión con jóvenes y padres sobre las emociones', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Proyecto vida grupal', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Proyecto vida individual', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Visita orientacion proyecto de vida', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'El mundo y las emociones';

-- 5.10 Tareas para "Gestión de emociones" (subprograma)
INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Taller técnicas gestión de las emociones', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'Gestión de emociones';

INSERT INTO "Tasks" ("IdSubProgram", "NameTask", "CreatedAt")
SELECT sp."IdSubProgram", 'Seguimiento técnicas empleadas en sus emociones', NOW()
FROM "Sub_Programs" sp
JOIN "Programs" p ON sp."IdProgram" = p."IdProgram"
WHERE p."NameProgram" = 'gestión de emociones' AND sp."NameSubProgram" = 'Gestión de emociones';

---- Migrar Roles

INSERT INTO "RolesTranslations" (IdRole, IdLanguage, NameRole, Description)
SELECT IdRole, 1, NameRole, Description FROM RolesTranslations;

-- Migrar Programs
INSERT INTO "ProgramsTranslations" (IdProgram, IdLanguage, NameProgram, DescriptionProgram)
SELECT IdProgram, 1, NameProgram, DescriptionProgram FROM ProgramsTranslations;

-- Migrar Sub_Programs
INSERT INTO "SubProgramsTranslations" (IdSubProgram, IdLanguage, NameSubProgram, DescriptionSubProgram)
SELECT IdSubProgram, 1, NameSubProgram, DescriptionSubProgram FROM SubProgramsTranslations;

-- Migrar Activities
INSERT INTO "ActivitiesTranslations" (IdActivity, IdLanguage, NameActivity)
SELECT IdActivity, 1, NameActivity FROM ActivitiesTranslations;

-- Migrar Absences
INSERT INTO "AbsencesTranslations" (IdAbsence, IdLanguage, DescriptionAbsence)
SELECT IdAbsence, 1, DescriptionAbsence FROM AbsencesTranslations;

-- alter tables para cambiar nombres de columnas para que queden con notacion pascal case
-- RolesTranslations
ALTER TABLE "RolesTranslations" RENAME COLUMN NameRole TO "NameRole";
ALTER TABLE "RolesTranslations" RENAME COLUMN Description TO "Description";
ALTER TABLE "RolesTranslations" RENAME COLUMN IdRole TO "IdRole"
ALTER TABLE "RolesTranslations" RENAME COLUMN IdLanguage TO "IdLanguage";

-- Sub_ProgramsTranslations
ALTER TABLE "SubProgramsTranslations" RENAME COLUMN NameSubProgram TO "NameSubProgram";
ALTER TABLE "SubProgramsTranslations" RENAME COLUMN DescriptionSubProgram TO "DescriptionSubProgram";
ALTER TABLE "SubProgramsTranslations" RENAME COLUMN IdSubProgram TO "IdSubProgram";
ALTER TABLE "SubProgramsTranslations" RENAME COLUMN IdLanguage TO "IdLanguage";

-- ActivitiesTranslations
ALTER TABLE "ActivitiesTranslations" RENAME COLUMN NameActivity TO "NameActivity";
ALTER TABLE "ActivitiesTranslations" RENAME COLUMN IdActivity TO "IdActivity";
ALTER TABLE "ActivitiesTranslations" RENAME COLUMN IdLanguage TO "IdLanguage";

-- AbsencesTranslations
ALTER TABLE "AbsencesTranslations" RENAME COLUMN DescriptionAbsence TO "DescriptionAbsence";
ALTER TABLE "AbsencesTranslations" RENAME COLUMN IdAbsence TO "IdAbsence";
ALTER TABLE "AbsencesTranslations" RENAME COLUMN IdLanguage TO "IdLanguage";



-- Roles
ALTER TABLE "Roles" DROP COLUMN "NameRole", DROP COLUMN "Description";

-- Programs
ALTER TABLE "Programs" DROP COLUMN "NameProgram", DROP COLUMN "DescriptionProgram";

-- Sub_Programs
ALTER TABLE "Sub_Programs" DROP COLUMN "NameSubProgram", DROP COLUMN "DescriptionSubProgram";

-- Activities
ALTER TABLE "Activities" DROP COLUMN "NameActivity";

-- Absences
ALTER TABLE "Absences" DROP COLUMN "DescriptionAbsence";

-- Reports
ALTER TABLE "Reports" DROP COLUMN "DescriptionReport";

-- insert para 
INSERT INTO "Languages" ("Code", "Name") VALUES (1, 'spanish' );
INSERT INTO "Languages" ("Code", "Name") VALUES (2, 'english' );