import Navbar from "../components/NavBar";
import RegisterAnimalsForm from "../forms/RegisterAnimalsForm";
import Sidebar from "../components/SideBar";

const RegisterAnimals = () => {
  return (
    <div>
      <Sidebar />

      <div className="ml-50"> 
        <Navbar />
        <div className="ml-0 bg-gradient-to-r from-blue-400 to-blue-700 text-white py-12 shadow-md">
          <div className="px-6">
            <h1 className="text-2xl font-semibold">Registro de animales</h1>
          </div>
        </div>

        <main className="p-6 space-y-6">
          <section>
            <RegisterAnimalsForm />
          </section>
        </main>
      </div>
    </div>
  );
};

export default RegisterAnimals;
