import { Navigate, Route, Routes } from 'react-router-dom'
import { CategoryPage } from '../../pages/CategoryPage'
import { CategoryContestPage } from '../../pages/CategoryContestPage'
import { CategoriesPage } from '../../pages/CategoriesPage'
import { ContributePage } from '../../pages/ContributePage'
import { CopyrightPage } from '../../pages/CopyrightPage'
import { EditorialDetailPage } from '../../pages/EditorialDetailPage'
import { HomePage } from '../../pages/HomePage'
import { SearchPage } from '../../pages/SearchPage'
import { Layout } from '../../shared/ui/Layout'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<SearchPage />} path="search" />
        <Route element={<CategoriesPage />} path="categories" />
        <Route element={<CategoryPage />} path="categories/:category" />
        <Route element={<CategoryContestPage />} path="categories/:category/contests/:contest" />
        <Route element={<EditorialDetailPage />} path="editorials/:editorialId" />
        <Route element={<ContributePage />} path="contribute" />
        <Route element={<CopyrightPage />} path="copyright" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
