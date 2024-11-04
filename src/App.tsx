import React, { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Navbar from "./NavBar";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import S3ImageManager from "./S3ImageManager";
import { ProductsProvider } from "./ProductsContext";
import { useIsAdminWhitelisted } from "./useAdminWhitelisted";

type ProtectedProps = {
  children: ReactNode; // Typing children to accept ReactNode
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductsProvider>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedComponent>
                  <AdminPage />
                </ProtectedComponent>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedComponent>
                  <ProductDetailPage />
                </ProtectedComponent>
              }
            />
          </Routes>
        </ProductsProvider>
      </AuthProvider>
    </Router>
  );
};

const ProtectedComponent: React.FC<ProtectedProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const { isWhitelisted, loading } = useIsAdminWhitelisted(currentUser?.email);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!currentUser) {
    return (
      <main>
        <h1 className="text-2xl text-center mt-10">
          You need to be logged in to view this page
        </h1>
      </main>
    );
  }

  if (!isWhitelisted) {
    return (
      <main>
        <h1 className="text-2xl text-center mt-10">
          Please contact the site admin for access.
        </h1>
      </main>
    );
  }

  return <>{children}</>;
};

const AdminPage: React.FC = () => {
  return (
    <main>
      <h1 className="text-3xl mt-5 font-bold text-center">Admin Page</h1>
      <ProductList />
      <S3ImageManager />
    </main>
  );
};

const ProductDetailPage: React.FC = () => {
  return (
    <main>
      <ProductDetail />
    </main>
  );
};

export default App;
