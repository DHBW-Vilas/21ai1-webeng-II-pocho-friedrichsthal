[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/kQ7-lFd_)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=10853581&assignment_repo_type=AssignmentRepo)

# Pocho Friedrichsthal Website

## Manual Installation & Startup

### Prerequisites

- NodeJS
- Planetscale Account
- Clerk Account

### Installation

1. Clone the repository
2. Create new database in Planetscale
3. Create new App in Clerk
4. Run `npm install` in the root directory
5. Create a `.env` file in the root directory and fill it with the following content:

```
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
DATABASE_URL=<YOUR_PLANETSCALE_DATABASE_URL>
```

6. Run `npx prisma db push` in the root directory
7. Run `npm install` again to trigger postinstall script
8. Run `npm run dev` to start the development server
9. Open Browser on `localhost:3000`

## Gitpod

    [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/DHBW-Vilas/21ai1-webeng-II-pocho-friedrichsthal)

### Necessary Actions

#### .env availabe

1. Copy the `.env` file into the root directory

#### .env not available

1. Create new database in Planetscale
2. Create new App in Clerk
3. Create a `.env` file in the root directory and fill it with the following content:

```
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
DATABASE_URL=<YOUR_PLANETSCALE_DATABASE_URL>
```

## Contributors

| Name         | Matrikel number | Github account |
| ------------ | --------------- | -------------- |
| Lars Lehmann | 7781075         | @nichtLehdev   |
