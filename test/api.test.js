// test/api.test.js
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../src/app'); // Importa sua aplicação Express
const db = require('../src/config/database'); // Importa o banco de dados

describe('API da COP30', () => {
    // Antes de todos os testes, reinicia o banco de dados para garantir um estado limpo
    before((done) => {
        db.serialize(() => {
            db.run(`DROP TABLE IF EXISTS Angels`);
            db.run(`DROP TABLE IF EXISTS Visitors`);
            db.run(`DROP TABLE IF EXISTS Associations`);
            db.run(`CREATE TABLE IF NOT EXISTS Angels (
                id INTEGER PRIMARY PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                availability TEXT NOT NULL,
                contact TEXT NOT NULL
            )`, (err) => {
                if (err) return done(err);
                db.run(`CREATE TABLE IF NOT EXISTS Visitors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    country TEXT NOT NULL,
                    interest TEXT NOT NULL,
                    contact TEXT NOT NULL
                )`, (err) => {
                    if (err) return done(err);
                    db.run(`CREATE TABLE IF NOT EXISTS Associations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        angel_id INTEGER,
                        visitor_id INTEGER,
                        FOREIGN KEY (angel_id) REFERENCES Angels(id),
                        FOREIGN KEY (visitor_id) REFERENCES Visitors(id)
                    )`, done); // Chama done quando a última tabela for criada
                });
            });
        });
    });

    // Teste para a rota raiz
    it('GET / deve retornar uma mensagem de boas-vindas', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Bem-vindo à API da COP30!');
                done();
            });
    });

    // Teste para cadastrar um Angel
    it('POST /api/angels deve cadastrar um novo Angel', (done) => {
        request(app)
            .post('/api/angels')
            .send({ name: 'Maria da Silva', city: 'Belém', availability: 'Manhã', contact: 'maria@example.com' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id');
                expect(res.body.message).to.equal('Angel cadastrado com sucesso.');
                done();
            });
    });

    // Teste para listar Angels
    it('GET /api/angels deve retornar uma lista de Angels', (done) => {
        request(app)
            .get('/api/angels')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.above(0); // Deve ter pelo menos 1 Angel
                done();
            });
    });

    // Teste para cadastrar um Visitor
    it('POST /api/visitors deve cadastrar um novo Visitor', (done) => {
        request(app)
            .post('/api/visitors')
            .send({ name: 'John Doe', country: 'USA', interest: 'Sustentabilidade', contact: 'john@example.com' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id');
                expect(res.body.message).to.equal('Visitor cadastrado com sucesso.');
                done();
            });
    });

    // Teste para listar Visitors
    it('GET /api/visitors deve retornar uma lista de Visitors', (done) => {
        request(app)
            .get('/api/visitors')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.above(0); // Deve ter pelo menos 1 Visitor
                done();
            });
    });

    // Teste para associar um Angel e um Visitor
    it('POST /api/associate deve associar um Angel e um Visitor', (done) => {
        let angelId;
        let visitorId;

        // Primeiro, crie um Angel e um Visitor para ter IDs válidos
        request(app)
            .post('/api/angels')
            .send({ name: 'Teste Angel', city: 'Teste City', availability: 'Manhã', contact: 'teste@angel.com' })
            .end((err, res) => {
                if (err) return done(err);
                angelId = res.body.id;

                request(app)
                    .post('/api/visitors')
                    .send({ name: 'Teste Visitor', country: 'Teste Country', interest: 'Teste', contact: 'teste@visitor.com' })
                    .end((err, res) => {
                        if (err) return done(err);
                        visitorId = res.body.id;

                        // Agora tente associar
                        request(app)
                            .post('/api/associate')
                            .send({ angel_id: angelId, visitor_id: visitorId })
                            .expect(201)
                            .end((err, res) => {
                                if (err) return done(err);
                                expect(res.body.message).to.equal('Associação criada com sucesso.');
                                expect(res.body).to.have.property('id');
                                done();
                            });
                    });
            });
    });

    // Teste para busca de Angels por cidade
    it('GET /api/angels/search?city=Belém deve retornar Angels de Belém', (done) => {
        request(app)
            .get('/api/angels/search?city=Belém')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body[0].city).to.equal('Belém');
                done();
            });
    });

    // Teste para busca de Angels por disponibilidade
    it('GET /api/angels/search?availability=Manhã deve retornar Angels disponíveis na manhã', (done) => {
        request(app)
            .get('/api/angels/search?availability=Manhã')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body[0].availability).to.equal('Manhã');
                done();
            });
    });

    // Teste para atualização de Angel
    it('PUT /api/angels/:id deve atualizar um Angel existente', (done) => {
        // Primeiro, crie um Angel para atualizar
        request(app)
            .post('/api/angels')
            .send({ name: 'Angel a Atualizar', city: 'Cidade Velha', availability: 'Tarde', contact: 'angel@update.com' })
            .end((err, res) => {
                if (err) return done(err);
                const angelId = res.body.id;

                request(app)
                    .put(`/api/angels/${angelId}`)
                    .send({ name: 'Angel Atualizado', city: 'Reduto', availability: 'Noite', contact: 'angel_new@update.com' })
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body.message).to.equal('Angel atualizado com sucesso.');
                        done();
                    });
            });
    });

    // Teste para exclusão de Angel
    it('DELETE /api/angels/:id deve excluir um Angel existente', (done) => {
        // Primeiro, crie um Angel para excluir
        request(app)
            .post('/api/angels')
            .send({ name: 'Angel a Excluir', city: 'Cidade Excluir', availability: 'Manhã', contact: 'angel@delete.com' })
            .end((err, res) => {
                if (err) return done(err);
                const angelId = res.body.id;

                request(app)
                    .delete(`/api/angels/${angelId}`)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body.message).to.equal('Angel excluído com sucesso.');
                        done();
                    });
            });
    });

    // Depois de todos os testes, fecha a conexão com o banco de dados
    after((done) => {
        db.close((err) => {
            if (err) return done(err);
            console.log('Conexão com o banco de dados fechada.');
            done();
        });
    });
});