# Painel Admin — Imobiliária Geraldo Gama

## Requisitos

- Node.js 18+
- MongoDB Atlas (gratuito) — https://www.mongodb.com/atlas
- Cloudinary (gratuito) — https://cloudinary.com

## Configuração

1. Instalar dependências:
   ```
   cd admin
   npm install
   ```

2. Copiar `.env.example` para `.env` e preencher:
   ```
   cp .env.example .env
   ```

3. Criar um cluster gratuito no MongoDB Atlas e copiar a string de conexão para `MONGODB_URI`

4. Criar uma conta no Cloudinary e copiar as credenciais (Cloud Name, API Key, API Secret)

5. (Opcional) Importar os 82 imóveis existentes:
   ```
   npm run seed
   ```

6. Iniciar o servidor:
   ```
   npm start
   ```

7. Acessar: http://localhost:3000/admin/login

## Login

- Email: `geraldogamaimv@gmail.com`
- Senha: `admin`

## Esqueci minha senha

O link de redefinição aparece no console do servidor (modo debug). Em produção, configure um serviço de email (SendGrid, etc).

## Deploy no Render

1. Crie um novo **Web Service** no Render
2. Conecte ao repositório da pasta `admin/`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Adicione as variáveis de ambiente no painel do Render:
   - `MONGODB_URI`
   - `JWT_SECRET` (gere uma string aleatória longa)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
    - `BASE_URL` (URL do seu site no Render, ex: https://seu-admin.onrender.com)
    - `ADMIN_EMAIL=geraldogamaimv@gmail.com`
    - `ADMIN_PASSWORD=admin`
    - `ADMIN_NAME=Geraldo Gama`
    - `SENDGRID_FROM=geraldogamaimv@gmail.com`
 6. Deploy!
