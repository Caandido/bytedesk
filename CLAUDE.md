# CLAUDE.md

# DevFlow
### Programming Study & Project Manager

---

# Objetivo

Criar um aplicativo desktop/web moderno voltado exclusivamente para programadores.

O sistema deve unir:

- Organização de estudos
- Organização de projetos
- Controle de bugs
- Roadmaps
- Versionamento manual
- Documentação
- Diário de desenvolvimento
- Checklist
- Anotações
- Integração futura com Git

O objetivo é que o usuário nunca precise abrir Notion, Trello, Obsidian e vários blocos de notas ao mesmo tempo.

Tudo deve existir em um único ambiente.

---

# Filosofia

O aplicativo deve priorizar:

- simplicidade
- velocidade
- organização
- produtividade
- interface limpa
- poucos cliques

Sempre pensar como um desenvolvedor utilizando o sistema diariamente.

---

# Público

- estudantes
- desenvolvedores iniciantes
- freelancers
- equipes pequenas
- criadores de SaaS
- profissionais

---

# Design

Tema escuro.

Inspirado em:

- VS Code
- GitHub
- Linear
- Notion
- Obsidian

Paleta

Background:
#111827

Sidebar:
#1F2937

Cards:
#374151

Primary:
#22C55E

Danger:
#EF4444

Warning:
#F59E0B

Info:
#3B82F6

Texto:
#F9FAFB

---

# Estrutura

O sistema será dividido em módulos.

# Dashboard

Tela inicial contendo:

Projetos ativos

Projetos finalizados

Estudos em andamento

Roadmaps

Últimos erros registrados

Próximas tarefas

Tempo estudado

Tempo programando

Estatísticas

---

# Estudos

Cada estudo possui:

Nome

Categoria

Tecnologia

Descrição

Data de início

Status

Nível

Tags

Links

Arquivos

Anotações

Checklist

Horas estudadas

Objetivos

---

Exemplo

HTML

Status:
Em andamento

Objetivos

☐ Semântica

☐ Forms

☐ Tables

☐ Accessibility

☐ SEO

☐ Canvas

---

Cada estudo deve possuir:

Editor Markdown

Favoritos

Pesquisa

Histórico

Relacionamentos

Exemplo

HTML relacionado com

CSS

JavaScript

React

---

# Roadmaps

Criar roadmaps completos.

Exemplo

Frontend

☐ HTML

☐ CSS

☐ JS

☐ TS

☐ React

☐ Next

☐ Testing

☐ CI/CD

☐ Docker

☐ Deploy

Cada item pode possuir:

descrição

links

artigos

vídeos

livros

notas

tempo recomendado

progresso

---

# Projetos

Cada projeto possui:

Nome

Descrição

Cliente

Categoria

Tecnologias

Status

Prioridade

Versão

Data

Prazo

Github

Figma

Deploy

Documentação

---

Dentro do projeto existirão módulos.

---

## Visão Geral

Descrição

Objetivos

Checklist

Tecnologias

Arquitetura

Dependências

---

## Tarefas

Sistema Kanban.

Backlog

A Fazer

Em Desenvolvimento

Em Testes

Concluído

Cada tarefa possui

Título

Descrição

Prioridade

Tempo estimado

Tempo gasto

Responsável

Checklist

Comentários

Anexos

---

## Bugs

Sistema completo de gerenciamento.

Cada bug possui

Título

Descrição

Severidade

Prioridade

Status

Versão

Módulo afetado

Data

Prints

Vídeos

Logs

Passos para reproduzir

Resultado esperado

Resultado obtido

Correção

Quem corrigiu

---

Exemplo

Erro

Botão Login quebra quando email vazio.

Status

Resolvido

Versão

v0.8.2

Correção

Adicionada validação antes da requisição.

---

## Versionamento

Cada projeto possui histórico.

Versão

Descrição

Data

Mudanças

Breaking Changes

Novidades

Correções

Exemplo

v1.3.0

Novidades

Sistema de Login

Dashboard

Tema escuro

Correções

Bug no cadastro

Erro do upload

---

## Changelog

Gerado automaticamente.

