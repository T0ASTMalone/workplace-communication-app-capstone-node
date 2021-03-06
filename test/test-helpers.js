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
      img: null,
    },
    {
      user_id: 2,
      username: "Test user 2",
      password: "Thisis@testpassowrd!",
      wp_id: 2,
      type: "creator",
      nickname: "Test nickname 2",
      img: null,
    },
    {
      user_id: 3,
      username: "Test user 3",
      password: "Thisis@testpassowrd!",
      wp_id: 3,
      type: "creator",
      nickname: "Test nickname 3",
      img: null,
    },
  ];
};

makeWp = () => {
  return [
    {
      wp_name: "TEST COMPANY 1",
      type: "company",
      wp_code: "1234",
      wp_id: 1,
    },
    {
      wp_name: "TEST COMPANY 2",
      type: "company",
      wp_code: "1235",
      wp_id: 2,
    },
    {
      wp_name: "TEST COMPANY 3",
      type: "company",
      wp_code: "1236",
      wp_id: 3,
    },
  ];
};

makePosts = () => {
  const testPosts = [
    {
      post_id: 1,
      user_id: 1,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "idea",
      wp_id: 1,
    },
    {
      post_id: 2,
      user_id: 1,
      title: "Test Post 2",
      content: "This is just a second a test post",
      priority: 0,
      type: "posts",
      wp_id: 1,
    },
    {
      post_id: 3,
      user_id: 2,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 2,
    },
    {
      post_id: 4,
      user_id: 3,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 3,
    },
  ];

  const expectedPosts = [
    {
      post_id: 1,
      user_id: 1,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "idea",
      wp_id: 1,
      nickname: "Test nickname 1",
      img: null,
      username: "Test user 1",
      total: "2",
    },
    {
      post_id: 2,
      user_id: 1,
      title: "Test Post 2",
      content: "This is just a second a test post",
      priority: 0,
      type: "posts",
      wp_id: 1,
      nickname: "Test nickname 1",
      img: null,
      username: "Test user 1",
      total: "2",
    },
    {
      post_id: 3,
      user_id: 2,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 2,
      nickname: "Test nickname 2",
      img: null,
      username: "Test user 2",
      total: "2",
    },
    {
      post_id: 4,
      user_id: 3,
      title: "Test Post",
      content: "This is just a test post",
      priority: 0,
      type: "posts",
      wp_id: 3,
      nickname: "Test nickname 3",
      img: null,
      username: "Test user 3",
      total: "0",
    },
  ];

  return { testPosts, expectedPosts };
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
      img: null,
      total: "2",
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
      img: null,
      total: "2",
    },
  ];
};

makeAcks = () => {
  const acksToPost = [
    { id: 1, user_id: 2, post_id: 1 },
    { id: 2, user_id: 3, post_id: 1 },
    { id: 3, user_id: 2, post_id: 2 },
    { id: 4, user_id: 3, post_id: 2 },
    { id: 5, user_id: 1, post_id: 3 },
    { id: 6, user_id: 3, post_id: 3 },
  ];
  const expectedAcks = [
    { id: 1, user_id: 2, post_id: 1, nickname: "Test nickname 2" },
    { id: 2, user_id: 3, post_id: 1, nickname: "Test nickname 3" },
    { id: 3, user_id: 2, post_id: 2, nickname: "Test nickname 2" },
    { id: 4, user_id: 3, post_id: 2, nickname: "Test nickname 3" },
    { id: 5, user_id: 1, post_id: 3, nickname: "Test nickname 1" },
    { id: 6, user_id: 3, post_id: 3, nickname: "Test nickname 3" },
  ];

  return { acksToPost, expectedAcks };
};

makeMaliciousWp = () => {
  const maliciousWp = {
    wp_id: 1,
    wp_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    type: "company",
    wp_code: "1234",
  };

  const expectedWp = {
    ...maliciousWp,
    wp_name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
  };

  delete expectedWp.wp_code;

  return {
    maliciousWp,
    expectedWp,
  };
};

cleanTables = (db) => {
  return db.transaction((trx) =>
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
          trx.raw(`SELECT setval('seen_id_seq', 0)`),
        ])
      )
  );
};

seedUsers = (db, users) => {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));

  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_user_id_seq', ?)`, [
        users[users.length - 1].user_id,
      ])
    );
};

seedWp = async (db, wp) => {
  await db("workplaces").insert(wp);

  return db.raw(`SELECT setval('workplaces_wp_id_seq', ?)`, [
    wp[wp.length - 1].wp_id,
  ]);
};

seedPosts = (db, posts) => {
  return db("posts")
    .insert(posts)
    .then(() =>
      db.raw(`SELECT setval('posts_post_id_seq', ?)`, [
        posts[posts.length - 1].post_id,
      ])
    );
};

seedAcks = (db, acks) => {
  return db("seen")
    .insert(acks)
    .then(() =>
      db.raw(`SELECT setval('seen_id_seq', ?)`, [acks[acks.length - 1].id])
    );
};

makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.nickname,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
};

module.exports = {
  makeUsers,
  makeWp,
  makePosts,
  makeAcks,
  cleanTables,
  seedUsers,
  seedWp,
  seedPosts,
  seedAcks,
  makeAuthHeader,
  makeMaliciousWp,
  makeExpectedPosts,
};
