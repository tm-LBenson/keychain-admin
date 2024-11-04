import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./NavBar";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import S3ImageManager from "./S3ImageManager";
import { ProductsProvider } from "./ProductsContext";

function App() {
  return (
    <>
      <Router>
        <ProductsProvider>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <h1 className="text-3xl mt-5 font-bold text-center">
                    Admin Page
                  </h1>
                  <ProductList />
                  <S3ImageManager />
                </main>
              }
            />
            <Route
              path="/product/:id"
              element={
                <>
                  <main>
                    <ProductDetail />
                  </main>
                </>
              }
            />
          </Routes>
        </ProductsProvider>
      </Router>
    </>
  );
}

export default App;
