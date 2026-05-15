-- Cria o banco de testes automaticamente quando o container sobe pela primeira vez.
-- Usado pelos testes de integração (DATABASE_URL do .env.test).
CREATE DATABASE api_rest_portifolio_test;
GRANT ALL PRIVILEGES ON DATABASE api_rest_portifolio_test TO api_user;
