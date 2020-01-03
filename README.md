**WorkPlace API Docs**

An api for improving communication between team members.

Responds with JSON

**Authentication**

- json web tokens

**POST auth/login**

Log in with valid credentials

**Example request**

    fetch(`https://fast-gorge-81708.herokuapp.com/api/auth/login`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

Credentials should contain the following:

    const credentials = {
        nickname: "valid@email.com",
        password: "validPassword1!"
        type: 'creator'
    };

The type can be either:

- creator
- user'

**Example Response**

        {
            authToken: jwt token,
            user_id: 1
        }

---

**POST /wp**

Create a new WorkPlace by providing a valid wp information

        const wp = {
            name: 'exampleWpName',
            type: 'company' *
        }

\*Type can be one of the following

- project
- team
- company

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/wp”, {
        method: ‘POST’,
        headers: {
            "content-type": "application/json",
        }
        body: JSON.stringify(wp),
    });

**Example response**

    {
        wp_id: 1,
        wp_name: 'exampleWpName',
        type: 'company',
        wp_code: '89RfOOuD'
    }

new users can use wp_code to join a workplace

**GET /wp/:id**

Get workplace information

**Example request:**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/wp/:id”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response:**

     {
      wp_id: 1,
      wp_name: 'exampleWpName',
      type: 'company'
      }

---

**POST /users**

Register a new user by providing a valid user with the following information

    const newUser = {
        username: "exampleUsername" ,
        password: "examplePassword1!,
        nickname: "exampleNickname",
        type: 'creator', *
        code: 1234, *
        img: 'exampleImgUrl'
    };

\*type can be one of the following:

- creator
- user
- pending

unless the type creator is provided the user type will default to pending

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users”, {
        method: ‘POST’,
        headers: {
            "content-type": "application/json",
        }
        body: JSON.stringify(newUser),
    });

**Example response**

    {
      user_id: 1,
      username: "exampleUsername" ',
      wp_id: 1,
      type: 'creator',
      nickname: "exampleNickname",
      img: 'exampleImgUrl'
    }

**GET /user/:id**

Get the user information

**Example request:**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users/:id”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response if user type is creator:**

     {
      user_id: 1,
      username: 'exampleUsername',
      wp_id: 1,
      type: 'user',
      code: 1234,
      nickname: 'exampleNickname',
      img: 'exampleUrl
      }

**Example response if user type is user**

    {
        user_id: 1,
        username: 'exampleUsername',
        wp_id: 1,
        type: 'user',
        nickname: 'exampleNickname',
        img: 'exampleUrl
    };

**DELETE /user/:id**

Delete user

**Example request:**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users/:id”, {
        method: ‘DELETE’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response**

201 no content

**PATCH /user/:id**

Update user

**Example request:**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users/:id”, {
        method: ‘PATCH’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
        body: JSON.stringify(newUserInfo),
    });

Update any property of a user that was used when creating the user

**Example response**

201 no content

**GET /users/wp/:wpId**

Get users in a workplace

A type can be added to the end of the url to specify the type of user to return.

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users/wp/:wpId?type=pending”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

All users that are part of the workplace with that id and are of the type provided will be returned. If no type is provided all users that are part of that workplace will be returned.

**Example request:**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/users/wp/:wpId”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response**

    [
        {
        user_id: 1,
        username: 'exampleUsername',
        wp_id: 1,
        type: 'creator',
        nickname: 'exampleNickname1',
        img: 'exampleUrl
        }
        {
        user_id: 2,
        username: 'exampleUsername',
        wp_id: 1,
        type: 'user',
        nickname: 'exampleNickname2',
        img: 'exampleUrl
        }
        {
        user_id: 2,
        username: 'exampleUsername',
        wp_id: 1,
        type: 'user',
        nickname: 'exampleNickname3',
        img: 'exampleUrl
        };
    ]

---

**POST /posts**

Make post to workplace

Posts should include the following:

    const newMeal = {
        wp_id: 1,
        user_id: 1,
        title: 'exampleTitle,
        content: 'example content',
        type: "posts"
    };

\* post type can be either:

- posts
- idea

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts”, {
        method: ‘POST’,
        headers: {
            "content-type": "application/json",
            authorization: ‘bearer [authorization token]’
        },
        body: JSON.stringify(post)
    });

