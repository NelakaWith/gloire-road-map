-- Seed data for Gloire Road Map
-- Inserts 15 students and 10 goals per student (150 goals total)

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE goals;
TRUNCATE TABLE students;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert 15 students with explicit ids
INSERT INTO students (id, name, created_at) VALUES
  (1, 'Amina Johnson', NOW()),
  (2, 'Carlos Mendes', NOW()),
  (3, 'Priya Patel', NOW()),
  (4, 'Liam O\'Connor', NOW()),
  (5, 'Sofia Garcia', NOW()),
  (6, 'Noah Smith', NOW()),
  (7, 'Emma Müller', NOW()),
  (8, 'Mateo Rossi', NOW()),
  (9, 'Hana Kim', NOW()),
  (10, 'Omar Ali', NOW()),
  (11, 'Maya Brown', NOW()),
  (12, 'Daniela Costa', NOW()),
  (13, 'Ethan Williams', NOW()),
  (14, 'Chloe Martin', NOW()),
  (15, 'Lucas Silva', NOW());

-- Insert 10 goals per student (150 total)
INSERT INTO goals (student_id, title, description, target_date, setup_date, updated_at, is_completed, completed_at, created_at) VALUES
-- Student 1 (Amina Johnson)
(1, 'Complete math workbook chapter 1', 'Work through pages 1-20 of the assigned math workbook.', '2024-10-15', '2024-09-01 09:00:00', '2024-09-10 14:30:00', FALSE, NULL, NOW()),
(1, 'Practice multiplication facts 15 mins daily', 'Daily timed practice to improve speed and accuracy.', '2024-10-01', '2024-09-05 08:00:00', '2024-09-12 08:15:00', FALSE, NULL, NOW()),
(1, 'Read one short story per week', 'Choose an age-appropriate short story and discuss key points.', '2024-12-01', '2024-09-07 17:00:00', '2024-09-20 10:00:00', TRUE, NULL, NOW()),
(1, 'Finish science project draft', 'Draft the hypothesis and methods sections for review.', '2024-11-01', '2024-09-10 16:00:00', '2024-09-18 12:00:00', FALSE, NULL, NOW()),
(1, 'Attend extra tutoring session', 'Weekly tutoring every Tuesday for focused practice.', '2024-10-20', '2024-09-02 15:30:00', '2024-09-14 15:30:00', FALSE, NULL, NOW()),
(1, 'Complete coding challenges 5 problems', 'Solve five basic algorithm problems on the platform.', '2024-10-05', '2024-09-08 19:00:00', '2024-09-11 19:45:00', TRUE, NULL, NOW()),
(1, 'Improve handwriting exercises', 'Complete handwriting worksheets to improve letter formation.', '2024-10-25', '2024-09-12 14:00:00', '2024-09-19 09:30:00', FALSE, NULL, NOW()),
(1, 'Memorize 20 new vocabulary words', 'Study and use new words in sentences.', '2024-12-15', '2024-09-03 18:00:00', '2024-09-17 18:10:00', FALSE, NULL, NOW()),
(1, 'Prepare presentation slides', 'Create and rehearse slides for the class presentation.', '2024-11-20', '2024-09-15 11:00:00', '2024-09-20 11:30:00', TRUE, NULL, NOW()),
(1, 'Submit book report', 'Finalize and submit the book report document.', '2024-11-05', '2024-09-06 13:00:00', '2024-09-16 13:45:00', FALSE, NULL, NOW()),