Formato

## v1.4.0

Novidades

-

Correções

-

Melhorias

-

---

## Documentação

Editor Markdown completo.

Suporte para:

Código

Tabelas

Checklist

Imagens

Links

Avisos

Diagramas Mermaid

---

## Banco de Ideias

Guardar ideias futuras.

Cada ideia possui

Título

Descrição

Prioridade

Impacto

Complexidade

Status

Relacionamentos

---

## Arquitetura

Diagramas

Fluxogramas

Banco de dados

APIs

Estrutura de pastas

Dependências

---

## Banco de Erros

Todos os erros conhecidos.

Pesquisar

Filtrar

Tags

Tecnologia

Categoria

Solução

Exemplo

Erro

CORS

Motivo

Backend bloqueando origem.

Solução

Liberar domínio no servidor.

---

## Diário de Desenvolvimento

Cada sessão gera um registro.

Data

Tempo

O que foi feito

Problemas encontrados

Como resolveu

Próximos passos

Humor

Produtividade

---

# Conhecimento

Criar uma Wiki pessoal.

Categorias

JavaScript

React

Node

Docker

Linux

Git

Banco de Dados

Cada página suporta:

Markdown

Código

Relacionamentos

Pesquisa

Histórico

Favoritos

---

# Git

Inicialmente sem integração.

Criar campos:

Repositório

Branch

Último Commit

Próxima versão

Tags

No futuro integrar GitHub API.

---

# Estatísticas

Projetos

Finalizados

Em andamento

Horas estudadas

Horas programadas

Tecnologias mais usadas

Bugs resolvidos

Tarefas concluídas

Dias consecutivos

Gráficos

---

# Pesquisa Global

Pesquisar:

Projetos

Estudos

Bugs

Notas

Documentação

Versões

Tarefas

Roadmaps

Wiki

---

# Sistema de Tags

Exemplos

#frontend

#backend

#api

#typescript

#react

#node

#docker

#mysql

#bug

#estudo

#ideia

#documentacao

---

# Favoritos

Tudo pode ser favoritado.

Projetos

Notas

Roadmaps

Erros

Documentações

Tarefas

---

# Atalhos

Ctrl+K

Pesquisa global

Ctrl+N

Novo projeto

Ctrl+Shift+N

Novo estudo

Ctrl+B

Novo bug

Ctrl+D

Nova documentação

Ctrl+T

Nova tarefa

---

# Funcionalidades futuras

Sincronização em nuvem

Aplicativo mobile

GitHub

GitLab

Bitbucket

IA para resumir documentação

IA para sugerir soluções

IA para gerar roadmap

IA para revisar código

IA para criar checklist

IA para gerar documentação

Pomodoro integrado

Calendário

Modo offline

Backup automático

Extensões

Plugins

Marketplace

---

# Stack sugerida

Frontend

React

TypeScript

Vite

TailwindCSS

shadcn/ui

React Router

TanStack Query

Zustand

React Hook Form

Zod

Framer Motion

Lucide Icons

---

Backend

Node.js

NestJS

Prisma

SQLite

PostgreSQL

JWT

---

Desktop

Electron

ou

Tauri

---

Banco

SQLite para uso local

PostgreSQL para sincronização futura

---

# Estrutura sugerida

src/

app/

components/

pages/

features/

hooks/

services/

database/

types/

stores/

utils/

styles/

assets/

layouts/

routes/

---

# Regras para Claude

Sempre:

Criar código limpo

Usar SOLID

Usar Clean Architecture quando possível

Componentizar tudo

Evitar duplicação

Usar TypeScript estrito

Criar interfaces

Documentar funções importantes

Criar componentes reutilizáveis

Seguir Atomic Design quando fizer sentido

Criar código escalável

Pensar em futuras integrações

Nunca criar código improvisado.

Toda nova funcionalidade deve ser preparada para expansão futura.

Toda tela deve ser responsiva.

Toda informação importante deve possuir pesquisa, filtros e ordenação.

Todo formulário deve possuir validação.

Sempre considerar acessibilidade (WCAG).

Todo dado deve possuir data de criação e última atualização.

```