-- Cria o banco de testes automaticamente quando o container sobe pela primeira vez.
-- Usado pelos testes de integração (DATABASE_URL do .env.test).
CREATE DATABASE node_rest_blueprint_test;
GRANT ALL PRIVILEGES ON DATABASE node_rest_blueprint_test TO api_user;