-- Student 2 (Carlos Mendes)
(2, 'Complete math workbook chapter 2', 'Finish assigned problems and review errors with teacher.', '2024-10-18', '2024-09-02 09:00:00', '2024-09-13 09:20:00', FALSE, NULL, NOW()),
(2, 'Practice division facts 15 mins daily', 'Timed drills to master division tables.', '2024-11-01', '2024-09-04 08:15:00', '2024-09-12 08:30:00', FALSE, NULL, NOW()),
(2, 'Read two news articles this week', 'Select two short news items and summarize them.', '2024-09-30', '2024-09-03 18:30:00', '2024-09-13 18:35:00', FALSE, NULL, NOW()),
(2, 'Complete science experiment', 'Conduct experiment and record observations.', '2024-10-30', '2024-09-07 14:00:00', '2024-09-19 10:15:00', TRUE, NULL, NOW()),
(2, 'Attend music lesson', 'Practice assigned pieces and scales with the instructor.', '2024-11-10', '2024-09-06 16:00:00', '2024-09-18 16:00:00', FALSE, NULL, NOW()),
(2, 'Build simple web page', 'Create a single-page website using HTML and CSS.', '2024-12-01', '2024-09-09 20:00:00', '2024-09-17 20:20:00', FALSE, NULL, NOW()),
(2, 'Practice soccer drills', 'Drill shooting and passing for 30 minutes.', '2024-10-11', '2024-09-05 07:30:00', '2024-09-14 07:50:00', TRUE, NULL, NOW()),
(2, 'Learn 10 new Spanish words', 'Flashcards and short conversation practice.', '2024-12-10', '2024-09-11 19:00:00', '2024-09-15 19:10:00', FALSE, NULL, NOW()),
(2, 'Finish art sketch series', 'Complete five sketches for the portfolio.', '2024-11-25', '2024-09-08 15:00:00', '2024-09-16 15:40:00', FALSE, NULL, NOW()),
(2, 'Prepare for spelling bee', 'Practice spelling lists and mock rounds.', '2024-10-05', '2024-09-10 17:00:00', '2024-09-12 17:20:00', TRUE, NULL, NOW()),

-- Student 3 (Priya Patel)
(3, 'Complete math workbook chapter 3', 'Complete exercises and review answers with peer tutor.', '2024-10-20', '2024-09-02 10:00:00', '2024-09-14 10:10:00', FALSE, NULL, NOW()),
(3, 'Practice fractions 20 mins daily', 'Daily practice using fraction worksheets.', '2024-11-05', '2024-09-06 08:00:00', '2024-09-15 08:45:00', FALSE, NULL, NOW()),
(3, 'Read a biography this month', 'Choose an inspiring biography and write a reflection.', '2024-12-01', '2024-09-12 19:00:00', '2024-09-18 19:30:00', FALSE, NULL, NOW()),
(3, 'Finish science lab report', 'Type up the lab results and conclusions.', '2024-11-15', '2024-09-09 13:00:00', '2024-09-20 13:20:00', TRUE, NULL, NOW()),
(3, 'Join debate club practice', 'Attend weekly debate workshops.', '2024-10-10', '2024-09-03 18:30:00', '2024-09-16 18:40:00', FALSE, NULL, NOW()),
(3, 'Code a small calculator app', 'Implement a basic calculator with add/subtract.', '2024-12-10', '2024-09-11 20:00:00', '2024-09-17 20:50:00', FALSE, NULL, NOW()),
(3, 'Practice piano scales', 'Warm-up scales focusing on timing and dynamics.', '2024-10-08', '2024-09-05 16:00:00', '2024-09-14 16:25:00', TRUE, NULL, NOW()),
(3, 'Study for history quiz', 'Review notes and key dates for the upcoming quiz.', '2024-11-01', '2024-09-07 07:00:00', '2024-09-13 07:45:00', FALSE, NULL, NOW()),
(3, 'Complete watercolor painting', 'Finish color study and final watercolor piece.', '2024-11-30', '2024-09-08 14:30:00', '2024-09-19 14:45:00', FALSE, NULL, NOW()),
(3, 'Prepare research notes', 'Organize sources and outline for the research paper.', '2024-12-05', '2024-09-10 09:00:00', '2024-09-18 09:10:00', TRUE, NULL, NOW()),

