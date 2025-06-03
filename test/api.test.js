const request = require('supertest');
const expect = require('chai').expect;
const app = require('../src/app');
const db = require('../src/config/database');
const bcrypt = require('bcryptjs'); // Para criar senhas hash para usuários de teste

describe('API da COP30 - Autenticação e Lógica de Negócio', () => {
    let adminToken;
    let angelUserToken; // Token para um Angel que também é um usuário
    let testAngelId; // ID de um Angel para testes de associação
    let testVisitorId; // ID de um Visitor para testes de associação

    before((done) => {
        db.serialize(() => {
            // Limpar e recriar tabelas
            db.run(`DROP TABLE IF EXISTS Angels`);
            db.run(`DROP TABLE IF EXISTS Visitors`);
            db.run(`DROP TABLE IF EXISTS Associations`);
            db.run(`DROP TABLE IF EXISTS Users`); // Limpar tabela de usuários também

            db.run(`CREATE TABLE IF NOT EXISTS Angels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                availability TEXT NOT NULL,
                contact TEXT NOT NULL,
                visitors_count INTEGER DEFAULT 0
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
                    )`, (err) => {
                        if (err) return done(err);
                        db.run(`CREATE TABLE IF NOT EXISTS Users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT NOT NULL UNIQUE,
                            password TEXT NOT NULL,
                            role TEXT DEFAULT 'user'
                        )`, (err) => {
                            if (err) return done(err);

                            // Criar usuário admin para testes
                            const hashedPassword = bcrypt.hashSync('adminpass', 10);
                            db.run(`INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`,
                                ['admin', hashedPassword, 'admin'], function (err) {
                                    if (err) return done(err);

                                    // Fazer login como admin para obter o token
                                    request(app)
                                        .post('/api/login')
                                        .send({ username: 'admin', password: 'adminpass' })
                                        .end((err, res) => {
                                            if (err) return done(err);
                                            adminToken = res.body.token;

                                            // Criar um usuário Angel de teste
                                            const angelHashedPassword = bcrypt.hashSync('angelpass', 10);
                                            db.run(`INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`,
                                                ['testangeluser', angelHashedPassword, 'angel'], function (err) {
                                                    if (err) return done(err);
                                                    // Fazer login como angel para obter o token
                                                    request(app)
                                                        .post('/api/login')
                                                        .send({ username: 'testangeluser', password: 'angelpass' })
                                                        .end((err, res) => {
                                                            if (err) return done(err);
                                                            angelUserToken = res.body.token;
                                                            done();
                                                        });
                                                });
                                        });
                                });
                        });
                    });
                });
            });
        });
    });

    // Teste para a rota raiz (não protegida)
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

    // --- Testes de Autenticação ---
    it('POST /api/register deve registrar um novo usuário', (done) => {
        request(app)
            .post('/api/register')
            .send({ username: 'novoUsuario', password: 'senha123' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Usuário registrado com sucesso.');
                done();
            });
    });

    it('POST /api/login deve autenticar um usuário e retornar um token', (done) => {
        request(app)
            .post('/api/login')
            .send({ username: 'novoUsuario', password: 'senha123' })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('token');
                expect(res.body.message).to.equal('Login realizado com sucesso.');
                done();
            });
    });

    it('GET /api/angels deve retornar 401 se não houver token', (done) => {
        request(app)
            .get('/api/angels')
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Acesso negado. Token não fornecido.');
                done();
            });
    });

    // --- Testes de CRUD Protegidos (Usando adminToken) ---

    // Teste para cadastrar um Angel
    it('POST /api/angels deve cadastrar um novo Angel (com token)', (done) => {
        request(app)
            .post('/api/angels')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Maria da Silva', city: 'Belém', availability: 'Manhã', contact: 'maria@example.com' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id');
                testAngelId = res.body.id; // Guarda o ID para outros testes
                expect(res.body.message).to.equal('Angel cadastrado com sucesso.');
                done();
            });
    });

    // Teste para listar Angels
    it('GET /api/angels deve retornar uma lista de Angels (com token)', (done) => {
        request(app)
            .get('/api/angels')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.above(0);
                done();
            });
    });

    // Teste para cadastrar um Visitor
    it('POST /api/visitors deve cadastrar um novo Visitor (com token)', (done) => {
        request(app)
            .post('/api/visitors')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'John Doe', country: 'USA', interest: 'Sustentabilidade', contact: 'john@example.com' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id');
                testVisitorId = res.body.id; // Guarda o ID para outros testes
                expect(res.body.message).to.equal('Visitor cadastrado com sucesso.');
                done();
            });
    });

    // Teste para listar Visitors
    it('GET /api/visitors deve retornar uma lista de Visitors (com token)', (done) => {
        request(app)
            .get('/api/visitors')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.above(0);
                done();
            });
    });

    // Teste para associar um Angel e um Visitor (com token e limite)
    it('POST /api/associate deve associar um Angel e um Visitor (com token)', (done) => {
        request(app)
            .post('/api/associate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ angel_id: testAngelId, visitor_id: testVisitorId })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Associação criada com sucesso.');
                expect(res.body).to.have.property('id');
                done();
            });
    });

    // Teste para associar mais de 3 visitors a um Angel
    it('POST /api/associate deve recusar associação se Angel já tiver 3 visitors', (done) => {
        // Crie 2 visitantes adicionais para o Angel
        request(app)
            .post('/api/visitors')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Visitor 2', country: 'USA', interest: 'Sustentabilidade', contact: 'v2@example.com' })
            .end((err, res) => {
                if (err) return done(err);
                const visitorId2 = res.body.id;

                request(app)
                    .post('/api/associate')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ angel_id: testAngelId, visitor_id: visitorId2 })
                    .end((err, res) => {
                        if (err) return done(err);

                        request(app)
                            .post('/api/visitors')
                            .set('Authorization', `Bearer ${adminToken}`)
                            .send({ name: 'Visitor 3', country: 'USA', interest: 'Sustentabilidade', contact: 'v3@example.com' })
                            .end((err, res) => {
                                if (err) return done(err);
                                const visitorId3 = res.body.id;

                                request(app)
                                    .post('/api/associate')
                                    .set('Authorization', `Bearer ${adminToken}`)
                                    .send({ angel_id: testAngelId, visitor_id: visitorId3 })
                                    .end((err, res) => {
                                        if (err) return done(err);

                                        // Agora, tente associar um 4º visitante - deve falhar
                                        request(app)
                                            .post('/api/visitors')
                                            .set('Authorization', `Bearer ${adminToken}`)
                                            .send({ name: 'Visitor 4', country: 'USA', interest: 'Sustentabilidade', contact: 'v4@example.com' })
                                            .end((err, res) => {
                                                if (err) return done(err);
                                                const visitorId4 = res.body.id;

                                                request(app)
                                                    .post('/api/associate')
                                                    .set('Authorization', `Bearer ${adminToken}`)
                                                    .send({ angel_id: testAngelId, visitor_id: visitorId4 })
                                                    .expect(400) // Espera erro 400
                                                    .end((err, res) => {
                                                        if (err) return done(err);
                                                        expect(res.body.message).to.include('já atingiu o limite de 3 visitors');
                                                        done();
                                                    });
                                            });
                                    });
                            });
                    });
            });
    });

    // Você pode adicionar mais testes aqui para PUT/DELETE com autenticação e roles

    after((done) => {
        db.close((err) => {
            if (err) return done(err);
            console.log('Conexão com o banco de dados fechada.');
            done();
        });
    });
});