import Navbar from "../components/NavBar";
import RegisterAnimalsForm from "../forms/RegisterAnimalsForm";

const RegisterAnimals = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">

        <section>
          <h1 className="text-xl font-semibold mb-2">📋 Registro de animales</h1>
          <RegisterAnimalsForm/>
        </section>



      </div>
    </div>
  );
};

export default RegisterAnimals;
