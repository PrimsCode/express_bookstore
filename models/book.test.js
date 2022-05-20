process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");


// isbn of sample book
let book_isbn;


beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123432122',
        'https://amazon.com/taco',
        'Eli',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn;
});

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });


describe("GET /books", function () {
    test("Get all books", async function () {
      const response = await request(app).get(`/books`);
          
      expect(response.statusCode).toBe(200);
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty("amazon_url");
      expect(response.body.books[0]).toHaveProperty("isbn");
    });
});

describe("Get /books/:isbn", function () {
    test("Get a book with a specific isbn", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    })

    test("Responds with 404 if can't find book in question", async function () {
        const response = await request(app).get(`/books/999`)
        expect(response.statusCode).toBe(404);
      });
})

describe("POST /books", function () {
  test("Create a new book", async function () {
    const response = await request(app)
        .post("/books")
        .send({
          isbn: '1234567',
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 200,
          publisher: "yeah right",
          title: "amazing times",
          year: 2010
        });
    
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
  });

  test("Prevents creating book without required title", async function () {
    const response = await request(app)
        .post(`/books`)
        .send({year: 2000});
    expect(response.statusCode).toBe(400);
  });
});


describe("PUT /books/:isbn", function () {
    test("Update a book", async function () {
      const response = await request(app)
          .put(`/books/${book_isbn}`)
          .send({
            amazon_url: "https://amazon.com/taco",
            author: "New Eli",
            language: "english",
            pages: 101,
            publisher: "Famous publishers",
            title: "my new book",
            year: 2009
          });
          
          expect(response.statusCode).toBe(200);
          expect(response.body.book).toHaveProperty("author");
          expect(response.body.book.author).toEqual("New Eli");
    });
  
    test("Prevents a bad book update", async function () {
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
              isbn: 32794782,
              badField: "DO NOT ADD ME!",
              amazon: "https://taco.com",
              author: "mctest",
              language: "english",
              pages: "eoe",
              publisher: "yeah right",
              title: "UPDATED BOOK",
              year: 2000
            });
        
            expect(response.statusCode).toBe(400);
      });
    
      test("Responds 404 if can't find book in question", async function () {
        // delete book first
        await request(app)
            .delete(`/books/${book_isbn}`)
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(404);
      });
  });

  describe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app)
          .delete(`/books/${book_isbn}`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
  });
     
  
  afterAll(async function () {
    await db.end()
  });