-- Student 4 (Liam O'Connor)
(4, 'Complete math workbook chapter 4', 'Work through the assigned geometry exercises and review mistakes.', '2024-10-22', '2024-09-01 09:30:00', '2024-09-11 09:45:00', FALSE, NULL, NOW()),
(4, 'Practice geometry problems 20 mins', 'Daily geometry practice to reinforce concepts.', '2024-11-12', '2024-09-04 08:00:00', '2024-09-14 08:20:00', FALSE, NULL, NOW()),
(4, 'Read a science article each week', 'Summarize one short science article weekly.', '2024-12-01', '2024-09-08 19:30:00', '2024-09-17 19:40:00', FALSE, NULL, NOW()),
(4, 'Design simple science poster', 'Create visuals and concise bullet points for the poster.', '2024-11-05', '2024-09-10 15:00:00', '2024-09-18 15:15:00', TRUE, NULL, NOW()),
(4, 'Attend coding meetup', 'Participate in local coding group for beginners.', '2024-10-07', '2024-09-06 18:00:00', '2024-09-16 18:25:00', FALSE, NULL, NOW()),
(4, 'Build a model volcano', 'Assemble materials and test eruption simulation.', '2024-11-20', '2024-09-07 14:30:00', '2024-09-19 14:50:00', FALSE, NULL, NOW()),
(4, 'Practice tennis serves', 'Drills for serve consistency and placement.', '2024-10-16', '2024-09-03 07:30:00', '2024-09-12 07:50:00', TRUE, NULL, NOW()),
(4, 'Learn keyboard shortcuts for typing', 'Practice common shortcuts to improve efficiency.', '2024-11-30', '2024-09-05 12:00:00', '2024-09-15 12:10:00', FALSE, NULL, NOW()),
(4, 'Finish short story draft', 'Edit and refine draft for submission.', '2024-10-29', '2024-09-09 20:00:00', '2024-09-18 20:20:00', FALSE, NULL, NOW()),
(4, 'Prepare presentation notes', 'Finalize speaker notes and practice timings.', '2024-11-22', '2024-09-11 10:00:00', '2024-09-17 10:25:00', TRUE, NULL, NOW()),

-- Student 5 (Sofia Garcia)
(5, 'Complete math workbook chapter 5', 'Complete assigned algebra problems and check answers.', '2024-10-30', '2024-09-03 09:45:00', '2024-09-16 09:55:00', FALSE, NULL, NOW()),
(5, 'Practice algebra 25 mins daily', 'Daily practice focusing on factoring and equations.', '2024-11-08', '2024-09-06 08:30:00', '2024-09-15 08:40:00', FALSE, NULL, NOW()),
(5, 'Read a poetry collection', 'Read and analyze poems, write short reflections.', '2024-12-20', '2024-09-12 17:30:00', '2024-09-19 17:45:00', FALSE, NULL, NOW()),
(5, 'Complete biology worksheets', 'Finish assigned worksheets and label diagrams.', '2024-10-12', '2024-09-02 14:00:00', '2024-09-11 14:10:00', TRUE, NULL, NOW()),
(5, 'Join art club meeting', 'Attend weekly art club to learn new techniques.', '2024-11-18', '2024-09-07 15:00:00', '2024-09-17 15:10:00', FALSE, NULL, NOW()),
(5, 'Create digital collage', 'Experiment with layering and composition.', '2024-11-29', '2024-09-09 20:15:00', '2024-09-16 20:30:00', FALSE, NULL, NOW()),
(5, 'Practice ballet routine', 'Work on choreography sections and timing.', '2024-10-25', '2024-09-05 18:00:00', '2024-09-14 18:20:00', TRUE, NULL, NOW()),
(5, 'Study for literature test', 'Review themes and characters from the reading list.', '2024-11-02', '2024-09-08 07:30:00', '2024-09-13 07:55:00', FALSE, NULL, NOW()),
(5, 'Finish ceramic piece', 'Apply glaze and finish the ceramic project.', '2024-12-01', '2024-09-10 13:30:00', '2024-09-18 13:50:00', FALSE, NULL, NOW()),
(5, 'Gather field trip materials', 'Collect necessary materials and permission slips.', '2024-10-05', '2024-09-04 11:00:00', '2024-09-15 11:20:00', TRUE, NULL, NOW()),

-- Student 6 (Noah Smith)
(6, 'Complete math workbook chapter 6', 'Finish practice set and correct mistakes.', '2024-11-15', '2024-09-02 10:30:00', '2024-09-14 10:45:00', FALSE, NULL, NOW()),
(6, 'Practice percentages problems', 'Work through percentage problems and examples.', '2024-10-28', '2024-09-05 08:10:00', '2024-09-13 08:25:00', FALSE, NULL, NOW()),
(6, 'Read a technical article', 'Select an article on a technical subject and summarize.', '2024-12-01', '2024-09-11 19:00:00', '2024-09-17 19:20:00', FALSE, NULL, NOW()),
(6, 'Finish chemistry lab write-up', 'Compile results and format the lab report.', '2024-10-18', '2024-09-07 14:30:00', '2024-09-18 14:35:00', TRUE, NULL, NOW()),
(6, 'Attend robotics meeting', 'Participate and take notes for the robotics build.', '2024-11-22', '2024-09-06 17:00:00', '2024-09-16 17:15:00', FALSE, NULL, NOW()),
(6, 'Program a simple game', 'Design and implement gameplay mechanics.', '2024-12-15', '2024-09-08 20:00:00', '2024-09-15 20:25:00', FALSE, NULL, NOW()),
(6, 'Practice basketball free throws', 'Drill free-throw technique with arc focus.', '2024-10-09', '2024-09-03 07:00:00', '2024-09-12 07:20:00', TRUE, NULL, NOW()),
(6, 'Study vocabulary flashcards', 'Review flashcards and test recall daily.', '2024-11-30', '2024-09-10 18:00:00', '2024-09-19 18:05:00', FALSE, NULL, NOW()),
(6, 'Complete multimedia project', 'Integrate audio, video, and images into a short piece.', '2024-12-05', '2024-09-09 15:00:00', '2024-09-17 15:30:00', FALSE, NULL, NOW()),
(6, 'Prepare science fair poster', 'Finalize poster layout and key highlights.', '2024-11-01', '2024-09-11 09:30:00', '2024-09-18 09:40:00', TRUE, NULL, NOW()),

-- Student 7 (Emma Müller)
(7, 'Complete math workbook chapter 7', 'Complete practice exercises and review with peer.', '2024-11-20', '2024-09-03 10:00:00', '2024-09-13 10:20:00', FALSE, NULL, NOW()),
(7, 'Practice decimals and conversions', 'Convert decimals and practice conversion techniques.', '2024-10-14', '2024-09-05 08:45:00', '2024-09-16 08:50:00', FALSE, NULL, NOW()),
(7, 'Read a novel this month', 'Read a full novel and prepare a short review.', '2024-12-31', '2024-09-12 20:00:00', '2024-09-18 20:30:00', FALSE, NULL, NOW()),
(7, 'Finish physics homework', 'Complete assigned problems and check solutions.', '2024-10-25', '2024-09-07 13:30:00', '2024-09-17 13:50:00', TRUE, NULL, NOW()),
(7, 'Attend choir rehearsal', 'Practice repertoire and harmonies for performance.', '2024-11-05', '2024-09-04 18:30:00', '2024-09-14 18:45:00', FALSE, NULL, NOW()),
(7, 'Compose a short melody', 'Sketch motifs and harmonize the melody.', '2024-12-10', '2024-09-09 21:00:00', '2024-09-15 21:20:00', FALSE, NULL, NOW()),
(7, 'Practice violin scales', 'Daily warm-ups and scale practice.', '2024-10-05', '2024-09-06 16:30:00', '2024-09-14 16:55:00', TRUE, NULL, NOW()),
(7, 'Study geography maps', 'Memorize key locations and features for quiz.', '2024-11-10', '2024-09-08 07:15:00', '2024-09-18 07:25:00', FALSE, NULL, NOW()),
(7, 'Complete digital art piece', 'Finalize composition and export final files.', '2024-12-05', '2024-09-11 15:30:00', '2024-09-16 15:50:00', FALSE, NULL, NOW()),
(7, 'Prepare lab materials', 'Gather supplies and prepare experiment setup.', '2024-10-12', '2024-09-02 11:00:00', '2024-09-13 11:20:00', TRUE, NULL, NOW()),

-- Student 8 (Mateo Rossi)
(8, 'Complete math workbook chapter 8', 'Complete set problems and review with tutor.', '2024-11-01', '2024-09-03 09:00:00', '2024-09-14 09:10:00', FALSE, NULL, NOW()),
(8, 'Practice word problems 20 mins', 'Solve daily word problems focusing on strategy.', '2024-10-21', '2024-09-05 08:20:00', '2024-09-12 08:35:00', FALSE, NULL, NOW()),
(8, 'Read magazine articles weekly', 'Summarize one magazine article each week.', '2024-12-01', '2024-09-07 19:00:00', '2024-09-19 19:15:00', FALSE, NULL, NOW()),
(8, 'Finish environmental project', 'Compile findings and prepare final submission.', '2024-11-18', '2024-09-10 14:15:00', '2024-09-18 14:35:00', TRUE, NULL, NOW()),
(8, 'Join photography club', 'Attend meetings and practice shooting techniques.', '2024-10-30', '2024-09-06 16:00:00', '2024-09-16 16:25:00', FALSE, NULL, NOW()),
(8, 'Edit a photo series', 'Select and edit 10 photos for the series.', '2024-11-29', '2024-09-08 20:30:00', '2024-09-17 20:50:00', FALSE, NULL, NOW()),
(8, 'Practice cycling route', 'Complete a 10km route focusing on pacing.', '2024-10-10', '2024-09-04 06:45:00', '2024-09-13 07:05:00', TRUE, NULL, NOW()),
(8, 'Study foreign language phrases', 'Practice common phrases with a partner.', '2024-12-15', '2024-09-11 18:30:00', '2024-09-15 18:45:00', FALSE, NULL, NOW()),
(8, 'Complete sketchbook pages', 'Finish 8 sketchbook studies and scan them.', '2024-11-22', '2024-09-09 15:00:00', '2024-09-18 15:20:00', FALSE, NULL, NOW()),
(8, 'Prepare portfolio items', 'Select best pieces and prepare descriptions.', '2024-12-05', '2024-09-12 10:00:00', '2024-09-19 10:25:00', TRUE, NULL, NOW()),

-- Student 9 (Hana Kim)
(9, 'Complete math workbook chapter 9', 'Complete assigned exercises and additional practice problems.', '2024-11-05', '2024-09-02 10:30:00', '2024-09-14 10:45:00', FALSE, NULL, NOW()),
(9, 'Practice algebraic equations', 'Daily practice focusing on equation solving and checking.', '2024-10-20', '2024-09-05 08:20:00', '2024-09-12 08:40:00', FALSE, NULL, NOW()),
(9, 'Read a magazine feature', 'Read and summarize a magazine feature article.', '2024-12-01', '2024-09-06 18:50:00', '2024-09-18 19:05:00', FALSE, NULL, NOW()),
(9, 'Finish ecology assignment', 'Collect data and complete the assignment write-up.', '2024-11-15', '2024-09-07 14:00:00', '2024-09-19 14:20:00', TRUE, NULL, NOW()),
(9, 'Attend drama rehearsal', 'Prepare scenes and practice cues for performance.', '2024-10-10', '2024-09-04 17:30:00', '2024-09-16 17:50:00', FALSE, NULL, NOW()),
(9, 'Memorize lines for play', 'Memorize and rehearse assigned lines for the play.', '2024-11-30', '2024-09-11 19:30:00', '2024-09-15 19:45:00', FALSE, NULL, NOW()),
(9, 'Practice flute pieces', 'Practice assigned flute pieces and scales.', '2024-10-08', '2024-09-03 16:00:00', '2024-09-14 16:25:00', TRUE, NULL, NOW()),
(9, 'Study math flashcards', 'Review flashcards focusing on key formulas.', '2024-11-28', '2024-09-09 18:00:00', '2024-09-18 18:10:00', FALSE, NULL, NOW()),
(9, 'Complete craft project', 'Assemble materials and finish craft project.', '2024-12-01', '2024-09-10 13:00:00', '2024-09-17 13:20:00', FALSE, NULL, NOW()),
(9, 'Prepare audition materials', 'Polish pieces and prepare for auditions.', '2024-11-01', '2024-09-08 11:00:00', '2024-09-16 11:25:00', TRUE, NULL, NOW()),

-- Student 10 (Omar Ali)
(10, 'Complete math workbook chapter 10', 'Finish complex problem sets and review solutions.', '2024-11-20', '2024-09-04 10:00:00', '2024-09-15 10:25:00', FALSE, NULL, NOW()),
(10, 'Practice ratios and proportions', 'Work through proportion problems and example applications.', '2024-10-12', '2024-09-06 08:00:00', '2024-09-13 08:35:00', FALSE, NULL, NOW()),
(10, 'Read technical blog posts', 'Read and summarize technical blog content relevant to studies.', '2024-12-01', '2024-09-11 18:00:00', '2024-09-17 18:25:00', FALSE, NULL, NOW()),
(10, 'Finish physics lab report', 'Compile experiment data and write the report.', '2024-11-01', '2024-09-07 14:00:00', '2024-09-19 14:05:00', TRUE, NULL, NOW()),
(10, 'Join coding dojo', 'Participate and complete dojo exercises.', '2024-10-30', '2024-09-05 19:00:00', '2024-09-16 19:20:00', FALSE, NULL, NOW()),
(10, 'Build small robot', 'Assemble and program a simple robot.', '2024-12-15', '2024-09-09 20:00:00', '2024-09-18 20:30:00', FALSE, NULL, NOW()),
(10, 'Practice soccer tactics', 'Work on formations and positioning drills.', '2024-10-05', '2024-09-03 07:30:00', '2024-09-12 07:45:00', TRUE, NULL, NOW()),
(10, 'Study for history exam', 'Review timelines and key historical events.', '2024-11-10', '2024-09-08 07:00:00', '2024-09-14 07:20:00', FALSE, NULL, NOW()),
(10, 'Complete woodworking project', 'Measure, cut, assemble and finish the woodworking piece.', '2024-11-25', '2024-09-10 13:45:00', '2024-09-17 14:00:00', FALSE, NULL, NOW()),
(10, 'Prepare presentation slides', 'Finalize visuals and speaker notes for presentation.', '2024-11-22', '2024-09-12 11:30:00', '2024-09-20 11:45:00', TRUE, NULL, NOW()),

-- Student 11 (Maya Brown)
(11, 'Complete math workbook chapter 11', 'Complete assigned math problems and review solutions.', '2024-11-30', '2024-09-03 09:15:00', '2024-09-16 09:35:00', FALSE, NULL, NOW()),
(11, 'Practice statistics problems', 'Practice data and probability problems.', '2024-10-28', '2024-09-05 08:10:00', '2024-09-14 08:25:00', FALSE, NULL, NOW()),
(11, 'Read a short story collection', 'Read and analyze a short story each week.', '2024-12-01', '2024-09-07 19:00:00', '2024-09-18 19:20:00', FALSE, NULL, NOW()),
(11, 'Finish chemistry worksheet', 'Complete and review chemistry practice worksheets.', '2024-10-15', '2024-09-06 14:00:00', '2024-09-17 14:25:00', TRUE, NULL, NOW()),
(11, 'Attend debate practice', 'Prepare arguments and practice delivery.', '2024-10-05', '2024-09-04 17:30:00', '2024-09-15 17:50:00', FALSE, NULL, NOW()),
(11, 'Draft an essay', 'Outline and write essay sections for review.', '2024-11-22', '2024-09-09 20:00:00', '2024-09-17 20:30:00', FALSE, NULL, NOW()),
(11, 'Practice yoga routine', 'Daily yoga routine focusing on flexibility.', '2024-11-01', '2024-09-05 06:30:00', '2024-09-13 06:50:00', TRUE, NULL, NOW()),
(11, 'Study vocabulary sets', 'Review vocabulary and practice usage in sentences.', '2024-12-10', '2024-09-08 18:00:00', '2024-09-16 18:20:00', FALSE, NULL, NOW()),
(11, 'Complete pottery glaze', 'Apply glaze and fire the pottery piece.', '2024-11-25', '2024-09-10 14:30:00', '2024-09-19 14:50:00', FALSE, NULL, NOW()),
(11, 'Prepare research outline', 'Organize the research plan and identify sources.', '2024-12-01', '2024-09-12 09:00:00', '2024-09-18 09:15:00', TRUE, NULL, NOW()),

-- Student 12 (Daniela Costa)
(12, 'Complete math workbook chapter 12', 'Complete advanced exercises and check work.', '2024-11-22', '2024-09-03 10:15:00', '2024-09-15 10:30:00', FALSE, NULL, NOW()),
(12, 'Practice linear equations', 'Solve linear equations and graph solutions.', '2024-10-14', '2024-09-05 08:00:00', '2024-09-13 08:30:00', FALSE, NULL, NOW()),
(12, 'Read a cultural article', 'Read and reflect on a cultural piece and discuss.', '2024-12-01', '2024-09-07 18:30:00', '2024-09-19 18:40:00', FALSE, NULL, NOW()),
(12, 'Finish lab experiments', 'Complete remaining lab experiments and document results.', '2024-11-10', '2024-09-09 14:30:00', '2024-09-18 14:55:00', TRUE, NULL, NOW()),
(12, 'Join language exchange', 'Practice language skills with a native speaker partner.', '2024-10-25', '2024-09-04 17:00:00', '2024-09-13 17:10:00', FALSE, NULL, NOW()),
(12, 'Create a short film', 'Write script and shoot short scenes for editing.', '2024-12-15', '2024-09-10 20:00:00', '2024-09-17 20:25:00', FALSE, NULL, NOW()),
(12, 'Practice swimming laps', 'Practice endurance and stroke technique in the pool.', '2024-10-09', '2024-09-06 07:30:00', '2024-09-16 07:45:00', TRUE, NULL, NOW()),
(12, 'Study for geography quiz', 'Review maps and key facts for the geography quiz.', '2024-11-05', '2024-09-08 07:45:00', '2024-09-14 08:00:00', FALSE, NULL, NOW()),
(12, 'Complete textile design', 'Experiment with patterns and materials for textile design.', '2024-11-30', '2024-09-11 15:00:00', '2024-09-17 15:25:00', FALSE, NULL, NOW()),
(12, 'Prepare presentation handout', 'Design handouts and ensure they match the presentation.', '2024-11-20', '2024-09-12 11:00:00', '2024-09-18 11:20:00', TRUE, NULL, NOW()),

-- Student 13 (Ethan Williams)
(13, 'Complete math workbook chapter 13', 'Complete advanced practice problems and review solutions.', '2024-11-25', '2024-09-03 09:40:00', '2024-09-16 09:55:00', FALSE, NULL, NOW()),
(13, 'Practice calculus basics', 'Review limits and derivatives with practice sets.', '2024-10-30', '2024-09-05 08:20:00', '2024-09-13 08:40:00', FALSE, NULL, NOW()),
(13, 'Read science magazine', 'Read and summarize articles relevant to studies.', '2024-12-01', '2024-09-07 18:45:00', '2024-09-18 19:05:00', FALSE, NULL, NOW()),
(13, 'Finish engineering assignment', 'Finalize calculations and diagrams for the assignment.', '2024-11-12', '2024-09-09 14:00:00', '2024-09-18 14:20:00', TRUE, NULL, NOW()),
(13, 'Attend coding workshop', 'Participate in hands-on coding workshop sessions.', '2024-10-15', '2024-09-06 19:00:00', '2024-09-15 19:20:00', FALSE, NULL, NOW()),
(13, 'Prototype a gadget', 'Sketch and build a simple prototype for testing.', '2024-12-15', '2024-09-10 20:00:00', '2024-09-17 20:30:00', FALSE, NULL, NOW()),
(13, 'Practice basketball drills', 'Work on shooting and dribbling skills.', '2024-10-05', '2024-09-04 07:20:00', '2024-09-12 07:40:00', TRUE, NULL, NOW()),
(13, 'Study advanced topics', 'Review advanced curriculum topics and practice problems.', '2024-11-20', '2024-09-11 17:30:00', '2024-09-17 17:50:00', FALSE, NULL, NOW()),
(13, 'Complete photography project', 'Plan, shoot, and edit a photography series.', '2024-12-05', '2024-09-08 15:30:00', '2024-09-19 15:50:00', FALSE, NULL, NOW()),
(13, 'Prepare project documentation', 'Organize documentation and write the final report.', '2024-11-30', '2024-09-12 10:00:00', '2024-09-18 10:20:00', TRUE, NULL, NOW()),

-- Student 14 (Chloe Martin)
(14, 'Complete math workbook chapter 14', 'Complete advanced problem set and review solutions.', '2024-11-05', '2024-09-03 09:20:00', '2024-09-15 09:40:00', FALSE, NULL, NOW()),
(14, 'Practice test questions', 'Timed practice of test-style questions.', '2024-10-01', '2024-09-06 07:45:00', '2024-09-14 07:55:00', FALSE, NULL, NOW()),
(14, 'Read a novel and review', 'Read assigned novel and prepare review notes.', '2024-12-20', '2024-09-11 20:00:00', '2024-09-18 20:25:00', FALSE, NULL, NOW()),
(14, 'Finish art portfolio pieces', 'Complete selected pieces for portfolio review.', '2024-11-30', '2024-09-08 15:00:00', '2024-09-19 15:30:00', TRUE, NULL, NOW()),
(14, 'Join community volunteer event', 'Participate in the scheduled volunteer event.', '2024-10-12', '2024-09-05 12:00:00', '2024-09-16 12:10:00', FALSE, NULL, NOW()),
(14, 'Organize study group', 'Coordinate and schedule group study sessions.', '2024-11-22', '2024-09-07 13:00:00', '2024-09-16 13:20:00', FALSE, NULL, NOW()),
(14, 'Practice piano repertoire', 'Polish assigned piano pieces for performance.', '2024-10-15', '2024-09-04 17:00:00', '2024-09-12 17:20:00', TRUE, NULL, NOW()),
(14, 'Study for science exam', 'Review key topics and practice problem sets.', '2024-11-10', '2024-09-09 07:30:00', '2024-09-18 07:50:00', FALSE, NULL, NOW()),
(14, 'Complete creative writing', 'Draft and revise creative writing pieces for submission.', '2024-12-01', '2024-09-10 18:00:00', '2024-09-17 18:30:00', FALSE, NULL, NOW()),
(14, 'Prepare exhibition materials', 'Frame and label pieces for exhibition display.', '2024-11-05', '2024-09-12 11:30:00', '2024-09-19 11:45:00', TRUE, NULL, NOW()),

-- Student 15 (Lucas Silva)
(15, 'Complete math workbook chapter 15', 'Complete final practice set and review solutions.', '2024-11-28', '2024-09-03 09:00:00', '2024-09-16 09:20:00', FALSE, NULL, NOW()),
(15, 'Practice problem solving daily', 'Daily problem solving focusing on logic and strategy.', '2024-10-10', '2024-09-05 08:00:00', '2024-09-14 08:30:00', FALSE, NULL, NOW()),
(15, 'Read career-focused articles', 'Read articles and summarize career insights.', '2024-12-31', '2024-09-11 19:00:00', '2024-09-18 19:25:00', FALSE, NULL, NOW()),
(15, 'Finish capstone project outline', 'Complete outline and get supervisor feedback.', '2024-11-01', '2024-09-08 14:00:00', '2024-09-19 14:30:00', TRUE, NULL, NOW()),
(15, 'Attend mentorship session', 'Attend scheduled mentorship meeting and prepare questions.', '2024-10-05', '2024-09-06 17:30:00', '2024-09-15 17:55:00', FALSE, NULL, NOW()),
(15, 'Build a portfolio website', 'Design and deploy a personal portfolio site.', '2024-12-15', '2024-09-09 20:00:00', '2024-09-17 20:40:00', FALSE, NULL, NOW()),
(15, 'Practice guitar chords', 'Practice chord progressions and transitions.', '2024-10-20', '2024-09-04 18:00:00', '2024-09-12 18:20:00', TRUE, NULL, NOW()),
(15, 'Study for college prep test', 'Follow a study schedule for college prep topics.', '2024-11-15', '2024-09-10 07:30:00', '2024-09-16 07:55:00', FALSE, NULL, NOW()),
(15, 'Complete digital portfolio', 'Compile digital work and upload to portfolio site.', '2024-12-01', '2024-09-11 15:00:00', '2024-09-18 15:30:00', FALSE, NULL, NOW()),
(15, 'Prepare application materials', 'Finalize CV, personal statement, and references.', '2024-11-20', '2024-09-12 11:00:00', '2024-09-19 11:20:00', TRUE, NULL, NOW());

-- End of seed data

-- Populate completed_at for completed goals (set to a realistic datetime between created_at and target_date when available)
-- Logic:
--  - If target_date is available, pick a random day between created_at and target_date (inclusive).
--  - Otherwise pick a random day within 0-13 days after created_at.
--  - Add a random time-of-day (random seconds within the day) to produce a DATETIME value.
UPDATE goals
SET completed_at = CASE
  WHEN target_date IS NOT NULL THEN
    -- daysBetween = max(0, DATEDIFF(target_date, DATE(created_at)))
    -- pick random offset in [0, daysBetween]
    DATE_ADD(
      DATE_ADD(DATE(created_at), INTERVAL FLOOR(RAND() * (GREATEST(0, DATEDIFF(target_date, DATE(created_at))) + 1)) DAY),
      INTERVAL FLOOR(RAND() * 86400) SECOND
    )
  ELSE
    -- no target_date: pick up to 13 days after created_at and add random seconds
    DATE_ADD(
      DATE_ADD(DATE(created_at), INTERVAL FLOOR(RAND() * 14) DAY),
      INTERVAL FLOOR(RAND() * 86400) SECOND
    )
END
WHERE is_completed = TRUE AND completed_at IS NULL;

