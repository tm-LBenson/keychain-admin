import "./App.css";
import Navbar from "./NavBar";
import Products from "./Products";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <h1>Admin Page</h1>
        <Products />
      </main>
    </>
  );
}

export default App;
