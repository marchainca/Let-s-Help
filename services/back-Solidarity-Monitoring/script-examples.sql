-- =============================================
-- INSERTS PARA TABLA Programs
-- =============================================
INSERT INTO Programs (NameProgram, DescriptionProgram, IdLeadUser, CreatedAt) VALUES
("Programa deportivo", "Programa de formación deportiva", 1, NOW()),
("familias saludables", "Programa de apoyo a familias", 1, NOW()),
("gestión de emociones", "Programa de inteligencia emocional", 1, NOW());

-- =============================================
-- INSERTS PARA TABLA Sub_Programs
-- =============================================
-- Subprogramas para "Programa deportivo"
INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "Iniciación", "Nivel inicial", NOW()
FROM Programs p WHERE p.NameProgram = "Programa deportivo";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "Fortalecimiento", "Nivel intermedio", NOW()
FROM Programs p WHERE p.NameProgram = "Programa deportivo";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "Perfeccionamiento", "Nivel avanzado", NOW()
FROM Programs p WHERE p.NameProgram = "Programa deportivo";

-- Subprogramas para "familias saludables"
INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "salud financiera", "Educación financiera", NOW()
FROM Programs p WHERE p.NameProgram = "familias saludables";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "hábitos de vida saludable", "Promoción de hábitos", NOW()
FROM Programs p WHERE p.NameProgram = "familias saludables";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "crianza responsable", "Orientación parental", NOW()
FROM Programs p WHERE p.NameProgram = "familias saludables";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "gestión de emociones", "Manejo emocional", NOW()
FROM Programs p WHERE p.NameProgram = "familias saludables";

-- Subprogramas para "gestión de emociones"
INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "quien soy yo", "Autoconocimiento", NOW()
FROM Programs p WHERE p.NameProgram = "gestión de emociones";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "El mundo y las emociones", "Comprensión emocional", NOW()
FROM Programs p WHERE p.NameProgram = "gestión de emociones";

INSERT INTO Sub_Programs (IdProgram, NameSubProgram, DescriptionSubProgram, CreatedAt)
SELECT p.IdProgram, "Gestión de emociones", "Técnicas de regulación", NOW()
FROM Programs p WHERE p.NameProgram = "gestión de emociones";

-- =============================================
-- INSERTS PARA TABLA Tasks
-- =============================================
-- Tareas para Iniciación (Programa deportivo)
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Entrenamientos", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Iniciación";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Partidos / Competencia", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Iniciación";

-- Tareas para Fortalecimiento
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Entrenamientos", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Fortalecimiento";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Partidos / Competencia", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Fortalecimiento";

-- Tareas para Perfeccionamiento
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Entrenamientos", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Perfeccionamiento";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Partidos / Competencia", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Perfeccionamiento";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Pruebas Deportistas Destacados", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "Programa deportivo" AND sp.NameSubProgram = "Perfeccionamiento";

-- =============================================
-- Tareas para "familias saludables"
-- =============================================
-- salud financiera
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Promoción del emprendimiento familiar y socialización de herramientas de salud financiera", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "salud financiera";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Apoyo al desarrollo y fortalecimiento de emprendimientos familiares", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "salud financiera";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Realización curso manipulación de alimentos", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "salud financiera";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividad intercambio de experiencia con emprendedores artesanos de Palmira", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "salud financiera";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Orientación elaboración hoja de vida familiares integrantes", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "salud financiera";

-- hábitos de vida saludable
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Gestión citas médicas integrantes proyecto y orientación acceso a servicios de salud para familias e integrantes", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "hábitos de vida saludable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividades para la promoción de hábitos y estilo de vida saludable a través de la actividad física, técnicas de relajación, meditación y yoga", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "hábitos de vida saludable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividades de prevención y detección temprana del consumo de SPA", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "hábitos de vida saludable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Taller hábitos y estilos de vida saludable-prevención enfermedades cardiovasculares mediante una alimentación balanceada", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "hábitos de vida saludable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividades para la promoción de salud sexual y reproductiva", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "hábitos de vida saludable";

-- crianza responsable
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Orientación familiar", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "crianza responsable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividades Escuela de Padres, temas: Estilos y Pautas de Crianza, cambios en la adolescencia, escucha activa", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "crianza responsable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Definición de estrategia psicosocial y revisión de casos prioritarios para orientación familiar", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "crianza responsable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Intervención familiar", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "crianza responsable";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Visitas domiciliarias a integrantes para identificación de factores de riesgo psicosocial", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "crianza responsable";

-- gestión de emociones (dentro de familias saludables)
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión equipo psicosocial - Análisis y planeación", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividad con familias e integrantes para el fortalecimiento de vínculos familiares", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión con integrantes sobre herramientas de afrontamiento y gestión de Emociones", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Intervenciones integrantes para resolución de conflictos y establecimiento de compromisos", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Socialización Manual de convivencia a integrantes y sus familias", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Actividades para el fortalecimiento y cohesión grupal del equipo de femenino (socialización violentometro, talleres perspectiva de género)", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Fortalecimiento de la cohesión grupal en cada una de las categorías mediante el desarrollo de actividades lúdicas en los espacios de entrenamiento y torneos locales", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "familias saludables" AND sp.NameSubProgram = "gestión de emociones";

-- =============================================
-- Tareas para "gestión de emociones" (programa)
-- =============================================
-- quien soy yo
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Valoraciones individuales.", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Observaciones grupales.", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Intervención individual.", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Valoraciones sociofamiliares", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión manual de convivencia -ingreso integrante, revision manual convivecia", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión reingreso de jóvenes", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "planeacion actividades", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Elaboración matriz DOFA", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Elaboración informe final Sebastián Bojassen", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Convocatoria nuevos integrantes", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "quien soy yo";

-- El mundo y las emociones
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Talleres lúdicos que brinden conocimiento sobre las emociones.", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Orientaciones a nivel individual para una mejor comprensión de las emociones.", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Acompañamiento casos especiales psicología", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Seguimiento grupo palmira", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión comportamiento jóvenes", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Reunión con jóvenes y padres sobre las emociones", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Proyecto vida grupal", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Proyecto vida individual", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Visita orientacion proyecto de vida", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "El mundo y las emociones";

-- Gestión de emociones (subprograma)
INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Taller técnicas gestión de las emociones", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "Gestión de emociones";

INSERT INTO Tasks (IdSubProgram, NameTask, CreatedAt)
SELECT sp.IdSubProgram, "Seguimiento técnicas empleadas en sus emociones", NOW()
FROM Sub_Programs sp
JOIN Programs p ON sp.IdProgram = p.IdProgram
WHERE p.NameProgram = "gestión de emociones" AND sp.NameSubProgram = "Gestión de emociones";