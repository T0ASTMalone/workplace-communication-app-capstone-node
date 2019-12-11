TRUNCATE food_log, meal_log, users RESTART IDENTITY;

ALTER TABLE food_log 
    ADD COLUMN
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL

 