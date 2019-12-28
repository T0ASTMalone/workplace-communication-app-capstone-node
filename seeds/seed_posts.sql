INSERT INTO posts (post_id, user_id, title, content, date_added, priority, type, wp_id)
VALUES 
    (1, 1, 'Test Post', 'This is just a test post', now(), 0, 'posts', 4),
    (2, 1, 'No work tommorow', 'Blizzard warning tommorw. So no work', now(), 1, 'posts', 4),
    (3, 2, 'Test Post', 'Just a test post for develpmente', now(), 0, 'posts', 4),
    (4, 6, 'First Post', 'Hey, I made the first post ever on this workplace', now(), 0, 'posts', 5),
    (5, 7, 'I have an idea', 'Hey we should reschedule our meeting for next tuesday', now(), 0, 'idea', 5),
    (6, 6, 'Meeting rescheduled', 'We are rescheduling tommorows meeting for next tuesday', now(), 0, 'posts', 5),
    (7, 1, 'Look busy', 'I know it is slow but we need to look busy. Please, if you have no work just clean your area.', now(), 0, 'posts', 4)