**Example response:**

    {
      user_id: 1,
      username: 'exampleName',
      nickname: 'exampleNickname',
      post_id: 1,
      title: 'exampleTitle',
      type: 'post',
      wp_id: 1,
      date_added: 1/1/2020,
      content: 'example content',
      img: 'example profile pic url',
      total: "0"
    }

\* total is total number of likes/acknowledgments a post has

**GET /posts/:id**

Get users post information

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[id]”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response:**

    {
      user_id: 1,
      username: 'exampleName',
      nickname: 'exampleNickname',
      post_id: 1,
      title: 'exampleTitle',
      type: 'post',
      wp_id: 1,
      date_added: 1/1/2020,
      content: 'example content',
      img: 'example profile pic url',
      total: "0"
    }

**DELETE /posts/:id**

Delete post

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/post/[postid]”, {
        method: ‘DELETE’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**PATCH /posts/:id**

Update post by providing the post id and the new post information in the body of the request

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[id]”, {
        method: ‘PATCH’,
        headers: {
            "content-type": "application/json",
            authorization: ‘bearer [authorization token]’
        },
        body: JSON.stringify(updated-post),
    });

**Example Response**

201 no content

**GET /posts/:wp-id/wp**

Get a workplaces posts

Posts are returned with the newest post first.

An offset and type query parameters can be provided to get older posts and to filter the posts by type.

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[wp-id]/wp?type=posts&offset=2”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

Ten post will be returned per request. Increase the offset to get older posts

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[wp-id]/wp”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response:**

    [
        {
        user_id: 1,
        username: 'exampleName',
        nickname: 'exampleNickname',
        post_id: 1,
        title: 'exampleTitle',
        type: 'post',
        wp_id: 1,
        date_added: 1/3/2020,
        content: 'example content',
        img: 'example profile pic url',
        total: "0"
        },
        {
        user_id: 2,
        username: 'exampleName2',
        nickname: 'exampleNickname2',
        post_id: 2,
        title: 'exampleTitle2',
        type: 'post',
        wp_id: 1,
        date_added: 1/2/2020,
        content: 'example content2',
        img: 'example profile pic url',
        total: "0"
        },
        {
        user_id: 3,
        username: 'exampleName3',
        nickname: 'exampleNickname3',
        post_id: 3,
        title: 'exampleTitle3',
        type: 'post',
        wp_id: 1,
        date_added: 1/1/2020,
        content: 'example content3',
        img: 'example profile pic url',
        total: "0"
        },
    ]

**GET /posts/:user-id/user**

Get a users posts

Posts are returned with the newest post first.

An offset and type query parameters can be provided to get older posts and to filter the posts by type.

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[user-id]/user?type=posts&offset=2”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

Ten post will be returned per request. Increase the offset to get older posts

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/posts/[user-id]/user”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example response:**

    [
        {
        user_id: 3,
        username: 'exampleName3',
        nickname: 'exampleNickname3',
        post_id: 3,
        title: 'exampleTitle3',
        type: 'post',
        wp_id: 1,
        date_added: 1/1/2020,
        content: 'example content3',
        img: 'example profile pic url',
        total: "0"
        },
    ]

---

**POST /seen**

To create an acknowledgment for a post, provide the user id and the post id. An acknowledgment allows the user to acknowledge that they have seen the post.

ack = {
user_id: 1,
post_id: 1
}

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/seen/”, {
        method: ‘GET’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
        body: JSON.stringify(ack),
    });

**Example response:**

if acknowledgment already exists the id for that acknowledgment will be returned

    {
        id: 1,
    }

if the acknowledgment is successfully created

    {
        id: 1,
        user_id: 1,
        nickname: 'exampleNickname',
        post_id: 1
    }

**DELETE /seen/:id**

Delete acknowledgment

**Example request**

    fetch(“https://fast-gorge-81708.herokuapp.com/api/seen/[ackid]”, {
        method: ‘DELETE’,
        headers: {
            authorization: ‘bearer [authorization token]’
        }
    });

**Example Response**

201 no content

**Response codes**

The API uses the following standard response codes.

- "500 - Internal Server Error"

GET requests

- "200 - Ok"

POST requests

- "201 - Created"
- "400 - Bad Request"
- "204 - No Content"
- "404 - Not Found"

PATCH requests

- "200 - Ok"
