# Projeto COP30 - Backend

Este documento detalha a estrutura, o código e os endpoints da API REST do projeto COP30, com as implementações de autenticação JWT e o limite de 3 visitantes por Angel.

## Sumário
1.  [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2.  [Estrutura de Pastas](#2-estrutura-de-pastas)
3.  [Arquivos de Configuração](#3-arquivos-de-configuração)
    * [`.env`](#env)
    * [`package.json`](#packagejson)
    * [`src/config/database.js`](#srcconfigdatabasejs)
    * [`src/app.js`](#srcappjs)
4.  [Controladores (Controllers)](#4-controladores-controllers)
    * [`src/controllers/authController.js`](#srccontrollersauthcontrollerjs)
    * [`src/controllers/angelController.js`](#srccontrollersangelcontrollerjs)
    * [`src/controllers/visitorController.js`](#srccontrollersvisitorcontrollerjs)
    * [`src/controllers/associationController.js`](#srccontrollersassociationcontrollerjs)
5.  [Middleware](#5-middleware)
    * [`src/middleware/authMiddleware.js`](#srcmiddlewareauthmiddlewarejs)
6.  [Utilitários](#6-utilitários)
    * [`src/utils/jwt.js`](#srcutilsjwtjs)
7.  [Rotas (Routes)](#7-rotas-routes)
    * [`src/routes/index.js`](#srcroutesindexjs)
8.  [Testes](#8-testes)
    * [`test/api.test.js`](#testapitestjs)
9.  [Endpoints da API](#9-endpoints-da-api)
    * [Rotas de Autenticação (Abertas)](#rotas-de-autenticação-abertas)
    * [Rotas Protegidas - Entidade Angel](#rotas-protegidas---entidade-angel)
    * [Rotas Protegidas - Entidade Visitor](#rotas-protegidas---entidade-visitor)
    * [Rotas Protegidas - Entidade Association](#rotas-protegidas---entidade-association)
    * [Rota Raiz da Aplicação (Não Protegida)](#rota-raiz-da-aplicação-não-protegida)
10. [Como Iniciar e Testar](#10-como-iniciar-e-testar)

---

## 1. Visão Geral do Projeto

O backend da COP30 é uma API REST desenvolvida em Node.js com Express e SQLite. Seu objetivo é gerenciar o cadastro, consulta e associação entre "Angels" (voluntários guias) e "Visitors" (visitantes da conferência). As funcionalidades incluem:

* Cadastro de Angels e Visitors.
* Associação entre Angels e Visitors, com limite de **no máximo 3 Visitors por Angel**.
* Busca de Angels por cidade ou disponibilidade.
* Autenticação de usuários usando **JSON Web Tokens (JWT)** para proteger as rotas da API.
* Utilização de status HTTP apropriados e tratamento de erros.

## 2. Estrutura de Pastas
Ok! Vou consolidar todas as informações do seu projeto, incluindo os arquivos de código atualizados e os endpoints da API, em um único arquivo Markdown.
Markdown

# Projeto COP30 - Backend

Este documento detalha a estrutura, o código e os endpoints da API REST do projeto COP30, com as implementações de autenticação JWT e o limite de 3 visitantes por Angel.

## Sumário
1.  [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2.  [Estrutura de Pastas](#2-estrutura-de-pastas)
3.  [Arquivos de Configuração](#3-arquivos-de-configuração)
    * [`.env`](#env)
    * [`package.json`](#packagejson)
    * [`src/config/database.js`](#srcconfigdatabasejs)
    * [`src/app.js`](#srcappjs)
4.  [Controladores (Controllers)](#4-controladores-controllers)
    * [`src/controllers/authController.js`](#srccontrollersauthcontrollerjs)
    * [`src/controllers/angelController.js`](#srccontrollersangelcontrollerjs)
    * [`src/controllers/visitorController.js`](#srccontrollersvisitorcontrollerjs)
    * [`src/controllers/associationController.js`](#srccontrollersassociationcontrollerjs)
5.  [Middleware](#5-middleware)
    * [`src/middleware/authMiddleware.js`](#srcmiddlewareauthmiddlewarejs)
6.  [Utilitários](#6-utilitários)
    * [`src/utils/jwt.js`](#srcutilsjwtjs)
7.  [Rotas (Routes)](#7-rotas-routes)
    * [`src/routes/index.js`](#srcroutesindexjs)
8.  [Testes](#8-testes)
    * [`test/api.test.js`](#testapitestjs)
9.  [Endpoints da API](#9-endpoints-da-api)
    * [Rotas de Autenticação (Abertas)](#rotas-de-autenticação-abertas)
    * [Rotas Protegidas - Entidade Angel](#rotas-protegidas---entidade-angel)
    * [Rotas Protegidas - Entidade Visitor](#rotas-protegidas---entidade-visitor)
    * [Rotas Protegidas - Entidade Association](#rotas-protegidas---entidade-association)
    * [Rota Raiz da Aplicação (Não Protegida)](#rota-raiz-da-aplicação-não-protegida)
10. [Como Iniciar e Testar](#10-como-iniciar-e-testar)

---

## 1. Visão Geral do Projeto

O backend da COP30 é uma API REST desenvolvida em Node.js com Express e SQLite. Seu objetivo é gerenciar o cadastro, consulta e associação entre "Angels" (voluntários guias) e "Visitors" (visitantes da conferência). As funcionalidades incluem:

* Cadastro de Angels e Visitors.
* Associação entre Angels e Visitors, com limite de **no máximo 3 Visitors por Angel**.
* Busca de Angels por cidade ou disponibilidade.
* Autenticação de usuários usando **JSON Web Tokens (JWT)** para proteger as rotas da API.
* Utilização de status HTTP apropriados e tratamento de erros.

## 2. Estrutura de Pastas

```

cop30-backend/
├── database/
│   └── cop30.db           # Banco de dados SQLite
├── node_modules/          # Dependências do Node.js
├── src/
│   ├── app.js             # Ponto de entrada da aplicação Express
│   ├── config/
│   │   └── database.js    # Configuração da conexão com o SQLite
│   ├── controllers/
│   │   ├── angelController.js     # Lógica de negócio para Angels
│   │   ├── associationController.js # Lógica de negócio para Associações (com limite de visitors)
│   │   ├── authController.js      # Lógica para registro e login de usuários
│   │   └── visitorController.js   # Lógica de negócio para Visitors
│   ├── middleware/
│   │   └── authMiddleware.js      # Middleware para autenticação JWT e autorização por role
│   ├── routes/
│   │   └── index.js       # Definição de todas as rotas da API
│   ├── utils/
│   │   └── jwt.js         # Utilitários para JWT (geração e verificação)
│   └── .env               # Variáveis de ambiente (IGNORADO pelo Git)
├── test/
│   └── api.test.js        # Testes da API (integrados com autenticação)
├── .env.example           # Exemplo de arquivo .env (Opcional, mas boa prática)
├── .gitignore             # Arquivos e pastas a serem ignorados pelo Git
├── package-lock.json
└── package.json           # Definições do projeto e dependências
```

## 3. Arquivos de Configuração

### `.env`

Localizado na raiz do projeto (`cop30-backend/.env`). **NÃO DEVE SER COMMITADO NO GIT.**

### `package.json`

Define as dependências do projeto.

### `src/config/database.js`

Configuração da conexão com o banco de dados SQLite e criação das tabelas, incluindo a nova tabela `Users` e a coluna `visitors_count` em `Angels`.

### `src/app.js`

Ponto de entrada da aplicação Express, configura middlewares e importa as rotas.

## 4. Controladores (Controllers)

### `src/controllers/authController.js`

Controlador responsável pelo registro de novos usuários e autenticação (login) via JWT.

### `src/controllers/angelController.js`

Controlador para as operações CRUD e busca da entidade `Angels`.

### `src/controllers/visitorController.js`

Controlador para as operações CRUD da entidade `Visitors`.

### `src/controllers/associationController.js`

Controlador para a criação e gestão de associações, incluindo a lógica para limitar Angels a 3 Visitors.

## 5. Middleware

### `src/middleware/authMiddleware.js`

Middleware para autenticação de tokens JWT e autorização baseada em roles de usuário.

## 6. Utilitários

### `src/utils/jwt.js`

Funções para gerar e verificar JSON Web Tokens.

## 7. Rotas (Routes)

### `src/routes/index.js`

Define todas as rotas da API, conectando-as aos controladores e aplicando os middlewares de autenticação/autorização.

## 8. Testes

### `test/api.test.js`

Arquivo de testes de integração, adaptado para incluir a lógica de autenticação JWT e o limite de visitantes por Angel.

## 9. Endpoints da API

**URL Base:** `http://localhost:3000` (ou a porta configurada no seu `.env`)
**Prefixo da API:** `/api`

### Rotas de Autenticação (Abertas)

Estas rotas **não precisam de token** e são usadas para registro e login de usuários.

| Método HTTP | Endpoint             | Descrição                      | Corpo da Requisição (JSON)                                    |
| :---------- | :------------------- | :----------------------------- | :------------------------------------------------------------ |
| `POST`      | `/api/register`      | Registra um novo usuário.      | `{ "username": "seu_usuario", "password": "sua_senha", "role": "admin" }` (role é opcional, padrão é 'user') |
| `POST`      | `/api/login`         | Autentica o usuário e retorna um token JWT. | `{ "username": "seu_usuario", "password": "sua_senha" }`    |

### Rotas Protegidas (Exigem JWT no cabeçalho `Authorization: Bearer <token>`)

Todas as requisições para estas rotas devem incluir o cabeçalho `Authorization` com o token JWT obtido no login.

#### Entidade: Angel

| Método HTTP | Endpoint                         | Descrição                                         | Roles Necessárias | Corpo da Requisição (JSON) / Query Params / URL Params |
| :---------- | :------------------------------- | :------------------------------------------------ | :---------------- | :------------------------------------------------------- |
| `POST`      | `/api/angels`                    | Cadastra um novo "Angel".                         | `angel`, `admin`  | `{ "name": "Nome", "city": "Cidade", "availability": "Disponibilidade", "contact": "Contato" }` |
| `GET`       | `/api/angels`                    | Lista todos os "Angels" cadastrados.             | Qualquer Autenticado | N/A                                                      |
| `GET`       | `/api/angels/:id`                | Obtém um "Angel" específico pelo ID.             | Qualquer Autenticado | URL Param: `:id` (ex: `/api/angels/1`)                   |
| `PUT`       | `/api/angels/:id`                | Atualiza um "Angel" específico pelo ID.           | `angel`, `admin`  | URL Param: `:id` <br> `{ "name": "Novo Nome", "city": "Nova Cidade", ... }` |
| `DELETE`    | `/api/angels/:id`                | Exclui um "Angel" específico pelo ID.             | `admin`           | URL Param: `:id`                                         |
| `GET`       | `/api/angels/search`             | Busca "Angels" por `city` ou `availability`.      | Qualquer Autenticado | Query Params: `?city=Belém` ou `?availability=Manhã`     |

#### Entidade: Visitor

| Método HTTP | Endpoint                         | Descrição                                         | Roles Necessárias | Corpo da Requisição (JSON) / Query Params / URL Params |
| :---------- | :------------------------------- | :------------------------------------------------ | :---------------- | :------------------------------------------------------- |
| `POST`      | `/api/visitors`                  | Cadastra um novo "Visitor".                       | Qualquer Autenticado | `{ "name": "Nome", "country": "País", "interest": "Interesse", "contact": "Contato" }` |
| `GET`       | `/api/visitors`                  | Lista todos os "Visitors" cadastrados.           | Qualquer Autenticado | N/A                                                      |
| `GET`       | `/api/visitors/:id`              | Obtém um "Visitor" específico pelo ID.           | Qualquer Autenticado | URL Param: `:id` (ex: `/api/visitors/1`)                 |
| `PUT`       | `/api/visitors/:id`              | Atualiza um "Visitor" específico pelo ID.         | Qualquer Autenticado | URL Param: `:id` <br> `{ "name": "Novo Nome", "country": "Novo País", ... }` |
| `DELETE`    | `/api/visitors/:id`              | Exclui um "Visitor" específico pelo ID.           | `admin`           | URL Param: `:id`                                         |

#### Entidade: Association

| Método HTTP | Endpoint                         | Descrição                                         | Roles Necessárias | Corpo da Requisição (JSON) / Query Params / URL Params |
| :---------- | :------------------------------- | :------------------------------------------------ | :---------------- | :------------------------------------------------------- |
| `POST`      | `/api/associate`                 | Associa um "Angel" a um "Visitor". **(Verifica limite de 3 Visitors por Angel)** | `angel`, `admin`  | `{ "angel_id": 1, "visitor_id": 2 }`                     |
| `GET`       | `/api/associations`              | Lista todas as associações.                       | Qualquer Autenticado | N/A                                                      |
| `DELETE`    | `/api/associations/:id`          | Exclui uma associação específica pelo ID.        | `admin`           | URL Param: `:id`                                         |

### Rota Raiz da Aplicação (Não Protegida)

| Método HTTP | Endpoint | Descrição                                  |
| :---------- | :------- | :----------------------------------------- |
| `GET`       | `/`      | Retorna uma mensagem de boas-vindas da API. |

## 10. Como Iniciar e Testar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Certifique-se de que a estrutura de pastas está correta**, especialmente que `src/routes.js` (o arquivo, não a pasta `src/routes/`) foi excluído e que `src/routes/index.js` contém o código atualizado.
3.  **Crie o arquivo `.env`** na raiz do projeto conforme a seção 3.1.
4.  **Inicie o servidor:**
    ```bash
    npm start
    ```
5.  **Teste a API usando o Postman ou `curl`:**
    * Primeiro, registre um usuário (`POST /api/register`).
    * Em seguida, faça login (`POST /api/login`) para obter um token JWT.
    * Use o token JWT no cabeçalho `Authorization: Bearer <token>` para acessar as rotas protegidas.
    * Teste a criação de Angels e Visitors, e a associação, verificando o limite de 3 visitantes por Angel.
6.  **Execute os testes automatizados:**
    ```bash
    npm test
    ```