CREATE TABLE users (
    user_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    weight INTEGER NOT NULL,
    height INTEGER NOT NULL,
    age INTEGER NOT NULL,
    goals TEXT NOT NULL,
    gender TEXT NOT NULL,
    activity_lvl TEXT NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fats INTEGER NOT NULL
);

CREATE TABLE meal_log (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL, 
    meal_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    meal_name TEXT NOT NULL,
    date_added TIMESTAMP DEFAULT now() NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fats INTEGER NOT NULL
);

CREATE TABLE food_log (
    meal_id INTEGER REFERENCES meal_log(meal_id) ON DELETE CASCADE NOT NULL, 
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    food_name TEXT NOT NULL,
    date_added TIMESTAMP DEFAULT now() NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fats INTEGER NOT NULL
);

