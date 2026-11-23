import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Catalog } from './pages/Catalog';
import { GameDetail } from './pages/GameDetail';
import { Auth } from './pages/Auth';
import { Admin } from './pages/Admin';
import { GameEditor } from './pages/GameEditor';
import { Users } from './pages/Users';
import { Library } from './pages/Library';
import { LibraryEditor } from './pages/LibraryEditor';
import { Chat } from './pages/Chat';
import { Privacy } from './pages/Privacy';
import './styles.css';
import './features.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><Routes><Route element={<Layout />}>
  <Route index element={<Catalog />} />
  <Route path="games/:id" element={<GameDetail />} />
  <Route path="login" element={<Auth key="login" />} />
  <Route path="register" element={<Auth key="register" register />} />
  <Route path="privacy" element={<Privacy />} />
  <Route element={<ProtectedRoute adminOnly={false} />}><Route path="library" element={<Library />} /><Route path="library/:id/edit" element={<LibraryEditor />} /><Route path="chat" element={<Chat />} /></Route>
  <Route element={<ProtectedRoute />}><Route path="admin" element={<Admin />} /><Route path="admin/games/new" element={<GameEditor />} /><Route path="admin/games/:id/edit" element={<GameEditor />} /><Route path="admin/users" element={<Users />} /><Route path="admin/library" element={<Library all />} /><Route path="admin/library/:id/edit" element={<LibraryEditor all />} /></Route>
  <Route path="*" element={<div className="container section"><p className="eyebrow">404 / Fuera del mapa</p><h1>Esta partida no existe.</h1><Link className="button" to="/">Volver al catálogo</Link></div>} />
</Route></Routes></BrowserRouter></React.StrictMode>);
