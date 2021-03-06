const request = require("supertest")
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data');

beforeEach(() => {
    return seed(testData);
})

afterAll(() => {
    db.end();
});


describe('app', () => {
    describe('GET /api/topics', () => {
        test('Should return json of the topics with status 200', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                const topics = body.topics;
                expect(topics).toBeInstanceOf(Array);
                expect(topics.length > 0).toBeTruthy()
                topics.forEach((topic) => {
                    expect(topic).toEqual(
                        expect.objectContaining({
                            slug: expect.any(String),
                            description: expect.any(String)
                        })
                    );
                });
            });
        });
        test('should return error message with 404 for invalid path', () => {
            return request(app)
            .get('/api/carrots')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('Route not found');
            })
        });
    });
    describe('GET /api/articles/:article_id', () => {
        test('Should return json of an article with the corresponding id, including a comment count and staus 200', () => {
            const idToSearch = 3;
            return request(app)
            .get(`/api/articles/${idToSearch}`)
            .expect(200)
            .then(({body}) => {
                const article = body.article;
                expect(article).toBeInstanceOf(Object);
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: idToSearch,
                        title: 'Eight pug gifs that remind me of mitch',
                        topic: 'mitch',
                        author: 'icellusedkars',
                        body: 'some gifs',
                        created_at: '2020-11-03T09:12:00.000Z',
                        votes: 0,
                        comment_count: 2
                    })
                );
            });
        });
        test('should return error message with 400 for bad request', () => {
            return request(app)
            .get('/api/articles/carrots')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Bad request');
            })
        });
        test('should return error message with 404 for invalid article id', () => {
            return request(app)
            .get('/api/articles/9999')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No article found with that id');
            })
        });
    });
    describe('PATCH /api/articles/:article_id', () => {
        test('Can add votes to corresponding article and return json of updated article with status 200', () => {
            const idToPatch = 3;
            const patchData = {inc_votes: 12}
            return request(app)
            .patch(`/api/articles/${idToPatch}`)
            .send(patchData)
            .expect(200)
            .then(({body}) => {
                const article = body.article;
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: idToPatch,
                        title: 'Eight pug gifs that remind me of mitch',
                        topic: 'mitch',
                        author: 'icellusedkars',
                        body: 'some gifs',
                        created_at: '2020-11-03T09:12:00.000Z',
                        votes: 12
                    })
                )
            });
        });
        test('Can subtract votes to corresponding article and return json of updated article with status 200', () => {
            const idToPatch = 1;
            const patchData = {inc_votes: -60}
            return request(app)
            .patch(`/api/articles/${idToPatch}`)
            .send(patchData)
            .expect(200)
            .then(({body}) => {
                const article = body.article;
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: idToPatch,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: '2020-07-09T20:11:00.000Z',
                        votes: 40,
                    })
                )
            });
        });
        test('should return error message with 404 for invalid path', () => {
            const patchData = {votes: 12}
            return request(app)
            .patch('/api/articles/3')
            .send(patchData)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Invalid request body');
            })
        });
        test('should return error message with 404 for invalid path', () => {
            const patchData = {inc_votes: 12}
            return request(app)
            .patch('/api/articles/9999')
            .send(patchData)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No article found with that id');
            })
        });
    });
    describe('GET /api/users', () => {
        test('Should return json of the users with status 200', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                const users = body.users;
                expect(users).toBeInstanceOf(Array);
                expect(users.length === 4).toBeTruthy();
                users.forEach((user) => {
                    expect(user).toEqual(
                        expect.objectContaining({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String)
                        })
                    )
                })
            });
        });
        test('should return error message with 404 for invalid path', () => {
            return request(app)
            .get('/api/carrots')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('Route not found');
            })
        });
    });
    describe('GET /api/articles', () => {
        test('Should return json of the articles, orderd by date (default) in descending (default) order with status 200', () => {
            return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                const articles = body.articles;
                expect(articles).toBeInstanceOf(Array);
                expect(articles.length === 12)
                expect(articles).toBeSortedBy('created_at',{descending:true});
                articles.forEach((article) => {
                    expect(article).toEqual(
                        expect.objectContaining({
                            article_id: expect.any(Number),
                            title: expect.any(String),
                            topic: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            comment_count: expect.any(Number)
                        })
                    )
                })
            });
        });
        test('Should return json of the articles, orderd by votes in ascending order with status 200', () => {
            return request(app)
            .get('/api/articles/?sort_by=votes&order=asc')
            .expect(200)
            .then(({body}) => {
                const articles = body.articles;
                expect(articles).toBeInstanceOf(Array);
                expect(articles.length === 12)
                expect(articles).toBeSortedBy('votes',{ascending:true});
            });
        });
        test('Should return json of the articles, orderd by date in ascending order, filtered by topic cats with status 200', () => {
            return request(app)
            .get('/api/articles/?order=asc&topic=cats')
            .expect(200)
            .then(({body}) => {
                const articles = body.articles;
                expect(articles).toBeInstanceOf(Array);
                expect(articles.length === 12)
                expect(articles).toBeSortedBy('created_at',{ascending:true});
                articles.forEach((article) => expect(article.topic).toEqual('cats'));
            });
        });
        test('should return empty array and status 200 for topic with no articles', () => {
            return request(app)
            .get('/api/articles/?topic=paper')
            .expect(200)
            .then(({body}) => {
                const articles = body.articles;
                expect(articles).toBeInstanceOf(Array);
                expect(articles.length === 0);
            })
        });
        test('should return error message with 404 for invalid path', () => {
            return request(app)
            .get('/api/carrots')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('Route not found');
            })
        });
        test('should return error message with 400 for an invalid query - order', () => {
            return request(app)
            .get('/api/articles/?order=tom')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Bad order request');
            })
        });
        test('should return error message with 400 for an invalid query - sort_by', () => {
            return request(app)
            .get('/api/articles/?sort_by=tom')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Invalid sort_by - no column with that name');
            })
        });
        test('should return error message with 404 for an invalid topic', () => {
            return request(app)
            .get('/api/articles/?topic=tom')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No topic with that name');
            })
        });
    });
    describe('GET /api/articles/:article_id/comments', () => {
        test('Should return json of comments related to that article with status 200', () => {
            const idToSearch = 9
            return request(app)
            .get(`/api/articles/${idToSearch}/comments`)
            .expect(200)
            .then(({body}) => {
                const comments = body.comments;
                expect(comments).toBeInstanceOf(Array);
                expect(comments.length === 2).toBeTruthy();
                comments.forEach((comment) => {
                    expect(comment).toEqual(
                        expect.objectContaining({
                            comment_id: expect.any(Number),
                            body: expect.any(String),
                            article_id: idToSearch,
                            author: expect.any(String),
                            votes: expect.any(Number),
                            created_at: expect.any(String)
                        })
                    )
                })
            });
        });
        test('if an article has no comments responds with empty array and status 200', () => {
            const idToSearch = 10
            return request(app)
            .get(`/api/articles/${idToSearch}/comments`)
            .expect(200)
            .then(({body}) => {
                const comments = body.comments;
                expect(comments).toBeInstanceOf(Array);
                expect(comments.length === 0 ).toBeTruthy();
                expect(comments).toEqual([]);
            });
        });
        test('should return error message with 400 for bad request', () => {
            return request(app)
            .get('/api/articles/carrots/comments')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Bad request');
            })
        });
        test('should return error message with 404 for invalid article id', () => {
            return request(app)
            .get('/api/articles/9999/comments')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No article found with that id');
            })
        });
    });
    describe('POST /api/articles/:article_id/comments', () => {
        test('Should post a new comment to comments with the specifed article, respond with the json of that comment and status 201', () => {
            const idToPost = 9
            const commentToPost = {
                username: 'rogersop',
                body: 'test comment :)'
            }
            return request(app)
            .post(`/api/articles/${idToPost}/comments`)
            .send(commentToPost)
            .expect(201)
            .then(({body}) => {
                const comment = body.comment;
                expect(comment).toEqual(
                    expect.objectContaining({
                        comment_id: 19,
                        body: 'test comment :)',
                        article_id: idToPost,
                        author: 'rogersop',
                        votes: 0,
                        created_at: expect.any(String)
                    })
                )
            }).then(() => {
                return db.query('SELECT * FROM comments WHERE comment_id = 19')
                .then((addedComment) => {
                    expect(addedComment.rows.length === 1).toBeTruthy();
                })
            })
        });
        test('should return error message with 404 for invalid article id', () => {
            const commentToPost = {
                username: 'rogersop',
                body: 'test comment :)'
            }
            return request(app)
            .post('/api/articles/9999/comments')
            .send(commentToPost)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No article found with that id');
            })
        });
        test('should return error message with 404 for invalid username', () => {
            const commentToPost = {
                username: 'tom',
                body: 'test comment :)'
            }
            return request(app)
            .post('/api/articles/9/comments')
            .send(commentToPost)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No user with that username');
            })
        });
        test('should return error message with 400 for invalid request', () => {
            const commentToPost = {
                name: 'tom',
                arm: 'test comment :)'
            }
            return request(app)
            .post('/api/articles/9/comments')
            .send(commentToPost)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Bad request');
            })
        });
    });
    describe('DELETE /api/comments/:comment_id', () => {
        test('Should delete the comment with the given id and respond with a 204', () => {
            return request(app)
            .delete(`/api/comments/9`)
            .expect(204)
            .then(() => {
                return db.query('SELECT * FROM comments')
                .then((result) => expect(result.rows.length) === 17);
            })
        });
        test('should return error message with 404 for invalid article id', () => {
            return request(app)
            .delete('/api/comments/9999')
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('No article found with that id');
            })
        });
        test('should return error message with 400 for bad request', () => {
            return request(app)
            .delete('/api/comments/carrots')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual('Bad request');
            })
        });
    });
    describe('GET /api', () => {
        test('Should respond with endpoints.json and status 200', () => {
            return request(app)
            .get('/api')
            .expect(200)
            .then(({body}) => {
                const endpoints = body;
                expect(endpoints).toBeInstanceOf(Object);
                expect(endpoints).toEqual(
                    expect.objectContaining({
                        'GET /api': expect.any(Object),
                        'GET /api/topics': expect.any(Object),
                        'GET /api/articles/:article_id': expect.any(Object),
                        'GET /api/users': expect.any(Object),
                        'GET /api/users/:username': expect.any(Object),
                        'GET /api/articles': expect.any(Object),
                        'GET /api/articles/:article_id/comments': expect.any(Object),
                        'PATCH /api/articles/:article_id': expect.any(Object),
                        'POST /api/articles/:article_id/comments': expect.any(Object),
                        'DELETE /api/comments/:comment_id': expect.any(Object),
                    })
                )
            })
        });
    });
    describe('GET /api/users/:username', () => {
        test('Should return json of comments related to that article with status 200', () => {
            const usernameToSearch = 'rogersop'
            return request(app)
            .get(`/api/users/${usernameToSearch}`)
            .expect(200)
            .then(({body}) => {
                const user = body.user;
                expect(user).toBeInstanceOf(Object);
                expect(user).toEqual(
                    expect.objectContaining({
                        username: usernameToSearch,
                        name: 'paul',
                        avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
                    })
                )
            });
        });
        test('should return error message with 404 for invalid usernmae', () => {
            const usernameToSearch = 'tom'
            return request(app)
            .delete(`/api/users/${usernameToSearch}`)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual('Route not found');
            })
        });
    });
});
