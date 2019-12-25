const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

makeUsers = () => {
  return [
    {
      user_id: 1,
      username: "Test user 1",
      password: "Thisis@testpassowrd!",
      wp_id: 1,
      type: "creator",
      nickname: "Test nickname 1",
      img: null
    },
    {
      user_id: 2,
      username: "Test user 2",
      password: "Thisis@testpassowrd!",
      wp_id: 2,
      type: "creator",
      nickname: "Test nickname 1",
      img: null
    },
    {
      user_id: 3,
      username: "Test user 3",
      password: "Thisis@testpassowrd!",
      wp_id: 3,
      type: "creator",
      nickname: "Test nickname 1",
      img: null
    }
  ];
};

makeWp = () => {
  return [
    {
      wp_name: "TEST COMPANY 1",
      type: "company",
      wp_code: "1234",
      wp_id: 1
    },
    {
      wp_name: "TEST COMPANY 2",
      type: "company",
      wp_code: "1235",
      wp_id: 2
    },
    {
      wp_name: "TEST COMPANY 3",
      type: "company",
      wp_code: "1236",
      wp_id: 3
    }
  ];
};

makePosts = () => {
  return [
    {
      post_id: 1,
      user_id: 1,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "idea",
      wp_id: 1
    },
    {
      post_id: 2,
      user_id: 1,
      title: "Test Post 2",
      content: "This is just a second a test post",
      priority: 0,
      type: "posts",
      wp_id: 1
    },
    {
      post_id: 3,
      user_id: 2,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 2
    },
    {
      post_id: 4,
      user_id: 3,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 3
    }
  ];
};

makeExpectedPosts = () => {
  return [
    {
      post_id: 2,
      user_id: 1,
      title: "Test Post 2",
      content: "This is just a second a test post",
      priority: 0,
      type: "posts",
      wp_id: 1,
      nickname: "Test nickname 1",
      img: null
    },
    {
      post_id: 1,
      user_id: 1,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "idea",
      wp_id: 1,
      nickname: "Test nickname 1",
      img: null
    }
  ];
};

makeMaliciousWp = () => {
  const maliciousWp = {
    wp_id: 1,
    wp_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    type: "company",
    wp_code: "1234"
  };

  const expectedWp = {
    ...maliciousWp,
    wp_name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
  };

  delete expectedWp.wp_code;

  return {
    maliciousWp,
    expectedWp
  };
};

cleanTables = db => {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
        workplaces,
        users,
        posts,
        seen
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE workplaces_wp_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`ALTER SEQUENCE users_user_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE posts_post_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE seen_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('workplaces_wp_id_seq', 0)`),
          trx.raw(`SELECT setval('users_user_id_seq', 0)`),
          trx.raw(`SELECT setval('posts_post_id_seq', 0)`),
          trx.raw(`SELECT setval('seen_id_seq', 0)`)
        ])
      )
  );
};

seedUsers = (db, users) => {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));

  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_user_id_seq', ?)`, [
        users[users.length - 1].user_id
      ])
    );
};

seedWp = (db, wp) => {
  return db("workplaces")
    .insert(wp)
    .then(() =>
      db.raw(`SELECT setval('workplaces_wp_id_seq', ?)`, [
        wp[wp.length - 1].wp_id
      ])
    );
};

seedPosts = (db, posts) => {
  //console.log(posts);
  return db("posts")
    .insert(posts)
    .then(() =>
      db.raw(`SELECT setval('posts_post_id_seq', ?)`, [
        posts[posts.length - 1].post_id
      ])
    );
};

makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.username,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
};

module.exports = {
  makeUsers,
  makeWp,
  makePosts,
  cleanTables,
  seedUsers,
  seedWp,
  seedPosts,
  makeAuthHeader,
  makeMaliciousWp,
  makeExpectedPosts
};
