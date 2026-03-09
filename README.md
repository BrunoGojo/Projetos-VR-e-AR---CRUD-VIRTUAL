# CRUD em Realidade Virtual (A-Frame)

Este projeto demonstra a implementação de um **CRUD (Create, Read,
Update e Delete)** em um ambiente de **Realidade Virtual** utilizando
**JavaScript e A-Frame**.

Os registros do CRUD são representados como **cubos 3D dentro de uma
cena virtual**.

## Tecnologias

-   HTML
-   CSS
-   JavaScript
-   A-Frame.js
-   LocalStorage

## Funcionamento

Cada item criado aparece como um **objeto 3D** na cena.

O usuário pode interagir com o ambiente utilizando:

- **Movimento do mouse** para olhar ao redor da cena
- **Clique do mouse** para selecionar um cubo
- **Formulário lateral** para criar, atualizar ou remover itens

Operações disponíveis:

-   **POST** → Criar item
-   **GET** → Listar itens
-   **PUT** → Atualizar item
-   **DELETE** → Remover item

Todas as alterações são refletidas diretamente no ambiente 3D.

## Estrutura do Projeto

vr-crud-aframe/ ├── index.html ├── style.css ├── app.js └── README.md

## Como Executar
Abra no Live Server:


Abra o arquivo **index.html** como live server.

Ou no Codespaces:

python3 -m http.server 5500

Depois abra a porta **5500** no navegador.

## Autor

Bruno do Nascimento Almeida Xavier
