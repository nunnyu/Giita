# Official Name TBD: Music Practice Management Platform

A full-stack web application designed to help musicians organize, track, and practice songs with rich metadata integration and customizable practice features.

![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## Overview

This is a modern music practice management platform that combines song discovery, organization, and practice tracking in a single application. The platform integrates with Spotify's Web API to provide rich metadata and offers features for musicians to create practice profiles, add custom notes, and track learning progress.

## Features

- **Spotify Integration**: Search and discover songs using Spotify's extensive catalog
- **Practice Profiles**: Create multiple profiles to organize songs
- **Custom Notes**: Add and edit practice notes for each song
- **Link Management**: Store and organize practice resources and links
- **Auto-Save**: Debounced auto-save functionality for seamless note editing
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: Synchronized data between frontend and backend

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database and backend services
- **Axios** - HTTP client for external APIs

### APIs & Services
- **Spotify Web API** - Music search and audio features (OAuth 2.0 Client Credentials)
- **Supabase** - Database (PostgreSQL) and authentication

### Development Tools
- **Git** - Version control
- **npm** - Package manager
- **Concurrently** - Run multiple npm scripts simultaneously